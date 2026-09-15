/**
 * LilyPad ERP - Sender Rollup Cards ("the Adam card")
 * AI Email Triage Module, stage 5 (+ user-curation additions). Unlike
 * stage 4's per-email Haiku classification (cheap, single-document,
 * mechanical), this is a multi-message synthesis - reading the last
 * several messages exchanged with one high-priority sender and writing
 * an executive summary, blockers, and ready-to-send quick replies.
 * That's a genuinely harder task than "classify this one email," so it
 * runs on Sonnet, and only for senders who've earned a card (see
 * getRollupCandidates) - either automatically (stage 3's scoring) or
 * because the user explicitly added an address or keyword rule to
 * always watch for.
 *
 * Cards are cached on LilyPadContactInteractionScore.rollup and
 * regenerated only when stale (see needsRegeneration) - this is a
 * Sonnet call, not a free classification, so it's deliberately not
 * recomputed on every page load.
 */

const Anthropic = require('@anthropic-ai/sdk')
const { convert: htmlToText } = require('html-to-text')
const winston = require('../logger')
const LilyPadEmailCache = require('../models/lilypadEmailCache')
const LilyPadContactInteractionScore = require('../models/lilypadContactInteractionScore')
const LilyPadSuggestedTask = require('../models/lilypadSuggestedTask')
const LilyPadEmailPriorityRule = require('../models/lilypadEmailPriorityRule')
const microsoftCalendarService = require('./microsoftCalendarService')

const REQUEST_TIMEOUT_MS = 45000
const MAX_RETRIES = 3
const MAX_MESSAGE_CHARS = 800
const THREAD_HISTORY_LIMIT = 10
// A genuine synthesis task (read N messages, write a coherent executive
// summary + blockers + drafts a human could send as-is) - the stronger
// model earns its cost here, unlike stage 4's single-document classify.
const DEFAULT_MODEL = 'claude-sonnet-5'
const ROLLUP_MIN_PRIORITY_SCORE = 40
const ROLLUP_MIN_UNREAD = 2
const ROLLUP_RECENT_DAYS = 3
const ROLLUP_STALE_HOURS = 6
const KEYWORD_LOOKBACK_DAYS = 30
const KEYWORD_MATCH_SENDER_LIMIT = 5

function getConfig () {
  return {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    model: process.env.EMAIL_ROLLUP_MODEL || DEFAULT_MODEL
  }
}

function isRollupConfigured () {
  return Boolean(getConfig().apiKey)
}

let cachedClient = null
let cachedClientKey = null

function getClient (apiKey) {
  if (!cachedClient || cachedClientKey !== apiKey) {
    cachedClient = new Anthropic({ apiKey, maxRetries: MAX_RETRIES, timeout: REQUEST_TIMEOUT_MS })
    cachedClientKey = apiKey
  }
  return cachedClient
}

const ROLLUP_TOOL = {
  name: 'emit_rollup',
  description: 'Structured executive rollup of a recent conversation with one sender.',
  input_schema: {
    type: 'object',
    required: ['executive_summary', 'blockers', 'quick_replies'],
    properties: {
      executive_summary: { type: 'string', description: '2-3 sentences synthesizing the whole recent thread, written for someone who has not read any of it.' },
      blockers: {
        type: 'array',
        items: { type: 'string' },
        description: 'Direct action items or open questions that require the recipient\'s input. Empty array if there are none.'
      },
      quick_replies: {
        type: 'array',
        maxItems: 3,
        items: {
          type: 'object',
          required: ['label', 'draft_body'],
          properties: {
            label: { type: 'string', description: 'Short button label, e.g. "Confirm Thursday".' },
            draft_body: { type: 'string', description: 'Full reply text, ready to send as-is or with light edits - plain text, no markdown.' }
          }
        }
      }
    }
  }
}

const SYSTEM_PROMPT = 'You read a recent email exchange between the user and one other person, given as a ' +
  'chronological transcript with each message labeled [You] or [Them]. Emit a structured rollup via the ' +
  'emit_rollup tool: a 2-3 sentence executive summary of the whole exchange, any blockers/open questions that ' +
  'genuinely need the user\'s input (not just FYI messages), and up to 3 ready-to-send quick reply drafts a busy ' +
  'executive could send with little or no editing. Base everything strictly on what the messages actually say - ' +
  'do not invent commitments or context that isn\'t there.'

