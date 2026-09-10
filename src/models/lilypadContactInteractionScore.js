/**
 * LilyPad ERP - Contact Interaction Score
 * One doc per (owner, counterpart email address) - the rolling 60-day
 * inbound/outbound velocity that build stage 3 (priority routing / cold
 * inbound quarantine) reads from. Not populated yet as of stage 1 - this
 * model exists now so the sync engine has a stable target schema, but
 * nothing writes to it until the scoring engine (stage 3) ships.
 */

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const COLLECTION = 'lilypad_contact_interaction_scores'

const interactionScoreSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'lilypad_accounts', required: true },
    address: { type: String, required: true, lowercase: true, trim: true },
    displayName: { type: String, default: '' },
    isInternalDomain: { type: Boolean, default: false },
    windowStart: { type: Date, default: null },
    receivedCount: { type: Number, default: 0 },
    repliedCount: { type: Number, default: 0 },
    lastInboundAt: { type: Date, default: null },
    lastOutboundAt: { type: Date, default: null },
    // Cross-reference into the ERP itself - a sender who's also a real
    // customer/vendor contact is never graymail, regardless of velocity.
    matchedErpContact: {
      kind: { type: String, enum: ['customer', 'salesforce_account', 'vendor', null], default: null },
      refId: { type: Schema.Types.ObjectId, default: null }
    },
    velocityScore: { type: Number, default: 0 }
  },
  { timestamps: true }
)

interactionScoreSchema.index({ owner: 1, address: 1 }, { unique: true })

module.exports = mongoose.model(COLLECTION, interactionScoreSchema)
