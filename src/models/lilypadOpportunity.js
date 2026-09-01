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
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model(COLLECTION, opportunitySchema)
