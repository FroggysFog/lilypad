const express = require('express')
const router = express.Router()
const controllers = require('../controllers')
const packagejson = require('../../package.json')
const { requireLogin, requireLoginApi, requireAdminApi, redirectIfLoggedIn } = require('../middleware/lilypadAuth')
const lilypadAuth = require('../controllers/lilypadAuth')

function mainRoutes(router, controllers) {
  router.get('/', redirectIfLoggedIn, controllers.main.index)
  router.get('/healthz', function (req, res) {
    return res.status(200).send('OK')
  })
  router.get('/version', function (req, res) {
    return res.json({ version: packagejson.version })
  })
  router.get('/install', function (req, res) {
    return res.redirect('/')
  })

  router.get('/login', function (req, res) {
    return res.redirect('/')
  })
  router.post('/login', lilypadAuth.login)
  router.get('/logout', lilypadAuth.logout)

  router.get('/newissue', function (req, res) {
    return res.redirect('/tickets.html?action=new')
  })

  // Microsoft Teams integration (used by tickets.html's Teams Chat modal)
  router.get('/auth/microsoft/connect', requireLogin, controllers.microsoftTeams.connect)
  router.get('/auth/microsoft/callback', controllers.microsoftTeams.callback)
  router.get('/api/microsoft-teams/status', requireLoginApi, controllers.microsoftTeams.status)
  router.post('/api/microsoft-teams/disconnect', requireLoginApi, controllers.microsoftTeams.disconnect)
  router.get('/api/microsoft-teams/chats', requireLoginApi, controllers.microsoftTeams.chats)
  router.get('/api/microsoft-teams/chats/:chatId/messages', requireLoginApi, controllers.microsoftTeams.messages)
  router.post('/api/microsoft-teams/chats/:chatId/messages', requireLoginApi, controllers.microsoftTeams.send)

  // Microsoft Calendar integration (used by calendar.html) - per-user
  // connection, distinct from the single shared Teams connection above.
  router.get('/auth/microsoft-calendar/connect', requireLogin, controllers.microsoftCalendarAuth.connect)
  router.get('/auth/microsoft-calendar/callback', requireLogin, controllers.microsoftCalendarAuth.callback)
  router.get('/api/v1/lilypad/calendar/microsoft/status', requireLoginApi, controllers.microsoftCalendarAuth.status)
  router.post('/api/v1/lilypad/calendar/microsoft/disconnect', requireLoginApi, controllers.microsoftCalendarAuth.disconnect)
  router.get('/api/v1/lilypad/calendar/events', requireLoginApi, controllers.lilypadCalendar.getEvents)
  router.post('/api/v1/lilypad/calendar/events', requireLoginApi, controllers.lilypadCalendar.createEvent)
  router.put('/api/v1/lilypad/calendar/events/:id', requireLoginApi, controllers.lilypadCalendar.updateEvent)
  router.delete('/api/v1/lilypad/calendar/events/:id', requireLoginApi, controllers.lilypadCalendar.deleteEvent)

  // Microsoft Email (Outlook) - reuses the same per-user Microsoft 365
  // connection as the Calendar integration above (same connect/status
  // endpoints), just a different Graph resource (Mail.Read).
  router.get('/api/v1/lilypad/email/messages', requireLoginApi, controllers.microsoftEmail.getMessages)
  router.get('/api/v1/lilypad/email/messages/:id', requireLoginApi, controllers.microsoftEmail.getMessageById)
  router.get('/api/v1/lilypad/email/messages/:id/thread', requireLoginApi, controllers.microsoftEmail.getThread)
  router.post('/api/v1/lilypad/email/messages/:id/reply', requireLoginApi, controllers.microsoftEmail.reply)
  router.post('/api/v1/lilypad/email/messages/:id/forward', requireLoginApi, controllers.microsoftEmail.forward)
  router.post('/api/v1/lilypad/email/messages/:id/move', requireLoginApi, controllers.microsoftEmail.moveMessage)
  router.delete('/api/v1/lilypad/email/messages/:id', requireLoginApi, controllers.microsoftEmail.deleteMessage)

  // Stage 2: compose/drafts - AI Email Triage Module.
  router.post('/api/v1/lilypad/email/drafts', requireLoginApi, controllers.microsoftEmail.createDraft)
  router.patch('/api/v1/lilypad/email/drafts/:id', requireLoginApi, controllers.microsoftEmail.updateDraft)
  router.delete('/api/v1/lilypad/email/drafts/:id', requireLoginApi, controllers.microsoftEmail.discardDraft)
  router.post('/api/v1/lilypad/email/drafts/:id/attachments', requireLoginApi, controllers.microsoftEmail.attachmentUploadMiddleware, controllers.microsoftEmail.addAttachment)
  router.post('/api/v1/lilypad/email/drafts/:id/send', requireLoginApi, controllers.microsoftEmail.sendDraft)

  // AI Email Triage Module, stage 1: local cache + delta sync engine.
  // The webhook is intentionally NOT behind requireLoginApi - Graph
  // calls it directly with no session, and is verified per-notification
  // via clientState instead (see microsoftEmailSyncService.js).
  router.post('/api/v1/lilypad/email/sync-webhook', controllers.microsoftEmail.syncWebhook)
  router.post('/api/v1/lilypad/email/sync-now', requireLoginApi, controllers.microsoftEmail.triggerSync)

  // Stage 3: interaction scoring + cold-inbound (graymail) quarantine.
  router.get('/api/v1/lilypad/email/graymail-digest', requireLoginApi, controllers.microsoftEmail.getGraymailDigest)
  router.post('/api/v1/lilypad/email/score-now', requireLoginApi, controllers.microsoftEmail.triggerScoring)

  // Stage 4: per-email LLM triage extraction + Suggested Tasks queue.
  router.post('/api/v1/lilypad/email/extract-now', requireLoginApi, controllers.microsoftEmail.triggerExtraction)
  router.get('/api/v1/lilypad/email/suggested-tasks', requireLoginApi, controllers.microsoftEmail.getSuggestedTasks)
  router.post('/api/v1/lilypad/email/suggested-tasks/:id/approve', requireLoginApi, controllers.microsoftEmail.approveSuggestedTask)
  router.post('/api/v1/lilypad/email/suggested-tasks/:id/dismiss', requireLoginApi, controllers.microsoftEmail.dismissSuggestedTask)

  // Stage 5: sender rollup cards ("the Adam card").
  router.get('/api/v1/lilypad/email/sender-cards', requireLoginApi, controllers.microsoftEmail.getSenderCards)
  router.post('/api/v1/lilypad/email/sender-cards/:address/rollup-now', requireLoginApi, controllers.microsoftEmail.regenerateSenderCard)
  router.post('/api/v1/lilypad/email/sender-cards/:address/blockers/:index/add-task', requireLoginApi, controllers.microsoftEmail.addTaskFromBlocker)

  // Salesforce integration (used by past-due-payments.html)
  router.get('/auth/salesforce/connect', requireLogin, controllers.salesforceAuth.connect)
  router.get('/auth/salesforce/callback', requireLogin, controllers.salesforceAuth.callback)
  router.get('/api/salesforce/status', requireLoginApi, controllers.salesforceAuth.status)

  // Cart.com integration (used by the Cart.com Explorer / api-credentials.html)
  router.get('/auth/cart/connect', requireLogin, controllers.cartAuth.connect)
  router.get('/auth/cart/callback', requireLogin, controllers.cartAuth.callback)
  router.get('/api/cart/status', requireLoginApi, controllers.cartAuth.status)
  router.get('/api/cart/test', requireAdminApi, controllers.cartAuth.testEndpoint)
}

