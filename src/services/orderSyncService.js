/**
 * LilyPad ERP - Order Sync
 * Ported from lilypad-hub's /api/salesforce/orders (Order + OrderItem
 * line items). The Cart.com order-merge from that route was not ported -
 * those API credentials were never actually configured there either, so
 * this starts Salesforce-only, same as Past Due Payments did.
 */

const { querySalesforce } = require('./salesforceService')
const LilyPadOrder = require('../models/lilypadOrder')

function normalizeOrderRecord (raw, items) {
  const source = raw && typeof raw === 'object' ? raw : {}
  const account = source.Account && typeof source.Account === 'object' ? source.Account : {}

  return {
    orderNumber: String(source.OrderNumber || '').trim(),
    status: String(source.Status || '').trim(),
    effectiveDate: source.EffectiveDate || null,
    endDate: source.EndDate || null,
    totalAmount: Number(source.TotalAmount || 0),
    accountId: String(source.AccountId || '').trim(),
    accountName: String(account.Name || '').trim(),
    accountPhone: String(account.Phone || '').trim(),
    billingAddress: {
      street: String(source.BillingStreet || '').trim(),
      city: String(source.BillingCity || '').trim(),
      state: String(source.BillingState || '').trim(),
      postalCode: String(source.BillingPostalCode || '').trim(),
      country: String(source.BillingCountry || '').trim()
    },
    shippingAddress: {
      street: String(source.ShippingStreet || '').trim(),
      city: String(source.ShippingCity || '').trim(),
      state: String(source.ShippingState || '').trim(),
      postalCode: String(source.ShippingPostalCode || '').trim(),
      country: String(source.ShippingCountry || '').trim()
    },
    description: String(source.Description || ''),
    items: (items || []).map((item) => {
      const pbEntry = item.PricebookEntry && typeof item.PricebookEntry === 'object' ? item.PricebookEntry : {}
      const product = pbEntry.Product2 && typeof pbEntry.Product2 === 'object' ? pbEntry.Product2 : {}
      return {
        productName: String(product.Name || '').trim(),
        sku: String(product.StockKeepingUnit || '').trim(),
        quantity: Number(item.Quantity || 0),
        unitPrice: Number(item.UnitPrice || 0),
        totalPrice: Number(item.TotalPrice || 0)
      }
    }),
    sourceRecordId: String(source.Id || '').trim()
  }
}

async function syncOrdersFromSalesforce (options = {}) {
  const limit = Math.max(1, Math.min(250, Number(options.limit || 100)))

  const records = await querySalesforce(`
        SELECT Id, OrderNumber, Status, EffectiveDate, EndDate, TotalAmount, AccountId,
               Account.Name, Account.Phone, BillingStreet, BillingCity, BillingState,
               BillingPostalCode, BillingCountry, ShippingStreet, ShippingCity, ShippingState,
               ShippingPostalCode, ShippingCountry, Description, CreatedDate, LastModifiedDate
        FROM Order
        ORDER BY EffectiveDate DESC NULLS LAST, CreatedDate DESC
        LIMIT ${limit}
    `)

  const itemsByOrderId = {}
  for (let index = 0; index < records.length; index += 50) {
    const orderIds = records.slice(index, index + 50).map((order) => order.Id).filter(Boolean)
    if (!orderIds.length) continue

    try {
      const orderItems = await querySalesforce(`
                SELECT Id, OrderId, Quantity, UnitPrice, TotalPrice,
                       PricebookEntry.Product2.Name, PricebookEntry.Product2.StockKeepingUnit
                FROM OrderItem
                WHERE OrderId IN ('${orderIds.join("','")}')
                ORDER BY OrderId, CreatedDate
            `)
      orderItems.forEach((item) => {
        if (!itemsByOrderId[item.OrderId]) itemsByOrderId[item.OrderId] = []
        itemsByOrderId[item.OrderId].push(item)
      })
    } catch (itemError) {
      // Line items are a nice-to-have; keep the order sync itself alive if this fails
    }
  }

  const normalized = records
    .map((order) => normalizeOrderRecord(order, itemsByOrderId[order.Id]))
    .filter((r) => r.sourceRecordId)

  let synced = 0
  for (const record of normalized) {
    await LilyPadOrder.findOneAndUpdate(
      { sourceRecordId: record.sourceRecordId },
      { $set: { ...record, lastSyncAt: new Date() } },
      { upsert: true }
    )
    synced += 1
  }

  return { synced, total: normalized.length }
}

module.exports = {
  normalizeOrderRecord,
  syncOrdersFromSalesforce
}
