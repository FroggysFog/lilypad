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
    // True when originalDueDate/finalDueDate were inferred (orderedAt +
    // assumed payment terms) rather than a due date Cart.com actually
    // stated - see cartOrderSyncService.js's computeDueDate. Salesforce-
    // sourced records never set this; it's always false for those.
    dueDateIsEstimated: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      trim: true,
      default: ''
    },
    // Which sync pulled this record in - lets Salesforce's and Cart.com's
    // sync/cleanup jobs each manage only their own records in this shared
    // collection instead of stepping on each other's deleteMany calls.
    source: {
      type: String,
      enum: ['salesforce', 'cart'],
      default: 'salesforce',
      index: true
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
    // Manual override for a payment settled somewhere the upstream
    // Salesforce/Cart.com sync doesn't see yet (check received, disputed
    // and on hold, etc). Deliberately not part of either sync service's
    // $set update, so an hourly resync can never clobber it - it only
    // goes away when staff clears it, or when the record itself is
    // deleted because the upstream sync no longer considers it past due.
    manuallyResolved: {
      type: Boolean,
      default: false
    },
    manuallyResolvedAt: {
      type: Date,
      default: null
    },
    manuallyResolvedBy: {
      type: String,
      trim: true,
      default: ''
    },
    manuallyResolvedNote: {
      type: String,
      trim: true,
      default: ''
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model(COLLECTION, pastDueAccountSchema)
