/**
 * LilyPad ERP - Teams Chat Triage & Rollup
 * One-tier analog of the email pipeline (emailTriageExtractionService.js's
 * per-message triage + emailSenderRollupService.js's per-sender rollup
 * collapsed into a single pass), since chat's candidate-selection rule
 * is simply "any chat with new activity since last check" - there's no
 * inbox-scale volume here that needs email's priority/manual/keyword
 * rules to narrow down who "earns a card."
 *
 * Cards are cached on LilyPadChatInteractionCache.rollup and regenerated
 * only when a chat's newest real message differs from what was last
 * processed - this is a Claude call, not a free classification, so it's
 * deliberately not recomputed on every page load (same reasoning as the
 * email rollup's staleness check).
 */

const Anthropic = require('@anthropic-ai/sdk')
const winston = require('../logger')
const LilyPadChatInteractionCache = require('../models/lilypadChatInteractionCache')
const LilyPadSuggestedTask = require('../models/lilypadSuggestedTask')
const microsoftTeams = require('./microsoftTeams')
const microsoftCalendarService = require('./microsoftCalendarService')
const { isSimilarTitle } = require('./suggestedTaskDedup')

const REQUEST_TIMEOUT_MS = 30000
const MAX_RETRIES = 3
const MAX_MESSAGE_CHARS = 800
const MESSAGE_HISTORY_LIMIT = 30
// Cheap/fast, same tiering reasoning as email's per-message triage stage -
// this is one chat's recent messages in, one summary+tasks out, not a
// task that benefits from a larger model's reasoning depth.
const DEFAULT_MODEL = 'claude-haiku-4-5'
const MIN_TASK_CONFIDENCE = 0.5
const MAX_TASKS_PER_CHAT = 3

function getConfig () {
  return {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    model: process.env.TEAMS_CHAT_TRIAGE_MODEL || DEFAULT_MODEL
  }
}

