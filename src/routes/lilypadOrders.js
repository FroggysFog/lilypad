/**
 * LilyPad ERP - Orders Routes
 */

const express = require('express')
const router = express.Router()
const controllers = require('../controllers')
const { requireLoginApi } = require('../middleware/lilypadAuth')

module.exports = function () {
  router.get('/orders', requireLoginApi, controllers.lilypadOrders.getOrders)
  router.post('/orders/sync', requireLoginApi, controllers.lilypadOrders.triggerOrderSync)
  router.get('/orders/:id', requireLoginApi, controllers.lilypadOrders.getOrderDetail)

  return router
}
