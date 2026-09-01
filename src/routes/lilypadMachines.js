/**
 * LilyPad ERP - Machine Master Page Routes
 */

const express = require('express')
const router = express.Router()
const path = require('path')
const controllers = require('../controllers')
const { requireLogin } = require('../middleware/lilypadAuth')

const UPLOAD_ROOT = process.env.UPLOAD_DIR || '/var/data/uploads'

module.exports = function () {
  const machines = controllers.lilypadMachines

  router.get('/machines', machines.getMachines)
  router.get('/machines/search', machines.searchMachines)
  router.get('/machines/:slug', machines.getMachineBySlug)
  router.post('/machines', requireLogin, machines.createMachine)
  router.post('/machines/:slug/media', requireLogin, machines.uploadMiddleware, machines.uploadMedia)
  router.post('/machines/:slug/media/link', requireLogin, machines.addMediaLink)
  router.delete('/machines/:slug/media/:mediaId', requireLogin, machines.deleteMedia)
  router.post('/machines/:slug/issues', requireLogin, machines.addIssue)
  router.delete('/machines/:slug/issues/:issueId', requireLogin, machines.deleteIssue)

  router.use('/uploads', requireLogin, express.static(path.join(UPLOAD_ROOT)))

  return router
}
