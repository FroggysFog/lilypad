/**
 * LilyPad ERP - Notifications Routes
 * Polling API for the logged-in user's own notification feed.
 */

const express = require('express')
const router = express.Router()
const controllers = require('../controllers')
const { requireLoginApi } = require('../middleware/lilypadAuth')

module.exports = function () {
  router.get('/notifications', requireLoginApi, controllers.lilypadNotifications.getMyNotifications)
  router.put('/notifications/:id/read', requireLoginApi, controllers.lilypadNotifications.markAsRead)
  router.put('/notifications/read-all', requireLoginApi, controllers.lilypadNotifications.markAllAsRead)
  router.delete('/notifications/:id', requireLoginApi, controllers.lilypadNotifications.deleteNotification)

  return router
}
