/**
 * LilyPad ERP - Per-Email LLM Triage Extraction (AI Email Triage
 * Module, stage 4)
 * Runs a forced-tool-choice Claude call over each not-yet-processed
 * inbox message to classify whether it's actionable, how urgent it is,
 * and what commitments/tasks it contains - the schema is small and
 * mechanical on purpose, which is exactly what a cheap, fast model
 * handles reliably (see pageExtractionService.js for the same tiering
 * reasoning applied to prospecting).
 *
 * Uses the official @anthropic-ai/sdk (not raw HTTP) - already retries
 * 429/5xx/connection errors with backoff, so there's no hand-rolled
 * retry loop here. System prompt is cache_control'd since it's byte-
 * identical on every single-email call in a batch - the single highest-
 * value place to spend a prompt cache on this pipeline.
 */

const Anthropic = require('@anthropic-ai/sdk')
const { convert: htmlToText } = require('html-to-text')
const winston = require('../logger')
const LilyPadEmailCache = require('../models/lilypadEmailCache')
const LilyPadSuggestedTask = require('../models/lilypadSuggestedTask')
const microsoftCalendarService = require('./microsoftCalendarService')

const REQUEST_TIMEOUT_MS = 30000
const MAX_RETRIES = 3
const MAX_BODY_CHARS = 6000
// Cheap/fast on purpose - this is a small, mechanical per-email
// classification, not a task that benefits from a larger model's
// reasoning depth (compare emailRollupService.js in a later stage,
// which uses a stronger model for multi-message synthesis).
const DEFAULT_MODEL = 'claude-haiku-4-5'
const BATCH_SIZE_PER_OWNER = 20
const LOOKBACK_DAYS = 14
const MIN_TASK_CONFIDENCE = 0.5

function getConfig () {
  return {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    model: process.env.EMAIL_TRIAGE_MODEL || DEFAULT_MODEL
  }
}

function isExtractionConfigured () {
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

const TRIAGE_TOOL = {
  name: 'emit_triage',
  description: 'Structured triage classification of one email.',
  input_schema: {
    type: 'object',
    required: ['is_actionable', 'urgency', 'one_line_summary', 'tasks'],
    properties: {
      is_actionable: { type: 'boolean', description: 'True if this email asks the recipient to do, decide, or respond to something.' },
      urgency: { type: 'string', enum: ['low', 'normal', 'high', 'urgent'] },
      one_line_summary: { type: 'string', description: 'One sentence, max ~140 characters, summarizing what this email is about.' },
      tasks: {
        type: 'array',
        description: 'Explicit commitments, requests, or deadlines actually present in the text - do not invent tasks the sender did not ask for. Empty array if none.',
        items: {
          type: 'object',
          required: ['title', 'confidence'],
          properties: {
            title: { type: 'string', description: 'Imperative phrasing, e.g. "Send signed SOW to Adam".' },
            due_date_iso: { type: ['string', 'null'], description: 'ISO 8601 date if a deadline was stated or clearly implied, else null.' },
            confidence: { type: 'number', description: '0-1, how explicit the commitment/request was.' }
          }
        }
      }
    }
  }
}

const SYSTEM_PROMPT = 'You are the triage engine for an internal operations ERP\'s email module. ' +
  'You read one email at a time and emit a structured classification via the emit_triage tool. ' +
  'You never see the recipient\'s other emails or the ERP database - your job is narrow: does this ' +
  'email need action, how urgent is it, and what commitments does it contain. Extract only commitments ' +
  'actually present in the text - do not infer tasks the sender didn\'t ask for. If nothing is ' +
  'actionable, return an empty tasks array and is_actionable: false.'

function bodyToPlainText (email) {
  if (email.bodyHtml) {
    return htmlToText(email.bodyHtml, { wordwrap: false, selectors: [{ selector: 'a', options: { ignoreHref: true } }] }).slice(0, MAX_BODY_CHARS)
  }
  return String(email.bodyPreview || '').slice(0, MAX_BODY_CHARS)
}

function buildUserPrompt (email) {
  const from = (email.from && (email.from.name || email.from.address)) || 'Unknown sender'
  const received = email.receivedDateTime ? new Date(email.receivedDateTime).toISOString() : 'unknown'
  return `From: ${from}\nSubject: ${email.subject || '(no subject)'}\nReceived: ${received}\n\n${bodyToPlainText(email)}`
}

/**
 * One email in, one triage classification out. Throws on a configured-
 * but-failing API (auth/rate-limit/etc) so the caller can log and skip
 * rather than silently mis-tagging a message.
 */
async function extractTriageForEmail (email) {
  const config = getConfig()
  if (!config.apiKey) throw new Error('LLM extraction is not configured. Add ANTHROPIC_API_KEY to the environment.')

  const client = getClient(config.apiKey)

  try {
    const response = await client.messages.create({
      model: config.model,
      max_tokens: 1024,
      system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      tools: [TRIAGE_TOOL],
      tool_choice: { type: 'tool', name: TRIAGE_TOOL.name },
      messages: [{ role: 'user', content: buildUserPrompt(email) }]
    })

    const toolUse = response.content.find((block) => block.type === 'tool_use')
    if (!toolUse) {
      return { is_actionable: false, urgency: 'normal', one_line_summary: '', tasks: [] }
    }
    const result = toolUse.input || {}
    return {
      is_actionable: Boolean(result.is_actionable),
      urgency: ['low', 'normal', 'high', 'urgent'].includes(result.urgency) ? result.urgency : 'normal',
      one_line_summary: String(result.one_line_summary || '').slice(0, 200),
      tasks: Array.isArray(result.tasks) ? result.tasks : []
    }
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) throw new Error('LLM extraction failed: invalid ANTHROPIC_API_KEY.')
    if (error instanceof Anthropic.RateLimitError) throw new Error('LLM extraction failed: rate limited after retries.')
    if (error instanceof Anthropic.APIError) throw new Error(`LLM extraction request failed (${error.status}): ${error.message}`)
    throw error
  }
}

