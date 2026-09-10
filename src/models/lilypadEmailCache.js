/**
 * LilyPad ERP - Local Email Cache
 * A local mirror of each connected user's Microsoft mailbox, filled by
 * the Graph delta sync engine (see microsoftEmailSyncService.js) - the
 * UI reads from here, never from Graph directly, so render never has to
 * wait on a live Graph round-trip. One doc per Graph message per owner
 * (Graph message IDs aren't guaranteed unique across mailboxes, so the
 * uniqueness constraint below is on the pair, not graphMessageId alone).
 */

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const COLLECTION = 'lilypad_email_cache'

const recipientSchema = new Schema({
  name: { type: String, default: '' },
  address: { type: String, default: '', lowercase: true, trim: true }
}, { _id: false })

const emailCacheSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'lilypad_accounts', required: true, index: true },
    graphMessageId: { type: String, required: true },
    graphConversationId: { type: String, default: '', index: true },
    folder: { type: String, enum: ['inbox', 'sentitems', 'drafts', 'archive', 'deleteditems'], required: true, index: true },
    subject: { type: String, default: '' },
    bodyHtml: { type: String, default: '' },
    bodyPreview: { type: String, default: '' },
    from: { type: recipientSchema, default: () => ({}) },
    toRecipients: [recipientSchema],
    ccRecipients: [recipientSchema],
    receivedDateTime: { type: Date, index: true },
    isRead: { type: Boolean, default: false, index: true },
    hasAttachments: { type: Boolean, default: false },
    attachments: [{
      graphAttachmentId: String,
      name: String,
      contentType: String,
      size: Number
    }],
    importance: { type: String, default: 'normal' },
    // isColdInbound/priorityScore are written by the stage 3 scoring
    // engine; processed/isActionable/urgency/summary by the stage 4 LLM
    // extraction pipeline - kept on the email doc itself rather than a
    // separate collection, since the inbox view and the triage queue
    // both render from this collection and can't afford a second
    // round-trip per row.
    triage: {
      processed: { type: Boolean, default: false },
      isColdInbound: { type: Boolean, default: false },
      priorityScore: { type: Number, default: 0 },
      isActionable: { type: Boolean, default: false },
      urgency: { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' },
      summary: { type: String, default: '' },
      extractedAt: { type: Date, default: null }
    },
    // Stage 6 processing flags - separate from `triage` since they're
    // unrelated passes (ERP entity linking runs on inbox+sent+archive;
    // the "waiting on" outbound-ask scan only on sent) that shouldn't be
    // coupled to the stage 3/4 triage fields.
    entityLinksProcessed: { type: Boolean, default: false, index: true },
    waitingOnProcessed: { type: Boolean, default: false, index: true },
    // Soft-deleted when Graph delta reports a removal, not hard-deleted -
    // keeps a "Recently Deleted" view possible later without re-syncing.
    deleted: { type: Boolean, default: false, index: true }
  },
  { timestamps: true }
)

emailCacheSchema.index({ owner: 1, graphMessageId: 1 }, { unique: true })
emailCacheSchema.index({ owner: 1, folder: 1, receivedDateTime: -1 })

module.exports = mongoose.model(COLLECTION, emailCacheSchema)
