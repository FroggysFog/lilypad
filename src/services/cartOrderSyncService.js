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
 */

const cartService = require('../services/cartService')
const LilyPadCartOrder = require('../models/lilypadCartOrder')
const winston = require('../logger')

const CUSTOMER_FETCH_CONCURRENCY = 8

function singleFlight (fn) {
  let inFlight = null
  return async function (...args) {
    if (inFlight) return inFlight
    inFlight = fn(...args).finally(() => { inFlight = null })
    return inFlight
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
  const result = await cartService.cartRequest('/api/v1/order_statuses.json')
  const statuses = (result.data && result.data.order_statuses) || []
  return statuses.filter((s) => s.is_open && !s.is_cancelled && !s.is_quote_status)
}

async function fetchApprovedPaymentsTotal (orderId) {
  const result = await cartService.cartRequest(`/api/v1/order_payments.json?order_id=${orderId}`)
  const payments = (result.data && result.data.payments) || []
  return payments.reduce((sum, p) => (p.is_approved && !p.is_void ? sum + Number(p.amount || 0) : sum), 0)
}

async function fetchCustomer (customerId, cache) {
  if (!customerId) return null
  if (cache.has(customerId)) return cache.get(customerId)
  try {
    const result = await cartService.cartRequest(`/api/v1/customers/${customerId}.json`)
    cache.set(customerId, result.data || null)
    return result.data || null
  } catch (err) {
    winston.warn(`Cart.com Order sync: failed to fetch customer ${customerId}: ${err.message}`)
    cache.set(customerId, null)
    return null
  }
}

function normalizeCartOrder (raw, amountPaid, customer, statusName) {
  const grandTotal = Number(raw.grand_total || 0)
  const balanceDue = Math.max(0, Math.round((grandTotal - amountPaid) * 100) / 100)
  const dueDate = raw.due_date ? new Date(raw.due_date) : null
  const now = new Date()

  return {
    cartOrderId: raw.id,
    sourceRecordId: `cart-${raw.id}`,
    orderNumber: raw.order_number || '',
    orderStatusId: raw.order_status_id,
    orderStatusName: statusName || '',
    orderedAt: raw.ordered_at ? new Date(raw.ordered_at) : null,
    dueDate,
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
 * LilyPadCartOrder, then removes any previously-synced order that's no
 * longer in that qualifying set (paid off, cancelled, etc.) so the
 * collection stays scoped instead of accumulating stale records.
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
      const result = await cartService.cartRequest(nextPath)
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

  const removal = await LilyPadCartOrder.deleteMany({ sourceRecordId: { $nin: seenIds } })
  winston.info(`Cart.com Order sync: ${synced} synced across ${openStatuses.length} open statuses, ${removal.deletedCount} removed (no longer open)`)

  return { synced, total, removed: removal.deletedCount || 0 }
}

module.exports = {
  getOpenOrderStatuses,
  syncCartOrders: singleFlight(syncCartOrders)
}
