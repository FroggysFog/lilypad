/**
 * LilyPad ERP - Contact Interaction Score
 * One doc per (owner, counterpart email address) - the rolling 60-day
 * inbound/outbound velocity that stage 3 (priority routing / cold
 * inbound quarantine) reads from. Recomputed by
 * emailInteractionScoringService.js from the local email cache.
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
    // customer/lead/ticket submitter is never graymail, regardless of
    // velocity.
    matchedErpContact: {
      kind: { type: String, enum: ['customer', 'salesforce_account', 'vendor', 'lead', 'ticket_submitter', null], default: null },
      refId: { type: Schema.Types.ObjectId, default: null }
    },
    velocityScore: { type: Number, default: 0 }
  },
  { timestamps: true }
)

interactionScoreSchema.index({ owner: 1, address: 1 }, { unique: true })

module.exports = mongoose.model(COLLECTION, interactionScoreSchema)
