/**
 * LilyPad ERP - Global Search Controller
 */

const { globalSearch } = require('../services/globalSearchService')

const lilypadSearchController = {}

/**
 * GET /api/v1/lilypad/search?q=...
 */
lilypadSearchController.search = async function (req, res) {
  try {
    const q = String(req.query.q || '').trim()
    if (q.length < 2) {
      return res.status(200).json({ success: true, data: {} })
    }

    // Same effective-role resolution as every other role-aware controller
    // (e.g. getMe, getSalesPipelineData) - an admin using "Preview as"
    // sees search results scoped to the previewed role, not their own.
    const previewRole = req.user.role === 'admin' ? req.session.previewRole : null
    const effectiveRole = previewRole || req.user.role

    const data = await globalSearch(q, req.user, effectiveRole)
    return res.status(200).json({ success: true, data })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

module.exports = lilypadSearchController
