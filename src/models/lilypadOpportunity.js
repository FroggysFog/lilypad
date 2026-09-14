/**
 * LilyPad ERP - Opportunity Schema
 * Synced from Salesforce Opportunity records.
 */

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const COLLECTION = 'lilypad_opportunities'

const opportunitySchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      default: ''
    },
    accountId: {
      type: String,
      trim: true,
      default: ''
    },
    accountName: {
      type: String,
      trim: true,
      default: ''
    },
    stageName: {
      type: String,
      trim: true,
      default: ''
    },
    amount: {
      type: Number,
      default: 0
    },
    closeDate: {
      type: String,
      default: null
    },
    probability: {
      type: Number,
      default: 0
    },
    ownerName: {
      type: String,
      trim: true,
      default: ''
    },
    // Salesforce's Owner.Id - lets rep-scoping match precisely even if
    // a rep's LilyPad fullname and Salesforce owner display name diverge
    // (see repMatchingService.js).
    ownerSourceId: {
      type: String,
      trim: true,
      default: ''
    },
    type: {
      type: String,
      trim: true,
      default: ''
    },
    leadSource: {
      type: String,
      trim: true,
      default: ''
    },
    isClosed: {
      type: Boolean,
      default: false
    },
    isWon: {
      type: Boolean,
      default: false
    },
    description: {
      type: String,
      default: ''
    },
    sourceRecordId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    lastSyncAt: {
      type: Date,
      default: Date.now
    },
    // Rep-logged calls/visits/notes - not synced from Salesforce, purely
    // a LilyPad-side addition (see lilypadOpportunities.js's addActivity).
    activities: [{
      type: { type: String, enum: ['call', 'visit', 'email', 'follow_up', 'note'], required: true },
      author: { type: Schema.Types.ObjectId, ref: 'lilypad_accounts', default: null },
      authorName: { type: String, default: '' },
      body: { type: String, required: true },
      occurredAt: { type: Date, default: Date.now },
      followUpDate: { type: Date, default: null }
    }],
    // Audit trail for both activity logging and Salesforce push-backs
    // (see opportunitySyncService.js's pushOpportunityUpdate) - same
    // shape as lilypadTicket.js's history array.
    history: [{
      action: { type: String, required: true },
      by: { type: Schema.Types.ObjectId, ref: 'lilypad_accounts', default: null },
      byName: { type: String, default: 'System' },
      description: { type: String, default: '' },
      timestamp: { type: Date, default: Date.now }
    }]
  },
  { timestamps: true }
)

module.exports = mongoose.model(COLLECTION, opportunitySchema)
