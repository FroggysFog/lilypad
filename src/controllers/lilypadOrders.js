/**
 * LilyPad ERP - Orders Controller
 */

const LilyPadOrder = require('../models/lilypadOrder')
const { syncOrdersFromSalesforce } = require('../services/orderSyncService')

const lilypadOrdersController = {}

/**
 * GET /api/v1/lilypad/orders
 */
lilypadOrdersController.getOrders = async function (req, res) {
  try {
    const query = {}
    if (req.query.status) query.status = req.query.status
    if (req.query.accountName) query.accountName = { $regex: String(req.query.accountName).trim(), $options: 'i' }

    const orders = await LilyPadOrder.find(query).sort('-effectiveDate').limit(500)
    return res.status(200).json({ success: true, data: orders, count: orders.length })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * GET /api/v1/lilypad/orders/:id
 */
lilypadOrdersController.getOrderDetail = async function (req, res) {
  try {
    const order = await LilyPadOrder.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' })
    }
    return res.status(200).json({ success: true, data: order })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/orders/sync
 */
lilypadOrdersController.triggerOrderSync = async function (req, res) {
  try {
    const result = await syncOrdersFromSalesforce()
    return res.status(200).json({ success: true, message: `Synced ${result.synced} of ${result.total} orders from Salesforce.`, ...result })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

module.exports = lilypadOrdersController
