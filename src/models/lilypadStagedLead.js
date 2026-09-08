/**
 * LilyPad ERP - Staged Lead Schema
 * Raw prospecting output from Apollo.io (and optionally ProPublica for
 * Non-Profit runs), held here for sales review before a rep bulk-approves
 * and "promotes" records into LilyPadCustomer / LilyPadSalesforceAccount.
 */

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const COLLECTION = 'lilypad_staged_leads'

const EMAIL_STATUSES = ['verified', 'extrapolated', 'unverified', 'catch_all', 'invalid']
const PHONE_TYPES = ['direct', 'hq', 'mobile', '']
const SECTORS = ['commercial', 'non_profit', 'government']
const SOURCE_PROVIDERS = ['apollo', 'propublica', 'manual']
const STATUSES = ['staged', 'approved', 'rejected', 'imported']

const stagedLeadSchema = new Schema(
  {
    batchId: {
      type: Schema.Types.ObjectId,
      ref: 'lilypad_lead_batches',
      required: true,
      index: true
    },
    externalId: {
      type: String,
      trim: true,
      default: ''
    },
    firstName: {
      type: String,
      trim: true,
      default: ''
    },
    lastName: {
      type: String,
      trim: true,
      default: ''
    },
    jobTitle: {
      type: String,
      trim: true,
      default: ''
    },
    companyName: {
      type: String,
      trim: true,
      default: ''
    },
    companyDomain: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
      index: true
    },
    companyIndustry: {
      type: String,
      trim: true,
      default: ''
    },
    companyDescription: {
      type: String,
      default: ''
    },
    personBio: {
      type: String,
      default: ''
    },
    linkedinUrl: {
      type: String,
      trim: true,
      default: ''
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
      index: true
    },
    emailStatus: {
      type: String,
      enum: EMAIL_STATUSES,
      default: 'unverified'
    },
    emailVerification: {
      provider: { type: String, trim: true, default: '' },
      result: { type: String, trim: true, default: '' },
      checkedAt: { type: Date, default: null }
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: ''
    },
    phoneType: {
      type: String,
      enum: PHONE_TYPES,
      default: ''
    },
    city: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' },
    country: { type: String, trim: true, default: '' },
    postalCode: { type: String, trim: true, default: '' },
    sector: {
      type: String,
      enum: SECTORS,
      required: true
    },
    nonProfitEin: {
      type: String,
      trim: true,
      default: ''
    },
    nonProfitVerified: {
      type: Boolean,
      default: false
    },
    sourceProvider: {
      type: String,
      enum: SOURCE_PROVIDERS,
      default: 'apollo'
    },
    rawPayload: {
      type: Schema.Types.Mixed,
      default: null
    },
    isDuplicate: {
      type: Boolean,
      default: false,
      index: true
    },
    duplicateMatchType: {
      type: String,
      enum: ['contact_email', 'account_domain', 'staged_lead', ''],
      default: ''
    },
    duplicateMatchedId: {
      type: Schema.Types.ObjectId,
      default: null
    },
    status: {
      type: String,
      enum: STATUSES,
      default: 'staged',
      index: true
    },
    promotedContactId: {
      type: Schema.Types.ObjectId,
      default: null
    },
    promotedAccountId: {
      type: Schema.Types.ObjectId,
      default: null
    }
  },
  { timestamps: true }
)

stagedLeadSchema.index({ batchId: 1, status: 1 })
stagedLeadSchema.index({ batchId: 1, isDuplicate: 1 })
// One row per external person per batch - lets bulkWrite upserts from
// paginated Apollo results be safely re-run/resumed without duplicating rows.
stagedLeadSchema.index({ batchId: 1, externalId: 1 }, { unique: true, partialFilterExpression: { externalId: { $gt: '' } } })

stagedLeadSchema.statics.EMAIL_STATUSES = EMAIL_STATUSES
stagedLeadSchema.statics.SECTORS = SECTORS
stagedLeadSchema.statics.STATUSES = STATUSES

module.exports = mongoose.model(COLLECTION, stagedLeadSchema)
