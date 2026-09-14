/**
 * LilyPad ERP - Sales Quota & Commission Attainment Controller
 * Quota targets are admin-set and stored (LilyPadSalesQuota); attainment
 * against a quota is always computed live from LilyPadOpportunity, never
 * stored, so it can't go stale relative to the Salesforce sync.
 */

const LilyPadAccount = require('../models/lilypadAccount')
const LilyPadSalesQuota = require('../models/lilypadSalesQuota')
const LilyPadOpportunity = require('../models/lilypadOpportunity')
const dashboardRolePresets = require('../services/dashboardRolePresets')
const repMatchingService = require('../services/repMatchingService')

const controller = {}

function currentPeriod () {
  const now = new Date()
  return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0')
}

function isValidPeriod (period) {
  return /^\d{4}-\d{2}$/.test(period)
}

// closeDate is stored as a plain SF-format date string ('YYYY-MM-DD'),
// not a Date - string comparison against ISO-formatted bounds works
// correctly as long as the end bound is the period's real last day.
function periodBounds (period) {
  const [year, month] = period.split('-').map(Number)
  const lastDay = new Date(year, month, 0).getDate()
  return {
    start: period + '-01',
    end: period + '-' + String(lastDay).padStart(2, '0')
  }
}

async function computeAttainment (user, period) {
  const { start, end } = periodBounds(period)
  const ownerFilter = repMatchingService.getOpportunityOwnerFilter(user)
  const result = await LilyPadOpportunity.aggregate([
    { $match: { ...ownerFilter, isWon: true, closeDate: { $gte: start, $lte: end } } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ])
  return result.length ? result[0].total : 0
}

/**
 * GET /api/v1/lilypad/sales-quotas?period=YYYY-MM
 * Admin-only. Every sales-role account, left-joined with its quota for
 * the period (0 if none set yet) and its live attainment.
 */
controller.getQuotas = async function (req, res) {
  try {
    const period = isValidPeriod(req.query.period) ? req.query.period : currentPeriod()

    const accounts = await LilyPadAccount.find({ deleted: { $ne: true } }).select('fullname email role')
    const salesAccounts = accounts.filter((a) => dashboardRolePresets.normalizeRoleKey(a.role) === 'sales')

    const quotaDocs = await LilyPadSalesQuota.find({ period, user: { $in: salesAccounts.map((a) => a._id) } })
    const quotaByUserId = new Map(quotaDocs.map((q) => [String(q.user), q]))

    const rows = await Promise.all(salesAccounts.map(async (account) => {
      const quotaDoc = quotaByUserId.get(String(account._id))
      const attainedAmount = await computeAttainment(account, period)
      return {
        userId: account._id,
        fullname: account.fullname,
        email: account.email,
        quotaAmount: quotaDoc ? quotaDoc.quotaAmount : 0,
        attainedAmount
      }
    }))

    return res.status(200).json({ success: true, data: rows, period })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * PUT /api/v1/lilypad/sales-quotas/:userId/:period
 * Admin-only. Upserts one rep's quota target for one month.
 */
controller.setQuota = async function (req, res) {
  try {
    const { userId, period } = req.params
    if (!isValidPeriod(period)) {
      return res.status(400).json({ success: false, error: 'Period must be in YYYY-MM format.' })
    }
    const quotaAmount = Number(req.body.quotaAmount)
    if (!Number.isFinite(quotaAmount) || quotaAmount < 0) {
      return res.status(400).json({ success: false, error: 'quotaAmount must be a non-negative number.' })
    }

    const saved = await LilyPadSalesQuota.findOneAndUpdate(
      { user: userId, period },
      { user: userId, period, quotaAmount, setByName: (req.user && req.user.fullname) || '' },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    return res.status(200).json({ success: true, data: saved })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * GET /api/v1/lilypad/sales-quotas/me?period=YYYY-MM
 * Any logged-in user - their own quota + live attainment for the period.
 */
controller.getMyAttainment = async function (req, res) {
  try {
    const period = isValidPeriod(req.query.period) ? req.query.period : currentPeriod()
    const quotaDoc = await LilyPadSalesQuota.findOne({ user: req.user._id, period })
    const attainedAmount = await computeAttainment(req.user, period)

    return res.status(200).json({
      success: true,
      data: {
        period,
        quotaAmount: quotaDoc ? quotaDoc.quotaAmount : 0,
        attainedAmount
      }
    })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * Shared by the dashboard widget route (getSalesQuotaData in
 * lilypadDashboard.js) - personal bar for a sales rep, org-wide table
 * for admin/operations, so the widget doesn't need its own copy of
 * this branching logic.
 */
controller.getQuotaWidgetData = async function (req, res) {
  const effectiveRole = (req.user.role === 'admin' ? req.session.previewRole : null) || req.user.role
  if (dashboardRolePresets.normalizeRoleKey(effectiveRole) === 'sales') {
    return controller.getMyAttainment(req, res)
  }
  return controller.getQuotas(req, res)
}

module.exports = controller
