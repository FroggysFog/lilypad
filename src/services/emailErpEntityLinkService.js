/**
 * LilyPad ERP - Email <-> ERP Entity Auto-Linking (AI Email Triage
 * Module, stage 6a)
 * Pattern-matches order/PO numbers, carrier tracking numbers, and
 * ticket/task UIDs out of email subject+body text, then looks each
 * candidate up against the real ERP collections - deliberately no LLM
 * call here. Recognizing "PO-48192" or "LP-204" is a fixed-format
 * pattern-match problem, not one that benefits from a model's judgment,
 * and running this on every synced message would make it by far the
 * most-called piece of the pipeline if it went through Claude.
 *
 * Customer links are the one match reused rather than re-derived - the
 * sender's address is already resolved against LilyPadCustomer by
 * stage 3's scoring engine, so this just reads that result instead of
 * re-querying.
 */

const { convert: htmlToText } = require('html-to-text')
const LilyPadEmailCache = require('../models/lilypadEmailCache')
const LilyPadErpEntityLink = require('../models/lilypadErpEntityLink')
const LilyPadOrder = require('../models/lilypadOrder')
const LilyPadTicket = require('../models/lilypadTicket')
const LilyPadTask = require('../models/lilypadTask')
const LilyPadContactInteractionScore = require('../models/lilypadContactInteractionScore')
const microsoftCalendarService = require('./microsoftCalendarService')

