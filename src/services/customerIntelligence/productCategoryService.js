/**
 * LilyPad ERP - Product Category Lookup
 * Salesforce's Product2.Family field was never pulled into the Order sync
 * (see orderSyncService.js's SOQL - only Product2.Name and
 * StockKeepingUnit are selected), so there's no category data to read -
 * it has to be derived from productName/sku text. This is a real,
 * necessarily-approximate keyword classifier: it needs calibrating
 * against actual SKU/product-name examples from lilypad_orders before
 * it can be trusted for a real upsell-gap report. Ship it, but verify
 * the categorization against a sample of real orders before relying on
 * "no fluid purchases" as a hard fact rather than a hint.
 */

// Keywords are deliberately specific (multi-word or clearly product-shaped)
// rather than short substrings like "f-" or "hz-" - a 2-3 character
// fragment matches too much of an arbitrary SKU string to be trustworthy
// without real examples to check it against.
const CATEGORY_KEYWORDS = {
  fog_machine: ['fog machine', 'fogger', 'fog fluid generator', 'hurricane fog', 'geyser fog', 'viper fog'],
  haze_machine: ['haze machine', 'hazer', 'atmospheric haze', 'unique 2.1'],
  fluid_consumable: ['fog fluid', 'haze fluid', 'fluid concentrate', 'quart', 'gallon', 'fluid refill'],
  accessory_part: ['remote control', 'timer remote', 'nozzle', 'heater element', 'replacement part', 'filter', 'fluid tank', 'power cable', 'mounting bracket'],
  rental_service: ['rental', 'repair service', 'service fee', 'shipping charge']
}

function categorizeLineItem (productName, sku) {
  const haystack = `${productName || ''} ${sku || ''}`.toLowerCase()

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => haystack.includes(kw))) return category
  }
  return 'other'
}

/**
 * Rolls up a list of { productName, sku, quantity, unitPrice, totalPrice }
 * (or Cart.com's { itemName, itemNumber, price, quantity }) line items
 * into per-category counts/revenue.
 */
function summarizeProductMix (lineItems) {
  const byCategory = new Map()

  for (const item of lineItems || []) {
    const name = item.productName || item.itemName || ''
    const sku = item.sku || item.itemNumber || ''
    const quantity = Number(item.quantity) || 0
    const revenue = Number(item.totalPrice) || (Number(item.price) || 0) * quantity

    const category = categorizeLineItem(name, sku)
    const current = byCategory.get(category) || { category, itemCount: 0, revenue: 0 }
    current.itemCount += quantity || 1
    current.revenue += revenue
    byCategory.set(category, current)
  }

  return Array.from(byCategory.values())
}

module.exports = {
  categorizeLineItem,
  summarizeProductMix,
  CATEGORY_KEYWORDS
}