function messageToTranscriptLine (msg, isMine) {
  const text = msg.bodyHtml
    ? htmlToText(msg.bodyHtml, { wordwrap: false }).slice(0, MAX_MESSAGE_CHARS)
    : String(msg.bodyPreview || '').slice(0, MAX_MESSAGE_CHARS)
  const when = msg.receivedDateTime ? new Date(msg.receivedDateTime).toISOString().slice(0, 10) : ''
  return `[${isMine ? 'You' : 'Them'}] (${when}) Subject: ${msg.subject || '(no subject)'}\n${text}`
}

/**
 * Pulls the last THREAD_HISTORY_LIMIT messages exchanged with one
 * address, across inbox and sent - deliberately NOT scoped to a single
 * conversationId, since the point of a sender rollup is "what's going
 * on with this person," which can span several distinct threads.
 */
async function getRecentExchange (ownerId, address) {
  const docs = await LilyPadEmailCache.find({
    owner: ownerId,
    deleted: false,
    $or: [
      { folder: 'inbox', 'from.address': address },
      { folder: 'sentitems', 'toRecipients.address': address }
    ]
  }).sort({ receivedDateTime: -1 }).limit(THREAD_HISTORY_LIMIT)

  return docs.reverse().map((doc) => ({ doc, isMine: doc.folder === 'sentitems' }))
}

/**
 * Regeneration always replaces the whole rollup subdocument (see
 * below), which deliberately wipes declinedBlockers/dismissedAt along
 * with the stale summary - new activity earns a clean slate rather
 * than carrying old "not relevant" markings forward onto a
 * regenerated (and possibly quite different) set of blockers.
 */
async function generateRollupForSender (ownerId, address) {
  const config = getConfig()
  if (!config.apiKey) throw new Error('LLM rollup is not configured. Add ANTHROPIC_API_KEY to the environment.')

  const exchange = await getRecentExchange(ownerId, address)
  if (!exchange.length) return null

  const transcript = exchange.map(({ doc, isMine }) => messageToTranscriptLine(doc, isMine)).join('\n\n---\n\n')
  const mostRecentInbound = [...exchange].reverse().find((e) => !e.isMine)

  const client = getClient(config.apiKey)
  const response = await client.messages.create({
    model: config.model,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    tools: [ROLLUP_TOOL],
    tool_choice: { type: 'tool', name: ROLLUP_TOOL.name },
    messages: [{ role: 'user', content: transcript }]
  })

  const toolUse = response.content.find((block) => block.type === 'tool_use')
  const result = (toolUse && toolUse.input) || { executive_summary: '', blockers: [], quick_replies: [] }

  const rollup = {
    executiveSummary: String(result.executive_summary || '').slice(0, 600),
    blockers: Array.isArray(result.blockers) ? result.blockers.slice(0, 10).map((b) => ({ text: String(b).slice(0, 300) })) : [],
    quickReplies: Array.isArray(result.quick_replies)
      ? result.quick_replies.slice(0, 3).map((q) => ({ label: String(q.label || '').slice(0, 60), draftBody: String(q.draft_body || '').slice(0, 2000) }))
      : [],
    generatedAt: new Date(),
    basedOnMessageCount: exchange.length,
    mostRecentMessageId: mostRecentInbound ? mostRecentInbound.doc.graphMessageId : '',
    declinedBlockers: [],
    dismissedAt: null,
    dismissedAtMessageCount: null
  }

  await LilyPadContactInteractionScore.updateOne({ owner: ownerId, address }, { $set: { rollup } })
  return rollup
}

function needsRegeneration (scoreDoc, currentMessageCount) {
  const rollup = scoreDoc.rollup
  if (!rollup || !rollup.generatedAt) return true
  if (rollup.basedOnMessageCount !== currentMessageCount) return true
  const ageMs = Date.now() - new Date(rollup.generatedAt).getTime()
  return ageMs > ROLLUP_STALE_HOURS * 60 * 60 * 1000
}

async function countUnread (ownerId, address) {
  return LilyPadEmailCache.countDocuments({
    owner: ownerId,
    folder: 'inbox',
    deleted: false,
    'from.address': address,
    isRead: false,
    'triage.isColdInbound': { $ne: true }
  })
}

async function getOrCreateScoreDoc (ownerId, address, displayNameHint) {
  let contact = await LilyPadContactInteractionScore.findOne({ owner: ownerId, address })
  if (!contact) {
    contact = await LilyPadContactInteractionScore.create({ owner: ownerId, address, displayName: displayNameHint || '' })
  }
  return contact
}

