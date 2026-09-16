/**
 * LilyPad ERP - Morning Report Digest
 * One per user per calendar day - the cache that makes "generated once
 * per day, on first login" real. Every section is populated from a real
 * query (see morningDigestService.js); only `greeting` is LLM-written,
 * and only ever as a summary of the facts already gathered here - never
 * a source of facts itself.
 */

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const COLLECTION = 'lilypad_morning_digests'

const morningDigestSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'lilypad_accounts', required: true, index: true },
    // 'YYYY-MM-DD' in the business timezone (see MORNING_DIGEST_TIMEZONE)
    // this digest is for - the (owner, digestDate) pair is the cache key.
    digestDate: { type: String, required: true },
    greeting: { type: String, default: '' },
    sections: {
      calendar: [{
        title: String,
        start: Date,
        end: Date,
        location: String,
        onlineMeetingUrl: String,
        source: { type: String, enum: ['erp', 'microsoft'] }
      }],
      tasksDueToday: [{
        taskId: { type: Schema.Types.ObjectId, ref: 'lilypad_tasks' },
        formattedUid: String,
        title: String,
        priority: String,
        dueDate: Date,
        overdue: Boolean
      }],
      priorityConversations: [{
        address: String,
        name: String,
        summary: String,
        blockerCount: Number
      }],
      suggestedTasks: [{
        id: { type: Schema.Types.ObjectId, ref: 'lilypad_suggested_tasks' },
        title: String,
        source: { type: String, enum: ['email', 'meeting'] }
      }],
      meetingNotes: [{
        id: { type: Schema.Types.ObjectId, ref: 'lilypad_meeting_notes' },
        title: String,
        summary: String,
        actionItemCount: Number,
        startTime: Date
      }],
      chatActivity: [{
        chatId: String,
        chatName: String,
        lastMessagePreview: String,
        lastMessageAt: Date
      }],
      pipelineAlerts: {
        closingSoon: [{
          id: { type: Schema.Types.ObjectId, ref: 'lilypad_opportunities' },
          name: String,
          amount: Number,
          closeDate: String
        }],
        stalled: [{
          id: { type: Schema.Types.ObjectId, ref: 'lilypad_opportunities' },
          name: String,
          amount: Number,
          lastActivityDate: Date
        }]
      }
    },
    generatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
)

morningDigestSchema.index({ owner: 1, digestDate: 1 }, { unique: true })

module.exports = mongoose.model(COLLECTION, morningDigestSchema)
