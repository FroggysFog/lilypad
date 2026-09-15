/**
 * LilyPad ERP - Global Search Routes
 */

const express = require('express')
const router = express.Router()
const controllers = require('../controllers')
const { requireLoginApi } = require('../middleware/lilypadAuth')

module.exports = function () {
  router.get('/search', requireLoginApi, controllers.lilypadSearch.search)

  return router
}
