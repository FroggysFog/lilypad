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

const { querySalesforce, queryAllSalesforcePages, singleFlight } = require('./salesforceService')
const LilyPadOrder = require('../models/lilypadOrder')
const winston = require('../logger')

const SUB_QUERY_BATCH_SIZE = 200

function normalizeOrderRecord (raw, items, shipments) {
  const source = raw && typeof raw === 'object' ? raw : {}
  const account = source.Account && typeof source.Account === 'object' ? source.Account : {}
  const owner = source.Owner && typeof source.Owner === 'object' ? source.Owner : {}
  const billToContact = source.BillToContact && typeof source.BillToContact === 'object' ? source.BillToContact : {}
  const shipToContact = source.ShipToContact && typeof source.ShipToContact === 'object' ? source.ShipToContact : {}
  const recordType = source.RecordType && typeof source.RecordType === 'object' ? source.RecordType : {}
  const priceBook = source.Pricebook2 && typeof source.Pricebook2 === 'object' ? source.Pricebook2 : {}

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
    name: String(source.Name || '').trim(),
    recordTypeName: String(recordType.Name || '').trim(),
    priceBookName: String(priceBook.Name || '').trim(),
    orderSource: String(source.Order_Source__c || '').trim(),
    caseStatus: String(source.Case_Status__c || '').trim(),
    orderEntryRep: String(source.Order_Entry_Rep__c || '').trim(),
    isReductionOrder: Boolean(source.IsReductionOrder),
    poNumber: String(source.PoNumber || '').trim(),
    poDate: source.PoDate || null,
    billToContactName: String(billToContact.Name || '').trim(),
    billToContactEmail: String(billToContact.Email || '').trim(),
    billToContactPhone: String(billToContact.Phone || '').trim(),
    shipToContactName: String(shipToContact.Name || '').trim(),
    netTerms: String(source.Net_Terms__c || '').trim(),
    daysPastDue: Number(source.Days_Past_Due__c || 0),
    totalDue: Number(source.Total_Due__c || 0),
    initialDueDate: source.Initial_Due_Date__c || null,
    finalDueDate: source.Final_Due_Date__c || null,
    shippedDate: source.Shipped_Date__c || null,
    paymentMethod: String(source.Payment_Method__c || '').trim(),
    cartOrderId: String(source.Cart_OrderID__c || '').trim(),
    discountAmount: Number(source.Discount_Amount__c || 0),
    couponCode: String(source.Coupon_Code__c || '').trim(),
    subtotal: Number(source.Subtotal__c || 0),
    taxAmount: Number(source.Tax_Amount__c || 0),
    shippingAmount: Number(source.Shipping_Amount__c || 0),
    shippingRefunded: Number(source.Shipping_Refunded__c || 0),
    subtotalRefunded: Number(source.Subtotal_Refunded__c || 0),
    totalRefunded: Number(source.Total_Refunded__c || 0),
    totalInvoiced: Number(source.Total_Invoiced__c || 0),
    totalPaid: Number(source.Total_Paid__c || 0),
    grandTotal: Number(source.Grand_Total__c || 0),
    netShipping: Number(source.Net_Shipping__c || 0),
    netDueAmount: Number(source.Net_Due_Amount__c || 0),
    adjustedAmount: Number(source.Adjusted_Amount__c || 0),
    productCost: Number(source.Product_Cost__c || 0),
    orderProfitability: Number(source.Order_Profitability__c || 0),
    grossMargin: Number(source.Gross_Margin__c || 0),
    orderProductsVolume: Number(source.Order_Products_Volume__c || 0),
    originalOrderDate: source.Original_Order_Date__c || null,
    attainmentDate: source.Net_Due_Date__c || null,
    customerEmail: String(source.Customer_Email__c || '').trim(),
    customerId: String(source.Customer_ID__c || '').trim(),
    orderBillingCompany: String(source.Order_Billing_Company__c || '').trim(),
    orderBillingName: String(source.Order_Billing_Name__c || '').trim(),
    orderBillingPhone: String(source.Order_Billing_Phone__c || '').trim(),
    orderShippingCompany: String(source.Order_Shipping_Company__c || '').trim(),
    orderShippingName: String(source.Order_Shipping_Name__c || '').trim(),
    orderShippingPhone: String(source.Order_Shipping_Phone__c || '').trim(),
    shippingDescription: String(source.Shipping_Description__c || '').trim(),
    weight: Number(source.Weight__c || 0),
    internalOrderNotes: String(source.Internal_Order_Notes__c || ''),
    externalOrderNotes: String(source.External_Order_Notes__c || ''),
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
    shipments: (shipments || []).map((s) => ({
      trackingNumber: String(s.Tracking_Number__c || '').trim(),
      trackingNumberAlt: String(s.Tracking__c || '').trim(),
      carrier: String(s.Carrier__c || '').trim(),
      service: String(s.Service__c || '').trim(),
      shippingCost: Number(s.Shipping_Cost__c || 0),
      shipmentWeight: Number(s.Shipment_Weight__c || 0),
      magentoOrderNumber: String(s.Magento_Order_Number__c || '').trim(),
      shipDate: String(s.Date__c || '').trim(),
      sourceRecordId: String(s.Id || '').trim()
    })),
    sourceRecordId: String(source.Id || '').trim()
  }
}

