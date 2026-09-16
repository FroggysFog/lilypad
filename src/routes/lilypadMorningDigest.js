/**
 * LilyPad ERP - Morning Report Routes
 */

const express = require('express')
const router = express.Router()
const controllers = require('../controllers')
const { requireLoginApi } = require('../middleware/lilypadAuth')

module.exports = function () {
  router.get('/morning-digest', requireLoginApi, controllers.lilypadMorningDigest.get)
  router.post('/morning-digest/refresh', requireLoginApi, controllers.lilypadMorningDigest.refresh)

  return router
}
