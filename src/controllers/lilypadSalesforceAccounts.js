/**
 * LilyPad ERP - Salesforce Accounts Controller
 */

const LilyPadSalesforceAccount = require('../models/lilypadSalesforceAccount')
const LilyPadCustomer = require('../models/lilypadCustomer')
const { syncSalesforceAccounts } = require('../services/salesforceAccountSyncService')
const { normalizeDomain, normalizeCompanyName, isNameMatch } = require('../services/customerIntelligence/fuzzyMatchService')

const controller = {}

function escapeRegExp (value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Individual Customers (Leads) have no clean ID link to Accounts - see
 * customerIntelligence/entityResolutionService.js for why. Reuses the
 * exact same domain-first, fuzzy-name-fallback matching it already does
 * for the Customer Intelligence rebuild, computed live here for just
 * this one account (cheap - one narrowed query, not a full-collection
 * scan) so "who are the individuals at this company" works immediately
 * on any account detail page view, without depending on a separate
 * rebuild job having ever run.
 */
async function findMatchedCustomersForAccount (account) {
  const projection = 'name email phone leadStatus company industry lastActivityDate'
  const domain = normalizeDomain(account.website)

  if (domain) {
    const byDomain = await LilyPadCustomer.find({ email: new RegExp('@' + escapeRegExp(domain) + '$', 'i') })
      .select(projection)
      .lean()
    if (byDomain.length) return { matches: byDomain, matchType: 'domain' }
  }

  const normalizedName = normalizeCompanyName(account.name)
  const firstToken = normalizedName.split(' ')[0]
  if (firstToken) {
    // Narrows the query with a cheap regex on the first significant word
    // before the more expensive fuzzy comparison, so this never scans
    // the whole ~54k-row Leads collection on every account page view.
    const candidates = await LilyPadCustomer.find({ company: new RegExp(escapeRegExp(firstToken), 'i') })
      .select(projection)
      .lean()
    const matched = candidates.filter((c) => isNameMatch(normalizedName, c.company))
    if (matched.length) return { matches: matched, matchType: 'fuzzy_name' }
  }

  return { matches: [], matchType: 'none' }
}

const SORTABLE_FIELDS = ['name', 'industry', 'type', 'ownerName', 'phone', 'annualRevenue']

/**
 * GET /api/v1/lilypad/salesforce-accounts
 */
controller.getAccounts = async function (req, res) {
  try {
    const search = String(req.query.name || req.query.search || '').trim()
    const query = search ? { name: { $regex: search, $options: 'i' } } : {}

    const page = Math.max(1, Number(req.query.page) || 1)
    const pageSize = Math.min(200, Math.max(1, Number(req.query.pageSize) || 50))
    const sortKey = SORTABLE_FIELDS.includes(req.query.sortKey) ? req.query.sortKey : 'name'
    const sortDir = req.query.sortDir === 'desc' ? -1 : 1

    const [accounts, total] = await Promise.all([
      LilyPadSalesforceAccount.find(query).sort({ [sortKey]: sortDir }).skip((page - 1) * pageSize).limit(pageSize),
      LilyPadSalesforceAccount.countDocuments(query)
    ])

    return res.status(200).json({
      success: true,
      data: accounts,
      pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) }
    })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * GET /api/v1/lilypad/salesforce-accounts/:id
 */
controller.getAccountDetail = async function (req, res) {
  try {
    const account = await LilyPadSalesforceAccount.findById(req.params.id)
    if (!account) {
      return res.status(404).json({ success: false, error: 'Account not found' })
    }

    const { matches, matchType } = await findMatchedCustomersForAccount(account)

    return res.status(200).json({
      success: true,
      data: account,
      customers: matches,
      customerMatchType: matchType
    })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/salesforce-accounts/sync
 */
controller.triggerAccountSync = async function (req, res) {
  try {
    const result = await syncSalesforceAccounts()
    return res.status(200).json({ success: true, message: `Synced ${result.synced} of ${result.total} accounts from Salesforce.`, ...result })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

module.exports = controller
