/**
 * LilyPad ERP - Calendar Controller
 * Merges locally-created events/tasks with every connected user's live
 * Microsoft calendar into one feed, and pushes ERP-created events out to
 * each attendee's own Microsoft calendar (best-effort, per-attendee -
 * see lilypadCalendarEvent.js's msSync field for why).
 */

const { LilyPadCalendarEvent, LilyPadAccount, LilyPadTask } = require('../models')
const microsoftCalendarService = require('../services/microsoftCalendarService')
const xss = require('xss')

const controller = {}

/**
 * A calendar item marked as a "task" (not a plain event) is expected to
 * also show up in the real Task Manager, not just sit on the calendar -
 * so it needs an actual lilypad_tasks record, not just the itemType
 * label. Creates one the first time an event becomes a task; on later
 * edits, keeps that task's title/due date in sync with the event
 * instead of creating a second one.
 */
async function syncLinkedTask (event, performedByUser) {
  if (event.itemType !== 'task') return

  if (event.linkedTask) {
    const existing = await LilyPadTask.findOne({ _id: event.linkedTask, deleted: false })
    if (existing) {
      existing.title = event.title
      existing.dueDate = event.start
      await existing.save()
      return
    }
  }

  const task = await LilyPadTask.create({
    title: event.title,
    notes: event.description || '',
    dueDate: event.start,
    owner: event.createdBy,
    createdBy: event.createdBy,
    taggedUsers: event.attendees,
    history: [{
      action: 'created',
      by: performedByUser ? performedByUser._id : null,
      byName: performedByUser ? performedByUser.fullname : 'System',
      description: 'Created from a Calendar task'
    }]
  })

  event.linkedTask = task._id
  await event.save()
}

/**
 * Pushes one saved ERP event out to every distinct connected user among
 * [creator, ...attendees] - each push is independent (Promise.allSettled)
 * so one person's expired token doesn't stop the others or roll back the
 * local save, which already happened before this runs.
 */
async function syncEventToMicrosoft (event) {
  const targetUserIds = Array.from(new Set([String(event.createdBy), ...event.attendees.map(String)]))
  const connectedIds = new Set((await microsoftCalendarService.getConnectedUserIds()).map(String))
  const targets = targetUserIds.filter((id) => connectedIds.has(id))

  const results = await Promise.allSettled(
    targets.map((userId) => microsoftCalendarService.createEventForUser(userId, event))
  )

  event.msSync = targets.map((userId, i) => {
    const result = results[i]
    return result.status === 'fulfilled'
      ? { user: userId, msEventId: result.value, synced: true, error: '', syncedAt: new Date() }
      : { user: userId, msEventId: '', synced: false, error: result.reason.message, syncedAt: new Date() }
  })

  await event.save()
}

/**
 * GET /api/v1/lilypad/calendar/events?start=ISO&end=ISO
 */
