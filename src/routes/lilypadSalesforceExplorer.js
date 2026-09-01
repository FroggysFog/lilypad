/**
 * LilyPad ERP - Salesforce Schema Explorer Routes
 * Admin-only: this browses raw org schema, not day-to-day operational data.
 */

const express = require('express')
const router = express.Router()
const controllers = require('../controllers')
const { requireAdminApi } = require('../middleware/lilypadAuth')

module.exports = function () {
  router.get('/salesforce/objects', requireAdminApi, controllers.salesforceExplorer.listObjects)
  router.get('/salesforce/objects/:name/preview', requireAdminApi, controllers.salesforceExplorer.previewObject)
  router.get('/salesforce/objects/:name', requireAdminApi, controllers.salesforceExplorer.describeObject)

  return router
}
