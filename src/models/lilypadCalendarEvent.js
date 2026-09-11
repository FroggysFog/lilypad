/**
 * LilyPad ERP - Calendar Event Schema
 * Events/tasks created directly in the ERP. Stored locally as the
 * source of truth (so the calendar still shows something for attendees
 * who haven't connected Microsoft), and best-effort pushed to each
 * attendee's own Microsoft calendar via their stored token (see
 * lilypadMicrosoftAccount.js) - msSync tracks that push per attendee
 * independently, since one person's push can fail (token expired,
 * revoked consent) without blocking the others or the local save.
 */

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const COLLECTION = 'lilypad_calendar_events'

const calendarEventSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 255 },
    description: { type: String, trim: true, default: '' },
    location: { type: String, trim: true, default: '' },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    allDay: { type: Boolean, default: false },
    itemType: { type: String, enum: ['event', 'task'], default: 'event' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'lilypad_accounts', required: true, index: true },
    attendees: [{ type: Schema.Types.ObjectId, ref: 'lilypad_accounts' }],
    linkedTask: { type: Schema.Types.ObjectId, ref: 'lilypad_tasks', default: null },
    linkedTicket: { type: Schema.Types.ObjectId, ref: 'lilypad_tickets', default: null },
    // Requests a Teams meeting be generated on save - only ever
    // requested once (see syncEventToMicrosoft), so onlineMeetingUrl
    // below stays stable across later edits instead of a new meeting
    // being created on every save.
    addTeamsMeeting: { type: Boolean, default: false },
    onlineMeetingUrl: { type: String, default: '' },
    // One entry per attendee (+ creator) this event was pushed to in
    // Microsoft - msEventId is that person's own Graph event id, needed
    // to later PATCH/DELETE the right event in their calendar specifically.
    msSync: [{
      user: { type: Schema.Types.ObjectId, ref: 'lilypad_accounts' },
      msEventId: { type: String, default: '' },
      synced: { type: Boolean, default: false },
      error: { type: String, default: '' },
      syncedAt: { type: Date, default: null }
    }],
    deleted: { type: Boolean, default: false, index: true }
  },
  { timestamps: true }
)

module.exports = mongoose.model(COLLECTION, calendarEventSchema)
