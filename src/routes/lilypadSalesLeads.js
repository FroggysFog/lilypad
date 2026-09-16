/**
 * LilyPad ERP - Sales OS Leads Routes
 * Mounted under /api/v1/lilypad, matching this app's one API namespace,
 * rather than a standalone /sales mount - the original spec assumed a
 * server-rendered-views app (`res.render('sales/battle-plan')`), which
 * doesn't apply here; this app serves static HTML pages backed by this
 * same JSON API prefix everywhere else (see reports.html, receipts.html,
 * morning-report.html for the identical pattern).
 */

const express = require('express')
const router = express.Router()
const controllers = require('../controllers')
const { requireLoginApi } = require('../middleware/lilypadAuth')

module.exports = function () {
  router.get('/sales-leads', requireLoginApi, controllers.lilypadSalesLeads.list)
  router.post('/sales-leads/search', requireLoginApi, controllers.lilypadSalesLeads.search)
  router.get('/sales-leads/reactivation/:division', requireLoginApi, controllers.lilypadSalesLeads.reactivation)
  router.post('/sales-leads/goal-scrape', requireLoginApi, controllers.lilypadSalesLeads.goalScrape)
  router.post('/sales-leads/promote-staged/:stagedLeadId', requireLoginApi, controllers.lilypadSalesLeads.promoteStaged)
  router.get('/sales-leads/jobs/:id', requireLoginApi, controllers.lilypadSalesLeads.getJob)
  router.post('/sales-leads/score-now', requireLoginApi, controllers.lilypadSalesLeads.scoreNow)
  router.post('/sales-leads/research-contacts', requireLoginApi, controllers.lilypadSalesLeads.researchContacts)
  router.post('/sales-leads/:id/create-quote', requireLoginApi, controllers.lilypadSalesLeads.createQuote)
  router.post('/sales-leads/:id/status', requireLoginApi, controllers.lilypadSalesLeads.updateStatus)

  return router
}
