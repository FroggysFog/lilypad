#!/usr/bin/env node

const crypto = require('crypto')
const winston = require('./src/logger')
const nconf = require('nconf')
const pkg = require('./package.json')

nconf.argv().env()

global.env = process.env.NODE_ENV || 'development'

nconf.defaults({
  tokens: {
    secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
    expires: 900
  }
})

winston.info('LilyPad ERP v' + pkg.version)
winston.info('Running in: ' + global.env)
winston.info('Server Time: ' + new Date())

function start () {
  const _db = require('./src/database')

  _db.init(function (err, db) {
    if (err) {
      winston.error('FATAL: ' + err.message)
      winston.warn('Retrying to connect to MongoDB in 10secs...')
      return setTimeout(start, 10000)
    }

    launchServer(db)
  })
}

function launchServer (db) {
  const ws = require('./src/webserver')
  ws.init(db, function (err) {
    if (err) {
      winston.error(err)
      return
    }

    ws.listen(function () {
      winston.info('LilyPad ERP Ready')

      const { startReminderScheduler } = require('./src/services/reminderEmailService')
      startReminderScheduler(winston)

      const { startSalesforceSyncScheduler } = require('./src/services/salesforceSyncScheduler')
      startSalesforceSyncScheduler(winston)

      const { startLeadProspectorRecoverySweep } = require('./src/services/leadProspectorScheduler')
      startLeadProspectorRecoverySweep(winston)

      const { startEmailSyncScheduler } = require('./src/services/microsoftEmailSyncService')
      startEmailSyncScheduler(winston)

      const { startInteractionScoringScheduler } = require('./src/services/emailInteractionScoringService')
      startInteractionScoringScheduler(winston)

      const { startEmailExtractionScheduler } = require('./src/services/emailTriageExtractionService')
      startEmailExtractionScheduler(winston)

      const { startSenderRollupScheduler } = require('./src/services/emailSenderRollupService')
      startSenderRollupScheduler(winston)

      const { startEntityLinkingScheduler } = require('./src/services/emailErpEntityLinkService')
      startEntityLinkingScheduler(winston)

      const { startWaitingOnScheduler } = require('./src/services/emailWaitingOnService')
      startWaitingOnScheduler(winston)
    })
  })
}

start()
