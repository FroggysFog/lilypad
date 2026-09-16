/**
 * LilyPad ERP - Unified "All Leads" Routes
 */

const express = require('express')
const router = express.Router()
const controllers = require('../controllers')
const { requireLoginApi } = require('../middleware/lilypadAuth')

module.exports = function () {
  router.get('/all-leads', requireLoginApi, controllers.lilypadAllLeads.list)

  return router
}
