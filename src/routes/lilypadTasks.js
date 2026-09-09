/**
 * LilyPad ERP - Personal Task Manager Routes
 */

const express = require('express')
const router = express.Router()
const controllers = require('../controllers')
const { requireLogin } = require('../middleware/lilypadAuth')

module.exports = function () {
  router.get('/tasks', requireLogin, controllers.lilypadTasks.getTasks)
  router.post('/tasks', requireLogin, controllers.lilypadTasks.createTask)
  router.get('/tasks/:id', requireLogin, controllers.lilypadTasks.getTaskById)
  router.put('/tasks/:id', requireLogin, controllers.lilypadTasks.updateTask)
  router.delete('/tasks/:id', requireLogin, controllers.lilypadTasks.deleteTask)
  router.put('/tasks/:id/status', requireLogin, controllers.lilypadTasks.updateStatus)
  router.put('/tasks/:id/assign', requireLogin, controllers.lilypadTasks.assignTask)
  router.post('/tasks/:id/comments', requireLogin, controllers.lilypadTasks.addComment)

  return router
}
