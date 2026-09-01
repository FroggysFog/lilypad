/**
 * LilyPad ERP - Customer (Lead) Sync
 * Queries Salesforce Leads and upserts them into LilyPadCustomer.
 *
 * The default query below guesses at two custom field API names
 * (Import_Notes__c, Trade_Show__c) based on the user's real Lead list
 * view columns - if those aren't the org's actual field names, the sync
 * will fail with a clear Salesforce "invalid field" error. Set
 * SF_LEADS_SOQL to override with the exact query for this org instead of
 * needing a code change (same escape hatch already used for Past Due
 * Payments' SF_OVERDUE_SOQL).
 */

const { queryAllSalesforce } = require('./salesforceService')
const LilyPadCustomer = require('../models/lilypadCustomer')

const DEFAULT_LEADS_SOQL = `
    SELECT Id, Name, Company, Industry, State, Status, Owner.Alias, LastActivityDate,
           CreatedDate, Import_Notes__c, Trade_Show__c, CreatedBy.Name, LeadSource, Phone, Email
    FROM Lead
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
  const soql = (process.env.SF_LEADS_SOQL || '').trim() || DEFAULT_LEADS_SOQL
  const records = await queryAllSalesforce(soql)

  const normalized = records
    .map(normalizeLeadRecord)
    .filter((r) => r.sourceRecordId)

  let synced = 0
  for (const record of normalized) {
    await LilyPadCustomer.findOneAndUpdate(
      { sourceRecordId: record.sourceRecordId },
      { $set: { ...record, lastSyncAt: new Date() } },
      { upsert: true }
    )
    synced += 1
  }

  return { synced, total: normalized.length }
}

module.exports = {
  normalizeLeadRecord,
  syncCustomersFromSalesforce
}
