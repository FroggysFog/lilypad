/**
 * LilyPad ERP - Lead Prospector Core Service
 * Sector/title logic, Apollo-record normalization, cross-collection
 * deduplication, and staged-lead -> CRM promotion. Kept separate from
 * leadProspectorWorker.js (which only owns pagination/progress/retry
 * orchestration) so this business logic can be unit tested without
 * mocking Apollo's HTTP layer.
 */

const LilyPadStagedLead = require('../models/lilypadStagedLead')
const LilyPadCustomer = require('../models/lilypadCustomer')
const LilyPadSalesforceAccount = require('../models/lilypadSalesforceAccount')
const { verifyNonProfit } = require('./proPublicaService')
const { verifyEmail } = require('./emailVerificationService')
const winston = require('../logger')

const SECTOR_TITLES = {
  commercial: ['Purchasing Manager', 'Director of Procurement', 'Buyer', 'Head of Sourcing', 'VP Supply Chain'],
  non_profit: ['Procurement Specialist', 'Director of Finance', 'Operations Director', 'Purchasing Agent'],
  government: ['Contracting Officer', 'Purchasing Agent', 'Procurement Specialist', 'Comptroller', 'Buyer']
}

const ALL_SECTOR_TITLES = Array.from(new Set([
  ...SECTOR_TITLES.commercial,
  ...SECTOR_TITLES.non_profit,
  ...SECTOR_TITLES.government
]))

const NON_PROFIT_HINT_WORDS = ['non-profit', 'nonprofit', 'ngo', 'foundation', 'charity', 'charitable']
const GOVERNMENT_HINT_WORDS = ['government', 'public sector', 'municipal', 'federal', 'county', 'state agency']

function getDefaultTitlesForSector (sector) {
  if (sector === 'commercial') return SECTOR_TITLES.commercial
  if (sector === 'non_profit') return SECTOR_TITLES.non_profit
  if (sector === 'government') return SECTOR_TITLES.government
  return ALL_SECTOR_TITLES
}

/**
 * Builds the Apollo searchPeople() filter shape from a lead_batches
 * document. User-supplied targetTitles always win over the sector
 * defaults; sector-hint keywords are added to targetIndustry (rather
 * than replacing it) so a rep's own industry keywords still narrow results.
 */
function buildApolloFilters (batch) {
  const personTitles = (batch.targetTitles && batch.targetTitles.length)
    ? batch.targetTitles
    : getDefaultTitlesForSector(batch.sector)

  const keywordTags = new Set((batch.targetIndustry || []).map((k) => String(k).trim()).filter(Boolean))
  if (batch.sector === 'non_profit') { keywordTags.add('non-profit'); keywordTags.add('nonprofit') }
  if (batch.sector === 'government') { keywordTags.add('government'); keywordTags.add('public sector') }

  const locations = (batch.targetLocations || []).map((l) => String(l).trim()).filter(Boolean)

  return {
    personTitles,
    personLocations: locations,
    organizationLocations: locations,
    keywordTags: Array.from(keywordTags)
  }
}

function escapeRegExp (value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function normalizeDomain (value) {
  if (!value) return ''
  let v = String(value).trim().toLowerCase()
  if (v.includes('@')) v = v.split('@')[1] || ''
  v = v.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].split('?')[0]
  return v
}

/**
 * Neither Apollo's mixed_people/search nor the in-house crawler reliably
 * returns a "sector" field, so for sector: 'all' runs each record is
 * classified from company industry/description/keyword text. Falls back
 * to 'commercial' - the most common case - when no non-profit/government
 * signal is present. Takes the common normalized record shape (see
 * normalize/apolloNormalizer.js and normalize/crawlNormalizer.js), not a
 * provider's raw response.
 */
