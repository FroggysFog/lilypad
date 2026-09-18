/**
 * LilyPad ERP - Unified Communications Feed
 * Merges the three "review a conversation, get a summary and any
 * tasks" sources - email sender rollups, Teams chat rollups, and
 * meeting notes - into one normalized card list for the dashboard's
 * single Communications widget (replacing the old separate Priority
 * Conversations / Suggested Tasks widgets).
 *
 * Meeting cards adapt Read.ai's own summary/action-items directly (no
 * Claude call here) - only email and chat involve LilyPad's own AI.
 *
 * Correctness note: a pending LilyPadSuggestedTask can point at a
 * sender/chat/meeting that no longer "earns" a rich card (its rollup
 * was dismissed, an email sender's priority score dropped, a chat went
 * quiet, etc). Without a fallback, that task would silently vanish
 * from the UI now that there's no separate flat "Suggested Tasks" list
 * for it to show up in instead - see buildOrphanCard below.
 */

const LilyPadSuggestedTask = require('../models/lilypadSuggestedTask')
const LilyPadMeetingNote = require('../models/lilypadMeetingNote')
const emailSenderRollupService = require('./emailSenderRollupService')
const teamsChatTriageService = require('./teamsChatTriageService')

const MEETING_LOOKBACK_DAYS = 14
const MEETING_CARD_LIMIT = 30

function taskShape (task) {
  return {
    id: String(task._id),
    title: task.title,
    context: task.context,
    suggestedDueDate: task.suggestedDueDate,
    urgency: task.urgency,
    confidence: task.confidence,
    sourceEmail: task.sourceEmail ? { subject: task.sourceEmail.subject, graphMessageId: task.sourceEmail.graphMessageId } : null
  }
}

/**
 * Derives the {sourceType, key} a pending task belongs under - must
 * match exactly how buildCardMap below keys each real card.
 */
function taskSourceKey (task) {
  if (task.sourceEmail && task.sourceEmail.from && task.sourceEmail.from.address) {
    return `email:${String(task.sourceEmail.from.address).toLowerCase()}`
  }
  if (task.sourceChat && task.sourceChat.chatId) {
    return `chat:${task.sourceChat.chatId}`
  }
  if (task.sourceMeetingNote) {
    return `meeting:${String(task.sourceMeetingNote._id)}`
  }
  return null
}

function buildOrphanCard (task) {
  if (task.sourceEmail) {
    return {
      sourceType: 'email',
      sourceId: task.sourceEmail.from ? task.sourceEmail.from.address : '',
      title: (task.sourceEmail.from && task.sourceEmail.from.name) || (task.sourceEmail.from && task.sourceEmail.from.address) || 'Email',
      subtitle: task.sourceEmail.subject || '',
      summary: null,
      lastActivityAt: task.sourceEmail.receivedDateTime || task.createdAt,
      urgencyHint: null,
      tasks: []
    }
  }
  if (task.sourceChat) {
    return {
      sourceType: 'chat',
      sourceId: task.sourceChat.chatId,
      title: task.sourceChat.displayName || 'Teams chat',
      subtitle: 'Teams chat',
      summary: null,
      lastActivityAt: task.createdAt,
      urgencyHint: null,
      tasks: []
    }
  }
  if (task.sourceMeetingNote) {
    return {
      sourceType: 'meeting',
      sourceId: String(task.sourceMeetingNote._id),
      title: task.sourceMeetingNote.title || 'Meeting',
      subtitle: task.sourceMeetingNote.startTime ? new Date(task.sourceMeetingNote.startTime).toLocaleDateString() : '',
      summary: null,
      lastActivityAt: task.sourceMeetingNote.startTime || task.createdAt,
      urgencyHint: null,
      tasks: []
    }
  }
  // A pending task with none of the three source refs populated
  // shouldn't be possible given how each pipeline creates them, but
  // fail safe with a generic card rather than dropping the task.
  return {
    sourceType: 'email',
    sourceId: `orphan:${task.id}`,
    title: task.context || 'Suggested task',
    subtitle: '',
    summary: null,
    lastActivityAt: task.createdAt,
    urgencyHint: null,
    tasks: []
  }
}

