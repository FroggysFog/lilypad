const path = require('path')
const express = require('express')
const expressStaticGzip = require('express-static-gzip')
const mongoose = require('mongoose')
const nconf = require('nconf')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const pageAccessGate = require('./pageAccess')

const PUBLIC_DIR = path.join(__dirname, '../../public')

module.exports = function (app, db, callback) {
  app.disable('x-powered-by')

  app.use(bodyParser.urlencoded({ limit: '2mb', extended: false }))
  app.use(bodyParser.json({ limit: '2mb' }))
  app.use(cookieParser())

  // Assets (CSS/JS/images/fonts) are the bulk of requests per page load
  // and never need auth - served here, before session, so they're never
  // slowed down by a session-store round trip. Page loads (.html) still
  // need session (see pageAccessGate below), so they're served further
  // down, after it.
  if (global.env === 'production') {
    app.use('/assets', expressStaticGzip(path.join(PUBLIC_DIR, 'assets'), { index: false }))
  } else {
    app.use('/assets', express.static(path.join(PUBLIC_DIR, 'assets')))
  }

  app.use(function (req, res, next) {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).send('Service temporarily unavailable - database connection lost.')
    }

    return next()
  })

  // 1-year sessions meant the sessions collection just kept growing (31k+
  // documents observed) since MongoDB's TTL cleanup couldn't catch up.
  // 90 days is still a long convenience window for an internal tool, but
  // bounds growth - adjustable via SESSION_MAX_AGE_DAYS if 90 is wrong.
  const sessionMaxAgeDays = Number(process.env.SESSION_MAX_AGE_DAYS || 90)
  const cookie = {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * sessionMaxAgeDays
  }

  const sessionSecret = nconf.get('tokens:secret') ? nconf.get('tokens:secret') : 'trudesk$1234#SessionKeY!2288'

  const sessionStore = MongoStore.create({
    client: db.connection.getClient(),
    autoReconnect: true
  })
  app.use(
    session({
      secret: sessionSecret,
      cookie,
      store: sessionStore,
      saveUninitialized: false,
      resave: false
    })
  )

  // Role-based page access - see middleware/pageAccess.js. Has to run
  // between session (needs req.session) and the full static mount below
  // (which would otherwise serve any .html file unconditionally).
  app.use(pageAccessGate)

  // Everything else static (HTML pages, login.html, favicon, etc) - the
  // gate above has already had its chance to redirect by the time a
  // request reaches here.
  if (global.env === 'production') {
    app.use(expressStaticGzip(PUBLIC_DIR, { index: false }))
  } else {
    app.use(express.static(PUBLIC_DIR))
  }

  app.use(allowCrossDomain)

  callback({}, sessionStore)
}

function allowCrossDomain (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'DNT,X-Mx-ReqToken,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,accesstoken,X-RToken,X-Token'
  )
  res.setHeader('Content-Security-Policy', "frame-ancestors 'none';")

  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
  } else {
    next()
  }
}
