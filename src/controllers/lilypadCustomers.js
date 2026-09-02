/**
 * LilyPad ERP - Customers Controller
 */

const LilyPadCustomer = require('../models/lilypadCustomer')
const { syncCustomersFromSalesforce } = require('../services/customerSyncService')

const lilypadCustomersController = {}

const SORTABLE_FIELDS = ['lastActivityDate', 'name', 'company', 'industry', 'state', 'leadStatus', 'ownerAlias', 'createdDate']

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
    return res.status(200).json({ success: true, data: customer })
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