/**
 * Three ways a sender earns a card:
 *  1. Automatic - already priority-scored (stage 3) AND currently has
 *     multiple unread messages, or at least one recent one.
 *  2. Manual address rule - the user said "always watch this person,"
 *     so it's included regardless of score or current activity.
 *  3. Keyword rule - recent inbox messages matching the keyword pull
 *     their senders in, labeled by the keyword rather than the
 *     sender's name, since the point is "show me my {keyword} watch,"
 *     not any one person's relationship history.
 * A card already dismissed with no new activity since (same total
 * message count) is filtered out here, before any regeneration work.
 */
async function getRollupCandidates (ownerId) {
  const recentCutoff = new Date(Date.now() - ROLLUP_RECENT_DAYS * 24 * 60 * 60 * 1000)
  const byAddress = new Map()

  function considerCandidate (contact, unreadCount, reason, label) {
    if (byAddress.has(contact.address)) return
    byAddress.set(contact.address, { contact, unreadCount, reason, label })
  }

  const priorityContacts = await LilyPadContactInteractionScore.find({ owner: ownerId, priorityScore: { $gte: ROLLUP_MIN_PRIORITY_SCORE } })
  for (const contact of priorityContacts) {
    const unreadCount = await countUnread(ownerId, contact.address)
    const qualifies = unreadCount >= ROLLUP_MIN_UNREAD || (unreadCount >= 1 && contact.lastInboundAt && contact.lastInboundAt >= recentCutoff)
    if (qualifies) considerCandidate(contact, unreadCount, 'priority', contact.displayName || contact.address)
  }

  const addressRules = await LilyPadEmailPriorityRule.find({ owner: ownerId, type: 'address' })
  for (const rule of addressRules) {
    const contact = await getOrCreateScoreDoc(ownerId, rule.value)
    const unreadCount = await countUnread(ownerId, rule.value)
    considerCandidate(contact, unreadCount, 'manual', contact.displayName || rule.value)
  }

  const keywordRules = await LilyPadEmailPriorityRule.find({ owner: ownerId, type: 'keyword' })
  if (keywordRules.length) {
    const keywordCutoff = new Date(Date.now() - KEYWORD_LOOKBACK_DAYS * 24 * 60 * 60 * 1000)
    for (const rule of keywordRules) {
      const escaped = rule.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const pattern = new RegExp(escaped, 'i')
      const matches = await LilyPadEmailCache.find({
        owner: ownerId,
        folder: 'inbox',
        deleted: false,
        receivedDateTime: { $gte: keywordCutoff },
        $or: [{ subject: pattern }, { bodyPreview: pattern }]
      }).sort({ receivedDateTime: -1 }).limit(KEYWORD_MATCH_SENDER_LIMIT * 3) // a few extra since several may share a sender

      const seenAddresses = new Set()
      for (const email of matches) {
        if (seenAddresses.size >= KEYWORD_MATCH_SENDER_LIMIT) break
        const address = email.from && email.from.address
        if (!address || seenAddresses.has(address)) continue
        seenAddresses.add(address)
        const contact = await getOrCreateScoreDoc(ownerId, address, email.from.name)
        const unreadCount = await countUnread(ownerId, address)
        considerCandidate(contact, unreadCount, 'keyword', rule.value)
      }
    }
  }

  const result = []
  for (const { contact, unreadCount, reason, label } of byAddress.values()) {
    const totalMessageCount = contact.receivedCount + contact.repliedCount
    const rollup = contact.rollup || {}
    const isDismissed = rollup.dismissedAt && rollup.dismissedAtMessageCount === totalMessageCount
    if (isDismissed) continue
    result.push({ contact, unreadCount, reason, label })
  }
  return result
}

// Keyed by `${ownerId}:${address}` - de-dupes concurrent regeneration
// attempts for the same sender so repeated interactive polling (e.g.
// the dashboard re-fetching after every Dismiss/+Task click) can't pile
// up redundant Sonnet calls for a sender that's already regenerating.
const regenerationInFlight = new Set()

function triggerBackgroundRegeneration (ownerId, address) {
  const key = `${ownerId}:${address}`
  if (regenerationInFlight.has(key)) return
  regenerationInFlight.add(key)
  generateRollupForSender(ownerId, address)
    .catch((err) => winston.error(`Sender rollup generation failed for ${address}: ${err.message}`))
    .finally(() => regenerationInFlight.delete(key))
}

