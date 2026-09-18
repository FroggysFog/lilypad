/**
 * LilyPad ERP - Account 360 Communications Timeline
 * Cross-owner (every rep's synced mailbox/calendar, not just the logged-in
 * user's) lookup of email + meeting activity for one Salesforce Account.
 * Raw activity only - no AI summarization here, that's what the dashboard's
 * communicationsFeedService.js is for. Deliberately domain-matches only
 * against the account's own website domain (curated business domain), not
 * matched-lead emails, which can be personal/freemail addresses that would
 * otherwise pull in unrelated customers' mail from every rep's cache.
 * Lead emails are still used for exact-address matching, which carries no
 * such risk.
 */

const LilyPadEmailCache = require('../models/lilypadEmailCache')
const LilyPadMeetingNote = require('../models/lilypadMeetingNote')
const { normalizeDomain } = require('./customerIntelligence/fuzzyMatchService')

const EMAIL_LIMIT = 50
const MEETING_LIMIT = 20

function escapeRegExp (value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function getAccountCommunications (account, matchedLeads) {
  const domain = normalizeDomain(account.website)
  const addresses = (matchedLeads || []).map((l) => l.email).filter(Boolean)
  const domainRegex = domain ? new RegExp('@' + escapeRegExp(domain) + '$', 'i') : null

  if (!addresses.length && !domainRegex) {
    return []
  }

  const addressMatch = (field) => {
    const clauses = []
    if (addresses.length) clauses.push({ [field]: { $in: addresses } })
    if (domainRegex) clauses.push({ [field]: domainRegex })
    return clauses
  }

  const emailOr = [
    ...addressMatch('from.address'),
    ...addressMatch('toRecipients.address'),
    ...addressMatch('ccRecipients.address')
  ]

  const meetingOr = []
  if (addresses.length) meetingOr.push({ participantEmails: { $in: addresses } })
  if (domainRegex) meetingOr.push({ participantEmails: domainRegex })

  const [emails, meetings] = await Promise.all([
    LilyPadEmailCache.find({
      folder: { $in: ['inbox', 'sentitems', 'archive'] },
      deleted: false,
      $or: emailOr
    })
      .select('subject from toRecipients receivedDateTime owner')
      .populate('owner', 'fullname')
      .sort({ receivedDateTime: -1 })
      .limit(EMAIL_LIMIT)
      .lean(),
    LilyPadMeetingNote.find({ $or: meetingOr })
      .select('title startTime participantEmails owner')
      .populate('owner', 'fullname')
      .sort({ startTime: -1 })
      .limit(MEETING_LIMIT)
      .lean()
  ])

  const emailCards = emails.map((e) => ({
    sourceType: 'email',
    title: e.subject || '(no subject)',
    subtitle: e.from && e.from.address,
    lastActivityAt: e.receivedDateTime,
    ownerName: e.owner && e.owner.fullname,
    participants: [e.from && e.from.address, ...(e.toRecipients || []).map((r) => r.address)].filter(Boolean)
  }))

  const meetingCards = meetings.map((m) => ({
    sourceType: 'meeting',
    title: m.title || 'Meeting',
    subtitle: '',
    lastActivityAt: m.startTime,
    ownerName: m.owner && m.owner.fullname,
    participants: m.participantEmails || []
  }))

  return [...emailCards, ...meetingCards].sort((a, b) => {
    const aTime = a.lastActivityAt ? new Date(a.lastActivityAt).getTime() : 0
    const bTime = b.lastActivityAt ? new Date(b.lastActivityAt).getTime() : 0
    return bTime - aTime
  })
}

module.exports = { getAccountCommunications }
