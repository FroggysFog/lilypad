/**
 * LilyPad ERP - Ask-a-Report Controller
 */

const LilyPadReportCard = require('../models/lilypadReportCard')
const LilyPadAccount = require('../models/lilypadAccount')
const reportQueryService = require('../services/reportQueryService')
const dashboardRolePresets = require('../services/dashboardRolePresets')

const controller = {}

/**
 * GET /api/v1/lilypad/reports/roles
 * Roles currently in use, for the "share with role" picker on the
 * Reports page - login-gated (not admin-only, unlike
 * lilypadRolePermissions.js's fuller catalog) since any user creating a
 * report needs this list, not just admins. Admin is excluded since
 * admins already see role/everyone-shared reports like anyone else in
 * that role would - there's no separate "admin view" of reports.
 */
controller.listRoles = async function (req, res) {
  try {
    const roles = await LilyPadAccount.distinct('role', { deleted: { $ne: true } })
    return res.status(200).json({ success: true, data: roles.filter((r) => r && r !== 'admin').sort() })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/reports/preview
 * Read-only - generates the answer but persists nothing, so the user
 * can review it on the Reports page before deciding to save it.
 */
controller.preview = async function (req, res) {
  try {
    const question = String(req.body.question || '').trim()
    if (!question) {
      return res.status(400).json({ success: false, error: 'A question is required.' })
    }

    const preview = await reportQueryService.generatePreview(question)
    return res.status(200).json({ success: true, ...preview })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/reports
 * Saves a previously-previewed report and, unless kept private, shares
 * it - also ensures the report-cards widget shows up on the creator's
 * own dashboard so it's visible without a separate customizer trip.
 */
controller.create = async function (req, res) {
  try {
    const { question, title, params, visibility, sharedRole } = req.body

    if (!title || !params || !params.startDate || !params.endDate) {
      return res.status(400).json({ success: false, error: 'A title and resolved report parameters are required.' })
    }

    const finalVisibility = ['private', 'role', 'everyone'].includes(visibility) ? visibility : 'private'
    let finalSharedRole = ''

    if (finalVisibility === 'role') {
      const rolesInUse = await LilyPadAccount.distinct('role', { deleted: { $ne: true } })
      if (!sharedRole || !rolesInUse.includes(sharedRole)) {
        return res.status(400).json({ success: false, error: 'sharedRole must be a role currently in use.' })
      }
      finalSharedRole = sharedRole
    }

    const card = await LilyPadReportCard.create({
      owner: req.user._id,
      question: String(question || '').slice(0, 500),
      title: String(title).slice(0, 200),
      params: {
        repName: params.repName || '',
        startDate: params.startDate,
        endDate: params.endDate,
        groupBy: params.groupBy === 'category' ? 'category' : 'none'
      },
      visibility: finalVisibility,
      sharedRole: finalSharedRole
    })

    await dashboardRolePresets.ensureWidgetEnabled(req.user._id, 'report-cards')

    return res.status(200).json({ success: true, data: card })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * GET /api/v1/lilypad/reports
 * The creator's own saved reports, for the "My Saved Reports" list.
 */
controller.listMine = async function (req, res) {
  try {
    const cards = await LilyPadReportCard.find({ owner: req.user._id }).sort({ createdAt: -1 })
    return res.status(200).json({ success: true, data: cards })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * DELETE /api/v1/lilypad/reports/:id
 */
controller.remove = async function (req, res) {
  try {
    const result = await LilyPadReportCard.deleteOne({ _id: req.params.id, owner: req.user._id })
    if (!result.deletedCount) {
      return res.status(404).json({ success: false, error: 'Report not found.' })
    }
    return res.status(200).json({ success: true })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * GET /api/v1/lilypad/dashboard/widgets/report-cards
 * The dashboard's live-refresh endpoint - every card visible to this
 * user (own, or shared to their role/everyone), each re-run through
 * runRevenueReport fresh so the numbers are never a stale snapshot.
 */
controller.getWidgetData = async function (req, res) {
  try {
    const effectiveRole = (req.user.role === 'admin' ? req.session.previewRole : null) || req.user.role

    const cards = await LilyPadReportCard.find({
      $or: [
        { owner: req.user._id },
        { visibility: 'everyone' },
        { visibility: 'role', sharedRole: effectiveRole }
      ]
    }).sort({ createdAt: -1 }).lean()

    const data = await Promise.all(cards.map(async (card) => {
      try {
        const result = await reportQueryService.runRevenueReport(card.params)
        const repLabel = card.params.repName || 'Company-wide'
        return {
          _id: card._id,
          title: card.title,
          question: card.question,
          visibility: card.visibility,
          isOwner: String(card.owner) === String(req.user._id),
          summary: reportQueryService.buildSummaryText(card.params, repLabel, result),
          total: result.total
        }
      } catch (err) {
        return { _id: card._id, title: card.title, error: 'Unable to refresh this report right now.' }
      }
    }))

    return res.status(200).json({ success: true, data })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

module.exports = controller
