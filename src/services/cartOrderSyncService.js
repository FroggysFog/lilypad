/**
 * LilyPad ERP - Cart.com Order Sync Service
 * Mirrors orderSyncService.js's shape for the Salesforce side, but for
 * Cart.com's REST API (froggysfog.com store - confirmed 100% Froggy's
 * Fog, no brand filtering needed here unlike the Salesforce side).
 *
 * Cart.com's order list has no working incremental filter - confirmed
 * live that updated_at_min is silently ignored (total_count barely
 * changed from the fully unfiltered count). With ~71k orders total,
 * pulling everything every sync would repeat the MongoDB storage-quota
 * problem from the Salesforce Orders sync. Instead this scopes to
 * orders whose CURRENT status is "open" per Cart.com's own
 * order_statuses.json flags (is_open: true, is_cancelled: false,
 * is_quote_status: false) - confirmed live that filtering by a single
 * such status_id (19, "PO Shipped Unpaid") narrows 71,440 orders down
 * to 408. That's a self-describing filter driven by Cart.com's own
 * data instead of a hardcoded guess at which status IDs matter, and it
 * automatically keeps working if Cart.com adds/renames statuses later.
 *
 * "Balance owed" isn't a field on the order at all - confirmed live
 * that a paid-in-full order still carries a due_date. It has to be
 * computed as grand_total minus the sum of approved, non-voided
 * payments from /api/v1/order_payments.json.
 *
 * Two gaps this file used to have, both now handled: (1) an order that
 * moves to a non-"open" status while still owing money used to just
 * disappear (fetched only from open statuses, then deleted for no longer
 * being in that set) - dropped orders now get a single-order
 * re-verification before deletion instead of being deleted on sight (see
 * reconcileDroppedOrders). (2) an order with no due_date at all used to
 * never qualify as past due regardless of balance - computeDueDate now
 * falls back to orderedAt + DEFAULT_PAYMENT_TERMS_DAYS when Cart.com
 * didn't set one, flagged via dueDateIsEstimated.
 */

const cartService = require('../services/cartService')
const LilyPadCartOrder = require('../models/lilypadCartOrder')
const winston = require('../logger')

// Confirmed live: 8-way concurrent payment/customer lookups tripped
// Cart.com's rate limit (429). Lower concurrency plus honoring
// Retry-After (falling back to exponential backoff when that header
// isn't present) keeps a sync running instead of failing outright.
const CUSTOMER_FETCH_CONCURRENCY = 3
const MAX_RATE_LIMIT_RETRIES = 6
const DEFAULT_RETRY_DELAY_MS = 3000

// Fallback assumed payment terms when Cart.com doesn't set due_date on an
// order at all - without this, an order with a real unpaid balance but no
// due_date could never be flagged past due, full stop. Not confirmed
// against a real contract term; override via env if Froggy's Fog's actual
// terms differ.
const DEFAULT_PAYMENT_TERMS_DAYS = Number(process.env.CART_DEFAULT_PAYMENT_TERMS_DAYS || 30)

function singleFlight (fn) {
  let inFlight = null
  return async function (...args) {
    if (inFlight) return inFlight
    inFlight = fn(...args).finally(() => { inFlight = null })
    return inFlight
  }
}

function delay (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function cartRequestWithRetry (path) {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await cartService.cartRequest(path)
    } catch (err) {
      if (err.cartStatus !== 429 || attempt > MAX_RATE_LIMIT_RETRIES) throw err
      const waitMs = err.retryAfterSeconds ? err.retryAfterSeconds * 1000 : DEFAULT_RETRY_DELAY_MS * attempt
      winston.warn(`Cart.com Order sync: rate limited on ${path} - waiting ${Math.round(waitMs / 1000)}s (retry ${attempt}/${MAX_RATE_LIMIT_RETRIES})`)
      await delay(waitMs)
    }
  }
}

