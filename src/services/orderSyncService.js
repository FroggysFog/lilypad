/**
 * LilyPad ERP - Order Sync
 * Ported from lilypad-hub's /api/salesforce/orders (Order + OrderItem
 * line items). The Cart.com order-merge from that route was not ported -
 * those API credentials were never actually configured there either, so
 * this starts Salesforce-only, same as Past Due Payments did.
 *
 * PoDate, PoNumber, and BillToContactId are standard Order fields (no
 * "__c" suffix, confirmed via Setup > Object Manager). Everything else
 * added here (Days_Past_Due__c, Total_Due__c, etc.) is a real custom
 * field name found the same way - past due accounts are derived straight
 * from these synced Order records (see pastDueSyncService.js) instead of
 * a separate Salesforce report or Invoice__c query.
 */

const { querySalesforce, queryAllSalesforce } = require('./salesforceService')
const LilyPadOrder = require('../models/lilypadOrder')

function normalizeOrderRecord (raw, items) {
  const source = raw && typeof raw === 'object' ? raw : {}
  const account = source.Account && typeof source.Account === 'object' ? source.Account : {}
  const owner = source.Owner && typeof source.Owner === 'object' ? source.Owner : {}
  const billToContact = source.BillToContact && typeof source.BillToContact === 'object' ? source.BillToContact : {}

  return {
    orderNumber: String(source.OrderNumber || '').trim(),
    status: String(source.Status || '').trim(),
    effectiveDate: source.EffectiveDate || null,
    endDate: source.EndDate || null,
    totalAmount: Number(source.TotalAmount || 0),
    accountId: String(source.AccountId || '').trim(),
    accountName: String(account.Name || '').trim(),
    accountPhone: String(account.Phone || '').trim(),
    ownerName: String(owner.Name || '').trim(),
    poNumber: String(source.PoNumber || '').trim(),
    poDate: source.PoDate || null,
    billToContactName: String(billToContact.Name || '').trim(),
    billToContactEmail: String(billToContact.Email || '').trim(),
    netTerms: String(source.Net_Terms__c || '').trim(),
    daysPastDue: Number(source.Days_Past_Due__c || 0),
    totalDue: Number(source.Total_Due__c || 0),
    initialDueDate: source.Initial_Due_Date__c || null,
    finalDueDate: source.Final_Due_Date__c || null,
    shippedDate: source.Shipped_Date__c || null,
    paymentMethod: String(source.Payment_Method__c || '').trim(),
    cartOrderId: String(source.Cart_OrderID__c || '').trim(),
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
  // No SOQL LIMIT here - queryAllSalesforce paginates through every record,
  // same as customerSyncService.js. An explicit options.limit still caps
  // the final result if ever needed (e.g. a quick manual test sync).
  const records = await queryAllSalesforce(`
        SELECT Id, OrderNumber, Status, EffectiveDate, EndDate, TotalAmount, AccountId,
               Account.Name, Account.Phone, Owner.Name, PoDate, PoNumber,
               BillToContactId, BillToContact.Name, BillToContact.Email,
               Net_Terms__c, Days_Past_Due__c, Total_Due__c, Initial_Due_Date__c,
               Final_Due_Date__c, Shipped_Date__c, Payment_Method__c, Cart_OrderID__c,
               BillingStreet, BillingCity, BillingState,
               BillingPostalCode, BillingCountry, ShippingStreet, ShippingCity, ShippingState,
               ShippingPostalCode, ShippingCountry, Description, CreatedDate, LastModifiedDate
        FROM Order
        ORDER BY EffectiveDate DESC NULLS LAST, CreatedDate DESC
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
