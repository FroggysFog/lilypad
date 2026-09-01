/**
 * LilyPad ERP - Customers Routes
 */

const express = require('express')
const router = express.Router()
const controllers = require('../controllers')
const { requireLoginApi } = require('../middleware/lilypadAuth')

module.exports = function () {
  router.get('/customers', requireLoginApi, controllers.lilypadCustomers.getCustomers)
  router.post('/customers/sync', requireLoginApi, controllers.lilypadCustomers.triggerCustomerSync)
  router.get('/customers/:id', requireLoginApi, controllers.lilypadCustomers.getCustomerDetail)

  return router
}
