/**
 * LilyPad ERP - Saved Report Card
 * A user's saved "Ask a Report" question, re-run live on every dashboard
 * load rather than cached - the LLM only ever resolved `params` once, at
 * creation time (see reportQueryService.js); the actual numbers always
 * come from a fresh query against `params`, never a stored result.
 */

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const COLLECTION = 'lilypad_report_cards'

const reportCardSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'lilypad_accounts', required: true, index: true },
    question: { type: String, trim: true, default: '' },
    title: { type: String, trim: true, required: true },
    reportType: { type: String, enum: ['revenue_summary'], default: 'revenue_summary' },
    params: {
      repName: { type: String, trim: true, default: '' },
      startDate: { type: String, default: '' },
      endDate: { type: String, default: '' },
      groupBy: { type: String, enum: ['category', 'none'], default: 'category' }
    },
    // 'role' requires sharedRole to be set; enforced in the controller,
    // not here, since validating it's a real in-use role needs a DB read.
    visibility: { type: String, enum: ['private', 'role', 'everyone'], default: 'private', index: true },
    sharedRole: { type: String, default: '' }
  },
  { timestamps: true }
)

module.exports = mongoose.model(COLLECTION, reportCardSchema)
