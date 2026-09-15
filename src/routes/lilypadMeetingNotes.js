/**
 * LilyPad ERP - Meeting Notes Routes
 */

const express = require('express')
const router = express.Router()
const controllers = require('../controllers')
const { requireLoginApi, requireAdminApi } = require('../middleware/lilypadAuth')

module.exports = function () {
  router.get('/meeting-notes', requireAdminApi, controllers.lilypadMeetingNotes.listRecent)
  router.get('/meeting-notes/for-event', requireLoginApi, controllers.lilypadMeetingNotes.getForEvent)

  return router
}
