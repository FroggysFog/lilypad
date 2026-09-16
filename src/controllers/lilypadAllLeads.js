/**
 * LilyPad ERP - Unified "All Leads" Controller
 */

const allLeadsService = require('../services/allLeadsService')

const controller = {}

/**
 * GET /api/v1/lilypad/all-leads?search=&division=&source=
 */
controller.list = async function (req, res) {
  try {
    const effectiveRole = (req.user.role === 'admin' ? req.session.previewRole : null) || req.user.role

    const data = await allLeadsService.getAllLeads({
      term: req.query.search,
      division: req.query.division,
      source: req.query.source,
      effectiveRole
    })

    return res.status(200).json({ success: true, ...data })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

module.exports = controller