/**
 * Read path for the frontend - returns whatever's currently cached
 * immediately, even if stale, and kicks off regeneration for anything
 * stale in the background rather than awaiting it. This used to await
 * each stale sender's regeneration sequentially before responding,
 * which made an interactive click that just wants a quick re-render
 * (Dismiss, +Task) block on however many Sonnet calls happened to be
 * due - sometimes tens of seconds to minutes. The next fetch after a
 * background regeneration lands picks up the fresh card; see
 * regenerateStaleCandidates for the one caller (the scheduler) that
 * still deliberately awaits regeneration sequentially.
 */
async function getRollupCards (ownerId) {
  const candidates = await getRollupCandidates(ownerId)
  const cards = []

  for (const { contact, unreadCount, reason, label } of candidates) {
    const totalMessageCount = contact.receivedCount + contact.repliedCount
    if (isRollupConfigured() && needsRegeneration(contact, totalMessageCount)) {
      triggerBackgroundRegeneration(ownerId, contact.address)
    }

    if (contact.rollup && contact.rollup.generatedAt) {
      const declined = new Set((contact.rollup.declinedBlockers || []).map(String))
      cards.push({
        address: contact.address,
        displayName: contact.displayName || contact.address,
        label,
        reason,
        unreadCount,
        executiveSummary: contact.rollup.executiveSummary,
        blockers: (contact.rollup.blockers || [])
          .filter((b) => !declined.has(String(b._id)))
          .map((b) => ({ id: String(b._id), text: b.text })),
        quickReplies: contact.rollup.quickReplies,
        mostRecentMessageId: contact.rollup.mostRecentMessageId,
        generatedAt: contact.rollup.generatedAt
      })
    }
  }

  return cards
}

/**
 * The scheduler's path - actually awaits each stale sender's
 * regeneration, sequentially, so a background sweep across every
 * connected owner doesn't burst several Sonnet calls at once. This is
 * the one caller that should still block on generateRollupForSender;
 * the interactive read path (getRollupCards) deliberately does not.
 */
async function regenerateStaleCandidates (ownerId) {
  const candidates = await getRollupCandidates(ownerId)
  for (const { contact } of candidates) {
    const totalMessageCount = contact.receivedCount + contact.repliedCount
    if (isRollupConfigured() && needsRegeneration(contact, totalMessageCount)) {
      try {
        await generateRollupForSender(ownerId, contact.address)
      } catch (err) {
        winston.error(`Sender rollup generation failed for ${contact.address}: ${err.message}`)
      }
    }
  }
}

// Both "add task" and "decline" end with the same not-found message,
// since both share the same actual cause: the card the user clicked on
// no longer matches the stored rollup, almost always because a
// regeneration (background trigger or the 30-minute scheduler)
// replaced it with fresh blockers/ids in between.
const BLOCKER_STALE_MESSAGE = 'This conversation was just refreshed - please check the current list and try again.'

function findBlocker (contact, blockerId) {
  return contact && contact.rollup && (contact.rollup.blockers || []).find((b) => String(b._id) === String(blockerId))
}

function markBlockerConsumed (contact, blockerId) {
  contact.rollup.declinedBlockers = contact.rollup.declinedBlockers || []
  if (!contact.rollup.declinedBlockers.includes(String(blockerId))) {
    contact.rollup.declinedBlockers.push(String(blockerId))
  }
  contact.markModified('rollup')
}

/**
 * "Add Task" from a card's blocker - creates a real suggestion the same
 * way stage 4's extraction pipeline does, rather than a second,
 * parallel task-creation path. Lands in the same Suggested Tasks queue
 * for Approve/Dismiss. Matched by the blocker's own _id (stable across
 * a single rollup generation), not its text - also marks the blocker
 * consumed the same way Decline does, so it stops showing on the card
 * and a second click can't create a duplicate task.
 */
async function addTaskFromBlocker (ownerId, address, blockerId) {
  const contact = await LilyPadContactInteractionScore.findOne({ owner: ownerId, address })
  const blocker = findBlocker(contact, blockerId)
  if (!blocker) throw new Error(BLOCKER_STALE_MESSAGE)

  const sourceEmail = contact.rollup.mostRecentMessageId
    ? await LilyPadEmailCache.findOne({ owner: ownerId, graphMessageId: contact.rollup.mostRecentMessageId })
    : null
  if (!sourceEmail) throw new Error('Could not find the source email for this rollup - it may have been deleted or moved.')

  const task = await LilyPadSuggestedTask.create({
    owner: ownerId,
    sourceEmail: sourceEmail._id,
    title: blocker.text.slice(0, 255),
    context: `From conversation with ${contact.displayName || contact.address}`,
    status: 'pending'
  })

  markBlockerConsumed(contact, blockerId)
  await contact.save()

  return task
}

