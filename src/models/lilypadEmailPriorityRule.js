/**
 * LilyPad ERP - Manual Email Priority Rule
 * User-curated additions to the "Priority Conversations" deck (see
 * emailSenderRollupService.js) alongside the automatic scoring from
 * stage 3 - either a specific address to always treat as priority
 * regardless of reply history, or a keyword that pulls in whichever
 * senders have recently emailed about that topic (e.g. "billing").
 */

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const COLLECTION = 'lilypad_email_priority_rules'

const priorityRuleSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'lilypad_accounts', required: true, index: true },
    type: { type: String, enum: ['address', 'keyword'], required: true },
    value: { type: String, required: true, trim: true, lowercase: true }
  },
  { timestamps: true }
)

priorityRuleSchema.index({ owner: 1, type: 1, value: 1 }, { unique: true })

module.exports = mongoose.model(COLLECTION, priorityRuleSchema)
