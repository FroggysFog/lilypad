/**
 * LilyPad ERP - ERP Entity Link
 * Cache of "this email mentions PO #48192" so a context badge renders
 * instantly instead of re-scanning email text and re-querying the
 * matched ERP record on every paint. Not populated yet as of stage 1
 * (that's build stage 6); exists now so later stages have a stable
 * target schema.
 */

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const COLLECTION = 'lilypad_erp_entity_links'

const erpEntityLinkSchema = new Schema(
  {
    sourceEmail: { type: Schema.Types.ObjectId, ref: 'lilypad_email_cache', required: true, index: true },
    entityType: { type: String, enum: ['order', 'salesforce_account', 'ticket', 'customer'], required: true },
    entityId: { type: Schema.Types.ObjectId, required: true },
    matchedText: { type: String, default: '' },
    // Denormalized display fields so the badge ("PO #48192 | Staged |
    // $4,200") never needs a join to render - refreshed lazily on
    // click-through rather than kept continuously live.
    snapshotLabel: { type: String, default: '' },
    snapshotStatus: { type: String, default: '' },
    snapshotValue: { type: Number, default: null }
  },
  { timestamps: true }
)

module.exports = mongoose.model(COLLECTION, erpEntityLinkSchema)
