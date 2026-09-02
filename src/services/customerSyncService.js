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

const { queryAllSalesforcePages } = require('./salesforceService')
const LilyPadCustomer = require('../models/lilypadCustomer')

const DEFAULT_LEADS_SOQL = `
    SELECT Id, Name, Company, Industry, State, Status, Owner.Alias, LastActivityDate,
           CreatedDate, Import_Notes__c, CreatedBy.Name, LeadSource, Phone, Email
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
  let synced = 0
  let total = 0

  await queryAllSalesforcePages(soql, async (page) => {
    const normalized = page
      .map(normalizeLeadRecord)
      .filter((r) => r.sourceRecordId)

    total += normalized.length
    for (const record of normalized) {
      await LilyPadCustomer.findOneAndUpdate(
        { sourceRecordId: record.sourceRecordId },
        { $set: { ...record, lastSyncAt: new Date() } },
        { upsert: true }
      )
      synced += 1
    }
  })

  return { synced, total }
}

module.exports = {
  normalizeLeadRecord,
  syncCustomersFromSalesforce
}
