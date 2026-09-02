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
const winston = require('../logger')
const { singleFlight } = require('./salesforceService')

// Orders owned by anyone outside this list, or billed to FrightProps, are a
// different brand sharing this Salesforce org and shouldn't appear as
// Froggy's Fog collections/reminders.
const ALLOWED_OWNERS = [
  'Joey Olaerts',
  "Froggy's Fog",
  'Scott Lynd',
  'Katie Lane',
  'Eli Phipps',
  'Mitchell Wolf',
  'Chris Markgraf',
  'Adam Pogue'
]
const EXCLUDED_ACCOUNT_PATTERN = /fright\s*props/i

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
 * Reads currently-synced Orders with money owed (excluding other brands
 * sharing this org - see ALLOWED_OWNERS/EXCLUDED_ACCOUNT_PATTERN above)
 * and upserts them into LilyPadPastDueAccount by sourceRecordId (the
 * underlying Salesforce Order Id, so this stays 1:1 with Orders).
 * Preserves any locally-edited payer info (payerEmail/payerPhone/
 * payerNotes) unless the order now has a non-empty value for it. Also
 * removes any previously-synced past due account that no longer
 * qualifies - paid off, or newly excluded by the brand/owner filter -
 * so the list and the reminder pipeline both stay current instead of
 * accumulating stale entries forever.
 */
async function syncPastDueAccountsFromSalesforce () {
  const overdueOrders = await LilyPadOrder.find({
    totalDue: { $gt: 0 },
    daysPastDue: { $gt: 0 },
    ownerName: { $in: ALLOWED_OWNERS },
    accountName: { $not: EXCLUDED_ACCOUNT_PATTERN }
  })

  const records = overdueOrders.map(derivePastDueRecordFromOrder)
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

  const removal = await LilyPadPastDueAccount.deleteMany({ sourceRecordId: { $nin: qualifyingIds } })
  winston.info(`Past Due sync: ${records.length} qualifying orders, ${removal.deletedCount} removed (paid off or excluded)`)

  return { synced, total: records.length, removed: removal.deletedCount }
}

module.exports = {
  parseCurrencyLikeNumber,
  normalizeIsoDate,
  computeDaysLateFromDate,
  derivePastDueRecordFromOrder,
  syncPastDueAccountsFromSalesforce: singleFlight(syncPastDueAccountsFromSalesforce)
}
