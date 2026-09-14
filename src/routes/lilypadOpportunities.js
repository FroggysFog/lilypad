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
  router.post('/opportunities/:id/activities', requireLoginApi, controllers.lilypadOpportunities.addActivity)
  router.delete('/opportunities/:id/activities/:activityId', requireLoginApi, controllers.lilypadOpportunities.deleteActivity)
  router.put('/opportunities/:id/salesforce-sync', requireLoginApi, controllers.lilypadOpportunities.pushSalesforceSync)

  return router
}
