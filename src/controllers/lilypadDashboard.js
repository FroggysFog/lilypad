/**
 * LilyPad ERP - Dashboard Controller
 * Handles user dashboard preferences, role presets, and modular widget data feeds.
 */

const dashboardRolePresets = require('../services/dashboardRolePresets')
const {
  LilyPadTicket,
  LilyPadOrder,
  LilyPadCartOrder,
  LilyPadOpportunity,
  LilyPadPastDueAccount,
  LilyPadCustomerProfile
} = require('../models')

const lilypadDashboardController = {}

/**
 * GET /api/v1/lilypad/dashboard/preferences
 * Returns the active user's layout preferences, plus all available widgets & KPIs for their role.
 */
lilypadDashboardController.getPreferences = async function (req, res) {
  try {
    const user = req.user
    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    const preferences = await dashboardRolePresets.getPreferencesForAccount(user)
    const availableWidgets = dashboardRolePresets.getAvailableWidgetsForRole(user.role)
    const availableKpis = dashboardRolePresets.getAvailableKpisForRole(user.role)

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
      opportunities = await LilyPadOpportunity.find({
        isClosed: false
      })
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
      customers = await LilyPadCustomerProfile.find({
        lastOrderDate: { $lte: sixtyDaysAgo, $ne: null }
      })
        .sort({ totalSpend: -1 })
        .limit(8)
        .lean()
    }

    return res.json({ success: true, customers })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

module.exports = lilypadDashboardController