async function getFeed (ownerId) {
  const [pendingTasksRaw, emailCards, chatCards, meetingNotes] = await Promise.all([
    LilyPadSuggestedTask.find({ owner: ownerId, status: 'pending' })
      .sort({ createdAt: -1 })
      .limit(300)
      .populate('sourceEmail', 'subject from receivedDateTime graphMessageId')
      .populate('sourceChat', 'chatId displayName')
      .populate('sourceMeetingNote', 'title startTime'),
    emailSenderRollupService.getRollupCards(ownerId),
    teamsChatTriageService.getChatCards(ownerId),
    LilyPadMeetingNote.find({
      owner: ownerId,
      startTime: { $gte: new Date(Date.now() - MEETING_LOOKBACK_DAYS * 24 * 60 * 60 * 1000) }
    }).sort({ startTime: -1 }).limit(MEETING_CARD_LIMIT).lean()
  ])

  const cardMap = new Map()

  for (const c of emailCards) {
    cardMap.set(`email:${c.address}`, {
      sourceType: 'email',
      sourceId: c.address,
      title: c.displayName,
      subtitle: c.reason === 'keyword' ? `keyword: ${c.label}` : (c.reason === 'manual' ? 'watched' : ''),
      summary: c.executiveSummary,
      lastActivityAt: c.lastInboundAt || c.generatedAt,
      urgencyHint: null,
      unreadCount: c.unreadCount,
      blockers: c.blockers,
      quickReplies: c.quickReplies,
      mostRecentMessageId: c.mostRecentMessageId,
      tasks: []
    })
  }

  for (const c of chatCards) {
    cardMap.set(`chat:${c.chatId}`, {
      sourceType: 'chat',
      sourceId: c.chatId,
      title: c.displayName,
      subtitle: 'Teams chat',
      summary: c.summary,
      lastActivityAt: c.generatedAt,
      urgencyHint: c.urgency,
      tasks: []
    })
  }

  for (const note of meetingNotes) {
    cardMap.set(`meeting:${note._id}`, {
      sourceType: 'meeting',
      sourceId: String(note._id),
      title: note.title || 'Meeting',
      subtitle: note.startTime ? new Date(note.startTime).toLocaleDateString() : '',
      summary: note.summary,
      lastActivityAt: note.endTime || note.startTime,
      urgencyHint: null,
      tasks: []
    })
  }

  const orphanCards = []
  for (const task of pendingTasksRaw) {
    const shaped = taskShape(task)
    const key = taskSourceKey(task)
    const card = key && cardMap.get(key)
    if (card) {
      card.tasks.push(shaped)
    } else {
      // Either the source no longer earns a card (dismissed/gone quiet)
      // or - for a brand new source with no rollup generated yet - it
      // simply hasn't been summarized yet. Either way, synthesize a
      // minimal card so the task stays visible.
      const orphanKey = key || `orphan:${shaped.id}`
      let orphan = cardMap.get(orphanKey)
      if (!orphan) {
        orphan = buildOrphanCard(task)
        cardMap.set(orphanKey, orphan)
        orphanCards.push(orphan)
      }
      orphan.tasks.push(shaped)
    }
  }

  const cards = Array.from(cardMap.values())
  cards.sort((a, b) => {
    const aPriority = (a.tasks.length > 0 || (a.blockers && a.blockers.length > 0)) ? 1 : 0
    const bPriority = (b.tasks.length > 0 || (b.blockers && b.blockers.length > 0)) ? 1 : 0
    if (aPriority !== bPriority) return bPriority - aPriority
    const aTime = a.lastActivityAt ? new Date(a.lastActivityAt).getTime() : 0
    const bTime = b.lastActivityAt ? new Date(b.lastActivityAt).getTime() : 0
    return bTime - aTime
  })

  return { cards, totalPendingTasks: pendingTasksRaw.length }
}

module.exports = { getFeed }
