/**
 * LilyPad ERP - Sales Command Center Overview Controller
 */

const salesCommandCenterService = require('../services/salesCommandCenterService')

const controller = {}

/**
 * GET /api/v1/lilypad/sales-command-center/overview
 * Bundles pipeline/win-rate, this rep's weekly Sales OS velocity,
 * recent shipments, and sync status into one call.
 */
controller.getOverview = async function (req, res) {
  try {
    const data = await salesCommandCenterService.getOverview(req.user)
    return res.status(200).json({ success: true, data })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

module.exports = controller
