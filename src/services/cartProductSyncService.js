/**
 * LilyPad ERP - Cart.com Catalog/Inventory Sync Service
 * Mirrors cartOrderSyncService.js's shape, but for Cart.com's product
 * catalog via the static Catalog API token (cartService.js's
 * cartCatalogRequest) rather than the OAuth flow, whose read_catalog
 * scope is rejected for reasons Cart.com hasn't resolved.
 *
 * Unlike orders (~71k total, forcing a narrow "open status" scope to fit
 * the Mongo free-tier), the full catalog is ~2,419 products - a curated
 * ~25-field schema at that count is a few hundred KB to low single-digit
 * MB, nowhere near a comparable size concern. Every product is synced,
 * no status-based scoping needed.
 *
 * Cleanup is simpler than orders' too: a product vanishing entirely from
 * the paginated list (as opposed to just flipping is_discontinued/
 * is_hidden, both of which stay visible in the payload) is treated as an
 * unambiguous "Cart.com removed it" signal, so this deletes on sight
 * rather than orders' re-verify-before-delete dance - there's no
 * receivable-style data loss risk here the way a dropped order had.
 *
 * quantity_on_hand lives directly on the product record, confirmed live -
 * /api/v1/inventory.json (which 400'd on an unparameterized GET, likely
 * needs a specific item_id param) is deliberately not used for this.
 */

const cartService = require('../services/cartService')
const LilyPadCartProduct = require('../models/lilypadCartProduct')
const winston = require('../logger')

const MAX_RATE_LIMIT_RETRIES = 6
const DEFAULT_RETRY_DELAY_MS = 3000

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
      return await cartService.cartCatalogRequest(path)
    } catch (err) {
      if (err.cartStatus !== 429 || attempt > MAX_RATE_LIMIT_RETRIES) throw err
      const waitMs = err.retryAfterSeconds ? err.retryAfterSeconds * 1000 : DEFAULT_RETRY_DELAY_MS * attempt
      winston.warn(`Cart.com Catalog sync: rate limited on ${path} - waiting ${Math.round(waitMs / 1000)}s (retry ${attempt}/${MAX_RATE_LIMIT_RETRIES})`)
      await delay(waitMs)
    }
  }
}

function normalizeCartProduct (raw) {
  return {
    cartProductId: raw.id,
    sourceRecordId: `cart-product-${raw.id}`,
    itemNumber: raw.item_number || '',
    itemName: raw.item_name || '',
    shortDescription: raw.short_description || '',
    manufacturerId: raw.manufacturer_id != null ? raw.manufacturer_id : null,
    primaryCategoryId: raw.primary_category_id != null ? raw.primary_category_id : null,
    productStatusId: raw.product_status_id != null ? raw.product_status_id : null,
    price: Number(raw.price || 0),
    retail: Number(raw.retail || 0),
    cost: Number(raw.cost || 0),
    quantityOnHand: Number(raw.quantity_on_hand || 0),
    quantityOnOrder: Number(raw.quantity_on_order || 0),
    isDiscontinued: Boolean(raw.is_discontinued),
    isHidden: Boolean(raw.is_hidden),
    isKit: Boolean(raw.is_kit),
    isChildProduct: Boolean(raw.is_child_product),
    isNonInventory: Boolean(raw.is_non_inventory),
    lowStockWarningThreshold: raw.low_stock_warning_threshold != null ? Number(raw.low_stock_warning_threshold) : null,
    enableLowStockWarning: Boolean(raw.enable_low_stock_warning),
    weight: raw.weight != null ? Number(raw.weight) : null,
    weightUnit: raw.weight_unit || '',
    gtin: raw.gtin || '',
    urlRewrite: raw.url_rewrite || '',
    cartCreatedAt: raw.created_at ? new Date(raw.created_at) : null,
    cartUpdatedAt: raw.updated_at ? new Date(raw.updated_at) : null,
    lastSyncAt: new Date()
  }
}

/**
 * Pulls the full product catalog into LilyPadCartProduct, then deletes
 * any previously-synced product not seen in this run (see module docs
 * for why a straight delete-on-vanish is safe here, unlike orders).
 */
async function syncCartProducts () {
  const status = cartService.getCartCatalogStatus()
  if (!status.configured) return { skipped: true, reason: 'Cart.com Catalog API token is not configured.' }

  const seenIds = []
  let synced = 0
  let total = 0

  let nextPath = '/api/v1/products.json'
  while (nextPath) {
    const result = await cartRequestWithRetry(nextPath)
    const data = result.data || {}
    const products = data.products || []
    total += products.length

    if (products.length) {
      const ops = products.map((raw) => {
        const doc = normalizeCartProduct(raw)
        seenIds.push(doc.sourceRecordId)
        return {
          updateOne: {
            filter: { cartProductId: doc.cartProductId },
            update: { $set: doc },
            upsert: true
          }
        }
      })
      await LilyPadCartProduct.bulkWrite(ops, { ordered: false })
      synced += ops.length
    }

    nextPath = data.next_page ? cartService.relativizeCartUrl(data.next_page) : null
  }

  const removal = await LilyPadCartProduct.deleteMany({ sourceRecordId: { $nin: seenIds } })

  winston.info(`Cart.com Catalog sync: ${synced} synced of ${total} seen, ${removal.deletedCount || 0} removed (no longer in Cart.com's catalog)`)

  return { synced, total, removed: removal.deletedCount || 0 }
}

module.exports = {
  syncCartProducts: singleFlight(syncCartProducts)
}
