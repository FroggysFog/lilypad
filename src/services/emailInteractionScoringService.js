/**
 * LilyPad ERP - Email Interaction Scoring Engine (AI Email Triage
 * Module, stage 3)
 * Deterministic, no LLM involved - just counting. For each connected
 * user, walks their cached inbox/sent mail over a rolling 60-day window
 * and computes, per counterpart address: how often they email you, how
 * often you've ever replied to them, whether their domain matches your
 * own company's, and whether they're a real ERP contact (customer,
 * lead, or ticket submitter). That score then decides two things on
 * the cached inbox messages themselves: a 0-100 priorityScore, and
 * whether the message is "cold inbound" - a stranger, outside your
 * domain, you've never once emailed back, who doesn't exist anywhere
 * else in the ERP - which is what the graymail digest filters on.
 */

const LilyPadEmailCache = require('../models/lilypadEmailCache')
const LilyPadContactInteractionScore = require('../models/lilypadContactInteractionScore')
const LilyPadMicrosoftAccount = require('../models/lilypadMicrosoftAccount')
const LilyPadCustomer = require('../models/lilypadCustomer')
const LilyPadStagedLead = require('../models/lilypadStagedLead')
const LilyPadTicket = require('../models/lilypadTicket')
const microsoftCalendarService = require('./microsoftCalendarService')

const WINDOW_DAYS = 60

function domainOf (address) {
  const parts = String(address || '').toLowerCase().split('@')
  return parts.length === 2 ? parts[1] : ''
}

/**
 * INTERNAL_EMAIL_DOMAINS (comma-separated) overrides this if set -
 * otherwise "internal" is derived from the connected user's own mailbox
 * domain, which is right for the common single-company case without
 * needing any configuration at all.
 */
async function getInternalDomains (ownerId) {
  if (process.env.INTERNAL_EMAIL_DOMAINS) {
    return process.env.INTERNAL_EMAIL_DOMAINS.split(',').map((d) => d.trim().toLowerCase()).filter(Boolean)
  }
  const account = await LilyPadMicrosoftAccount.findOne({ user: ownerId })
  const domain = account && domainOf(account.msEmail)
  return domain ? [domain] : []
}

async function matchErpContact (address) {
  if (!address) return { kind: null, refId: null }

  const customer = await LilyPadCustomer.findOne({ email: address }, '_id')
  if (customer) return { kind: 'customer', refId: customer._id }

  const lead = await LilyPadStagedLead.findOne({ email: address }, '_id')
  if (lead) return { kind: 'lead', refId: lead._id }

  const ticket = await LilyPadTicket.findOne({ email: address }, '_id')
  if (ticket) return { kind: 'ticket_submitter', refId: ticket._id }

  return { kind: null, refId: null }
}

/**
 * The exact definition from the spec: outside our domain, we've never
 * once replied to them (not "replied recently" - ever, within the
 * window), and they don't exist anywhere else in the ERP. Internal
 * colleagues and matched ERP contacts are never graymail regardless of
 * how lopsided the reply ratio looks.
 */
function computeIsColdInbound (scoreDoc) {
  return !scoreDoc.isInternalDomain && !scoreDoc.matchedErpContact.kind && scoreDoc.repliedCount === 0
}

function computePriorityScore (scoreDoc) {
  if (scoreDoc.isInternalDomain) return 100
  if (scoreDoc.matchedErpContact.kind) return 80
  if (computeIsColdInbound(scoreDoc)) return 5
  return Math.round(Math.min(1, scoreDoc.velocityScore) * 60)
}

/**
 * Writes the computed isColdInbound/priorityScore back onto every
 * cached inbox message from each address - this is what lets the
 * inbox list and the graymail digest just read a field instead of
 * re-joining against the score collection on every render.
 */
async function applyTriageFlags (ownerId, scoreDocs) {
  await Promise.all(scoreDocs.map((doc) => {
    const isColdInbound = computeIsColdInbound(doc)
    const priorityScore = computePriorityScore(doc)
    return LilyPadEmailCache.updateMany(
      { owner: ownerId, folder: 'inbox', 'from.address': doc.address },
      { $set: { 'triage.isColdInbound': isColdInbound, 'triage.priorityScore': priorityScore } }
    )
  }))
}

