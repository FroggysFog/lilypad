/**
 * LilyPad ERP - Morning Report Digest Builder
 * Gathers real facts from every source that already exists in this app
 * (calendar, tasks, priority conversations, suggested tasks, meeting
 * notes, chat activity, pipeline alerts) and writes exactly one LLM
 * narrative on top - the greeting paragraph. The LLM never computes a
 * count or invents a fact; every section is a real query, same
 * separation-of-concerns as reportQueryService.js.
 *
 * Cached one document per (owner, digestDate) - see lilypadMorningDigest.js -
 * so "once per day, on first login" costs one Sonnet call per user per
 * day, not one per page load.
 */

const Anthropic = require('@anthropic-ai/sdk')
const moment = require('moment-timezone')
const winston = require('../logger')
const LilyPadAccount = require('../models/lilypadAccount')
const LilyPadMorningDigest = require('../models/lilypadMorningDigest')
const LilyPadTask = require('../models/lilypadTask')
const LilyPadCalendarEvent = require('../models/lilypadCalendarEvent')
const LilyPadSuggestedTask = require('../models/lilypadSuggestedTask')
const LilyPadMeetingNote = require('../models/lilypadMeetingNote')
const LilyPadOpportunity = require('../models/lilypadOpportunity')
const microsoftCalendarService = require('./microsoftCalendarService')
const microsoftTeams = require('./microsoftTeams')
const emailSenderRollupService = require('./emailSenderRollupService')
const { getOpportunityOwnerFilter } = require('./repMatchingService')

const REQUEST_TIMEOUT_MS = 30000
const MAX_RETRIES = 3
const DEFAULT_MODEL = 'claude-sonnet-5'
// No per-user timezone concept exists anywhere in this app today - one
// app-wide business timezone constant, correct it via env var if
// Froggy's Fog operations aren't Eastern.
const TIMEZONE = process.env.MORNING_DIGEST_TIMEZONE || 'America/New_York'
const CLOSING_SOON_DAYS = 7
const STALLED_DAYS = 14

