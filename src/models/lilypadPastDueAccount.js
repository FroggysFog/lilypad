/**
 * LilyPad ERP - Past Due Account Schema
 * Accounts-receivable records synced from Salesforce, used to drive the
 * collections reminder-email pipeline.
 */

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const COLLECTION = 'lilypad_past_due_accounts'

const pastDueAccountSchema = new Schema(
  {
    accountName: {
      type: String,
      required: true,
      trim: true
    },
    amountDue: {
      type: Number,
      default: 0
    },
    originalDueDate: {
      type: String,
      default: null
    },
    finalDueDate: {
      type: String,
      default: null
    },
    salesRep: {
      type: String,
      trim: true,
      default: ''
    },
    payerName: {
      type: String,
      trim: true,
      default: ''
    },
    payerEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: ''
    },
    payerPhone: {
      type: String,
      trim: true,
      default: ''
    },
    payerNotes: {
      type: String,
      trim: true,
      default: ''
    },
    paymentMethod: {
      type: String,
      trim: true,
      default: ''
    },
    orderNumber: {
      type: String,
      trim: true,
      default: ''
    },
    poNumber: {
      type: String,
      trim: true,
      default: ''
    },
    poDate: {
      type: String,
      default: null
    },
    status: {
      type: String,
      trim: true,
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

module.exports = mongoose.model(COLLECTION, pastDueAccountSchema)
