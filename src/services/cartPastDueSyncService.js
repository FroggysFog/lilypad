/**
 * LilyPad ERP - Cart.com Past Due Sync
 * Same shape as pastDueSyncService.js (derives Past Due records from
 * already-synced Orders, purely local, no live API call), but reading
 * from LilyPadCartOrder instead of LilyPadOrder. No brand/owner filter
 * here - confirmed with the account owner that the froggysfog.com
 * Cart.com store is 100% Froggy's Fog, unlike the shared Salesforce org.
 */

const LilyPadCartOrder = require('../models/lilypadCartOrder')
const LilyPadPastDueAccount = require('../models/lilypadPastDueAccount')
const winston = require('../logger')

function singleFlight (fn) {
  let inFlight = null
  return async function (...args) {
    if (inFlight) return inFlight
    inFlight = fn(...args).finally(() => { inFlight = null })
    return inFlight
  }
}

function deriveCartPastDueRecord (order) {
  return {
    accountName: order.customerCompany || order.customerName || 'Cart.com Customer',
    amountDue: order.balanceDue,
    originalDueDate: order.dueDate ? order.dueDate.toISOString().slice(0, 10) : null,
    finalDueDate: order.dueDate ? order.dueDate.toISOString().slice(0, 10) : null,
    salesRep: order.salesPerson || '',
    payerName: order.customerName || order.customerCompany || '',
    payerEmail: order.customerEmail || '',
    payerPhone: order.customerPhone || '',
    orderNumber: order.orderNumber || String(order.cartOrderId),
    status: order.orderStatusName || '',
    source: 'cart',
    sourceRecordId: order.sourceRecordId
  }
}

/**
 * Reads currently-synced Cart.com Orders with a balance owed past their
 * due date and upserts them into the shared LilyPadPastDueAccount
 * collection. Preserves locally-edited payer info the same way the
 * Salesforce side does, and removes any previously-synced Cart.com past
 * due record that no longer qualifies (paid off) - scoped to
 * source: 'cart' so this never touches Salesforce-derived records.
 */
async function syncCartPastDueAccounts () {
  const overdueOrders = await LilyPadCartOrder.find({ isPastDue: true })

  const records = overdueOrders.map(deriveCartPastDueRecord)
  const qualifyingIds = records.map((r) => r.sourceRecordId)

  const existingByRecordId = {}
  if (qualifyingIds.length) {
    const existingAccounts = await LilyPadPastDueAccount.find(
      { sourceRecordId: { $in: qualifyingIds } },
      'sourceRecordId payerEmail'
    )
    existingAccounts.forEach((a) => { existingByRecordId[a.sourceRecordId] = a })
  }

  let synced = 0
  if (records.length) {
    const bulkResult = await LilyPadPastDueAccount.bulkWrite(
      records.map((record) => {
        const existing = existingByRecordId[record.sourceRecordId]
        const update = {
          accountName: record.accountName,
          amountDue: record.amountDue,
          originalDueDate: record.originalDueDate,
          finalDueDate: record.finalDueDate,
          salesRep: record.salesRep,
          orderNumber: record.orderNumber,
          status: record.status,
          source: 'cart',
          lastSyncAt: new Date()
        }
        if (record.payerEmail || !(existing && existing.payerEmail)) {
          update.payerName = record.payerName
          update.payerPhone = record.payerPhone
          if (record.payerEmail) update.payerEmail = record.payerEmail
        }

        return {
          updateOne: {
            filter: { sourceRecordId: record.sourceRecordId },
            update: { $set: update, $setOnInsert: { sourceRecordId: record.sourceRecordId } },
            upsert: true
          }
        }
      }),
      { ordered: false }
    )
    synced = (bulkResult.upsertedCount || 0) + (bulkResult.modifiedCount || 0)
  }

  const removal = await LilyPadPastDueAccount.deleteMany({ source: 'cart', sourceRecordId: { $nin: qualifyingIds } })
  winston.info(`Cart.com Past Due sync: ${records.length} qualifying orders, ${removal.deletedCount} removed (paid off)`)

  return { synced, total: records.length, removed: removal.deletedCount }
}

module.exports = {
  deriveCartPastDueRecord,
  syncCartPastDueAccounts: singleFlight(syncCartPastDueAccounts)
}
