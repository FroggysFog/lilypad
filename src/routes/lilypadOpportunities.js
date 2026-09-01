/**
 * LilyPad ERP - Opportunities Routes
 */

const express = require('express')
const router = express.Router()
const controllers = require('../controllers')
const { requireLoginApi } = require('../middleware/lilypadAuth')

module.exports = function () {
  router.get('/opportunities', requireLoginApi, controllers.lilypadOpportunities.getOpportunities)
  router.post('/opportunities/sync', requireLoginApi, controllers.lilypadOpportunities.triggerOpportunitySync)
  router.get('/opportunities/:id', requireLoginApi, controllers.lilypadOpportunities.getOpportunityDetail)

  return router
}
