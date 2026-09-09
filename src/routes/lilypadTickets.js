/**
 * LilyPad ERP - Core Ticketing Routes
 * RESTful API endpoints for Dynamic Intake Forms and Uniform To-Do Ticketing.
 */

const express = require('express')
const router = express.Router()
const controllers = require('../controllers')
const { requireLogin, requireLoginApi } = require('../middleware/lilypadAuth')

module.exports = function () {
  // Public / Shared: Dynamic Intake Form Definitions
  router.get('/intake-forms', controllers.lilypadTickets.getIntakeForms)
  router.get('/intake-forms/:slug', controllers.lilypadTickets.getIntakeFormBySlug)

  // Public / Internal: Submit Ticket (supports dynamic formData)
  router.post('/tickets', controllers.lilypadTickets.submitTicket)

  // Authenticated: Uniform To-Do List & Ticket Management
  router.get('/tickets/todo', requireLogin, controllers.lilypadTickets.getTodoList)
  router.put('/tickets/bulk/status', requireLogin, controllers.lilypadTickets.bulkUpdateStatus)
  router.delete('/tickets/bulk', requireLogin, controllers.lilypadTickets.bulkDeleteTickets)
  router.get('/tickets/:id', requireLogin, controllers.lilypadTickets.getTicketById)
  router.put('/tickets/:id', requireLogin, controllers.lilypadTickets.updateTicket)
  router.delete('/tickets/:id', requireLogin, controllers.lilypadTickets.deleteTicket)
  router.put('/tickets/:id/status', requireLogin, controllers.lilypadTickets.updateStatus)
  router.put('/tickets/:id/assign', requireLogin, controllers.lilypadTickets.assignTicket)
  router.post('/tickets/:id/comments', requireLogin, controllers.lilypadTickets.addComment)
  router.post('/tickets/:id/attachments', requireLogin, controllers.lilypadTickets.uploadMiddleware, controllers.lilypadTickets.uploadAttachment)
  router.delete('/tickets/:id/attachments/:attachmentId', requireLogin, controllers.lilypadTickets.deleteAttachment)
  router.post('/tickets/:id/worklogs', requireLogin, controllers.lilypadTickets.addWorkLog)
  router.delete('/tickets/:id/worklogs/:workLogId', requireLogin, controllers.lilypadTickets.deleteWorkLog)
  router.post('/tickets/:id/subtasks', requireLogin, controllers.lilypadTickets.addSubtask)
  router.put('/tickets/:id/subtasks/:subtaskId', requireLogin, controllers.lilypadTickets.toggleSubtask)
  router.delete('/tickets/:id/subtasks/:subtaskId', requireLogin, controllers.lilypadTickets.deleteSubtask)
  router.post('/tickets/:id/watchers', requireLogin, controllers.lilypadTickets.addWatcher)
  router.delete('/tickets/:id/watchers/:userId', requireLogin, controllers.lilypadTickets.removeWatcher)
  router.post('/tickets/:id/expenses', requireLogin, controllers.lilypadTickets.addExpense)
  router.delete('/tickets/:id/expenses/:expenseId', requireLogin, controllers.lilypadTickets.deleteExpense)

  // Self-service account
  router.get('/account/me', requireLoginApi, controllers.lilypadUsers.getMe)
  router.put('/account/password', requireLogin, controllers.lilypadUsers.changeMyPassword)

  // Admin & Team Management: User Accounts
  router.get('/users', requireLogin, controllers.lilypadUsers.getUsers)
  router.post('/users', requireLogin, controllers.lilypadUsers.createUser)
  router.put('/users/:id', requireLogin, controllers.lilypadUsers.updateUser)
  router.delete('/users/:id', requireLogin, controllers.lilypadUsers.deleteUser)

  return router
}
