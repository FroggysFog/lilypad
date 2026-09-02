/**
 * LilyPad ERP - Customer (Lead) Sync
 * Queries Salesforce Leads and upserts them into LilyPadCustomer.
 *
 * Trade_Show__c was a guessed custom field API name that this org doesn't
 * actually have ("No such column 'Trade_Show__c' on entity 'Lead'"), so
 * it's dropped from the query - tradeShow just stays blank on synced
 * records until the real field name (if any) is found via the Salesforce
 * Explorer page and added back. Set SF_LEADS_SOQL to override with the
 * exact query for this org instead of needing a code change (same escape
 * hatch already used for Past Due Payments' SF_OVERDUE_SOQL).
 */

const { queryAllSalesforcePages, singleFlight } = require('./salesforceService')
const LilyPadCustomer = require('../models/lilypadCustomer')
const winston = require('../logger')

/**
 * This org has ~54,000 Leads - syncing all of them was a meaningful
 * contributor to filling the 512MB MongoDB free-tier cluster (alongside
 * Orders, the much larger contributor). Scoped to leads with activity or
 * creation in a recent rolling window; older, stale leads aren't synced.
 */
function getCustomerRetentionCutoffDate () {
  const months = Number(process.env.LEAD_SYNC_RETENTION_MONTHS || 12)
  const cutoff = new Date()
  cutoff.setMonth(cutoff.getMonth() - months)
  return cutoff
}

function getCustomerRetentionCutoffSoqlDate () {
  return getCustomerRetentionCutoffDate().toISOString().slice(0, 10)
}

async function cleanupOutOfScopeCustomers () {
  const cutoffDate = getCustomerRetentionCutoffDate()
  const cutoffDateStr = cutoffDate.toISOString().slice(0, 10)
  const result = await LilyPadCustomer.deleteMany({
    createdDate: { $lt: cutoffDate },
    $or: [
      { lastActivityDate: { $exists: false } },
      { lastActivityDate: null },
      { lastActivityDate: '' },
      { lastActivityDate: { $lt: cutoffDateStr } }
    ]
  })
  if (result.deletedCount) {
    winston.info(`Customer sync cleanup: removed ${result.deletedCount} stale leads older than ${cutoffDateStr}`)
  }
  return result.deletedCount || 0
}

const DEFAULT_LEADS_SOQL_TEMPLATE = (cutoffDate) => `
    SELECT Id, Name, Company, Industry, State, Status, Owner.Alias, LastActivityDate,
           CreatedDate, Import_Notes__c, CreatedBy.Name, LeadSource, Phone, Email
    FROM Lead
    WHERE LastActivityDate >= ${cutoffDate} OR CreatedDate >= ${cutoffDate}
    ORDER BY LastActivityDate DESC NULLS LAST, CreatedDate DESC
`

function normalizeLeadRecord (raw) {
  const source = raw && typeof raw === 'object' ? raw : {}
  const owner = source.Owner && typeof source.Owner === 'object' ? source.Owner : {}
  const createdBy = source.CreatedBy && typeof source.CreatedBy === 'object' ? source.CreatedBy : {}

  return {
    name: String(source.Name || 'Salesforce Lead').trim(),
    company: String(source.Company || '').trim(),
    industry: String(source.Industry || '').trim(),
    state: String(source.State || '').trim(),
    leadStatus: String(source.Status || '').trim(),
    ownerAlias: String(owner.Alias || '').trim(),
    lastActivityDate: source.LastActivityDate || null,
    createdDate: source.CreatedDate ? new Date(source.CreatedDate) : null,
    importNotes: String(source.Import_Notes__c || '').trim(),
    tradeShow: String(source.Trade_Show__c || '').trim(),
    createdByName: String(createdBy.Name || '').trim(),
    leadSource: String(source.LeadSource || '').trim(),
    phone: String(source.Phone || '').trim(),
    email: String(source.Email || '').trim(),
    sourceRecordId: String(source.Id || '').trim()
  }
}

async function syncCustomersFromSalesforce () {
  const removed = await cleanupOutOfScopeCustomers()
  const soql = (process.env.SF_LEADS_SOQL || '').trim() || DEFAULT_LEADS_SOQL_TEMPLATE(getCustomerRetentionCutoffSoqlDate())
  let synced = 0
  let total = 0

  await queryAllSalesforcePages(soql, async (page) => {
    const normalized = page
      .map(normalizeLeadRecord)
      .filter((r) => r.sourceRecordId)

    total += normalized.length
    if (normalized.length) {
      const bulkResult = await LilyPadCustomer.bulkWrite(
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
    winston.info(`Customer sync progress: ${total} leads processed`)
  })

  return { synced, total, removed }
}

module.exports = {
  normalizeLeadRecord,
  syncCustomersFromSalesforce: singleFlight(syncCustomersFromSalesforce)
}
