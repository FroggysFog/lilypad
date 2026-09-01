/**
 * LilyPad ERP - Core Ticketing Routes
 * RESTful API endpoints for Dynamic Intake Forms and Uniform To-Do Ticketing.
 */

const express = require('express')
const router = express.Router()
const controllers = require('../controllers')
const { requireLogin } = require('../middleware/lilypadAuth')

module.exports = function () {
  // Public / Shared: Dynamic Intake Form Definitions
  router.get('/intake-forms', controllers.lilypadTickets.getIntakeForms)
  router.get('/intake-forms/:slug', controllers.lilypadTickets.getIntakeFormBySlug)

  // Public / Internal: Submit Ticket (supports dynamic formData)
  router.post('/tickets', controllers.lilypadTickets.submitTicket)

  // Authenticated: Uniform To-Do List & Ticket Management
  router.get('/tickets/todo', requireLogin, controllers.lilypadTickets.getTodoList)
  router.get('/tickets/:id', requireLogin, controllers.lilypadTickets.getTicketById)
  router.put('/tickets/:id/status', requireLogin, controllers.lilypadTickets.updateStatus)
  router.put('/tickets/:id/assign', requireLogin, controllers.lilypadTickets.assignTicket)
  router.post('/tickets/:id/comments', requireLogin, controllers.lilypadTickets.addComment)

  // Self-service account
  router.put('/account/password', requireLogin, controllers.lilypadUsers.changeMyPassword)

  // Admin & Team Management: User Accounts
  router.get('/users', requireLogin, controllers.lilypadUsers.getUsers)
  router.post('/users', requireLogin, controllers.lilypadUsers.createUser)
  router.put('/users/:id', requireLogin, controllers.lilypadUsers.updateUser)
  router.delete('/users/:id', requireLogin, controllers.lilypadUsers.deleteUser)

  return router
}