controller.getEvents = async function (req, res) {
  try {
    const start = req.query.start ? new Date(req.query.start) : new Date()
    const end = req.query.end ? new Date(req.query.end) : new Date(Date.now() + 30 * 86400000)

    const erpEvents = await LilyPadCalendarEvent.find({
      deleted: false,
      start: { $lt: end },
      end: { $gt: start }
    })
      .populate('createdBy', 'fullname')
      .populate('attendees', 'fullname')
      .populate('linkedTask', 'formattedUid title')
      .populate('linkedTicket', 'formattedUid title')

    const merged = erpEvents.map((e) => ({
      id: `erp-${e._id}`,
      source: 'erp',
      erpId: e._id,
      title: e.title,
      description: e.description,
      location: e.location,
      start: e.start,
      end: e.end,
      allDay: e.allDay,
      itemType: e.itemType,
      ownerName: (e.createdBy && e.createdBy.fullname) || 'Unknown',
      creatorId: String((e.createdBy && e.createdBy._id) || e.createdBy),
      attendeeNames: (e.attendees || []).map((a) => a.fullname),
      attendeeIds: (e.attendees || []).map((a) => String(a._id)),
      linkedTask: e.linkedTask,
      linkedTicket: e.linkedTicket,
      editable: String(e.createdBy._id || e.createdBy) === String(req.user._id)
    }))

    const connectedUserIds = await microsoftCalendarService.getConnectedUserIds()
    const accounts = await LilyPadAccount.find({ _id: { $in: connectedUserIds } }, 'fullname')
    const nameByUserId = new Map(accounts.map((a) => [String(a._id), a.fullname]))

    const startISO = start.toISOString()
    const endISO = end.toISOString()
    const msResults = await Promise.allSettled(
      connectedUserIds.map((userId) => microsoftCalendarService.getEventsForUser(userId, startISO, endISO))
    )

    connectedUserIds.forEach((userId, i) => {
      const result = msResults[i]
      if (result.status !== 'fulfilled') return
      result.value.forEach((msEvent) => {
        merged.push({
          id: `ms-${userId}-${msEvent.msEventId}`,
          source: 'microsoft',
          title: msEvent.title,
          description: msEvent.description,
          location: msEvent.location,
          start: msEvent.start,
          end: msEvent.end,
          allDay: msEvent.allDay,
          itemType: 'event',
          ownerName: nameByUserId.get(String(userId)) || 'Unknown',
          ownerId: String(userId),
          editable: false
        })
      })
    })

    return res.status(200).json({ success: true, data: merged })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/calendar/events
 */
controller.createEvent = async function (req, res) {
  try {
    const { title, description, location, start, end, allDay, itemType, attendeeIds, linkedTaskId, linkedTicketId } = req.body

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Title is required.' })
    }
    if (!start || !end) {
      return res.status(400).json({ success: false, error: 'Start and end are required.' })
    }

    let attendees = []
    if (Array.isArray(attendeeIds) && attendeeIds.length) {
      const found = await LilyPadAccount.find({ _id: { $in: attendeeIds } })
      attendees = found.map((a) => a._id)
    }

    const event = new LilyPadCalendarEvent({
      title: xss(title.trim()),
      description: description ? xss(String(description).trim()) : '',
      location: location ? xss(String(location).trim()) : '',
      start: new Date(start),
      end: new Date(end),
      allDay: Boolean(allDay),
      itemType: itemType === 'task' ? 'task' : 'event',
      createdBy: req.user._id,
      attendees,
      linkedTask: linkedTaskId || null,
      linkedTicket: linkedTicketId || null
    })

    await event.save()
    await syncLinkedTask(event, req.user)
    await syncEventToMicrosoft(event)

    return res.status(201).json({ success: true, message: 'Event created.', data: event })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * PUT /api/v1/lilypad/calendar/events/:id
 * Restricted to the event's creator - attendees see it on the merged
 * feed but don't own the ERP record.
 */
controller.updateEvent = async function (req, res) {
  try {
    const event = await LilyPadCalendarEvent.findOne({ _id: req.params.id, deleted: false })
    if (!event || String(event.createdBy) !== String(req.user._id)) {
      return res.status(404).json({ success: false, error: 'Event not found' })
    }

    const { title, description, location, start, end, allDay, itemType, attendeeIds } = req.body
    if (title !== undefined) event.title = xss(String(title).trim())
    if (description !== undefined) event.description = xss(String(description).trim())
    if (location !== undefined) event.location = xss(String(location).trim())
    if (start !== undefined) event.start = new Date(start)
    if (end !== undefined) event.end = new Date(end)
    if (allDay !== undefined) event.allDay = Boolean(allDay)
    if (itemType !== undefined) event.itemType = itemType === 'task' ? 'task' : 'event'
    if (Array.isArray(attendeeIds)) {
      const found = await LilyPadAccount.find({ _id: { $in: attendeeIds } })
      event.attendees = found.map((a) => a._id)
    }

    await event.save()
    await syncLinkedTask(event, req.user)

    // Re-push to Microsoft: update existing synced copies, create new
    // ones for newly-added attendees who are connected.
    const connectedIds = new Set((await microsoftCalendarService.getConnectedUserIds()).map(String))
    const targetUserIds = Array.from(new Set([String(event.createdBy), ...event.attendees.map(String)]))
    const existingSyncByUser = new Map(event.msSync.map((s) => [String(s.user), s]))

    await Promise.allSettled(targetUserIds.map(async (userId) => {
      if (!connectedIds.has(userId)) return
      const existing = existingSyncByUser.get(userId)
      if (existing && existing.synced) {
        await microsoftCalendarService.updateEventForUser(userId, existing.msEventId, event)
      } else {
        const msEventId = await microsoftCalendarService.createEventForUser(userId, event)
        existingSyncByUser.set(userId, { user: userId, msEventId, synced: true, error: '', syncedAt: new Date() })
      }
    }))

    event.msSync = Array.from(existingSyncByUser.values())
    await event.save()

    return res.status(200).json({ success: true, data: event })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * DELETE /api/v1/lilypad/calendar/events/:id
 */
controller.deleteEvent = async function (req, res) {
  try {
    const event = await LilyPadCalendarEvent.findOne({ _id: req.params.id, deleted: false })
    if (!event || String(event.createdBy) !== String(req.user._id)) {
      return res.status(404).json({ success: false, error: 'Event not found' })
    }

    event.deleted = true
    await event.save()

    await Promise.allSettled(
      event.msSync
        .filter((s) => s.synced && s.msEventId)
        .map((s) => microsoftCalendarService.deleteEventForUser(s.user, s.msEventId))
    )

    return res.status(200).json({ success: true, message: 'Event deleted.' })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

module.exports = controller
