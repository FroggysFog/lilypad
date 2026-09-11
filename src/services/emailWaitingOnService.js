/**
 * LilyPad ERP - "Waiting On" Monitor (AI Email Triage Module, stage 6b)
 * Watches the user's own outbound mail for messages that read like a
 * request or assigned deliverable ("can you send...", "please confirm...",
 * a trailing question), and tracks whether the recipient ever replies in
 * that same conversation. Heuristic, not LLM-backed on purpose - keyword/
 * pattern matching for "does this sentence look like a request" is a much
 * easier problem than triage's actionability judgment, and running it
 * through Claude for every sent message would be spending a model call
 * on something a phrase list already does adequately.
 */

const { convert: htmlToText } = require('html-to-text')
const LilyPadEmailCache = require('../models/lilypadEmailCache')
const LilyPadAwaitingResponse = require('../models/lilypadAwaitingResponse')
const microsoftCalendarService = require('./microsoftCalendarService')

const BATCH_SIZE_PER_OWNER = 100
const DEFAULT_FOLLOWUP_DAYS = 3

const REQUEST_PATTERNS = [
  /\bcan you\b/i,
  /\bcould you\b/i,
  /\bwould you\b/i,
  /\bplease (?:send|confirm|review|advise|provide|let me know|approve|sign)\b/i,
  /\blet me know\b/i,
  /\bneed (?:you|your)\b/i,
  /\bwhen can\b/i,
  /\bdo you have\b/i,
  /\bare you able\b/i,
  /\?\s*$/m // a line ending in a question mark
]

function bodyToPlainText (email) {
  return email.bodyHtml ? htmlToText(email.bodyHtml, { wordwrap: false }) : String(email.bodyPreview || '')
}

function looksLikeRequest (text) {
  return REQUEST_PATTERNS.some((pattern) => pattern.test(text))
}

/**
 * Scans not-yet-checked outbound mail, creating an "awaiting reply"
 * watcher for anything that reads like a request - one per email, to
 * the first recipient (the common case of a direct ask to one person;
 * a broadcast to many recipients is much less likely to be "waiting on
 * a specific person" in the way this feature means).
 *
 * Bounded to mail sent on or after the account's connectedAt - the
 * initial sync backfills a user's actual Sent Items history (which can
 * run back years), and this query had no lower bound at all before,
 * so a brand new connection would otherwise create "awaiting reply"
 * watchers for asks sent long before anyone was using LilyPad to track
 * them.
 */
async function scanOutboundForOwner (ownerId) {
  const status = await microsoftCalendarService.getStatus(ownerId)
  const query = {
    owner: ownerId,
    folder: 'sentitems',
    deleted: false,
    waitingOnProcessed: false
  }
  if (status.connectedAt) query.receivedDateTime = { $gte: status.connectedAt }

  const emails = await LilyPadEmailCache.find(query).sort({ receivedDateTime: 1 }).limit(BATCH_SIZE_PER_OWNER)

  let created = 0
  for (const email of emails) {
    const recipient = (email.toRecipients || [])[0]
    if (recipient && recipient.address && looksLikeRequest(bodyToPlainText(email))) {
      const sentAt = email.receivedDateTime || new Date()
      await LilyPadAwaitingResponse.create({
        owner: ownerId,
        sourceEmail: email._id,
        toAddress: recipient.address,
        toName: recipient.name || '',
        askSummary: email.subject || bodyToPlainText(email).slice(0, 140),
        followUpAfter: new Date(sentAt.getTime() + DEFAULT_FOLLOWUP_DAYS * 24 * 60 * 60 * 1000),
        status: 'waiting'
      })
      created++
    }
    email.waitingOnProcessed = true
    await email.save()
  }
  return { processed: emails.length, created }
}

/**
 * A reply is "the same person you asked, replying in the same
 * conversation, after you sent the ask" - matching on conversationId
 * rather than just "any later email from them" avoids marking an
 * unrelated new thread from the same person as having answered this ask.
 */
async function refreshStatusesForOwner (ownerId) {
  const openWatchers = await LilyPadAwaitingResponse.find({ owner: ownerId, status: { $in: ['waiting', 'overdue'] } })
    .populate('sourceEmail', 'graphConversationId receivedDateTime')

  let replied = 0
  let overdue = 0
  const now = new Date()

  for (const watcher of openWatchers) {
    if (!watcher.sourceEmail) continue

    const reply = await LilyPadEmailCache.findOne({
      owner: ownerId,
      folder: 'inbox',
      deleted: false,
      graphConversationId: watcher.sourceEmail.graphConversationId,
      'from.address': watcher.toAddress,
      receivedDateTime: { $gt: watcher.sourceEmail.receivedDateTime }
    }).sort({ receivedDateTime: 1 })

    if (reply) {
      watcher.status = 'replied'
      watcher.repliedAt = reply.receivedDateTime
      await watcher.save()
      replied++
    } else if (watcher.followUpAfter < now && watcher.status !== 'overdue') {
      watcher.status = 'overdue'
      await watcher.save()
      overdue++
    }
  }

  return { checked: openWatchers.length, replied, overdue }
}

async function runWaitingOnPassForOwner (ownerId) {
  const scanResult = await scanOutboundForOwner(ownerId)
  const statusResult = await refreshStatusesForOwner(ownerId)
  return { ...scanResult, ...statusResult }
}

async function runScheduledWaitingOn (winston) {
  const connectedIds = await microsoftCalendarService.getConnectedUserIds()
  for (const ownerId of connectedIds) {
    try {
      await runWaitingOnPassForOwner(ownerId)
    } catch (err) {
      if (winston) winston.error(`Waiting-on pass failed for ${ownerId}: ${err.message}`)
    }
  }
}

function startWaitingOnScheduler (winston) {
  const intervalMinutes = Number(process.env.EMAIL_WAITING_ON_CHECK_MINUTES || 20)
  const intervalMs = Math.max(10 * 60 * 1000, intervalMinutes * 60 * 1000)

  if (winston) winston.info(`Waiting-on scheduler started (${intervalMinutes} minute interval).`)

  setInterval(() => {
    runScheduledWaitingOn(winston).catch((err) => {
      if (winston) winston.error('Scheduled waiting-on pass failed: ' + err.message)
    })
  }, intervalMs)

  setTimeout(() => {
    runScheduledWaitingOn(winston).catch((err) => {
      if (winston) winston.error('Initial waiting-on pass failed: ' + err.message)
    })
  }, 45000)
}

module.exports = {
  runWaitingOnPassForOwner,
  runScheduledWaitingOn,
  startWaitingOnScheduler
}