function isChatTriageConfigured () {
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

const CHAT_ROLLUP_TOOL = {
  name: 'emit_chat_rollup',
  description: 'Structured summary and task extraction for a recent Teams chat conversation.',
  input_schema: {
    type: 'object',
    required: ['summary', 'urgency', 'tasks'],
    properties: {
      summary: { type: 'string', description: '2-3 sentences synthesizing the recent conversation, written for someone who has not read any of it.' },
      urgency: { type: 'string', enum: ['low', 'normal', 'high', 'urgent'], description: 'How urgent this conversation currently is.' },
      tasks: {
        type: 'array',
        maxItems: MAX_TASKS_PER_CHAT,
        description: `Explicit commitments, requests, or deadlines actually present in the messages - do not invent tasks nobody asked for. At most ${MAX_TASKS_PER_CHAT} tasks - pick the most important/actionable ones if there would otherwise be more. Empty array if none.`,
        items: {
          type: 'object',
          required: ['title', 'confidence'],
          properties: {
            title: { type: 'string', description: 'Imperative phrasing, e.g. "Send the updated quote to Adam".' },
            due_date_iso: { type: ['string', 'null'], description: 'ISO 8601 date if a deadline was stated or clearly implied, else null.' },
            confidence: { type: 'number', description: '0-1, how explicit the commitment/request was.' }
          }
        }
      }
    }
  }
}

const SYSTEM_PROMPT = 'You read a recent Microsoft Teams chat conversation, given as a chronological transcript ' +
  'with each message labeled by its sender\'s name. Emit a structured rollup via the emit_chat_rollup tool: a ' +
  '2-3 sentence summary of what the conversation is currently about, how urgent it is, and any explicit ' +
  'commitments/requests/deadlines actually present in the messages - do not invent tasks nobody asked for. ' +
  'A chat can have more than two participants, so attribute asks to the specific person who made them.'

function messageToTranscriptLine (msg) {
  const senderName = (msg.from && msg.from.user && msg.from.user.displayName) || 'Someone'
  const text = String((msg.body && msg.body.content) || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, MAX_MESSAGE_CHARS)
  const when = msg.createdDateTime ? new Date(msg.createdDateTime).toISOString().slice(0, 10) : ''
  return `[${senderName}] (${when})\n${text}`
}

/**
 * Real messages only - Graph's chat message feed also contains system
 * events (member added/removed, topic renamed, etc.) with messageType
 * !== 'message', which would otherwise burn a Claude call summarizing
 * "X added Y to the chat" as if it were conversation content.
 */
function isRealMessage (msg) {
  return msg.messageType === 'message' && msg.body && String(msg.body.content || '').trim()
}

async function getOrCreateCacheDoc (ownerId, chat) {
  let cache = await LilyPadChatInteractionCache.findOne({ owner: ownerId, chatId: chat.id })
  if (!cache) {
    cache = await LilyPadChatInteractionCache.create({
      owner: ownerId,
      chatId: chat.id,
      chatType: chat.chatType || '',
      displayName: chat.displayName || ''
    })
  } else if (chat.displayName && chat.displayName !== cache.displayName) {
    // Keep the cached cosmetic name current (e.g. a group chat's member
    // list changed) without disturbing anything else on the doc.
    await LilyPadChatInteractionCache.updateOne({ _id: cache._id }, { $set: { displayName: chat.displayName } })
    cache.displayName = chat.displayName
  }
  return cache
}

/**
 * Cheap first-pass filter using the same `GET /me/chats` call
 * microsoftTeams.getChats() already makes - Graph's chat resource
 * returns lastUpdatedDateTime on that same response, so this never
 * needs a per-chat getMessages() call just to check "did anything
 * happen here." Only chats whose lastUpdatedDateTime moved since
 * lastCheckedAt (or that have never been checked) are candidates.
 */
async function getCandidateChats (ownerId) {
  const chats = await microsoftTeams.getChats(ownerId)
  const candidates = []

  for (const chat of chats) {
    const cache = await getOrCreateCacheDoc(ownerId, chat)
    const lastUpdated = chat.lastUpdatedDateTime ? new Date(chat.lastUpdatedDateTime) : null
    const isCandidate = !cache.lastCheckedAt || (lastUpdated && lastUpdated > cache.lastCheckedAt)
    if (isCandidate) candidates.push({ chat, cache })
  }

  return candidates
}

/**
 * Regeneration always replaces the whole rollup subdocument, same as
 * email's sender rollup - new activity earns a clean slate.
 */
async function generateRollupForChat (ownerId, chatId) {
  const config = getConfig()
  if (!config.apiKey) throw new Error('LLM chat triage is not configured. Add ANTHROPIC_API_KEY to the environment.')

  const cache = await LilyPadChatInteractionCache.findOne({ owner: ownerId, chatId })
  if (!cache) throw new Error('This chat has not been indexed yet.')

  const { messages } = await microsoftTeams.getMessages(ownerId, chatId, {})
  const realMessages = messages.filter(isRealMessage).slice(-MESSAGE_HISTORY_LIMIT)

  if (!realMessages.length) {
    await LilyPadChatInteractionCache.updateOne({ _id: cache._id }, { $set: { lastCheckedAt: new Date() } })
    return null
  }

  const newestMessageId = realMessages[realMessages.length - 1].id
  if (newestMessageId === cache.rollup.lastProcessedMessageId) {
    // Nothing new since last summary despite lastUpdatedDatedTime moving
    // (e.g. a reaction or an edit) - skip the Claude call entirely.
    await LilyPadChatInteractionCache.updateOne({ _id: cache._id }, { $set: { lastCheckedAt: new Date() } })
    return null
  }

  const transcript = realMessages.map(messageToTranscriptLine).join('\n\n---\n\n')

  const client = getClient(config.apiKey)
  const response = await client.messages.create({
    model: config.model,
    max_tokens: 1024,
    system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
    tools: [CHAT_ROLLUP_TOOL],
    tool_choice: { type: 'tool', name: CHAT_ROLLUP_TOOL.name },
    messages: [{ role: 'user', content: transcript }]
  })

  const toolUse = response.content.find((block) => block.type === 'tool_use')
  const result = (toolUse && toolUse.input) || { summary: '', urgency: 'normal', tasks: [] }

  const rollup = {
    summary: String(result.summary || '').slice(0, 600),
    urgency: ['low', 'normal', 'high', 'urgent'].includes(result.urgency) ? result.urgency : 'normal',
    generatedAt: new Date(),
    lastProcessedMessageId: newestMessageId,
    dismissedAt: null,
    dismissedAtMessageId: ''
  }

  await LilyPadChatInteractionCache.updateOne({ _id: cache._id }, { $set: { rollup, lastCheckedAt: new Date() } })

  const tasks = Array.isArray(result.tasks) ? result.tasks : []
  const qualifying = tasks.filter((t) => t && t.title && (t.confidence == null || t.confidence >= MIN_TASK_CONFIDENCE))
  if (qualifying.length) await createSuggestedTasksForChat(ownerId, cache, qualifying)

  return rollup
}

/**
 * Same dedup-against-pending-titles approach as email's stage 4, scoped
 * to this one chat rather than an email thread.
 */
async function createSuggestedTasksForChat (ownerId, cache, tasks) {
  const pendingForChat = await LilyPadSuggestedTask.find({ owner: ownerId, status: 'pending', sourceChat: cache._id })
  const existingTitles = pendingForChat.map((s) => s.title)

  const newTasks = []
  for (const t of tasks) {
    if (existingTitles.some((existingTitle) => isSimilarTitle(existingTitle, t.title))) continue
    existingTitles.push(String(t.title))
    newTasks.push(t)
  }
  if (!newTasks.length) return

  await LilyPadSuggestedTask.insertMany(newTasks.map((t) => ({
    owner: ownerId,
    sourceChat: cache._id,
    title: String(t.title).slice(0, 255),
    context: cache.displayName || '',
    suggestedDueDate: t.due_date_iso ? new Date(t.due_date_iso) : null,
    urgency: 'normal',
    confidence: typeof t.confidence === 'number' ? t.confidence : 0.5,
    status: 'pending'
  })))
}

// Keyed by `${ownerId}:${chatId}` - same in-flight guard pattern as
// email's sender rollup, so repeated interactive polling can't pile up
// redundant Claude calls for a chat that's already regenerating.
const regenerationInFlight = new Set()

function triggerBackgroundRegeneration (ownerId, chatId) {
  const key = `${ownerId}:${chatId}`
  if (regenerationInFlight.has(key)) return
  regenerationInFlight.add(key)
  generateRollupForChat(ownerId, chatId)
    .catch((err) => winston.error(`Chat rollup generation failed for ${chatId}: ${err.message}`))
    .finally(() => regenerationInFlight.delete(key))
}

/**
 * Read path for the frontend - returns whatever's cached immediately and
 * kicks off regeneration for anything stale in the background, mirroring
 * emailSenderRollupService.getRollupCards exactly (never blocks a page
 * load on a live Claude call).
 */
async function getChatCards (ownerId) {
  const candidates = await getCandidateChats(ownerId)
  for (const { chat } of candidates) {
    if (isChatTriageConfigured()) triggerBackgroundRegeneration(ownerId, chat.id)
  }

  const allCached = await LilyPadChatInteractionCache.find({ owner: ownerId, 'rollup.generatedAt': { $ne: null } })
  const cards = []
  for (const cache of allCached) {
    const isDismissed = cache.rollup.dismissedAt && cache.rollup.dismissedAtMessageId === cache.rollup.lastProcessedMessageId
    if (isDismissed) continue
    cards.push({
      chatId: cache.chatId,
      displayName: cache.displayName || 'Teams chat',
      summary: cache.rollup.summary,
      urgency: cache.rollup.urgency,
      generatedAt: cache.rollup.generatedAt
    })
  }
  return cards
}

async function dismissChatCard (ownerId, chatId) {
  const cache = await LilyPadChatInteractionCache.findOne({ owner: ownerId, chatId })
  if (!cache) throw new Error('No chat found with that id.')

  await LilyPadChatInteractionCache.updateOne(
    { _id: cache._id },
    { $set: { 'rollup.dismissedAt': new Date(), 'rollup.dismissedAtMessageId': cache.rollup.lastProcessedMessageId } }
  )
}

/**
 * The scheduler's path - actually awaits each candidate chat's
 * regeneration, sequentially, so a background sweep across every
 * connected owner doesn't burst several Claude calls at once (same
 * reasoning as email's regenerateStaleCandidates).
 */
async function regenerateCandidateChats (ownerId) {
  const candidates = await getCandidateChats(ownerId)
  for (const { chat } of candidates) {
    try {
      await generateRollupForChat(ownerId, chat.id)
    } catch (err) {
      winston.error(`Chat rollup generation failed for ${chat.id}: ${err.message}`)
    }
  }
}

async function runScheduledChatTriage (winstonLogger) {
  if (!isChatTriageConfigured()) return
  const connectedIds = await microsoftCalendarService.getConnectedUserIds()
  for (const ownerId of connectedIds) {
    try {
      await regenerateCandidateChats(ownerId)
    } catch (err) {
      if (winstonLogger) winstonLogger.error(`Teams chat triage pass failed for ${ownerId}: ${err.message}`)
    }
  }
}

function startTeamsChatTriageScheduler (winstonLogger) {
  if (!isChatTriageConfigured()) {
    if (winstonLogger) winstonLogger.info('Teams chat triage scheduler not started - ANTHROPIC_API_KEY not configured.')
    return
  }

  const intervalMinutes = Number(process.env.TEAMS_CHAT_TRIAGE_CHECK_MINUTES || 15)
  const intervalMs = Math.max(10 * 60 * 1000, intervalMinutes * 60 * 1000)

  if (winstonLogger) winstonLogger.info(`Teams chat triage scheduler started (${intervalMinutes} minute interval).`)

  setInterval(() => {
    runScheduledChatTriage(winstonLogger).catch((err) => {
      if (winstonLogger) winstonLogger.error('Scheduled Teams chat triage failed: ' + err.message)
    })
  }, intervalMs)

  setTimeout(() => {
    runScheduledChatTriage(winstonLogger).catch((err) => {
      if (winstonLogger) winstonLogger.error('Initial Teams chat triage failed: ' + err.message)
    })
  }, 150000) // after the email pipeline's own initial runs
}

module.exports = {
  isChatTriageConfigured,
  getChatCards,
  generateRollupForChat,
  dismissChatCard,
  runScheduledChatTriage,
  startTeamsChatTriageScheduler
}
