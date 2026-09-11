/**
 * LilyPad ERP - Email Sync State
 * One doc per (owner, folder). The deltaLink IS the sync engine's
 * entire resumability state - losing it just means the next sync falls
 * back to a full resync instead of an incremental one, so this is
 * deliberately a thin, disposable doc rather than something with its
 * own backup/recovery story.
 */

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const COLLECTION = 'lilypad_email_sync_state'

const syncStateSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'lilypad_accounts', required: true },
    folder: { type: String, enum: ['inbox', 'sentitems', 'archive', 'deleteditems', 'junkemail'], required: true },
    deltaLink: { type: String, default: '' },
    lastSyncedAt: { type: Date, default: null },
    lastSyncError: { type: String, default: '' },
    // Graph webhook subscription tied to this folder - only meaningful
    // for 'inbox' today (sentitems is only ever pulled by the periodic
    // fallback sync, not pushed via webhook, since nothing downstream
    // needs sub-minute latency on your own sent mail).
    subscriptionId: { type: String, default: '' },
    subscriptionExpiresAt: { type: Date, default: null },
    // Verified against every inbound webhook call before trusting it -
    // see microsoftEmailSyncService.js's handleWebhookNotification.
    subscriptionClientState: { type: String, default: '' }
  },
  { timestamps: true }
)

syncStateSchema.index({ owner: 1, folder: 1 }, { unique: true })

module.exports = mongoose.model(COLLECTION, syncStateSchema)
