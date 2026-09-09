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
  router.post('/tasks/:id/people', requireLogin, controllers.lilypadTasks.tagUser)
  router.delete('/tasks/:id/people/:userId', requireLogin, controllers.lilypadTasks.untagUser)
  router.post('/tasks/:id/comments', requireLogin, controllers.lilypadTasks.addComment)
  router.post('/tasks/:id/subtasks', requireLogin, controllers.lilypadTasks.addSubtask)
  router.put('/tasks/:id/subtasks/:subtaskId', requireLogin, controllers.lilypadTasks.toggleSubtask)
  router.delete('/tasks/:id/subtasks/:subtaskId', requireLogin, controllers.lilypadTasks.deleteSubtask)
  router.post('/tasks/:id/attachments', requireLogin, controllers.lilypadTasks.uploadMiddleware, controllers.lilypadTasks.uploadAttachment)
  router.delete('/tasks/:id/attachments/:attachmentId', requireLogin, controllers.lilypadTasks.deleteAttachment)

  return router
}
