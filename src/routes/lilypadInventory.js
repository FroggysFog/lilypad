const express = require('express')
const router = express.Router()
const controllers = require('../controllers')
const { requireLoginApi } = require('../middleware/lilypadAuth')

module.exports = function () {
  router.get('/inventory', requireLoginApi, controllers.lilypadInventory.list)
  router.post('/inventory', requireLoginApi, controllers.lilypadInventory.create)
  router.put('/inventory/:id', requireLoginApi, controllers.lilypadInventory.update)
  router.delete('/inventory/:id', requireLoginApi, controllers.lilypadInventory.remove)
  return router
}
