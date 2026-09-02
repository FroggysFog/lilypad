/**
 * LilyPad ERP - Orders Controller
 */

const LilyPadOrder = require('../models/lilypadOrder')
const { syncOrdersFromSalesforce } = require('../services/orderSyncService')

const lilypadOrdersController = {}

const SORTABLE_FIELDS = ['orderNumber', 'status', 'accountName', 'effectiveDate', 'totalAmount']

/**
 * GET /api/v1/lilypad/orders
 */
lilypadOrdersController.getOrders = async function (req, res) {
  try {
    const query = {}
    if (req.query.status) query.status = req.query.status
    if (req.query.accountName) query.accountName = { $regex: String(req.query.accountName).trim(), $options: 'i' }
    if (req.query.search) {
      const search = String(req.query.search).trim()
      query.$or = [{ orderNumber: { $regex: search, $options: 'i' } }, { accountName: { $regex: search, $options: 'i' } }]
    }

    const page = Math.max(1, Number(req.query.page) || 1)
    const pageSize = Math.min(200, Math.max(1, Number(req.query.pageSize) || 50))
    const sortKey = SORTABLE_FIELDS.includes(req.query.sortKey) ? req.query.sortKey : 'effectiveDate'
    const sortDir = req.query.sortDir === 'asc' ? 1 : -1

    const [orders, total] = await Promise.all([
      LilyPadOrder.find(query).sort({ [sortKey]: sortDir }).skip((page - 1) * pageSize).limit(pageSize),
      LilyPadOrder.countDocuments(query)
    ])

    return res.status(200).json({
      success: true,
      data: orders,
      pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) }
    })
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
