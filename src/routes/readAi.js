/**
 * LilyPad ERP - Read.ai Webhook Routes
 * Deliberately not behind requireLoginApi - the caller is Read.ai's
 * servers, authenticated by HMAC signature (see readAiService.js), not
 * a logged-in browser session.
 */

const express = require('express')
const router = express.Router()
const controllers = require('../controllers')

module.exports = function () {
  router.post('/integrations/read-ai/webhook', controllers.readAi.webhook)

  return router
}
