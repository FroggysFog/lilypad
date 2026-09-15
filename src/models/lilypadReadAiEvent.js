/**
 * LilyPad ERP - Read.ai Webhook Capture
 * Raw landing zone for Read.ai meeting webhooks. Deliberately loose
 * (Mixed payload) rather than a strict schema, since the exact shape of
 * their action_items/summary fields hasn't been confirmed against a
 * real payload yet - see readAiService.js. Once that's settled this
 * becomes the audit trail behind whatever structured meeting-note
 * records get derived from it, not the primary data source.
 */

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const COLLECTION = 'lilypad_readai_events'

const readAiEventSchema = new Schema(
  {
    trigger: {
      type: String,
      trim: true,
      default: ''
    },
    signatureVerified: {
      type: Boolean,
      default: false
    },
    rawPayload: {
      type: Schema.Types.Mixed,
      default: {}
    },
    headers: {
      type: Schema.Types.Mixed,
      default: {}
    },
    processed: {
      type: Boolean,
      default: false
    },
    processingError: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model(COLLECTION, readAiEventSchema)