module.exports = function (app) {
  const lilypadTicketsRouter = require('./lilypadTickets')()
  app.use('/api/v1/lilypad', lilypadTicketsRouter)

  const lilypadTasksRouter = require('./lilypadTasks')()
  app.use('/api/v1/lilypad', lilypadTasksRouter)

  const lilypadMachinesRouter = require('./lilypadMachines')()
  app.use('/api/v1/lilypad', lilypadMachinesRouter)

  const lilypadNotificationsRouter = require('./lilypadNotifications')()
  app.use('/api/v1/lilypad', lilypadNotificationsRouter)

  const lilypadPastDueRouter = require('./lilypadPastDue')()
  app.use('/api/v1/lilypad', lilypadPastDueRouter)

  const lilypadCredentialsRouter = require('./lilypadCredentials')()
  app.use('/api/v1/lilypad', lilypadCredentialsRouter)

  const lilypadCustomersRouter = require('./lilypadCustomers')()
  app.use('/api/v1/lilypad', lilypadCustomersRouter)

  const lilypadOrdersRouter = require('./lilypadOrders')()
  app.use('/api/v1/lilypad', lilypadOrdersRouter)

  const lilypadSalesforceAccountsRouter = require('./lilypadSalesforceAccounts')()
  app.use('/api/v1/lilypad', lilypadSalesforceAccountsRouter)

  const lilypadOpportunitiesRouter = require('./lilypadOpportunities')()
  app.use('/api/v1/lilypad', lilypadOpportunitiesRouter)

  const lilypadSalesforceExplorerRouter = require('./lilypadSalesforceExplorer')()
  app.use('/api/v1/lilypad', lilypadSalesforceExplorerRouter)

  const lilypadProspectorRouter = require('./lilypadProspector')()
  app.use('/api/v1/lilypad', lilypadProspectorRouter)

  const lilypadCustomerIntelligenceRouter = require('./lilypadCustomerIntelligence')()
  app.use('/api/v1/lilypad', lilypadCustomerIntelligenceRouter)

  mainRoutes(router, controllers)
  app.use('/', router)

  app.use(handle404)
  app.use(handleErrors)
}

function handleErrors(err, req, res, next) {
  const status = err.status || 500
  if (status >= 500) {
    console.error(err.stack || err.message)
  }
  res.status(status).json({ success: false, error: err.message || 'Server error' })
}

function handle404(req, res) {
  return res.status(404).json({ success: false, error: 'Not found' })
}
