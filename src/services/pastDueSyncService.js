/**
 * LilyPad ERP - Past Due Account Sync
 * Past due accounts are derived directly from already-synced Order
 * records (see orderSyncService.js) rather than a separate Salesforce
 * report or Invoice__c query - the fields that mattered (Total_Due__c,
 * Days_Past_Due__c, Initial_Due_Date__c, etc.) all live on the standard
 * Order object in this org. This is a purely local operation: it doesn't
 * call Salesforce itself, so callers that want fresh data should sync
 * Orders first (the scheduler and the manual "Sync from Salesforce"
 * button on the Past Due page both do this).
 */

const LilyPadOrder = require('../models/lilypadOrder')
const LilyPadPastDueAccount = require('../models/lilypadPastDueAccount')

function parseCurrencyLikeNumber (value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  const normalized = String(value || '').replace(/[^0-9.-]/g, '')
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

function normalizeIsoDate (value) {
  if (!value) return null
  const raw = String(value).trim()
  if (!raw) return null

  const direct = new Date(raw)
  if (!Number.isNaN(direct.getTime())) {
    return direct.toISOString().slice(0, 10)
  }

  return null
}

function computeDaysLateFromDate (dueDateValue, now) {
  const iso = normalizeIsoDate(dueDateValue)
  if (!iso) return 0
  const dueDate = new Date(`${iso}T00:00:00.000Z`)
  const diffMs = now.getTime() - dueDate.getTime()
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
}

function derivePastDueRecordFromOrder (order) {
  return {
    accountName: order.accountName || 'Salesforce Account',
    amountDue: parseCurrencyLikeNumber(order.totalDue),
    originalDueDate: order.initialDueDate || null,
    finalDueDate: order.finalDueDate || null,
    salesRep: order.ownerName || '',
    payerName: order.billToContactName || order.accountName || '',
    payerEmail: order.billToContactEmail || '',
    orderNumber: order.orderNumber || '',
    poNumber: order.poNumber || '',
    poDate: order.poDate || null,
    paymentMethod: order.paymentMethod || '',
    status: order.status || '',
    sourceRecordId: order.sourceRecordId
  }
}

/**
 * Reads currently-synced Orders with money owed and upserts them into
 * LilyPadPastDueAccount by sourceRecordId (the underlying Salesforce
 * Order Id, so this stays 1:1 with Orders). Preserves any locally-edited
 * payer info (payerEmail/payerPhone/payerNotes) unless the order now has
 * a non-empty value for it.
 */
async function syncPastDueAccountsFromSalesforce () {
  const overdueOrders = await LilyPadOrder.find({
    totalDue: { $gt: 0 },
    daysPastDue: { $gt: 0 }
  })

  const records = overdueOrders.map(derivePastDueRecordFromOrder)
  let synced = 0

  for (const record of records) {
    const existing = await LilyPadPastDueAccount.findOne({ sourceRecordId: record.sourceRecordId })

    const update = {
      accountName: record.accountName,
      amountDue: record.amountDue,
      originalDueDate: record.originalDueDate,
      finalDueDate: record.finalDueDate,
      salesRep: record.salesRep,
      orderNumber: record.orderNumber,
      poNumber: record.poNumber,
      poDate: record.poDate,
      paymentMethod: record.paymentMethod,
      status: record.status,
      lastSyncAt: new Date()
    }

    if (record.payerEmail || !(existing && existing.payerEmail)) {
      update.payerName = record.payerName
      if (record.payerEmail) update.payerEmail = record.payerEmail
    }

    await LilyPadPastDueAccount.findOneAndUpdate(
      { sourceRecordId: record.sourceRecordId },
      { $set: update, $setOnInsert: { sourceRecordId: record.sourceRecordId } },
      { upsert: true }
    )
    synced += 1
  }

  return { synced, total: records.length }
}

module.exports = {
  parseCurrencyLikeNumber,
  normalizeIsoDate,
  computeDaysLateFromDate,
  derivePastDueRecordFromOrder,
  syncPastDueAccountsFromSalesforce
}
