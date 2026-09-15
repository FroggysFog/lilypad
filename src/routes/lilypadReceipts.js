/**
 * LilyPad ERP - Receipts Routes
 */

const express = require('express')
const router = express.Router()
const controllers = require('../controllers')
const { requireLoginApi } = require('../middleware/lilypadAuth')

module.exports = function () {
  router.get('/receipts', requireLoginApi, controllers.lilypadReceipts.listMine)
  router.get('/receipts/:id', requireLoginApi, controllers.lilypadReceipts.getById)
  router.post('/receipts/:id/dismiss', requireLoginApi, controllers.lilypadReceipts.dismiss)

  return router
}
