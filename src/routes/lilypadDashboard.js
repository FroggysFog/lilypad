/**
 * LilyPad ERP - Dashboard REST Routes
 * Endpoints for personal command center preferences, role presets, and widget feeds.
 */

const express = require('express')
const router = express.Router()
const controllers = require('../controllers')
const { requireLoginApi } = require('../middleware/lilypadAuth')

module.exports = function () {
  // Preference management
  router.get('/dashboard/preferences', requireLoginApi, controllers.lilypadDashboard.getPreferences)
  router.put('/dashboard/preferences', requireLoginApi, controllers.lilypadDashboard.savePreferences)
  router.post('/dashboard/preferences/reset', requireLoginApi, controllers.lilypadDashboard.resetPreferences)

  // Modular Widget Data Feeds
  router.get('/dashboard/widgets/rma-bench', requireLoginApi, controllers.lilypadDashboard.getRmaBenchData)
  router.get('/dashboard/widgets/sales-pipeline', requireLoginApi, controllers.lilypadDashboard.getSalesPipelineData)
  router.get('/dashboard/widgets/shipping-dock', requireLoginApi, controllers.lilypadDashboard.getShippingDockData)
  router.get('/dashboard/widgets/past-due-ar', requireLoginApi, controllers.lilypadDashboard.getPastDueData)
  router.get('/dashboard/widgets/lapsed-customers', requireLoginApi, controllers.lilypadDashboard.getLapsedCustomersData)

  return router
}
