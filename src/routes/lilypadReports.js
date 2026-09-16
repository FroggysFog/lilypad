/**
 * LilyPad ERP - Ask-a-Report Routes
 */

const express = require('express')
const router = express.Router()
const controllers = require('../controllers')
const { requireLoginApi } = require('../middleware/lilypadAuth')

module.exports = function () {
  router.get('/reports/roles', requireLoginApi, controllers.lilypadReports.listRoles)
  router.post('/reports/preview', requireLoginApi, controllers.lilypadReports.preview)
  router.post('/reports', requireLoginApi, controllers.lilypadReports.create)
  router.get('/reports', requireLoginApi, controllers.lilypadReports.listMine)
  router.delete('/reports/:id', requireLoginApi, controllers.lilypadReports.remove)

  return router
}
