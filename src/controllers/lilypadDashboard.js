/**
 * LilyPad ERP - Dashboard Controller
 * Handles user dashboard preferences, role presets, and modular widget data feeds.
 */

const xss = require('xss')
const dashboardRolePresets = require('../services/dashboardRolePresets')
const LilyPadSetting = require('../models/lilypadSetting')
const {
  LilyPadTicket,
  LilyPadOrder,
  LilyPadCartOrder,
  LilyPadOpportunity,
  LilyPadPastDueAccount
} = require('../models')
// Not exported from the models/index.js barrel (only a handful of models
// are) - require it directly, same as lilypadCustomerIntelligence.js does.
const LilyPadCustomerProfile = require('../models/lilypadCustomerProfile')
const { getOpportunityOwnerFilter, resolveOwnedSalesforceAccountIds } = require('../services/repMatchingService')
const lilypadSalesQuotaController = require('./lilypadSalesQuota')

const lilypadDashboardController = {}

// A singleton stored in the generic settings collection (see
// lilypadSetting.js) rather than its own model - one banner shown to
// everyone on the Command Center, not a list with its own lifecycle.
const ANNOUNCEMENT_SETTING_KEY = 'dashboardAnnouncement'

/**
 * GET /api/v1/lilypad/dashboard/announcement
 * Returns null if nothing's ever been set - the widget falls back to
 * its own default copy in that case rather than showing an empty banner.
 */
