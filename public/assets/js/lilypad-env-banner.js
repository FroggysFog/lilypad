/**
 * LilyPad ERP - Sandbox/Production Environment Badge
 * Injected on every page the same way lilypad-teams-chat.js is - a
 * small, unmissable "which environment am I looking at" indicator, for
 * exactly the situation of having both the sandbox and production
 * sites open in different tabs and needing an instant visual answer.
 *
 * Defaults to showing nothing (production) unless the server
 * explicitly says LILYPAD_ENVIRONMENT=sandbox - a missing/misconfigured
 * env var should never accidentally alarm a real user with a false
 * "you're on sandbox" banner, only the reverse (sandbox silently
 * looking like production) is worth guarding against here, and this
 * fails toward that being visible rather than the other way around.
 *
 * A floating corner badge rather than a full-width top banner on
 * purpose - a banner would need every page's own fixed topbar pushed
 * down to avoid overlapping it, which isn't safe to assume blindly
 * across pages with unknown/varying layouts.
 */
(function () {
  'use strict'

  fetch('/api/v1/lilypad/environment').then(function (r) { return r.json() }).then(function (result) {
    if (!result.success || result.data.environment !== 'sandbox') return

    var badge = document.createElement('div')
    badge.textContent = '🧪 SANDBOX'
    badge.title = 'This is the test/build environment - changes here are not seen by the team.'
    badge.style.cssText = 'position:fixed; bottom:12px; left:12px; z-index:99999; background:#e8ac0e; color:#1a1a1a; font-weight:700; font-size:12px; font-family:sans-serif; padding:6px 14px; border-radius:20px; box-shadow:0 2px 8px rgba(0,0,0,0.25); pointer-events:none; letter-spacing:0.02em;'
    document.body.appendChild(badge)

    if (document.title.indexOf('[SANDBOX] ') !== 0) {
      document.title = '[SANDBOX] ' + document.title
    }
  }).catch(function () {
    // Can't tell which environment this is - say nothing rather than guess.
  })
})()
