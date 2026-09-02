/**
 * LilyPad ERP - Opportunity Sync
 * Queries Salesforce Opportunities and upserts them into LilyPadOpportunity.
 * Uses standard Opportunity fields only; SF_OPPORTUNITIES_SOQL overrides
 * for org-specific customization, same escape hatch as the other syncs.
 */

const { queryAllSalesforcePages } = require('./salesforceService')
const LilyPadOpportunity = require('../models/lilypadOpportunity')
const winston = require('../logger')

const DEFAULT_OPPORTUNITIES_SOQL = `
    SELECT Id, Name, AccountId, Account.Name, StageName, Amount, CloseDate, Probability,
           Owner.Name, Type, LeadSource, IsClosed, IsWon, Description,
           CreatedDate, LastModifiedDate
    FROM Opportunity
    ORDER BY CloseDate DESC NULLS LAST, LastModifiedDate DESC
`

function normalizeOpportunityRecord (raw) {
  const source = raw && typeof raw === 'object' ? raw : {}
  const account = source.Account && typeof source.Account === 'object' ? source.Account : {}
  const owner = source.Owner && typeof source.Owner === 'object' ? source.Owner : {}

  return {
    name: String(source.Name || '').trim(),
    accountId: String(source.AccountId || '').trim(),
    accountName: String(account.Name || '').trim(),
    stageName: String(source.StageName || '').trim(),
    amount: Number(source.Amount || 0),
    closeDate: source.CloseDate || null,
    probability: Number(source.Probability || 0),
    ownerName: String(owner.Name || '').trim(),
    type: String(source.Type || '').trim(),
    leadSource: String(source.LeadSource || '').trim(),
    isClosed: Boolean(source.IsClosed),
    isWon: Boolean(source.IsWon),
    description: String(source.Description || ''),
    sourceRecordId: String(source.Id || '').trim()
  }
}

async function syncOpportunitiesFromSalesforce () {
  const soql = (process.env.SF_OPPORTUNITIES_SOQL || '').trim() || DEFAULT_OPPORTUNITIES_SOQL
  let synced = 0
  let total = 0

  await queryAllSalesforcePages(soql, async (page) => {
    const normalized = page
      .map(normalizeOpportunityRecord)
      .filter((r) => r.sourceRecordId)

    total += normalized.length
    if (normalized.length) {
      const bulkResult = await LilyPadOpportunity.bulkWrite(
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
    winston.info(`Opportunity sync progress: ${total} opportunities processed`)
  })

  return { synced, total }
}

module.exports = {
  normalizeOpportunityRecord,
  syncOpportunitiesFromSalesforce
}