async function fetchOrderItemsByOrderId (orderIds) {
  const itemsByOrderId = {}
  for (let index = 0; index < orderIds.length; index += SUB_QUERY_BATCH_SIZE) {
    const batch = orderIds.slice(index, index + SUB_QUERY_BATCH_SIZE)
    if (!batch.length) continue

    try {
      const orderItems = await querySalesforce(`
                SELECT Id, OrderId, Quantity, UnitPrice, TotalPrice,
                       PricebookEntry.Product2.Name, PricebookEntry.Product2.StockKeepingUnit
                FROM OrderItem
                WHERE OrderId IN ('${batch.join("','")}')
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
  return itemsByOrderId
}

async function fetchShipworksDataByOrderId (orderIds) {
  const shipmentsByOrderId = {}
  for (let index = 0; index < orderIds.length; index += SUB_QUERY_BATCH_SIZE) {
    const batch = orderIds.slice(index, index + SUB_QUERY_BATCH_SIZE)
    if (!batch.length) continue

    try {
      const shipworksRecords = await querySalesforce(`
                SELECT Id, Order__c, Carrier__c, Magento_Order_Number__c, Service__c,
                       Shipping_Cost__c, Tracking_Number__c, Tracking__c, Shipment_Weight__c, Date__c
                FROM Shipworks_Data__c
                WHERE Order__c IN ('${batch.join("','")}')
                ORDER BY Order__c, CreatedDate
            `)
      shipworksRecords.forEach((s) => {
        if (!shipmentsByOrderId[s.Order__c]) shipmentsByOrderId[s.Order__c] = []
        shipmentsByOrderId[s.Order__c].push(s)
      })
    } catch (shipworksError) {
      // Tracking data is a nice-to-have; keep the order sync itself alive if this fails
    }
  }
  return shipmentsByOrderId
}

/**
 * Processes and upserts one Salesforce query page (~2000 records) at a
 * time via queryAllSalesforcePages, instead of loading the entire order
 * history into memory before writing anything - this org's order count
 * is large enough that accumulating it all first was likely OOM-killing
 * the process (crashes lined up with the sync scheduler's hourly tick).
 */
async function syncOrdersFromSalesforce () {
  let synced = 0
  let total = 0
  const startedAt = Date.now()

  await queryAllSalesforcePages(`
        SELECT Id, Name, OrderNumber, Status, EffectiveDate, EndDate, TotalAmount, AccountId,
               Account.Name, Account.Phone, Owner.Name, RecordType.Name, Pricebook2.Name,
               Order_Source__c, Case_Status__c, Order_Entry_Rep__c, IsReductionOrder,
               PoDate, PoNumber, BillToContactId, BillToContact.Name, BillToContact.Email,
               BillToContact.Phone, ShipToContact.Name,
               Net_Terms__c, Days_Past_Due__c, Total_Due__c, Initial_Due_Date__c,
               Final_Due_Date__c, Shipped_Date__c, Payment_Method__c, Cart_OrderID__c,
               Discount_Amount__c, Coupon_Code__c, Subtotal__c, Tax_Amount__c, Shipping_Amount__c,
               Shipping_Refunded__c, Subtotal_Refunded__c, Total_Refunded__c, Total_Invoiced__c,
               Total_Paid__c, Grand_Total__c, Net_Shipping__c, Net_Due_Amount__c, Adjusted_Amount__c,
               Product_Cost__c, Order_Profitability__c, Gross_Margin__c, Order_Products_Volume__c,
               Original_Order_Date__c, Net_Due_Date__c, Customer_Email__c, Customer_ID__c,
               Order_Billing_Company__c, Order_Billing_Name__c, Order_Billing_Phone__c,
               Order_Shipping_Company__c, Order_Shipping_Name__c, Order_Shipping_Phone__c,
               Shipping_Description__c, Weight__c, Internal_Order_Notes__c, External_Order_Notes__c,
               BillingStreet, BillingCity, BillingState,
               BillingPostalCode, BillingCountry, ShippingStreet, ShippingCity, ShippingState,
               ShippingPostalCode, ShippingCountry, Description, CreatedDate, LastModifiedDate
        FROM Order
        ORDER BY EffectiveDate DESC NULLS LAST, CreatedDate DESC
    `, async (page) => {
    const orderIds = page.map((order) => order.Id).filter(Boolean)
    const itemsByOrderId = await fetchOrderItemsByOrderId(orderIds)
    const shipmentsByOrderId = await fetchShipworksDataByOrderId(orderIds)

    const normalized = page
      .map((order) => normalizeOrderRecord(order, itemsByOrderId[order.Id], shipmentsByOrderId[order.Id]))
      .filter((r) => r.sourceRecordId)

    total += normalized.length
    if (normalized.length) {
      // One bulk round-trip for the whole page instead of one await per
      // order - thousands of sequential single-document upserts is what
      // made a full sync feel hung once Shipworks tracking doubled the
      // per-order Salesforce sub-queries on top of it.
      const bulkResult = await LilyPadOrder.bulkWrite(
        normalized.map((record) => ({
          updateOne: {
            filter: { sourceRecordId: record.sourceRecordId },
            update: { $set: { ...record, lastSyncAt: new Date() } },
            upsert: true
          }
        })),
        { ordered: false }
      )
      synced += (bulkResult.upsertedCount || 0) + (bulkResult.modifiedCount || 0)
    }

    winston.info(`Order sync progress: ${total} orders processed (${Math.round((Date.now() - startedAt) / 1000)}s elapsed)`)
  })

  return { synced, total }
}

module.exports = {
  normalizeOrderRecord,
  syncOrdersFromSalesforce: singleFlight(syncOrdersFromSalesforce)
}
