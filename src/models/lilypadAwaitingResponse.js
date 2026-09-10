/**
 * LilyPad ERP - Awaiting Response ("Waiting On" monitor)
 * One doc per outbound ask - if an outbound email requested something
 * from someone else, this tracks whether they've replied and flags it
 * once followUpAfter passes without one. Not populated yet as of stage 1
 * (that's build stage 6); exists now so later stages have a stable
 * target schema.
 */

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const COLLECTION = 'lilypad_awaiting_responses'

const awaitingResponseSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'lilypad_accounts', required: true, index: true },
    sourceEmail: { type: Schema.Types.ObjectId, ref: 'lilypad_email_cache', required: true },
    toAddress: { type: String, required: true, lowercase: true, trim: true },
    toName: { type: String, default: '' },
    askSummary: { type: String, default: '' },
    deadline: { type: Date, default: null },
    followUpAfter: { type: Date, required: true },
    status: { type: String, enum: ['waiting', 'replied', 'overdue', 'dismissed'], default: 'waiting', index: true },
    repliedAt: { type: Date, default: null }
  },
  { timestamps: true }
)

module.exports = mongoose.model(COLLECTION, awaitingResponseSchema)