/**
 * "Decline" a blocker - marks it not relevant without turning it into a
 * task. Cleared automatically the next time this sender's rollup
 * regenerates (see generateRollupForSender), so it's "not relevant
 * right now," not a permanent hide of that exact blocker forever.
 */
async function declineBlocker (ownerId, address, blockerId) {
  const contact = await LilyPadContactInteractionScore.findOne({ owner: ownerId, address })
  const blocker = findBlocker(contact, blockerId)
  if (!blocker) throw new Error(BLOCKER_STALE_MESSAGE)

  markBlockerConsumed(contact, blockerId)
  await contact.save()
}

/**
 * Dismiss a card - hides it from the deck until new activity (a
 * changed total message count) arrives, at which point it naturally
 * re-qualifies and regenerates with a clean rollup.
 */
async function dismissCard (ownerId, address) {
  const contact = await LilyPadContactInteractionScore.findOne({ owner: ownerId, address })
  if (!contact) throw new Error('No conversation found for this address.')

  contact.rollup = contact.rollup || {}
  contact.rollup.dismissedAt = new Date()
  contact.rollup.dismissedAtMessageCount = contact.receivedCount + contact.repliedCount
  contact.markModified('rollup')
  await contact.save()
}

// --- Manual priority rules ---------------------------------------------

async function listPriorityRules (ownerId) {
  return LilyPadEmailPriorityRule.find({ owner: ownerId }).sort({ createdAt: -1 })
}

async function addPriorityRule (ownerId, type, value) {
  if (!['address', 'keyword'].includes(type)) throw new Error('Invalid rule type.')
  const cleaned = String(value || '').trim().toLowerCase()
  if (!cleaned) throw new Error('A value is required.')
  if (type === 'address' && !cleaned.includes('@')) throw new Error('Enter a valid email address.')

  return LilyPadEmailPriorityRule.findOneAndUpdate(
    { owner: ownerId, type, value: cleaned },
    { $setOnInsert: { owner: ownerId, type, value: cleaned } },
    { upsert: true, new: true }
  )
}

async function removePriorityRule (ownerId, ruleId) {
  await LilyPadEmailPriorityRule.deleteOne({ _id: ruleId, owner: ownerId })
}

async function runScheduledRollups (winstonLogger) {
  if (!isRollupConfigured()) return
  const connectedIds = await microsoftCalendarService.getConnectedUserIds()
  for (const ownerId of connectedIds) {
    try {
      await regenerateStaleCandidates(ownerId)
    } catch (err) {
      if (winstonLogger) winstonLogger.error(`Sender rollup pass failed for ${ownerId}: ${err.message}`)
    }
  }
}

function startSenderRollupScheduler (winstonLogger) {
  if (!isRollupConfigured()) {
    if (winstonLogger) winstonLogger.info('Sender rollup scheduler not started - ANTHROPIC_API_KEY not configured.')
    return
  }

  const intervalMinutes = Number(process.env.EMAIL_ROLLUP_CHECK_MINUTES || 30)
  const intervalMs = Math.max(15 * 60 * 1000, intervalMinutes * 60 * 1000)

  if (winstonLogger) winstonLogger.info(`Sender rollup scheduler started (${intervalMinutes} minute interval).`)

  setInterval(() => {
    runScheduledRollups(winstonLogger).catch((err) => {
      if (winstonLogger) winstonLogger.error('Scheduled sender rollup failed: ' + err.message)
    })
  }, intervalMs)

  setTimeout(() => {
    runScheduledRollups(winstonLogger).catch((err) => {
      if (winstonLogger) winstonLogger.error('Initial sender rollup failed: ' + err.message)
    })
  }, 120000) // after sync/scoring/extraction's own initial runs
}

module.exports = {
  isRollupConfigured,
  getRollupCards,
  generateRollupForSender,
  addTaskFromBlocker,
  declineBlocker,
  dismissCard,
  listPriorityRules,
  addPriorityRule,
  removePriorityRule,
  runScheduledRollups,
  startSenderRollupScheduler
}