function classifySector (batchSector, normalizedRecord) {
  if (batchSector !== 'all') return batchSector

  const haystack = [
    normalizedRecord.companyIndustry,
    normalizedRecord.companyDescription,
    ...(normalizedRecord.companyKeywords || [])
  ].filter(Boolean).join(' ').toLowerCase()

  if (GOVERNMENT_HINT_WORDS.some((w) => haystack.includes(w))) return 'government'
  if (NON_PROFIT_HINT_WORDS.some((w) => haystack.includes(w))) return 'non_profit'
  return 'commercial'
}

/**
 * Cross-collection duplicate check, in priority order: existing CRM
 * contact by email, existing CRM account by company domain, then any
 * other staged lead (any batch) already tracking this person/company.
 * Never throws - a lookup failure just means "not a duplicate" rather
 * than failing the whole batch.
 */
async function findDuplicateMatch (email, domain) {
  try {
    const cleanEmail = String(email || '').trim().toLowerCase()
    const cleanDomain = normalizeDomain(domain)

    if (cleanEmail) {
      const contact = await LilyPadCustomer.findOne({ email: cleanEmail }).select('_id')
      if (contact) return { isDuplicate: true, matchType: 'contact_email', matchedId: contact._id }
    }

    if (cleanDomain) {
      const account = await LilyPadSalesforceAccount.findOne({
        website: new RegExp(escapeRegExp(cleanDomain) + '$', 'i')
      }).select('_id')
      if (account) return { isDuplicate: true, matchType: 'account_domain', matchedId: account._id }
    }

    const stagedOr = []
    if (cleanEmail) stagedOr.push({ email: cleanEmail })
    if (cleanDomain) stagedOr.push({ companyDomain: cleanDomain })
    if (stagedOr.length) {
      const staged = await LilyPadStagedLead.findOne({
        $or: stagedOr,
        status: { $ne: 'rejected' }
      }).select('_id')
      if (staged) return { isDuplicate: true, matchType: 'staged_lead', matchedId: staged._id }
    }

    return { isDuplicate: false, matchType: '', matchedId: null }
  } catch (err) {
    winston.warn(`Lead Prospector dedupe check failed (treating as unique): ${err.message}`)
    return { isDuplicate: false, matchType: '', matchedId: null }
  }
}

/**
 * Turns one normalized record - from apolloNormalizer.js or
 * crawlNormalizer.js, both producing the same common shape - into a
 * staged_leads document. Dedup, ProPublica validation, and email
 * verification are looked up here so both the Apollo worker's paging
 * loop and the in-house crawl worker stay focused on their own
 * orchestration concerns (pagination/retries vs. crawl/extraction) and
 * never duplicate this logic.
 *
 * Expected shape of `record` (see normalize/*.js for exact producers):
 *   { externalId, firstName, lastName, jobTitle, department, email,
 *     emailStatusHint, phoneNumber, phoneType, companyName,
 *     companyWebsite, companyIndustry, companyDescription,
 *     companyKeywords, personBio, linkedinUrl, city, state, country,
 *     postalCode, sourceProvider, sourceUrl, vertical, rawPayload }
 */
async function buildStagedLeadDoc (batch, record) {
  const email = String(record.email || '').trim().toLowerCase()
  const domain = normalizeDomain(record.companyWebsite || email)
  const sector = classifySector(batch.sector, record)

  const duplicate = await findDuplicateMatch(email, domain)

  let nonProfitEin = ''
  let nonProfitVerified = false
  if (sector === 'non_profit' && record.companyName) {
    const npCheck = await verifyNonProfit(record.companyName)
    nonProfitEin = npCheck.ein
    nonProfitVerified = npCheck.verified
  }

  let emailStatus = record.emailStatusHint || 'unverified'
  let emailVerification = { provider: '', result: '', checkedAt: null }
  if (email) {
    const verification = await verifyEmail(email, emailStatus)
    emailVerification = verification
    if (verification.provider && verification.provider !== 'stub' && verification.result) {
      emailStatus = verification.result
    }
  }

  return {
    batchId: batch._id,
    externalId: record.externalId || '',
    firstName: record.firstName || '',
    lastName: record.lastName || '',
    jobTitle: record.jobTitle || '',
    department: record.department || '',
    companyName: record.companyName || '',
    companyDomain: domain,
    companyIndustry: record.companyIndustry || '',
    companyDescription: record.companyDescription || '',
    personBio: record.personBio || '',
    linkedinUrl: record.linkedinUrl || '',
    email,
    emailStatus,
    emailVerification,
    phoneNumber: record.phoneNumber || '',
    phoneType: record.phoneType || '',
    city: record.city || '',
    state: record.state || '',
    country: record.country || '',
    postalCode: record.postalCode || '',
    sector,
    vertical: record.vertical || '',
    sourceUrl: record.sourceUrl || '',
    nonProfitEin,
    nonProfitVerified,
    sourceProvider: record.sourceProvider || 'manual',
    rawPayload: record.rawPayload || null,
    isDuplicate: duplicate.isDuplicate,
    duplicateMatchType: duplicate.matchType,
    duplicateMatchedId: duplicate.matchedId,
    status: 'staged'
  }
}

