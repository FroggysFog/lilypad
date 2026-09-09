/**
 * LilyPad ERP - Server-Side Page Access Gate
 * Hiding a nav link is a UX convenience, not security - anyone can still
 * type a URL directly. This is the actual enforcement: runs before the
 * static file middleware serves any .html page (see middleware/index.js
 * for why that ordering matters and how asset requests avoid paying for
 * the session lookup this needs).
 *
 * Deliberately fails OPEN when we can't determine who's asking (no
 * session, DB hiccup) - this gate only narrows access for identified
 * users with a resolvable role; it doesn't replace requireLogin/
 * requireLoginApi on the actual API routes, which remain the real
 * authentication boundary.
 */

const path = require('path')
const LilyPadAccount = require('../models/lilypadAccount')
const pagePermissionService = require('../services/pagePermissionService')

async function pageAccessGate (req, res, next) {
  if (!req.path.endsWith('.html')) return next()
  if (req.path === '/access-restricted.html' || req.path === '/login.html') return next()

  const accountId = req.session && req.session.lilypadAccountId
  if (!accountId) return next() // not logged in - let the page's own client-side auth handling take over, unchanged from before this feature existed

  try {
    const account = await LilyPadAccount.findById(accountId)
    if (!account || account.deleted) return next()

    const previewRole = account.role === 'admin' ? req.session.previewRole : null
    const effectiveRole = previewRole || account.role

    const page = path.basename(req.path)
    const allowed = await pagePermissionService.isPageAllowed(effectiveRole, page)
    if (!allowed) return res.redirect('/access-restricted.html')

    return next()
  } catch (err) {
    return next() // fail open - see file header
  }
}

module.exports = pageAccessGate