const BATCH_SIZE_PER_OWNER = 100
const ORDER_NUMBER_PATTERN = /\b(?:PO|Order|SO)[\s#:-]*(\d{3,10})\b/gi
const UPS_TRACKING_PATTERN = /\b1Z[0-9A-Z]{16}\b/g
const TICKET_UID_PATTERN = /\bLP-(\d+)\b/g
const TASK_UID_PATTERN = /\bTSK-(\d+)\b/g

function bodyToPlainText (email) {
  return email.bodyHtml ? htmlToText(email.bodyHtml, { wordwrap: false }) : String(email.bodyPreview || '')
}

function extractCandidates (text) {
  const orderNumbers = new Set()
  const trackingNumbers = new Set()
  const ticketUids = new Set()
  const taskUids = new Set()
  let m

  ORDER_NUMBER_PATTERN.lastIndex = 0
  while ((m = ORDER_NUMBER_PATTERN.exec(text))) orderNumbers.add(m[1])

  UPS_TRACKING_PATTERN.lastIndex = 0
  while ((m = UPS_TRACKING_PATTERN.exec(text))) trackingNumbers.add(m[0])

  TICKET_UID_PATTERN.lastIndex = 0
  while ((m = TICKET_UID_PATTERN.exec(text))) ticketUids.add(`LP-${m[1]}`)

  TASK_UID_PATTERN.lastIndex = 0
  while ((m = TASK_UID_PATTERN.exec(text))) taskUids.add(`TSK-${m[1]}`)

  return { orderNumbers: [...orderNumbers], trackingNumbers: [...trackingNumbers], ticketUids: [...ticketUids], taskUids: [...taskUids] }
}

async function findLinksForEmail (email) {
  const text = `${email.subject || ''}\n${bodyToPlainText(email)}`
  const { orderNumbers, trackingNumbers, ticketUids, taskUids } = extractCandidates(text)
  const links = []

  for (const num of orderNumbers) {
    const order = await LilyPadOrder.findOne({ orderNumber: num })
    if (order) {
      links.push({
        entityType: 'order',
        entityId: order._id,
        matchedText: num,
        snapshotLabel: `Order #${order.orderNumber}`,
        snapshotStatus: order.status || '',
        snapshotValue: order.totalAmount || null
      })
    }
  }

  for (const tn of trackingNumbers) {
    const order = await LilyPadOrder.findOne({ $or: [{ 'shipments.trackingNumber': tn }, { 'shipments.trackingNumberAlt': tn }] })
    if (order) {
      links.push({
        entityType: 'order',
        entityId: order._id,
        matchedText: tn,
        snapshotLabel: `Order #${order.orderNumber} (tracking)`,
        snapshotStatus: order.status || '',
        snapshotValue: order.totalAmount || null
      })
    }
  }

  for (const uid of ticketUids) {
    const ticket = await LilyPadTicket.findOne({ formattedUid: uid })
    if (ticket) {
      links.push({
        entityType: 'ticket',
        entityId: ticket._id,
        matchedText: uid,
        snapshotLabel: `${ticket.formattedUid}: ${ticket.title || ''}`,
        snapshotStatus: ticket.status || '',
        snapshotValue: null
      })
    }
  }

  for (const uid of taskUids) {
    const task = await LilyPadTask.findOne({ formattedUid: uid })
    if (task) {
      links.push({
        entityType: 'task',
        entityId: task._id,
        matchedText: uid,
        snapshotLabel: `${task.formattedUid}: ${task.title || ''}`,
        snapshotStatus: task.status || '',
        snapshotValue: null
      })
    }
  }

  if (email.from && email.from.address) {
    const score = await LilyPadContactInteractionScore.findOne({ owner: email.owner, address: email.from.address })
    if (score && score.matchedErpContact && score.matchedErpContact.kind === 'customer') {
      links.push({
        entityType: 'customer',
        entityId: score.matchedErpContact.refId,
        matchedText: email.from.address,
        snapshotLabel: score.displayName || email.from.address,
        snapshotStatus: '',
        snapshotValue: null
      })
    }
  }

  return links
}

async function linkEntitiesForEmail (email) {
  const links = await findLinksForEmail(email)

  // Replace wholesale rather than diff - this runs once per email (the
  // processed flag prevents re-running), so there's no steady-state
  // cost to just clearing and re-inserting.
  await LilyPadErpEntityLink.deleteMany({ sourceEmail: email._id })
  if (links.length) {
    await LilyPadErpEntityLink.insertMany(links.map((l) => ({ sourceEmail: email._id, ...l })))
  }

  email.entityLinksProcessed = true
  await email.save()
  return links.length
}

/**
 * Runs across inbox+sent+archive (not drafts, which change too fast to
 * be worth linking mid-edit) for one owner, oldest-first, capped per
 * run - this is cheap (no LLM), so the batch can be much larger than
 * stage 4/5's model-backed passes.
 */
async function runEntityLinkingForOwner (ownerId) {
  const emails = await LilyPadEmailCache.find({
    owner: ownerId,
    folder: { $in: ['inbox', 'sentitems', 'archive'] },
    deleted: false,
    entityLinksProcessed: false
  }).sort({ receivedDateTime: 1 }).limit(BATCH_SIZE_PER_OWNER)

  let linked = 0
  for (const email of emails) {
    const count = await linkEntitiesForEmail(email)
    if (count) linked++
  }
  return { processed: emails.length, linked }
}

async function runScheduledEntityLinking (winston) {
  const connectedIds = await microsoftCalendarService.getConnectedUserIds()
  for (const ownerId of connectedIds) {
    try {
      await runEntityLinkingForOwner(ownerId)
    } catch (err) {
      if (winston) winston.error(`ERP entity linking failed for ${ownerId}: ${err.message}`)
    }
  }
}

function startEntityLinkingScheduler (winston) {
  const intervalMinutes = Number(process.env.EMAIL_ENTITY_LINK_CHECK_MINUTES || 20)
  const intervalMs = Math.max(10 * 60 * 1000, intervalMinutes * 60 * 1000)

  if (winston) winston.info(`ERP entity linking scheduler started (${intervalMinutes} minute interval).`)

  setInterval(() => {
    runScheduledEntityLinking(winston).catch((err) => {
      if (winston) winston.error('Scheduled ERP entity linking failed: ' + err.message)
    })
  }, intervalMs)

  setTimeout(() => {
    runScheduledEntityLinking(winston).catch((err) => {
      if (winston) winston.error('Initial ERP entity linking failed: ' + err.message)
    })
  }, 45000)
}

async function getLinksForEmail (ownerId, graphMessageId) {
  const email = await LilyPadEmailCache.findOne({ owner: ownerId, graphMessageId })
  if (!email) return []
  return LilyPadErpEntityLink.find({ sourceEmail: email._id, dismissed: { $ne: true } })
}

/**
 * Verified through the link's own sourceEmail rather than trusting
 * linkId alone - an entity link has no owner field of its own (it's
 * only reachable via its sourceEmail), so this is what stops one user
 * from dismissing a link on another user's email by guessing its id.
 */
async function dismissLink (ownerId, linkId) {
  const link = await LilyPadErpEntityLink.findById(linkId)
  if (!link) return
  const email = await LilyPadEmailCache.findOne({ _id: link.sourceEmail, owner: ownerId })
  if (!email) return // not this user's email - silently no-op

  link.dismissed = true
  await link.save()
}

module.exports = {
  runEntityLinkingForOwner,
  runScheduledEntityLinking,
  startEntityLinkingScheduler,
  getLinksForEmail,
  dismissLink
}
