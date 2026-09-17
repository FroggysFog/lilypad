/**
 * LilyPad ERP - Sales Lead Claim Eligibility
 * The Sales Command Center should only surface leads that are genuinely
 * "unclaimed": either there's no existing Salesforce Account for this
 * business at all, or there is one but it isn't really being worked -
 * its Owner is just the generic "Froggys Fog" bucket (not a real rep)
 * and nobody has logged an Opportunity against it yet.
 *
 * Matches leads to accounts the same domain-first/fuzzy-name-fallback
 * way entityResolutionService.js and lilypadSalesforceAccounts.js
 * already do (fuzzyMatchService.js) - no new matching logic invented
 * here. Never deletes a lead; an ineligible one is simply disqualified
 * (existing status/disqualificationReason fields), the same mechanism
 * already used for any other lead a rep shouldn't work.
 */

const LilyPadSalesLead = require('../models/lilypadSalesLead')
const LilyPadSalesforceAccount = require('../models/lilypadSalesforceAccount')
const LilyPadOpportunity = require('../models/lilypadOpportunity')
const { normalizeCompanyName, normalizeDomain, isNameMatch } = require('./customerIntelligence/fuzzyMatchService')
const winston = require('../logger')

// Only the literal company-name owner counts as "not really assigned."
// Every other owner (the real reps, or another generic bucket like
// House Accounts/Support Dept) is treated as already having a rep.
const UNASSIGNED_OWNER_NAMES = new Set(['froggys fog', "froggy's fog"])

function isUnassignedOwner (ownerName) {
  return UNASSIGNED_OWNER_NAMES.has(String(ownerName || '').trim().toLowerCase())
}

/**
 * Finds the Salesforce Account matching this lead, if any - domain
 * first (high confidence), fuzzy company name as fallback.
 */
async function findMatchedAccountForLead (lead) {
  const domain = normalizeDomain(lead.domain)
  if (domain) {
    const byDomain = await LilyPadSalesforceAccount.findOne({ website: new RegExp(domain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') })
      .select('name ownerName sourceRecordId')
      .lean()
    if (byDomain) return { account: byDomain, matchType: 'domain' }
  }

  const normalizedName = normalizeCompanyName(lead.companyName)
  const firstToken = normalizedName.split(' ')[0]
  if (firstToken) {
    const candidates = await LilyPadSalesforceAccount.find({ name: new RegExp(firstToken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') })
      .select('name ownerName sourceRecordId')
      .lean()
    const matched = candidates.find((a) => isNameMatch(normalizedName, a.name))
    if (matched) return { account: matched, matchType: 'fuzzy_name' }
  }

  return { account: null, matchType: 'none' }
}

/**
 * @returns {{ eligible: boolean, reason: string }}
 */
async function resolveClaimEligibility (lead) {
  const { account } = await findMatchedAccountForLead(lead)

  if (!account) {
    return { eligible: true, reason: '' }
  }

  if (!isUnassignedOwner(account.ownerName)) {
    return { eligible: false, reason: `Already an assigned Froggy's Fog account (owner: ${account.ownerName || 'unknown'})` }
  }

  const hasOpportunity = account.sourceRecordId
    ? await LilyPadOpportunity.exists({ accountId: account.sourceRecordId })
    : false

  if (hasOpportunity) {
    return { eligible: false, reason: 'Already contacted - a Salesforce Opportunity is already logged for this account' }
  }

  return { eligible: true, reason: '' }
}

/**
 * Rechecks a batch of leads still in the "available to work" states
 * (same scope the Sales Command Center feed itself queries) and
 * disqualifies any that turn out to already be a claimed/contacted
 * account. Never touches a lead a rep has already moved past scoring
 * (contacted/quoted/converted/disqualified).
 */
async function recheckClaimEligibilityBatch (limit = 100) {
  const leads = await LilyPadSalesLead.find({ status: { $in: ['scored', 'unprocessed'] } })
    .select('companyName domain division')
    .limit(limit)
    .lean()

  let checked = 0
  let disqualified = 0
  for (const lead of leads) {
    checked++
    try {
      const { eligible, reason } = await resolveClaimEligibility(lead)
      if (!eligible) {
        await LilyPadSalesLead.updateOne(
          { _id: lead._id },
          { $set: { status: 'disqualified', disqualificationReason: reason } }
        )
        disqualified++
      }
    } catch (err) {
      winston.error(`Claim eligibility check failed for lead ${lead._id}: ${err.message}`)
    }
  }

  return { checked, disqualified }
}

function runScheduledClaimRecheck (winstonLogger) {
  return recheckClaimEligibilityBatch(200).then((summary) => {
    if (winstonLogger) winstonLogger.info(`Sales lead claim recheck: checked ${summary.checked}, disqualified ${summary.disqualified}`)
  }).catch((err) => {
    if (winstonLogger) winstonLogger.error('Scheduled sales lead claim recheck failed: ' + err.message)
  })
}

/**
 * Same setInterval + staggered initial setTimeout shape as every other
 * scheduler in this app (leadScorer.js, salesforceSyncScheduler.js) -
 * no node-cron dependency here.
 */
function startClaimEligibilityScheduler (winstonLogger) {
  const intervalHours = Number(process.env.SALES_LEAD_CLAIM_CHECK_HOURS || 24)
  const intervalMs = Math.max(6 * 60 * 60 * 1000, intervalHours * 60 * 60 * 1000)

  if (winstonLogger) winstonLogger.info(`Sales lead claim recheck scheduler started (${intervalHours} hour interval).`)

  setInterval(() => {
    runScheduledClaimRecheck(winstonLogger)
  }, intervalMs)

  setTimeout(() => {
    runScheduledClaimRecheck(winstonLogger)
  }, 240000) // staggered after leadScorer's own initial run
}

module.exports = {
  resolveClaimEligibility,
  recheckClaimEligibilityBatch,
  startClaimEligibilityScheduler
}
