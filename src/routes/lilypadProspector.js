const express = require('express')
const router = express.Router()
const controllers = require('../controllers')
const { requireLoginApi } = require('../middleware/lilypadAuth')

module.exports = function () {
  router.post('/leads/prospect', requireLoginApi, controllers.lilypadProspector.prospectLeads)
  router.get('/leads/verticals', requireLoginApi, controllers.lilypadProspector.getVerticals)
  router.get('/leads/batches', requireLoginApi, controllers.lilypadProspector.getBatches)
  router.get('/leads/batches/:id', requireLoginApi, controllers.lilypadProspector.getBatchStatus)
  router.get('/leads/batches/:id/leads', requireLoginApi, controllers.lilypadProspector.getBatchLeads)
  router.post('/leads/batches/:id/pause', requireLoginApi, controllers.lilypadProspector.pauseBatch)
  router.post('/leads/batches/:id/resume', requireLoginApi, controllers.lilypadProspector.resumeBatch)
  router.post('/leads/promote', requireLoginApi, controllers.lilypadProspector.promoteLeads)
  return router
}
