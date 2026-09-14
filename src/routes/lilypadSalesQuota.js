/**
 * LilyPad ERP - Sales Quota Routes
 */

const express = require('express')
const router = express.Router()
const controllers = require('../controllers')
const { requireLoginApi, requireAdminApi } = require('../middleware/lilypadAuth')

module.exports = function () {
  router.get('/sales-quotas', requireAdminApi, controllers.lilypadSalesQuota.getQuotas)
  router.put('/sales-quotas/:userId/:period', requireAdminApi, controllers.lilypadSalesQuota.setQuota)
  router.get('/sales-quotas/me', requireLoginApi, controllers.lilypadSalesQuota.getMyAttainment)

  return router
}
