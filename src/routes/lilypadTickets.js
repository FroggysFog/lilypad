/**
 * LilyPad ERP - Core Ticketing Routes
 * RESTful API endpoints for Dynamic Intake Forms and Uniform To-Do Ticketing.
 */

const express = require('express')
const router = express.Router()
const controllers = require('../controllers')

module.exports = function (middleware) {
  // Public / Shared: Dynamic Intake Form Definitions
  router.get('/intake-forms', controllers.lilypadTickets.getIntakeForms)
  router.get('/intake-forms/:slug', controllers.lilypadTickets.getIntakeFormBySlug)

  // Public / Internal: Submit Ticket (supports dynamic formData)
  router.post('/tickets', controllers.lilypadTickets.submitTicket)

  // Authenticated: Uniform To-Do List & Ticket Management
  router.get('/tickets/todo', middleware ? middleware.redirectToLogin : (req, res, next) => next(), controllers.lilypadTickets.getTodoList)
  router.get('/tickets/:id', middleware ? middleware.redirectToLogin : (req, res, next) => next(), controllers.lilypadTickets.getTicketById)
  router.put('/tickets/:id/status', middleware ? middleware.redirectToLogin : (req, res, next) => next(), controllers.lilypadTickets.updateStatus)
  router.put('/tickets/:id/assign', middleware ? middleware.redirectToLogin : (req, res, next) => next(), controllers.lilypadTickets.assignTicket)
  router.post('/tickets/:id/comments', middleware ? middleware.redirectToLogin : (req, res, next) => next(), controllers.lilypadTickets.addComment)

  // Admin & Team Management: User Accounts
  router.get('/users', middleware ? middleware.redirectToLogin : (req, res, next) => next(), controllers.lilypadUsers.getUsers)
  router.post('/users', middleware ? middleware.redirectToLogin : (req, res, next) => next(), controllers.lilypadUsers.createUser)
  router.put('/users/:id', middleware ? middleware.redirectToLogin : (req, res, next) => next(), controllers.lilypadUsers.updateUser)
  router.delete('/users/:id', middleware ? middleware.redirectToLogin : (req, res, next) => next(), controllers.lilypadUsers.deleteUser)

  return router
}

