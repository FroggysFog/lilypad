/**
 * LilyPad ERP - Customers Controller
 */

const LilyPadCustomer = require('../models/lilypadCustomer')
const { syncCustomersFromSalesforce } = require('../services/customerSyncService')

const lilypadCustomersController = {}

/**
 * GET /api/v1/lilypad/customers
 */
lilypadCustomersController.getCustomers = async function (req, res) {
  try {
    const search = String(req.query.search || '').trim()
    const query = search ? { name: { $regex: search, $options: 'i' } } : {}

    const customers = await LilyPadCustomer.find(query).sort('name').limit(500)
    return res.status(200).json({ success: true, data: customers, count: customers.length })
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
