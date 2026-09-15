/**
 * LilyPad ERP - Receipt Capture from Email
 * A sibling of emailTriageExtractionService.js (same forced-tool-choice
 * Claude call pattern, same batch/scheduler shape), but deliberately
 * NOT part of that pipeline: stage 4 triage skips anything flagged
 * triage.isColdInbound (graymail), and automated vendor/shipping/
 * payment mail - exactly what a receipt is - is precisely what that
 * flag exists to quarantine. So this scans the inbox independently,
 * pre-filtered to plausible receipt candidates (has an attachment, or a
 * receipt-ish subject line) to keep the per-email LLM call count down.
 */

const Anthropic = require('@anthropic-ai/sdk')
const fs = require('fs')
const path = require('path')
const winston = require('../logger')
const LilyPadEmailCache = require('../models/lilypadEmailCache')
const LilyPadReceipt = require('../models/lilypadReceipt')
const microsoftCalendarService = require('./microsoftCalendarService')
const microsoftEmailService = require('./microsoftEmailService')
const { bodyToPlainText } = require('./emailTriageExtractionService')

const REQUEST_TIMEOUT_MS = 30000
const MAX_RETRIES = 3
// Cheap/fast on purpose, same reasoning as stage 4 - "is this a
// receipt" is a small, mechanical classification.
const DEFAULT_MODEL = 'claude-haiku-4-5'
const BATCH_SIZE_PER_OWNER = 20
const LOOKBACK_DAYS = 14
const MIN_RECEIPT_CONFIDENCE = 0.6
const UPLOAD_ROOT = process.env.UPLOAD_DIR || '/var/data/uploads'
const RECEIPTS_DIR = path.join(UPLOAD_ROOT, 'receipts')

// Cheap pre-filter so most inbox mail never reaches the model at all -
// only candidates matching this even get a classification call.
const RECEIPT_SUBJECT_HINT = /invoice|receipt|order confirmation|payment received|your order|has shipped|shipping confirmation|tracking number|purchase order/i

