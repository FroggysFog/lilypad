const express = require('express')
const router = express.Router()
const controllers = require('../controllers')
const packagejson = require('../../package.json')
const { requireLogin, requireLoginApi, redirectIfLoggedIn } = require('../middleware/lilypadAuth')
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
}

module.exports = function (app) {
  const lilypadTicketsRouter = require('./lilypadTickets')()
  app.use('/api/v1/lilypad', lilypadTicketsRouter)

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