async function createSuggestedTasksFor (ownerId, email, tasks) {
  const qualifying = tasks.filter((t) => t && t.title && (t.confidence == null || t.confidence >= MIN_TASK_CONFIDENCE))
  if (!qualifying.length) return

  await LilyPadSuggestedTask.insertMany(qualifying.map((t) => ({
    owner: ownerId,
    sourceEmail: email._id,
    title: String(t.title).slice(0, 255),
    context: email.subject || '',
    suggestedDueDate: t.due_date_iso ? new Date(t.due_date_iso) : null,
    urgency: email.triage && email.triage.urgency,
    confidence: typeof t.confidence === 'number' ? t.confidence : 0.5,
    status: 'pending'
  })))
}

/**
 * Processes up to BATCH_SIZE_PER_OWNER not-yet-triaged inbox messages
 * for one owner, oldest-first within the lookback window - skips
 * cold-inbound (graymail) messages entirely, since there's no value in
 * spending a model call classifying something already quarantined.
 */
async function runExtractionForOwner (ownerId) {
  if (!isExtractionConfigured()) return { skipped: true, reason: 'ANTHROPIC_API_KEY not configured' }

  const since = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000)
  const emails = await LilyPadEmailCache.find({
    owner: ownerId,
    folder: 'inbox',
    deleted: false,
    'triage.processed': false,
    'triage.isColdInbound': { $ne: true },
    receivedDateTime: { $gte: since }
  }).sort({ receivedDateTime: 1 }).limit(BATCH_SIZE_PER_OWNER)

  let processed = 0
  let failed = 0
  for (const email of emails) {
    try {
      const triage = await extractTriageForEmail(email)
      email.triage.processed = true
      email.triage.isActionable = triage.is_actionable
      email.triage.urgency = triage.urgency
      email.triage.summary = triage.one_line_summary
      email.triage.extractedAt = new Date()
      await email.save()

      if (triage.is_actionable && triage.tasks.length) {
        await createSuggestedTasksFor(ownerId, email, triage.tasks)
      }
      processed++
    } catch (err) {
      failed++
      winston.error(`Email triage extraction failed for ${email._id}: ${err.message}`)
    }
  }

  return { processed, failed, remaining: emails.length === BATCH_SIZE_PER_OWNER }
}

async function runScheduledExtraction (winstonLogger) {
  if (!isExtractionConfigured()) return
  const connectedIds = await microsoftCalendarService.getConnectedUserIds()
  for (const ownerId of connectedIds) {
    try {
      await runExtractionForOwner(ownerId)
    } catch (err) {
      if (winstonLogger) winstonLogger.error(`Email triage extraction failed for ${ownerId}: ${err.message}`)
    }
  }
}

function startEmailExtractionScheduler (winstonLogger) {
  if (!isExtractionConfigured()) {
    if (winstonLogger) winstonLogger.info('Email triage extraction scheduler not started - ANTHROPIC_API_KEY not configured.')
    return
  }

  const intervalMinutes = Number(process.env.EMAIL_TRIAGE_CHECK_MINUTES || 20)
  const intervalMs = Math.max(10 * 60 * 1000, intervalMinutes * 60 * 1000)

  if (winstonLogger) winstonLogger.info(`Email triage extraction scheduler started (${intervalMinutes} minute interval).`)

  setInterval(() => {
    runScheduledExtraction(winstonLogger).catch((err) => {
      if (winstonLogger) winstonLogger.error('Scheduled email triage extraction failed: ' + err.message)
    })
  }, intervalMs)

  setTimeout(() => {
    runScheduledExtraction(winstonLogger).catch((err) => {
      if (winstonLogger) winstonLogger.error('Initial email triage extraction failed: ' + err.message)
    })
  }, 90000) // after sync's and scoring's own initial runs
}

module.exports = {
  isExtractionConfigured,
  runExtractionForOwner,
  runScheduledExtraction,
  startEmailExtractionScheduler
}
