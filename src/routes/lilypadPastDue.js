/**
 * LilyPad ERP - Past Due Payments Routes
 */

const express = require('express')
const router = express.Router()
const controllers = require('../controllers')
const { requireLoginApi } = require('../middleware/lilypadAuth')

module.exports = function () {
  router.get('/past-due', requireLoginApi, controllers.lilypadPastDue.getPastDueAccounts)
  router.get('/past-due/delivery-log', requireLoginApi, controllers.lilypadPastDue.getDeliveryLog)
  router.get('/past-due/templates', requireLoginApi, controllers.lilypadPastDue.getReminderTemplates)
  router.post('/past-due/templates', requireLoginApi, controllers.lilypadPastDue.saveReminderTemplate)
  router.post('/past-due/templates/:templateKey/toggle', requireLoginApi, controllers.lilypadPastDue.toggleReminderTemplate)
  router.get('/past-due/automation', requireLoginApi, controllers.lilypadPastDue.getReminderAutomationStatus)
  router.post('/past-due/automation/toggle', requireLoginApi, controllers.lilypadPastDue.toggleReminderAutomation)
  router.post('/past-due/sync', requireLoginApi, controllers.lilypadPastDue.triggerSalesforceSync)
  router.post('/past-due/sync-cart', requireLoginApi, controllers.lilypadPastDue.triggerCartSync)
  router.get('/past-due/:id', requireLoginApi, controllers.lilypadPastDue.getPastDueAccountDetail)
  router.put('/past-due/:id/payer-info', requireLoginApi, controllers.lilypadPastDue.updatePayerInfo)
  router.post('/past-due/:id/send-reminder', requireLoginApi, controllers.lilypadPastDue.sendManualReminder)

  return router
}
