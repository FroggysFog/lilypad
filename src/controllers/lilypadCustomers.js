/**
 * LilyPad ERP - Customers Controller
 */

const LilyPadCustomer = require('../models/lilypadCustomer')
const LilyPadSalesforceAccount = require('../models/lilypadSalesforceAccount')
const { syncCustomersFromSalesforce } = require('../services/customerSyncService')
const { normalizeDomain, normalizeCompanyName, isNameMatch } = require('../services/customerIntelligence/fuzzyMatchService')

const lilypadCustomersController = {}

const SORTABLE_FIELDS = ['lastActivityDate', 'name', 'company', 'industry', 'state', 'leadStatus', 'ownerAlias', 'createdDate']

function escapeRegExp (value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * The reverse of findMatchedCustomersForAccount in
 * lilypadSalesforceAccounts.js - given an individual Customer (Lead),
 * finds its parent Account (company) the same way: email domain first,
 * fuzzy company-name as fallback, since there's no clean ID link either
 * direction. Computed live, scoped to one customer, so it costs one
 * narrowed query rather than a collection scan.
 */
async function findParentAccountForCustomer (customer) {
  const projection = 'name industry phone website'
  const domain = normalizeDomain(customer.email)

  if (domain) {
    const byDomain = await LilyPadSalesforceAccount.findOne({ website: new RegExp(escapeRegExp(domain) + '$', 'i') })
      .select(projection)
      .lean()
    if (byDomain) return { account: byDomain, matchType: 'domain' }
  }

  const normalizedName = normalizeCompanyName(customer.company)
  const firstToken = normalizedName.split(' ')[0]
  if (firstToken) {
    const candidates = await LilyPadSalesforceAccount.find({ name: new RegExp(escapeRegExp(firstToken), 'i') })
      .select(projection)
      .lean()
    const matched = candidates.find((a) => isNameMatch(normalizedName, a.name))
    if (matched) return { account: matched, matchType: 'fuzzy_name' }
  }

  return { account: null, matchType: 'none' }
}

/**
 * GET /api/v1/lilypad/customers
 */
lilypadCustomersController.getCustomers = async function (req, res) {
  try {
    const search = String(req.query.search || '').trim()
    const query = search
      ? { $or: [{ name: { $regex: search, $options: 'i' } }, { company: { $regex: search, $options: 'i' } }] }
      : {}

    const page = Math.max(1, Number(req.query.page) || 1)
    const pageSize = Math.min(200, Math.max(1, Number(req.query.pageSize) || 50))
    const sortKey = SORTABLE_FIELDS.includes(req.query.sortKey) ? req.query.sortKey : 'lastActivityDate'
    const sortDir = req.query.sortDir === 'asc' ? 1 : -1

    const [customers, total] = await Promise.all([
      LilyPadCustomer.find(query).sort({ [sortKey]: sortDir }).skip((page - 1) * pageSize).limit(pageSize),
      LilyPadCustomer.countDocuments(query)
    ])

    return res.status(200).json({
      success: true,
      data: customers,
      pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) }
    })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * GET /api/v1/lilypad/customers/:id
 */
lilypadCustomersController.getCustomerDetail = async function (req, res) {
  try {
    const customer = await LilyPadCustomer.findById(req.params.id)
    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' })
    }

    const { account, matchType } = await findParentAccountForCustomer(customer)

    return res.status(200).json({
      success: true,
      data: customer,
      parentAccount: account,
      parentAccountMatchType: matchType
    })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/customers/sync
 */
lilypadCustomersController.triggerCustomerSync = async function (req, res) {
  try {
    const result = await syncCustomersFromSalesforce()
    return res.status(200).json({ success: true, message: `Synced ${result.synced} of ${result.total} customers from Salesforce.`, ...result })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

module.exports = lilypadCustomersController