/**
 * Bulk-approves and commits staged leads into the live CRM collections.
 * A lead already flagged as a duplicate is linked to its existing
 * account/contact instead of creating a second record; everything else
 * gets a new LilyPadSalesforceAccount / LilyPadCustomer, tagged with a
 * synthetic sourceRecordId (both models require a unique one) so re-runs
 * of promote on the same lead are idempotent.
 */
async function promoteStagedLeads (leadIds) {
  const leads = await LilyPadStagedLead.find({
    _id: { $in: leadIds },
    status: { $ne: 'imported' }
  })

  const results = []

  for (const lead of leads) {
    try {
      let accountId = null
      if (lead.isDuplicate && lead.duplicateMatchType === 'account_domain') {
        accountId = lead.duplicateMatchedId
      } else if (lead.companyDomain || lead.companyName) {
        let account = null
        if (lead.companyDomain) {
          account = await LilyPadSalesforceAccount.findOne({
            website: new RegExp(escapeRegExp(lead.companyDomain) + '$', 'i')
          })
        }
        if (!account && lead.companyName) {
          account = await LilyPadSalesforceAccount.findOne({ name: lead.companyName })
        }
        if (!account) {
          account = await LilyPadSalesforceAccount.create({
            name: lead.companyName || lead.companyDomain,
            industry: lead.companyIndustry,
            website: lead.companyDomain,
            description: lead.companyDescription,
            billingAddress: {
              city: lead.city,
              state: lead.state,
              country: lead.country,
              postalCode: lead.postalCode
            },
            sourceRecordId: `prospector:account:${lead._id}`
          })
        }
        accountId = account._id
      }

      let contactId = null
      if (lead.isDuplicate && lead.duplicateMatchType === 'contact_email') {
        contactId = lead.duplicateMatchedId
      } else {
        const contact = await LilyPadCustomer.create({
          name: `${lead.firstName} ${lead.lastName}`.trim() || lead.email || 'Prospected Lead',
          company: lead.companyName,
          industry: lead.companyIndustry,
          state: lead.state,
          leadStatus: 'New',
          email: lead.email,
          phone: lead.phoneNumber,
          leadSource: 'Lead Prospector',
          createdDate: new Date(),
          sourceRecordId: `prospector:contact:${lead._id}`
        })
        contactId = contact._id
      }

      lead.status = 'imported'
      lead.promotedAccountId = accountId
      lead.promotedContactId = contactId
      await lead.save()

      results.push({ leadId: lead._id, success: true, accountId, contactId })
    } catch (err) {
      results.push({ leadId: lead._id, success: false, error: err.message })
    }
  }

  return results
}

module.exports = {
  SECTOR_TITLES,
  ALL_SECTOR_TITLES,
  getDefaultTitlesForSector,
  buildApolloFilters,
  normalizeDomain,
  classifySector,
  findDuplicateMatch,
  buildStagedLeadDoc,
  promoteStagedLeads
}
