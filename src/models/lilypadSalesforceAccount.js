/**
 * LilyPad ERP - Salesforce Account Schema
 * Synced from Salesforce Account (company) records. Named distinctly from
 * LilyPadAccount (that's the staff login model, unrelated to Salesforce).
 */

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const COLLECTION = 'lilypad_salesforce_accounts'

const addressSchema = new Schema({
  street: { type: String, trim: true, default: '' },
  city: { type: String, trim: true, default: '' },
  state: { type: String, trim: true, default: '' },
  postalCode: { type: String, trim: true, default: '' },
  country: { type: String, trim: true, default: '' }
}, { _id: false })

const salesforceAccountSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      default: ''
    },
    type: {
      type: String,
      trim: true,
      default: ''
    },
    industry: {
      type: String,
      trim: true,
      default: ''
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    website: {
      type: String,
      trim: true,
      default: ''
    },
    ownerName: {
      type: String,
      trim: true,
      default: ''
    },
    annualRevenue: {
      type: Number,
      default: 0
    },
    numberOfEmployees: {
      type: Number,
      default: 0
    },
    billingAddress: addressSchema,
    shippingAddress: addressSchema,
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

module.exports = mongoose.model(COLLECTION, salesforceAccountSchema)
