const express = require('express')
const router = express.Router()
const controllers = require('../controllers')
const { requireLoginApi } = require('../middleware/lilypadAuth')

module.exports = function () {
  router.get('/sales-command-center/overview', requireLoginApi, controllers.lilypadSalesCommandCenter.getOverview)
  return router
}