function getConfig () {
  return {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    model: process.env.MORNING_DIGEST_MODEL || DEFAULT_MODEL
  }
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

function todayDateStr () {
  return moment.tz(TIMEZONE).format('YYYY-MM-DD')
}

function dayBounds (dateStr) {
  const start = moment.tz(dateStr, 'YYYY-MM-DD', TIMEZONE).startOf('day')
  const end = start.clone().endOf('day')
  return { start: start.toDate(), end: end.toDate() }
}

/**
 * Each source is wrapped individually so one failing (e.g. Graph being
 * unreachable for chat/calendar) never sinks the rest of the digest -
 * same resilience pattern as globalSearchService.js's per-category
 * try/catch.
 */
async function safely (label, fn, fallback) {
  try {
    return await fn()
  } catch (err) {
    winston.error(`Morning digest section "${label}" failed: ${err.message}`)
    return fallback
  }
}

async function gatherCalendar (ownerId, dateStr) {
  const { start, end } = dayBounds(dateStr)

  const erpEvents = await LilyPadCalendarEvent.find({
    deleted: false,
    $or: [{ createdBy: ownerId }, { attendees: ownerId }],
    start: { $lt: end },
    end: { $gt: start }
  }).lean()

  const msEvents = await safely('microsoft-calendar', async () => {
    const events = await microsoftCalendarService.getEventsForUser(ownerId, start.toISOString(), end.toISOString())
    return events.map((e) => ({
      title: e.title,
      start: e.start ? new Date(e.start) : null,
      end: e.end ? new Date(e.end) : null,
      location: e.location || '',
      onlineMeetingUrl: e.onlineMeetingUrl || '',
      source: 'microsoft'
    }))
  }, [])

  const mapped = erpEvents.map((e) => ({
    title: e.title,
    start: e.start,
    end: e.end,
    location: e.location || '',
    onlineMeetingUrl: e.onlineMeetingUrl || '',
    source: 'erp'
  }))

  return [...mapped, ...msEvents].sort((a, b) => new Date(a.start) - new Date(b.start))
}

async function gatherTasksDueToday (ownerId, dateStr) {
  const { start, end } = dayBounds(dateStr)
  const tasks = await LilyPadTask.getMyTasks(ownerId, { limit: 500 })
  return tasks
    .filter((t) => t.dueDate && t.status !== 'Done' && new Date(t.dueDate) <= end)
    .map((t) => ({
      taskId: t._id,
      formattedUid: t.formattedUid,
      title: t.title,
      priority: t.priority,
      dueDate: t.dueDate,
      overdue: new Date(t.dueDate) < start
    }))
}

async function gatherPriorityConversations (ownerId) {
  const cards = await emailSenderRollupService.getRollupCards(ownerId)
  return cards
    .filter((c) => c.blockers && c.blockers.length)
    .sort((a, b) => b.blockers.length - a.blockers.length)
    .slice(0, 5)
    .map((c) => ({
      address: c.address,
      name: c.displayName,
      summary: c.executiveSummary,
      blockerCount: c.blockers.length
    }))
}

async function gatherSuggestedTasks (ownerId) {
  const suggestions = await LilyPadSuggestedTask.find({ owner: ownerId, status: 'pending' })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean()
  return suggestions.map((s) => ({
    id: s._id,
    title: s.title,
    source: s.sourceMeetingNote ? 'meeting' : 'email'
  }))
}

async function gatherMeetingNotes (ownerId, dateStr) {
  const yesterdayStart = dayBounds(moment.tz(dateStr, 'YYYY-MM-DD', TIMEZONE).subtract(1, 'day').format('YYYY-MM-DD')).start
  const notes = await LilyPadMeetingNote.find({ owner: ownerId, createdAt: { $gte: yesterdayStart } })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean()
  return notes.map((n) => ({
    id: n._id,
    title: n.title,
    summary: n.summary,
    actionItemCount: (n.actionItems || []).length,
    startTime: n.startTime
  }))
}

async function gatherChatActivity (ownerId, dateStr) {
  const yesterdayStart = dayBounds(moment.tz(dateStr, 'YYYY-MM-DD', TIMEZONE).subtract(1, 'day').format('YYYY-MM-DD')).start
  return safely('teams-chat', async () => {
    const chats = await microsoftTeams.getChats(ownerId)
    return chats
      .filter((c) => c.lastMessagePreview && c.lastMessagePreview.createdDateTime && new Date(c.lastMessagePreview.createdDateTime) >= yesterdayStart)
      .sort((a, b) => new Date(b.lastMessagePreview.createdDateTime) - new Date(a.lastMessagePreview.createdDateTime))
      .slice(0, 5)
      .map((c) => ({
        chatId: c.id,
        chatName: c.displayName,
        lastMessagePreview: ((c.lastMessagePreview.body && c.lastMessagePreview.body.content) || '').slice(0, 200),
        lastMessageAt: new Date(c.lastMessagePreview.createdDateTime)
      }))
  }, [])
}

async function gatherPipelineAlerts (ownerId, dateStr) {
  // getOpportunityOwnerFilter needs a real user doc (fullname/
  // salesforceUserId) - callers elsewhere always pass req.user, so this
  // loads the account directly rather than requiring every caller of
  // gatherPipelineAlerts to also fetch it first.
  const account = await LilyPadAccount.findById(ownerId)
  const filter = account ? getOpportunityOwnerFilter(account) : { _id: null }

  const openOpportunities = await LilyPadOpportunity.find({ isClosed: false, ...filter }).lean()

  const inNDays = moment.tz(dateStr, 'YYYY-MM-DD', TIMEZONE).add(CLOSING_SOON_DAYS, 'days').format('YYYY-MM-DD')
  const closingSoon = openOpportunities
    .filter((o) => o.closeDate && o.closeDate >= dateStr && o.closeDate <= inNDays)
    .map((o) => ({ id: o._id, name: o.name, amount: o.amount, closeDate: o.closeDate }))

  const stalledCutoff = moment.tz(TIMEZONE).subtract(STALLED_DAYS, 'days').toDate()
  const stalled = openOpportunities
    .map((o) => {
      const activities = o.activities || []
      const lastActivityDate = activities.length
        ? activities.reduce((latest, a) => (a.occurredAt && a.occurredAt > latest ? a.occurredAt : latest), activities[0].occurredAt)
        : o.createdAt
      return { id: o._id, name: o.name, amount: o.amount, lastActivityDate }
    })
    .filter((o) => o.lastActivityDate && new Date(o.lastActivityDate) < stalledCutoff)

  return { closingSoon, stalled }
}

async function gatherFacts (ownerId, dateStr) {
  const [calendar, tasksDueToday, priorityConversations, suggestedTasks, meetingNotes, chatActivity, pipelineAlerts] = await Promise.all([
    safely('calendar', () => gatherCalendar(ownerId, dateStr), []),
    safely('tasks', () => gatherTasksDueToday(ownerId, dateStr), []),
    safely('priority-conversations', () => gatherPriorityConversations(ownerId), []),
    safely('suggested-tasks', () => gatherSuggestedTasks(ownerId), []),
    safely('meeting-notes', () => gatherMeetingNotes(ownerId, dateStr), []),
    safely('chat-activity', () => gatherChatActivity(ownerId, dateStr), []),
    safely('pipeline-alerts', () => gatherPipelineAlerts(ownerId, dateStr), { closingSoon: [], stalled: [] })
  ])

  return { calendar, tasksDueToday, priorityConversations, suggestedTasks, meetingNotes, chatActivity, pipelineAlerts }
}

const GREETING_TOOL = {
  name: 'emit_morning_greeting',
  description: "A short opening narrative for a user's morning report, based strictly on the facts provided.",
  input_schema: {
    type: 'object',
    required: ['greeting'],
    properties: {
      greeting: { type: 'string', description: '2-4 warm, specific sentences highlighting the 2-3 most important things below. Base this only on the facts provided - never invent a meeting, task, or number that is not listed.' }
    }
  }
}

function factsToText (facts) {
  const lines = []
  lines.push(`Calendar events today: ${facts.calendar.length}`)
  facts.calendar.slice(0, 8).forEach((e) => lines.push(`- ${e.title} at ${new Date(e.start).toLocaleTimeString()}`))

  lines.push(`Tasks due today: ${facts.tasksDueToday.length}`)
  facts.tasksDueToday.slice(0, 8).forEach((t) => lines.push(`- ${t.title} (${t.priority}${t.overdue ? ', OVERDUE' : ''})`))

  lines.push(`Priority conversations needing attention: ${facts.priorityConversations.length}`)
  facts.priorityConversations.forEach((c) => lines.push(`- ${c.name}: ${c.blockerCount} open item(s) - ${c.summary}`))

  lines.push(`Pending suggested tasks: ${facts.suggestedTasks.length}`)

  lines.push(`New meeting notes since yesterday: ${facts.meetingNotes.length}`)
  facts.meetingNotes.forEach((n) => lines.push(`- ${n.title} (${n.actionItemCount} action item(s))`))

  lines.push(`Recent chat activity: ${facts.chatActivity.length} chat(s)`)

  lines.push(`Opportunities closing within ${CLOSING_SOON_DAYS} days: ${facts.pipelineAlerts.closingSoon.length}`)
  facts.pipelineAlerts.closingSoon.forEach((o) => lines.push(`- ${o.name} ($${o.amount || 0}, closes ${o.closeDate})`))

  lines.push(`Stalled opportunities (no activity in ${STALLED_DAYS}+ days): ${facts.pipelineAlerts.stalled.length}`)
  facts.pipelineAlerts.stalled.forEach((o) => lines.push(`- ${o.name} ($${o.amount || 0})`))

  return lines.join('\n')
}

async function writeGreeting (facts) {
  const config = getConfig()
  if (!config.apiKey) return "Good morning! Here's what's on your plate today."

  try {
    const client = getClient(config.apiKey)
    const response = await client.messages.create({
      model: config.model,
      max_tokens: 512,
      system: [{ type: 'text', text: 'You write the opening greeting for an internal ERP\'s daily Morning Report, via the emit_morning_greeting tool.', cache_control: { type: 'ephemeral' } }],
      tools: [GREETING_TOOL],
      tool_choice: { type: 'tool', name: GREETING_TOOL.name },
      messages: [{ role: 'user', content: factsToText(facts) }]
    })
    const toolUse = response.content.find((block) => block.type === 'tool_use')
    return (toolUse && toolUse.input && toolUse.input.greeting) || "Good morning! Here's what's on your plate today."
  } catch (err) {
    winston.error(`Morning digest greeting generation failed: ${err.message}`)
    return "Good morning! Here's what's on your plate today."
  }
}

async function generateDigestForOwner (ownerId, { force = false } = {}) {
  const dateStr = todayDateStr()

  if (!force) {
    const existing = await LilyPadMorningDigest.findOne({ owner: ownerId, digestDate: dateStr })
    if (existing) return existing
  }

  const facts = await gatherFacts(ownerId, dateStr)
  const greeting = await writeGreeting(facts)

  return LilyPadMorningDigest.findOneAndUpdate(
    { owner: ownerId, digestDate: dateStr },
    { $set: { greeting, sections: facts, generatedAt: new Date() } },
    { new: true, upsert: true }
  )
}

module.exports = {
  generateDigestForOwner
}
