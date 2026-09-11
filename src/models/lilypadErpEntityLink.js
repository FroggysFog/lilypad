/**
 * LilyPad ERP - ERP Entity Link
 * Cache of "this email mentions PO #48192" so a context badge renders
 * instantly instead of re-scanning email text and re-querying the
 * matched ERP record on every paint. Populated by
 * emailErpEntityLinkService.js (stage 6) via pattern matching against
 * order numbers/tracking numbers/ticket+task UIDs in the text, plus
 * customer matches reused directly from stage 3's sender scoring.
 */

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const COLLECTION = 'lilypad_erp_entity_links'

const erpEntityLinkSchema = new Schema(
  {
    sourceEmail: { type: Schema.Types.ObjectId, ref: 'lilypad_email_cache', required: true, index: true },
    entityType: { type: String, enum: ['order', 'salesforce_account', 'ticket', 'task', 'customer'], required: true },
    entityId: { type: Schema.Types.ObjectId, required: true },
    matchedText: { type: String, default: '' },
    // Denormalized display fields so the badge ("PO #48192 | Staged |
    // $4,200") never needs a join to render - refreshed lazily on
    // click-through rather than kept continuously live.
    snapshotLabel: { type: String, default: '' },
    snapshotStatus: { type: String, default: '' },
    snapshotValue: { type: Number, default: null },
    // User-dismissed badges stay dismissed rather than reappearing next
    // time the email's reopened - runEntityLinkingForOwner only ever
    // creates links that don't already exist for a message (see its
    // upsert logic), so it never resurrects one a user already rejected.
    dismissed: { type: Boolean, default: false }
  },
  { timestamps: true }
)

module.exports = mongoose.model(COLLECTION, erpEntityLinkSchema)