async function recomputeScoresForOwner (ownerId) {
  const windowStart = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000)
  const internalDomains = await getInternalDomains(ownerId)

  const [inboundAgg, outboundAgg] = await Promise.all([
    LilyPadEmailCache.aggregate([
      { $match: { owner: ownerId, folder: 'inbox', deleted: false, receivedDateTime: { $gte: windowStart }, 'from.address': { $ne: '' } } },
      { $group: { _id: '$from.address', displayName: { $first: '$from.name' }, receivedCount: { $sum: 1 }, lastInboundAt: { $max: '$receivedDateTime' } } }
    ]),
    LilyPadEmailCache.aggregate([
      { $match: { owner: ownerId, folder: 'sentitems', deleted: false, receivedDateTime: { $gte: windowStart } } },
      { $unwind: '$toRecipients' },
      { $match: { 'toRecipients.address': { $ne: '' } } },
      { $group: { _id: '$toRecipients.address', displayName: { $first: '$toRecipients.name' }, repliedCount: { $sum: 1 }, lastOutboundAt: { $max: '$receivedDateTime' } } }
    ])
  ])

  const inboundByAddress = new Map(inboundAgg.map((row) => [row._id, row]))
  const outboundByAddress = new Map(outboundAgg.map((row) => [row._id, row]))
  const addresses = new Set([...inboundByAddress.keys(), ...outboundByAddress.keys()])

  const scoreDocs = []
  for (const address of addresses) {
    const inbound = inboundByAddress.get(address)
    const outbound = outboundByAddress.get(address)
    const receivedCount = inbound ? inbound.receivedCount : 0
    const repliedCount = outbound ? outbound.repliedCount : 0
    const isInternalDomain = internalDomains.includes(domainOf(address))
    // No need to hit three ERP collections for someone on your own
    // payroll - internal senders are never graymail candidates anyway.
    const matchedErpContact = isInternalDomain ? { kind: null, refId: null } : await matchErpContact(address)
    const velocityScore = receivedCount > 0 ? Math.min(1, repliedCount / receivedCount) : (repliedCount > 0 ? 1 : 0)

    const doc = await LilyPadContactInteractionScore.findOneAndUpdate(
      { owner: ownerId, address },
      {
        $set: {
          displayName: (inbound && inbound.displayName) || (outbound && outbound.displayName) || '',
          isInternalDomain,
          windowStart,
          receivedCount,
          repliedCount,
          lastInboundAt: (inbound && inbound.lastInboundAt) || null,
          lastOutboundAt: (outbound && outbound.lastOutboundAt) || null,
          matchedErpContact,
          velocityScore
        }
      },
      { upsert: true, new: true }
    )
    scoreDocs.push(doc)
  }

  await applyTriageFlags(ownerId, scoreDocs)
  return { addressesScored: scoreDocs.length }
}

async function runScheduledScoring (winston) {
  const connectedIds = await microsoftCalendarService.getConnectedUserIds()
  for (const ownerId of connectedIds) {
    try {
      await recomputeScoresForOwner(ownerId)
    } catch (err) {
      if (winston) winston.error(`Interaction scoring failed for ${ownerId}: ${err.message}`)
    }
  }
}

/**
 * Runs less often than the email sync scheduler - this is an aggregate
 * recompute over the whole rolling window, not a "what's new" check, so
 * there's no benefit to running it every few minutes.
 */
function startInteractionScoringScheduler (winston) {
  const intervalMinutes = Number(process.env.EMAIL_SCORING_CHECK_MINUTES || 30)
  const intervalMs = Math.max(10 * 60 * 1000, intervalMinutes * 60 * 1000)

  if (winston) winston.info(`Email interaction scoring scheduler started (${intervalMinutes} minute interval).`)

  setInterval(() => {
    runScheduledScoring(winston).catch((err) => {
      if (winston) winston.error('Scheduled interaction scoring failed: ' + err.message)
    })
  }, intervalMs)

  setTimeout(() => {
    runScheduledScoring(winston).catch((err) => {
      if (winston) winston.error('Initial interaction scoring failed: ' + err.message)
    })
  }, 60000) // after the email sync's own initial run has had a chance to populate the cache
}

module.exports = {
  recomputeScoresForOwner,
  runScheduledScoring,
  startInteractionScoringScheduler
}
