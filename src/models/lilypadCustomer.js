/**
 * LilyPad ERP - Customer (Lead) Schema
 * Synced from Salesforce Lead records - matches the columns of the
 * user's real Salesforce Lead list view (trade-show-sourced leads).
 */

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const COLLECTION = 'lilypad_customers'

const customerSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    company: {
      type: String,
      trim: true,
      default: ''
    },
    industry: {
      type: String,
      trim: true,
      default: ''
    },
    state: {
      type: String,
      trim: true,
      default: ''
    },
    leadStatus: {
      type: String,
      trim: true,
      default: ''
    },
    ownerAlias: {
      type: String,
      trim: true,
      default: ''
    },
    lastActivityDate: {
      type: String,
      default: null
    },
    createdDate: {
      type: Date,
      default: null
    },
    importNotes: {
      type: String,
      trim: true,
      default: ''
    },
    tradeShow: {
      type: String,
      trim: true,
      default: ''
    },
    createdByName: {
      type: String,
      trim: true,
      default: ''
    },
    leadSource: {
      type: String,
      trim: true,
      default: ''
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
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

module.exports = mongoose.model(COLLECTION, customerSchema)
