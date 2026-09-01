/**
 * LilyPad ERP - Credentials Vault Routes
 * Admin-only - every route uses requireAdminApi, not just requireLoginApi.
 */

const express = require('express')
const router = express.Router()
const controllers = require('../controllers')
const { requireAdminApi } = require('../middleware/lilypadAuth')

module.exports = function () {
  router.get('/credentials', requireAdminApi, controllers.lilypadCredentials.getCredentials)
  router.get('/credentials/:id/reveal', requireAdminApi, controllers.lilypadCredentials.revealCredential)
  router.post('/credentials', requireAdminApi, controllers.lilypadCredentials.createCredential)
  router.put('/credentials/:id', requireAdminApi, controllers.lilypadCredentials.updateCredential)
  router.delete('/credentials/:id', requireAdminApi, controllers.lilypadCredentials.deleteCredential)

  return router
}