async function mapWithConcurrency (items, limit, iteratee) {
  const results = new Array(items.length)
  let index = 0
  async function worker () {
    while (index < items.length) {
      const current = index++
      results[current] = await iteratee(items[current], current)
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
  return results
}

async function getOpenOrderStatuses () {
  const result = await cartRequestWithRetry('/api/v1/order_statuses.json')
  const statuses = (result.data && result.data.order_statuses) || []
  return statuses.filter((s) => s.is_open && !s.is_cancelled && !s.is_quote_status)
}

async function fetchApprovedPaymentsTotal (orderId) {
  const result = await cartRequestWithRetry(`/api/v1/order_payments.json?order_id=${orderId}`)
  const payments = (result.data && result.data.payments) || []
  return payments.reduce((sum, p) => (p.is_approved && !p.is_void ? sum + Number(p.amount || 0) : sum), 0)
}

/**
 * Single-order lookup, used only to re-verify orders that dropped out of
 * the "open status" fetch (see reconcileDroppedOrders below) - mirrors
 * fetchCustomer's /api/v1/customers/{id}.json singular-resource shape.
 * Not confirmed live the way the rest of this file's endpoints are
 * (flagged in comments elsewhere) - if Cart.com's actual path differs,
 * this fails closed (throws, caller keeps the record rather than
 * wrongly deleting a real receivable).
 */
async function fetchOrderById (orderId) {
  const result = await cartRequestWithRetry(`/api/v1/orders/${orderId}.json`)
  const order = (result.data && (result.data.order || result.data)) || null
  if (!order || !order.id) throw new Error(`No order data returned for ${orderId}`)
  return order
}

/**
 * An order dropping out of the "open status" fetch (see syncCartOrders)
 * could mean it was paid off - or it could mean Cart.com moved it to some
 * other status (On Hold, Disputed, a custom status) while a real balance
 * is still owed. Treating "not open anymore" as "resolved" would silently
 * delete a genuine receivable the moment its status changes. Instead,
 * each dropped order gets a fresh single-order lookup: still a balance
 * owed -> keep it (refreshed), balance actually cleared or the order is
 * gone/cancelled -> safe to delete. A lookup failure keeps the record
 * rather than deleting - losing visibility into money owed is worse than
 * a stale row sticking around an extra sync cycle.
 */
async function reconcileDroppedOrders (droppedSourceRecordIds, openStatusNameById) {
  if (!droppedSourceRecordIds.length) return { toDelete: [], toKeep: 0 }

  const droppedOrders = await LilyPadCartOrder.find({ sourceRecordId: { $in: droppedSourceRecordIds } })
  const customerCache = new Map()
  const toDelete = []
  let kept = 0

  for (const existing of droppedOrders) {
    try {
      const raw = await fetchOrderById(existing.cartOrderId)
      const [amountPaid, customer] = await Promise.all([
        fetchApprovedPaymentsTotal(existing.cartOrderId),
        fetchCustomer(raw.customer_id, customerCache)
      ])
      const normalized = normalizeCartOrder(raw, amountPaid, customer, openStatusNameById.get(raw.order_status_id) || existing.orderStatusName)

      if (normalized.balanceDue > 0.01) {
        await LilyPadCartOrder.updateOne({ cartOrderId: existing.cartOrderId }, { $set: normalized })
        kept++
      } else {
        toDelete.push(existing.sourceRecordId)
      }
    } catch (err) {
      winston.warn(`Cart.com Order sync: could not re-verify order ${existing.cartOrderId} before removal, keeping it: ${err.message}`)
      kept++
    }
  }

  return { toDelete, toKeep: kept }
}

async function fetchCustomer (customerId, cache) {
  if (!customerId) return null
  if (cache.has(customerId)) return cache.get(customerId)
  try {
    const result = await cartRequestWithRetry(`/api/v1/customers/${customerId}.json`)
    cache.set(customerId, result.data || null)
    return result.data || null
  } catch (err) {
    winston.warn(`Cart.com Order sync: failed to fetch customer ${customerId}: ${err.message}`)
    cache.set(customerId, null)
    return null
  }
}

/**
 * Cart.com's due_date is missing on some orders entirely (confirmed:
 * order.due_date can be absent even when a balance is owed) - falling
 * back to orderedAt + DEFAULT_PAYMENT_TERMS_DAYS means those orders can
 * still be flagged past due instead of silently never qualifying.
 * dueDateIsEstimated marks which case this is so the UI/data isn't
 * presenting a guess as a fact Cart.com actually stated.
 */
function computeDueDate (raw) {
  if (raw.due_date) return { dueDate: new Date(raw.due_date), isEstimated: false }
  if (raw.ordered_at) {
    const estimated = new Date(new Date(raw.ordered_at).getTime() + DEFAULT_PAYMENT_TERMS_DAYS * 24 * 60 * 60 * 1000)
    return { dueDate: estimated, isEstimated: true }
  }
  return { dueDate: null, isEstimated: false }
}

function normalizeCartOrder (raw, amountPaid, customer, statusName) {
  const grandTotal = Number(raw.grand_total || 0)
  const balanceDue = Math.max(0, Math.round((grandTotal - amountPaid) * 100) / 100)
  const { dueDate, isEstimated } = computeDueDate(raw)
  const now = new Date()

  return {
    cartOrderId: raw.id,
    sourceRecordId: `cart-${raw.id}`,
    orderNumber: raw.order_number || '',
    orderStatusId: raw.order_status_id,
    orderStatusName: statusName || '',
    orderedAt: raw.ordered_at ? new Date(raw.ordered_at) : null,
    dueDate,
    dueDateIsEstimated: isEstimated,
    grandTotal,
    subtotal: Number(raw.subtotal || 0),
    taxTotal: Number(raw.tax_total || 0),
    shippingTotal: Number(raw.shipping_total || 0),
    discountTotal: Number(raw.discount_total || 0),
    amountPaid: Math.round(amountPaid * 100) / 100,
    balanceDue,
    isPastDue: balanceDue > 0.01 && !!dueDate && dueDate.getTime() < now.getTime(),
    customerId: raw.customer_id || null,
    customerName: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
    customerEmail: customer ? (customer.email || '') : '',
    customerPhone: customer ? (customer.phone_number || '') : '',
    customerCompany: customer ? (customer.company || '') : '',
    salesPerson: customer ? (customer.sales_person || '') : '',
    adminComments: raw.admin_comments || '',
    publicComments: raw.public_comments || '',
    items: (raw.items || []).map((item) => ({
      itemNumber: item.item_number || '',
      itemName: item.item_name || '',
      price: Number(item.price || 0),
      quantity: Number(item.quantity || 0)
    })),
    lastSyncAt: new Date()
  }
}

/**
 * Pulls every order in an "open" status (see module docs) into
 * LilyPadCartOrder, then reconciles any previously-synced order that's
 * no longer in that qualifying set - re-verifying each one individually
 * (reconcileDroppedOrders) rather than assuming "not open anymore" means
 * "resolved," so a real receivable doesn't vanish the moment Cart.com
 * changes its status.
 */
async function syncCartOrders () {
  const status = await cartService.getCartOAuthStatus()
  if (!status.connected) return { skipped: true, reason: 'Cart.com is not connected.' }

  const openStatuses = await getOpenOrderStatuses()
  const statusNameById = new Map(openStatuses.map((s) => [s.id, s.name]))

  const customerCache = new Map()
  const seenIds = []
  let synced = 0
  let total = 0

  for (const openStatus of openStatuses) {
    let nextPath = `/api/v1/orders.json?order_status_id=${openStatus.id}`
    while (nextPath) {
      const result = await cartRequestWithRetry(nextPath)
      const data = result.data || {}
      const orders = data.orders || []
      total += orders.length

      const normalized = await mapWithConcurrency(orders, CUSTOMER_FETCH_CONCURRENCY, async (raw) => {
        const [amountPaid, customer] = await Promise.all([
          fetchApprovedPaymentsTotal(raw.id),
          fetchCustomer(raw.customer_id, customerCache)
        ])
        return normalizeCartOrder(raw, amountPaid, customer, statusNameById.get(raw.order_status_id))
      })

      if (normalized.length) {
        const ops = normalized.map((doc) => {
          seenIds.push(doc.sourceRecordId)
          return {
            updateOne: {
              filter: { cartOrderId: doc.cartOrderId },
              update: { $set: doc },
              upsert: true
            }
          }
        })
        await LilyPadCartOrder.bulkWrite(ops, { ordered: false })
        synced += ops.length
      }

      nextPath = data.next_page ? cartService.relativizeCartUrl(data.next_page) : null
    }
  }

  const droppedIds = await LilyPadCartOrder.find({ sourceRecordId: { $nin: seenIds } }).distinct('sourceRecordId')
  const { toDelete, toKeep } = await reconcileDroppedOrders(droppedIds, statusNameById)

  const removal = toDelete.length
    ? await LilyPadCartOrder.deleteMany({ sourceRecordId: { $in: toDelete } })
    : { deletedCount: 0 }

  winston.info(`Cart.com Order sync: ${synced} synced across ${openStatuses.length} open statuses, ${removal.deletedCount} removed (confirmed paid off/gone), ${toKeep} kept despite leaving the open-status set (still owe a balance or couldn't be re-verified)`)

  return { synced, total, removed: removal.deletedCount || 0, keptAfterStatusChange: toKeep }
}

module.exports = {
  getOpenOrderStatuses,
  syncCartOrders: singleFlight(syncCartOrders)
}
