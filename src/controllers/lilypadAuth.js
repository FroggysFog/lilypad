/**
 * LilyPad ERP - Auth Controller
 * Login/logout against the standalone LilyPadAccount model + session.
 */

const LilyPadAccount = require('../models/lilypadAccount')

const lilypadAuthController = {}

lilypadAuthController.login = function (req, res) {
  const username = req.body['login-username']
  const password = req.body['login-password']

  if (!username || !password) {
    return res.redirect('/login.html?error=1')
  }

  LilyPadAccount.getByUsername(username, function (err, account) {
    if (err || !account || !LilyPadAccount.comparePassword(password, account.password)) {
      return res.redirect('/login.html?error=1')
    }

    req.session.lilypadAccountId = account._id

    const redirectUrl = account.role === 'user' ? '/tickets.html' : '/dashboard.html'
    return res.redirect(redirectUrl)
  })
}

lilypadAuthController.logout = function (req, res) {
  req.session.destroy(function () {
    return res.redirect('/login.html')
  })
}

module.exports = lilypadAuthController
