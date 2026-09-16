const express = require('express')
const router = express.Router()
const controllers = require('../controllers')
const { requireLoginApi } = require('../middleware/lilypadAuth')

module.exports = function () {
  router.post('/customer-intelligence/rebuild', requireLoginApi, controllers.lilypadCustomerIntelligence.triggerRebuild)
  router.get('/customer-intelligence/status', requireLoginApi, controllers.lilypadCustomerIntelligence.getRebuildStatus)
  router.get('/customer-intelligence/profiles', requireLoginApi, controllers.lilypadCustomerIntelligence.getProfiles)
  router.get('/customer-intelligence/profiles/:id', requireLoginApi, controllers.lilypadCustomerIntelligence.getProfileDetail)
  router.get('/customer-intelligence/my-managed', requireLoginApi, controllers.lilypadCustomerIntelligence.getMyManaged)
  router.get('/customer-intelligence/territory-pool', requireLoginApi, controllers.lilypadCustomerIntelligence.getTerritoryPool)
  router.post('/customer-intelligence/profiles/:id/claim', requireLoginApi, controllers.lilypadCustomerIntelligence.claimAccount)
  return router
}
