/**
 * LilyPad ERP - Suggested Task
 * The staging collection both the "since last login" harvester (stage 4)
 * and the sender-card [Add Task] action (stage 5) write into - one
 * shared collection, not two, since both flows end at the same
 * "approve -> becomes a real lilypad_task" step. Not populated yet as
 * of stage 1; exists now so later stages have a stable target schema.
 */

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const COLLECTION = 'lilypad_suggested_tasks'

const suggestedTaskSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'lilypad_accounts', required: true, index: true },
    sourceEmail: { type: Schema.Types.ObjectId, ref: 'lilypad_email_cache', required: true },
    title: { type: String, required: true, trim: true },
    context: { type: String, default: '' },
    suggestedDueDate: { type: Date, default: null },
    urgency: { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' },
    confidence: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'approved', 'dismissed'], default: 'pending', index: true },
    // Set once approved - lets the triage queue show "already turned
    // into TSK-482" instead of the row just vanishing.
    createdTaskId: { type: Schema.Types.ObjectId, ref: 'lilypad_tasks', default: null }
  },
  { timestamps: true }
)

module.exports = mongoose.model(COLLECTION, suggestedTaskSchema)
