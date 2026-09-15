/**
 * LilyPad ERP - Captured Receipt
 * One per receipt-like email detected by receiptExtractionService.js.
 * Unlike LilyPadSuggestedTask (pending -> approved/dismissed, since
 * approving graduates it into a *different* record), a receipt IS the
 * filed artifact the moment it's created - there's no separate
 * "approve" step, only `dismissed` to hide a false positive without
 * losing the underlying data/audit trail.
 */

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const COLLECTION = 'lilypad_receipts'

const receiptSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'lilypad_accounts', required: true, index: true },
    sourceEmail: { type: Schema.Types.ObjectId, ref: 'lilypad_email_cache', default: null },
    // Denormalized from the source email so the list view never needs a
    // populate just to render a row.
    subject: { type: String, default: '' },
    receivedAt: { type: Date, default: null },
    vendor: { type: String, trim: true, default: '' },
    amount: { type: Number, default: null },
    currency: { type: String, trim: true, default: 'USD' },
    receiptDate: { type: Date, default: null },
    summary: { type: String, default: '' },
    confidence: { type: Number, default: 0 },
    attachments: [{
      filename: String,
      originalName: String,
      path: String,
      contentType: String,
      size: Number
    }],
    status: { type: String, enum: ['captured', 'dismissed'], default: 'captured', index: true }
  },
  { timestamps: true }
)

module.exports = mongoose.model(COLLECTION, receiptSchema)
