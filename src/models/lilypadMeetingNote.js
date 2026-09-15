/**
 * LilyPad ERP - Read.ai Meeting Note
 * One per Read.ai meeting_end webhook. Deliberately its own collection
 * rather than fields added onto a calendar event - most real meetings
 * are Microsoft-synced events, which are fetched live from Graph and
 * never persisted locally (see lilypadCalendar.js's getEvents), so
 * there's often no local calendar document to attach anything to.
 * msEventId carries the match for those; erpEventId for the ones
 * created directly in LilyPad. At most one of the two is ever set.
 */

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const COLLECTION = 'lilypad_meeting_notes'

const MATCH_CONFIDENCE = ['title_time', 'time_only', 'none']

const meetingNoteSchema = new Schema(
  {
    // Whose calendar this meeting belongs to - resolved from the
    // Read.ai payload's owner/participant emails against known LilyPad
    // accounts. Null if nobody on the call matches a LilyPad user (an
    // external-only meeting still gets its note captured, just unowned).
    owner: { type: Schema.Types.ObjectId, ref: 'lilypad_accounts', default: null, index: true },
    // Read.ai's own meeting id - not unique-indexed since a resend/retry
    // of the same webhook shouldn't hard-fail, but useful for dedup
    // checks before creating a duplicate note.
    sessionId: { type: String, trim: true, default: '', index: true },
    title: { type: String, trim: true, default: '' },
    startTime: { type: Date, default: null },
    endTime: { type: Date, default: null },
    platform: { type: String, trim: true, default: '' },
    reportUrl: { type: String, trim: true, default: '' },
    summary: { type: String, default: '' },
    actionItems: [{
      text: { type: String, required: true },
      // Set once turned into a LilyPadSuggestedTask, so re-processing
      // (a webhook retry) can tell it's already been done.
      suggestedTaskId: { type: Schema.Types.ObjectId, ref: 'lilypad_suggested_tasks', default: null }
    }],
    keyQuestions: [{ text: String }],
    topics: [{ text: String }],
    participantEmails: [{ type: String, trim: true, lowercase: true }],
    erpEventId: { type: Schema.Types.ObjectId, ref: 'lilypad_calendar_events', default: null },
    msEventId: { type: String, default: '', index: true },
    matchConfidence: { type: String, enum: MATCH_CONFIDENCE, default: 'none' },
    // Audit trail back to the raw webhook capture this was derived from.
    rawEventId: { type: Schema.Types.ObjectId, ref: 'lilypad_readai_events', default: null }
  },
  { timestamps: true }
)

meetingNoteSchema.statics.MATCH_CONFIDENCE = MATCH_CONFIDENCE

module.exports = mongoose.model(COLLECTION, meetingNoteSchema)
