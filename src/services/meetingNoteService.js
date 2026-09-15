/**
 * LilyPad ERP - Meeting Note Derivation
 * Turns a verified Read.ai meeting_end webhook into a LilyPadMeetingNote
 * and a LilyPadSuggestedTask per action item. The hard part is matching
 * the meeting to a calendar event: Read.ai's payload carries no
 * Microsoft Graph event id, only title/time/attendee emails, and most
 * real meetings are Microsoft-synced events that are never persisted
 * locally in the first place (see lilypadCalendar.js's getEvents) - so
 * matching has to happen at ingestion time, querying both the local
 * LilyPadCalendarEvent collection and a live Graph calendar lookup.
 */

const winston = require('../logger')
const LilyPadAccount = require('../models/lilypadAccount')
const LilyPadCalendarEvent = require('../models/lilypadCalendarEvent')
const LilyPadMeetingNote = require('../models/lilypadMeetingNote')
const LilyPadSuggestedTask = require('../models/lilypadSuggestedTask')
const microsoftCalendarService = require('./microsoftCalendarService')

// How far apart a meeting's actual start and a calendar event's start
// can be and still count as "the same meeting" - generous enough to
// absorb Read.ai's join lag or a calendar event that started a few
// minutes before/after the recorded session.
const MATCH_WINDOW_MS = 30 * 60 * 1000

function normalizeTitle (title) {
  return String(title || '').trim().toLowerCase().replace(/\s+/g, ' ')
}

/**
 * Tries the meeting's organizer email first, then each participant's,
 * against known LilyPad accounts - the first one that resolves wins.
 * An external-only meeting (nobody on the call has a LilyPad account)
 * still gets its note captured, just with owner: null.
 */
async function resolveOwner (payload) {
  const candidateEmails = []
  if (payload.owner && payload.owner.email) candidateEmails.push(payload.owner.email)
  for (const p of payload.participants || []) {
    if (p.email) candidateEmails.push(p.email)
  }

  for (const email of candidateEmails) {
    const account = await LilyPadAccount.findOne({ email: String(email).trim().toLowerCase(), deleted: { $ne: true } })
    if (account) return account
  }
  return null
}

async function findMatchingErpEvent (ownerId, startTime, title) {
  const events = await LilyPadCalendarEvent.find({
    deleted: false,
    $or: [{ createdBy: ownerId }, { attendees: ownerId }],
    start: { $gte: new Date(startTime.getTime() - MATCH_WINDOW_MS), $lte: new Date(startTime.getTime() + MATCH_WINDOW_MS) }
  })
  if (!events.length) return { event: null, confidence: 'none' }

  const normalized = normalizeTitle(title)
  const titleMatch = events.find((e) => normalizeTitle(e.title) === normalized)
  return titleMatch ? { event: titleMatch, confidence: 'title_time' } : { event: events[0], confidence: 'time_only' }
}

/**
 * A live Graph lookup, not a local query - Microsoft-synced events have
 * no persisted document to match against. Fails closed (no match, not
 * an error) if this owner isn't Microsoft-connected or Graph is
 * unreachable, since a meeting note is still worth keeping even
 * unmatched.
 */
async function findMatchingMsEvent (ownerId, startTime, title) {
  let events
  try {
    const dayStart = new Date(startTime.getTime() - 24 * 60 * 60 * 1000).toISOString()
    const dayEnd = new Date(startTime.getTime() + 24 * 60 * 60 * 1000).toISOString()
    events = await microsoftCalendarService.getEventsForUser(ownerId, dayStart, dayEnd)
  } catch (err) {
    return { msEventId: '', confidence: 'none' }
  }

  const inWindow = events.filter((e) => e.start && Math.abs(new Date(e.start).getTime() - startTime.getTime()) <= MATCH_WINDOW_MS)
  if (!inWindow.length) return { msEventId: '', confidence: 'none' }

  const normalized = normalizeTitle(title)
  const titleMatch = inWindow.find((e) => normalizeTitle(e.title) === normalized)
  return titleMatch
    ? { msEventId: titleMatch.msEventId, confidence: 'title_time' }
    : { msEventId: inWindow[0].msEventId, confidence: 'time_only' }
}

async function processReadAiEvent (rawEvent) {
  const payload = rawEvent.rawPayload || {}
  const owner = await resolveOwner(payload)
  const startTime = payload.start_time ? new Date(payload.start_time) : null
  const endTime = payload.end_time ? new Date(payload.end_time) : null

  let erpEventId = null
  let msEventId = ''
  let matchConfidence = 'none'

  if (owner && startTime) {
    const erpMatch = await findMatchingErpEvent(owner._id, startTime, payload.title)
    if (erpMatch.event) {
      erpEventId = erpMatch.event._id
      matchConfidence = erpMatch.confidence
    } else {
      const msMatch = await findMatchingMsEvent(owner._id, startTime, payload.title)
      if (msMatch.msEventId) {
        msEventId = msMatch.msEventId
        matchConfidence = msMatch.confidence
      }
    }
  }

  // Read.ai lists the organizer redundantly inside participants too, so
  // this dedupes rather than storing the owner's email twice.
  const participantEmailSet = new Set()
  if (payload.owner && payload.owner.email) participantEmailSet.add(payload.owner.email.toLowerCase())
  for (const p of payload.participants || []) {
    if (p.email) participantEmailSet.add(p.email.toLowerCase())
  }
  const participantEmails = Array.from(participantEmailSet)

  const chapterSummaries = (payload.chapter_summaries || []).map((c) => ({
    title: String((c && c.title) || '').slice(0, 200),
    description: String((c && c.description) || '').slice(0, 2000),
    topics: (((c && c.topics) || [])).map((t) => ({ text: String((t && t.text) || t).slice(0, 200) }))
  }))

  const rawTranscript = payload.transcript || {}
  const transcript = {
    speakers: (rawTranscript.speakers || []).map((s) => ({ name: String((s && s.name) || '') })),
    speakerBlocks: (rawTranscript.speaker_blocks || []).map((b) => ({
      startTime: b && b.start_time,
      endTime: b && b.end_time,
      speakerName: String((b && b.speaker && b.speaker.name) || ''),
      words: String((b && b.words) || '')
    }))
  }

  const note = await LilyPadMeetingNote.create({
    owner: owner ? owner._id : null,
    sessionId: payload.session_id || '',
    title: payload.title || '(Untitled meeting)',
    startTime,
    endTime,
    platform: payload.platform || '',
    reportUrl: payload.report_url || '',
    summary: payload.summary || '',
    actionItems: (payload.action_items || []).map((item) => ({ text: String((item && item.text) || item).slice(0, 500) })),
    keyQuestions: (payload.key_questions || []).map((q) => ({ text: String((q && q.text) || q).slice(0, 500) })),
    topics: (payload.topics || []).map((t) => ({ text: String((t && t.text) || t).slice(0, 200) })),
    chapterSummaries,
    transcript,
    participantEmails,
    erpEventId,
    msEventId,
    matchConfidence,
    rawEventId: rawEvent._id
  })

  if (owner) {
    for (const item of note.actionItems) {
      const task = await LilyPadSuggestedTask.create({
        owner: owner._id,
        sourceMeetingNote: note._id,
        title: item.text.slice(0, 255),
        context: note.title,
        status: 'pending'
      })
      item.suggestedTaskId = task._id
    }
    await note.save()
  } else {
    winston.warn(`Read.ai meeting "${note.title}" matched no LilyPad account - note captured without suggested tasks.`)
  }

  return note
}

module.exports = { processReadAiEvent }
