/**
 * LilyPad ERP - Session Auth Middleware
 * Standalone auth guard built on express-session, independent of Trudesk's passport setup.
 */

const LilyPadAccount = require('../models/lilypadAccount')

function requireLogin(req, res, next) {
  const accountId = req.session && req.session.lilypadAccountId
  if (!accountId) {
    return res.redirect('/login.html')
  }

  LilyPadAccount.findById(accountId, function (err, account) {
    if (err || !account || account.deleted) {
      return res.redirect('/login.html')
    }

    req.user = account
    return next()
  })
}

function requireLoginApi(req, res, next) {
  const accountId = req.session && req.session.lilypadAccountId
  if (!accountId) {
    return res.status(401).json({ success: false, error: 'Not logged in' })
  }

  LilyPadAccount.findById(accountId, function (err, account) {
    if (err || !account || account.deleted) {
      return res.status(401).json({ success: false, error: 'Not logged in' })
    }

    req.user = account
    return next()
  })
}

function redirectIfLoggedIn(req, res, next) {
  const accountId = req.session && req.session.lilypadAccountId
  if (!accountId) {
    return next()
  }

  LilyPadAccount.findById(accountId, function (err, account) {
    if (err || !account || account.deleted) {
      return next()
    }

    if (account.role === 'user') {
      return res.redirect('/tickets.html')
    }

    return res.redirect('/dashboard.html')
  })
}

module.exports = {
  requireLogin,
  requireLoginApi,
  redirectIfLoggedIn
}