lilypadDashboardController.getAnnouncement = async function (req, res) {
  try {
    const setting = await LilyPadSetting.findOne({ key: ANNOUNCEMENT_SETTING_KEY })
    return res.status(200).json({ success: true, data: setting ? setting.value : null })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * PUT /api/v1/lilypad/dashboard/announcement
 * Admin-only - this is a company-wide banner shown to every role.
 */
lilypadDashboardController.setAnnouncement = async function (req, res) {
  try {
    const title = xss(String(req.body.title || '').trim())
    const message = xss(String(req.body.message || '').trim())
    const buttonLabel = xss(String(req.body.buttonLabel || '').trim())
    const buttonHref = xss(String(req.body.buttonHref || '').trim())
    if (!message) {
      return res.status(400).json({ success: false, error: 'A message is required.' })
    }
    // Only relative in-app links or http(s) URLs - blocks javascript:/data:
    // hrefs from ending up in an href attribute every user's browser renders.
    if (buttonHref && !/^(https?:)?\/\//i.test(buttonHref) && !/^[a-z0-9_-]+\.html/i.test(buttonHref)) {
      return res.status(400).json({ success: false, error: 'Button link must be a page on this site or a full https:// URL.' })
    }

    const value = {
      title: title || 'Operations Announcement',
      message,
      buttonLabel,
      buttonHref,
      updatedAt: new Date(),
      updatedByName: (req.user && req.user.fullname) || ''
    }

    await LilyPadSetting.findOneAndUpdate(
      { key: ANNOUNCEMENT_SETTING_KEY },
      { key: ANNOUNCEMENT_SETTING_KEY, value },
      { upsert: true }
    )

    return res.status(200).json({ success: true, data: value })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * GET /api/v1/lilypad/dashboard/preferences
 * Returns the active user's layout preferences, plus all available widgets & KPIs for their role.
 *
 * An admin using "Preview As" (see lilypadRolePermissions.js/
 * pageAccessGate.js for the same pattern applied to page nav) sees that
 * role's own default Command Center layout here, not their real admin
 * account's personal widget customization - previewing is meant to show
 * what the role sees, and an admin's own dashboardPreferences almost
 * certainly isn't that.
 */
lilypadDashboardController.getPreferences = async function (req, res) {
  try {
    const user = req.user
    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    const previewRole = user.role === 'admin' ? req.session.previewRole : null
    const effectiveRole = previewRole || user.role

    let preferences
    if (previewRole) {
      const preset = await dashboardRolePresets.getPresetForRole(effectiveRole)
      const allowedWidgetIds = (await dashboardRolePresets.getAvailableWidgetsForRole(effectiveRole)).map(w => w.id)
      const allowedKpiIds = (await dashboardRolePresets.getAvailableKpisForRole(effectiveRole)).map(k => k.id)
      preferences = {
        role: effectiveRole,
        roleName: preset.roleName,
        customized: false,
        layoutMode: preset.layoutMode || 'bento',
        widgets: preset.widgets.filter((id) => allowedWidgetIds.includes(id)),
        kpis: preset.kpis.filter((id) => allowedKpiIds.includes(id))
      }
    } else {
      preferences = await dashboardRolePresets.getPreferencesForAccount(user)
    }

    const availableWidgets = await dashboardRolePresets.getAvailableWidgetsForRole(effectiveRole)
    const availableKpis = await dashboardRolePresets.getAvailableKpisForRole(effectiveRole)

    return res.json({
      success: true,
      preferences,
      availableWidgets,
      availableKpis
    })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * PUT /api/v1/lilypad/dashboard/preferences
 * Saves custom widget ordering, KPI selection, and layout mode.
 */
lilypadDashboardController.savePreferences = async function (req, res) {
  try {
    const user = req.user
    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    const { widgets, kpis, layoutMode } = req.body
    if (!Array.isArray(widgets)) {
      return res.status(400).json({ success: false, error: 'widgets must be an array' })
    }

    const updatedAccount = await dashboardRolePresets.savePreferencesForAccount(
      user._id,
      { widgets, kpis, layoutMode },
      user.role
    )

    const preferences = await dashboardRolePresets.getPreferencesForAccount(updatedAccount)

    return res.json({
      success: true,
      message: 'Dashboard preferences saved successfully',
      preferences
    })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/dashboard/preferences/reset
 * Reverts the user's dashboard back to their official role default preset.
 */
lilypadDashboardController.resetPreferences = async function (req, res) {
  try {
    const user = req.user
    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    const updatedAccount = await dashboardRolePresets.resetPreferencesForAccount(user._id, user.role)
    const preferences = await dashboardRolePresets.getPreferencesForAccount(updatedAccount)

    return res.json({
      success: true,
      message: 'Dashboard reset to role default layout',
      preferences
    })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * GET /api/v1/lilypad/dashboard/widgets/rma-bench
 * Provides active RMA & diagnostic tickets for Support & Tech teams.
 */
lilypadDashboardController.getRmaBenchData = async function (req, res) {
  try {
    const tickets = await LilyPadTicket.find({
      deleted: false,
      $or: [
        { categoryName: /FX Machine|Machine|Repair|Diagnostic/i },
        { tags: { $in: ['RMA', 'rma', 'bench', 'repair'] } }
      ],
      status: { $ne: 'Complete' }
    })
      .sort({ priority: -1, updatedAt: -1 })
      .limit(10)
      .lean()

    return res.json({ success: true, tickets })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * GET /api/v1/lilypad/dashboard/widgets/sales-pipeline
 * Provides active deals & pipeline summary for Sales teams.
 */
lilypadDashboardController.getSalesPipelineData = async function (req, res) {
  try {
    let opportunities = []
    if (LilyPadOpportunity) {
      const query = { isClosed: false }
      // Admins previewing a role see that role's scoped view too, same
      // as every other role-gated behavior in this file (see getMe).
      const effectiveRole = (req.user.role === 'admin' ? req.session.previewRole : null) || req.user.role
      if (dashboardRolePresets.normalizeRoleKey(effectiveRole) === 'sales') {
        Object.assign(query, getOpportunityOwnerFilter(req.user))
      }
      opportunities = await LilyPadOpportunity.find(query)
        .sort({ amount: -1, closeDate: 1 })
        .limit(8)
        .lean()
    }

    return res.json({ success: true, opportunities })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * GET /api/v1/lilypad/dashboard/widgets/shipping-dock
 * Provides packing & freight order feed for Warehouse & Logistics teams.
 */
lilypadDashboardController.getShippingDockData = async function (req, res) {
  try {
    let orders = []
    if (LilyPadCartOrder) {
      orders = await LilyPadCartOrder.find({
        status: { $in: ['Processing', 'Awaiting Fulfillment', 'Pending', 'Partially Shipped'] }
      })
        .sort({ orderDate: -1 })
        .limit(10)
        .lean()
    }

    if (!orders.length && LilyPadOrder) {
      orders = await LilyPadOrder.find({
        status: { $nin: ['Delivered', 'Cancelled', 'Closed'] }
      })
        .sort({ orderDate: -1 })
        .limit(10)
        .lean()
    }

    return res.json({ success: true, orders })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * GET /api/v1/lilypad/dashboard/widgets/past-due-ar
 * Provides A/R watchlist for Finance & Accounting.
 */
lilypadDashboardController.getPastDueData = async function (req, res) {
  try {
    let accounts = []
    if (LilyPadPastDueAccount) {
      accounts = await LilyPadPastDueAccount.find({
        totalOverdue: { $gt: 0 }
      })
        .sort({ totalOverdue: -1 })
        .limit(8)
        .lean()
    }

    return res.json({ success: true, accounts })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * GET /api/v1/lilypad/dashboard/widgets/lapsed-customers
 * Identifies accounts due for fluid replenishment.
 */
lilypadDashboardController.getLapsedCustomersData = async function (req, res) {
  try {
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
    let customers = []
    if (LilyPadCustomerProfile) {
      const query = { 'orderStats.lastOrderDate': { $lte: sixtyDaysAgo, $ne: null } }
      const effectiveRole = (req.user.role === 'admin' ? req.session.previewRole : null) || req.user.role
      if (dashboardRolePresets.normalizeRoleKey(effectiveRole) === 'sales') {
        const ownedIds = await resolveOwnedSalesforceAccountIds(req.user)
        query.salesforceAccountId = { $in: ownedIds }
      }
      customers = await LilyPadCustomerProfile.find(query)
        .sort({ 'orderStats.lifetimeRevenue': -1 })
        .limit(8)
        .lean()
    }

    return res.json({ success: true, customers })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * GET /api/v1/lilypad/dashboard/widgets/sales-quota
 * Delegates to the quota controller rather than duplicating its
 * personal-vs-org-wide branching logic here.
 */
lilypadDashboardController.getSalesQuotaData = function (req, res) {
  return lilypadSalesQuotaController.getQuotaWidgetData(req, res)
}

module.exports = lilypadDashboardController
