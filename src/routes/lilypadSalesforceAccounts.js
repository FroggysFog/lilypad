/**
 * LilyPad ERP - Salesforce Accounts Routes
 */

const express = require('express')
const router = express.Router()
const controllers = require('../controllers')
const { requireLoginApi } = require('../middleware/lilypadAuth')

module.exports = function () {
  router.get('/salesforce-accounts', requireLoginApi, controllers.lilypadSalesforceAccounts.getAccounts)
  router.post('/salesforce-accounts/sync', requireLoginApi, controllers.lilypadSalesforceAccounts.triggerAccountSync)
  router.get('/salesforce-accounts/:id', requireLoginApi, controllers.lilypadSalesforceAccounts.getAccountDetail)

  return router
}
