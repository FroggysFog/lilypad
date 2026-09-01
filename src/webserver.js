const _ = require('lodash')
const nconf = require('nconf')
  .argv()
  .env()

const express = require('express')
const WebServer = express()
const winston = require('./logger')
const middleware = require('./middleware')
const routes = require('./routes')
const server = require('http').createServer(WebServer)
let port = nconf.get('port') || 8118

;(app => {
  'use strict'

  module.exports.server = server
  module.exports.app = app
  module.exports.init = async (db, callback, p) => {
    if (p !== undefined) port = p
    middleware(app, db, function (middleware, store) {
      module.exports.sessionStore = store
      routes(app, middleware)

      if (typeof callback === 'function') callback()
    })
  }

  module.exports.listen = (callback, p) => {
    if (!_.isUndefined(p)) port = p

    server.on('error', err => {
      if (err.code === 'EADDRINUSE') {
        winston.error('Address in use, exiting...')
        server.close()
      } else {
        winston.error(err.message)
        throw err
      }
    })

    server.listen(port, '0.0.0.0', () => {
      winston.info('LilyPad ERP is now listening on port: ' + port)

      if (_.isFunction(callback)) return callback()
    })
  }
})(WebServer)