function getConfig () {
  return {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    model: process.env.RECEIPT_EXTRACTION_MODEL || DEFAULT_MODEL
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

const RECEIPT_TOOL = {
  name: 'emit_receipt_check',
  description: 'Structured classification of whether one email is a purchase receipt, invoice, or order confirmation.',
  input_schema: {
    type: 'object',
    required: ['is_receipt', 'confidence'],
    properties: {
      is_receipt: { type: 'boolean', description: 'True if this email is a receipt, invoice, order confirmation, or payment confirmation for a purchase - not a promotional/marketing email, newsletter, or shipping tracking update with no dollar amount.' },
      vendor: { type: 'string', description: 'The company that issued the receipt, e.g. "Amazon", "FedEx". Empty string if unclear.' },
      amount: { type: ['number', 'null'], description: 'Total charged amount, as a plain number with no currency symbol. Null if not stated.' },
      currency: { type: 'string', description: '3-letter currency code, default "USD" if unstated but an amount is present.' },
      receipt_date_iso: { type: ['string', 'null'], description: 'ISO 8601 date of the purchase/charge, if stated. Null otherwise.' },
      one_line_summary: { type: 'string', description: 'One short sentence describing what was purchased, e.g. "3x Fog Fluid Concentrate, 1 gallon".' },
      confidence: { type: 'number', description: '0-1, how confident this is genuinely a receipt.' }
    }
  }
}

const SYSTEM_PROMPT = 'You classify a single email for an internal ERP\'s receipt-capture feature. ' +
  'Determine only whether this specific email is a purchase receipt, invoice, order confirmation, or ' +
  'payment confirmation - something a bookkeeper would want filed for expense tracking. ' +
  'Marketing emails, newsletters, plain shipping-tracking updates with no charge amount, and account ' +
  'notifications are NOT receipts, even from a retailer. When genuinely unsure, set is_receipt to false ' +
  'rather than guessing - a missed receipt is far cheaper than a wrong filing cluttering the list.'

function buildUserPrompt (email, attachmentNames) {
  const from = (email.from && (email.from.name || email.from.address)) || 'Unknown sender'
  const received = email.receivedDateTime ? new Date(email.receivedDateTime).toISOString() : 'unknown'
  const attachmentLine = attachmentNames.length ? `\nAttachments: ${attachmentNames.join(', ')}` : ''
  return `From: ${from}\nSubject: ${email.subject || '(no subject)'}\nReceived: ${received}${attachmentLine}\n\n${bodyToPlainText(email)}`
}

async function classifyEmail (email, attachmentNames) {
  const config = getConfig()
  const client = getClient(config.apiKey)

  const response = await client.messages.create({
    model: config.model,
    max_tokens: 1024,
    system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
    tools: [RECEIPT_TOOL],
    tool_choice: { type: 'tool', name: RECEIPT_TOOL.name },
    messages: [{ role: 'user', content: buildUserPrompt(email, attachmentNames) }]
  })

  const toolUse = response.content.find((block) => block.type === 'tool_use')
  if (!toolUse) return { is_receipt: false, confidence: 0 }
  return toolUse.input || { is_receipt: false, confidence: 0 }
}

function sanitizeFilename (name) {
  return String(name || 'attachment').replace(/[^a-zA-Z0-9._-]/g, '_').slice(-150)
}

/**
 * Downloads and saves each qualifying attachment to the shared upload
 * disk (same Render persistent volume ticket/task/machine attachments
 * already use), returning the metadata LilyPadReceipt.attachments
 * expects. Best-effort per attachment - one failing (e.g. a transient
 * Graph error) shouldn't lose the whole receipt.
 */
async function downloadReceiptAttachments (ownerId, graphMessageId) {
  const saved = []
  let candidates = []
  try {
    candidates = await microsoftEmailService.listMessageAttachments(ownerId, graphMessageId)
  } catch (err) {
    winston.error(`Listing attachments failed for message ${graphMessageId}: ${err.message}`)
    return saved
  }

  for (const attachment of candidates) {
    try {
      const bytes = await microsoftEmailService.getAttachmentBytes(ownerId, graphMessageId, attachment)
      const dir = path.join(RECEIPTS_DIR, String(ownerId))
      fs.mkdirSync(dir, { recursive: true })
      const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${sanitizeFilename(attachment.name)}`
      fs.writeFileSync(path.join(dir, filename), bytes)
      saved.push({
        filename,
        originalName: attachment.name,
        path: `receipts/${ownerId}/${filename}`,
        contentType: attachment.contentType,
        size: attachment.size
      })
    } catch (err) {
      winston.error(`Downloading attachment "${attachment.name}" failed for message ${graphMessageId}: ${err.message}`)
    }
  }
  return saved
}

/**
 * Classifies one email and, if it's a confident receipt, files it -
 * always marks the email processed afterward via an atomic update (not
 * a full-document save) so an unrelated legacy-shaped field elsewhere on
 * the doc can never turn a routine "mark processed" into a validation
 * crash, the same lesson learned the hard way on the Priority
 * Conversations blockers.
 */
async function processEmail (ownerId, email) {
  try {
    const attachmentNames = []
    let attachments = []
    if (email.hasAttachments) {
      attachments = await downloadReceiptAttachments(ownerId, email.graphMessageId)
      attachments.forEach((a) => attachmentNames.push(a.originalName))
    }

    const result = await classifyEmail(email, attachmentNames)
    const isReceipt = Boolean(result.is_receipt) && (result.confidence || 0) >= MIN_RECEIPT_CONFIDENCE

    if (isReceipt) {
      await LilyPadReceipt.create({
        owner: ownerId,
        sourceEmail: email._id,
        subject: email.subject || '',
        receivedAt: email.receivedDateTime,
        vendor: String(result.vendor || '').slice(0, 200),
        amount: typeof result.amount === 'number' ? result.amount : null,
        currency: (result.currency || 'USD').slice(0, 10),
        receiptDate: result.receipt_date_iso ? new Date(result.receipt_date_iso) : null,
        summary: String(result.one_line_summary || '').slice(0, 300),
        confidence: result.confidence || 0,
        attachments,
        status: 'captured'
      })
    } else {
      // Not filed - downloaded attachments (if any) belong to a false
      // positive, so clean them back up rather than leaving orphaned
      // files with no LilyPadReceipt row pointing at them.
      attachments.forEach((a) => fs.unlink(path.join(UPLOAD_ROOT, a.path), () => {}))
    }

    await LilyPadEmailCache.updateOne({ _id: email._id }, { $set: { receiptExtractionProcessed: true } })
    return isReceipt
  } catch (err) {
    winston.error(`Receipt extraction failed for email ${email._id}: ${err.message}`)
    await LilyPadEmailCache.updateOne({ _id: email._id }, { $set: { receiptExtractionProcessed: true } })
    return false
  }
}

/**
 * Same lookback-floored-at-connectedAt window as stage 4, so a brand
 * new Microsoft connection doesn't dredge up years of old receipts the
 * first time it syncs.
 */
async function runExtractionForOwner (ownerId) {
  if (!isExtractionConfigured()) return { skipped: true, reason: 'ANTHROPIC_API_KEY not configured' }

  const lookbackFloor = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000)
  const status = await microsoftCalendarService.getStatus(ownerId)
  const since = status.connectedAt && status.connectedAt > lookbackFloor ? status.connectedAt : lookbackFloor

  const emails = await LilyPadEmailCache.find({
    owner: ownerId,
    folder: 'inbox',
    deleted: false,
    receiptExtractionProcessed: { $ne: true },
    receivedDateTime: { $gte: since },
    $or: [{ hasAttachments: true }, { subject: RECEIPT_SUBJECT_HINT }]
  }).sort({ receivedDateTime: 1 }).limit(BATCH_SIZE_PER_OWNER)

  let captured = 0
  let processed = 0
  for (const email of emails) {
    const wasReceipt = await processEmail(ownerId, email)
    processed++
    if (wasReceipt) captured++
  }

  return { processed, captured, remaining: emails.length === BATCH_SIZE_PER_OWNER }
}

async function runScheduledExtraction (winstonLogger) {
  if (!isExtractionConfigured()) return
  const connectedIds = await microsoftCalendarService.getConnectedUserIds()
  for (const ownerId of connectedIds) {
    try {
      await runExtractionForOwner(ownerId)
    } catch (err) {
      if (winstonLogger) winstonLogger.error(`Receipt extraction failed for ${ownerId}: ${err.message}`)
    }
  }
}

function startReceiptExtractionScheduler (winstonLogger) {
  if (!isExtractionConfigured()) {
    if (winstonLogger) winstonLogger.info('Receipt extraction scheduler not started - ANTHROPIC_API_KEY not configured.')
    return
  }

  const intervalMinutes = Number(process.env.RECEIPT_EXTRACTION_CHECK_MINUTES || 30)
  const intervalMs = Math.max(15 * 60 * 1000, intervalMinutes * 60 * 1000)

  if (winstonLogger) winstonLogger.info(`Receipt extraction scheduler started (${intervalMinutes} minute interval).`)

  setInterval(() => {
    runScheduledExtraction(winstonLogger).catch((err) => {
      if (winstonLogger) winstonLogger.error('Scheduled receipt extraction failed: ' + err.message)
    })
  }, intervalMs)

  setTimeout(() => {
    runScheduledExtraction(winstonLogger).catch((err) => {
      if (winstonLogger) winstonLogger.error('Initial receipt extraction failed: ' + err.message)
    })
  }, 150000) // staggered after the other email-pipeline schedulers' own initial runs
}

module.exports = {
  isExtractionConfigured,
  runExtractionForOwner,
  runScheduledExtraction,
  startReceiptExtractionScheduler
}
