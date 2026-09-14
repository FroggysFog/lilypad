/**
 * LilyPad ERP - Opportunity Sync
 * Queries Salesforce Opportunities and upserts them into LilyPadOpportunity.
 * Uses standard Opportunity fields only; SF_OPPORTUNITIES_SOQL overrides
 * for org-specific customization, same escape hatch as the other syncs.
 */

const { queryAllSalesforcePages, querySalesforce, updateSalesforceRecord, singleFlight } = require('./salesforceService')
const LilyPadOpportunity = require('../models/lilypadOpportunity')
const winston = require('../logger')

const SINGLE_OPPORTUNITY_SOQL_FIELDS = `Id, Name, AccountId, Account.Name, StageName, Amount, CloseDate, Probability,
           Owner.Id, Owner.Name, Type, LeadSource, IsClosed, IsWon, Description,
           CreatedDate, LastModifiedDate`

const DEFAULT_OPPORTUNITIES_SOQL = `
    SELECT Id, Name, AccountId, Account.Name, StageName, Amount, CloseDate, Probability,
           Owner.Id, Owner.Name, Type, LeadSource, IsClosed, IsWon, Description,
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
    ownerSourceId: String(owner.Id || '').trim(),
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

/**
 * Pushes a rep-made edit (stage, amount, and/or description) to the
 * linked Salesforce record, then immediately re-fetches that one record
 * and overwrites the local doc with Salesforce's confirmed state - this
 * is what keeps local data honest after a write (including any SF-side
 * validation/workflow side effects), not a stored "last pushed" flag.
 *
 * Known residual risk (accepted, not solved with a lock): the hourly
 * scheduled pull sync (syncOpportunitiesFromSalesforce) could start
 * querying Salesforce in the narrow window between this function's own
 * write and its re-fetch, and its bulkWrite $set could then land either
 * just before or just after this function's .save(). Given the sync
 * cadence (hourly) versus how long a manual edit takes (seconds), this
 * is a low-probability window - a real lock would be more machinery
 * than this one-off race justifies.
 */
async function pushOpportunityUpdate (opportunityId, fields) {
  const opportunity = await LilyPadOpportunity.findById(opportunityId)
  if (!opportunity) {
    throw new Error('Opportunity not found')
  }
  if (!opportunity.sourceRecordId) {
    throw new Error('This opportunity has no linked Salesforce record.')
  }
  // Salesforce record ids are always 15/18-char alphanumeric - reject
  // anything else before it's interpolated into a SOQL string below.
  if (!/^[a-zA-Z0-9]{15,18}$/.test(opportunity.sourceRecordId)) {
    throw new Error('This opportunity has an invalid Salesforce record id.')
  }

  const sfFields = {}
  if (fields.stageName !== undefined) sfFields.StageName = fields.stageName
  if (fields.amount !== undefined) sfFields.Amount = Number(fields.amount)
  if (fields.description !== undefined) sfFields.Description = fields.description
  if (!Object.keys(sfFields).length) {
    throw new Error('No updatable fields provided.')
  }

  await updateSalesforceRecord('Opportunity', opportunity.sourceRecordId, sfFields)

  const [fresh] = await querySalesforce(
    `SELECT ${SINGLE_OPPORTUNITY_SOQL_FIELDS} FROM Opportunity WHERE Id = '${opportunity.sourceRecordId}'`
  )
  if (fresh) {
    Object.assign(opportunity, normalizeOpportunityRecord(fresh), { lastSyncAt: new Date() })
  }
  opportunity.history.push({
    action: 'salesforce_push',
    by: null,
    byName: 'Salesforce Sync',
    description: `Pushed ${Object.keys(sfFields).join(', ')} to Salesforce and re-synced.`
  })

  return opportunity.save()
}

module.exports = {
  normalizeOpportunityRecord,
  syncOpportunitiesFromSalesforce: singleFlight(syncOpportunitiesFromSalesforce),
  pushOpportunityUpdate
}
