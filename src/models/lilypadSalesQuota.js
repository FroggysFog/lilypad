/**
 * LilyPad ERP - Sales Quota Schema
 * Admin-set monthly quota targets per sales rep. Attainment against a
 * quota is always computed live from LilyPadOpportunity (see
 * lilypadSalesQuota.js controller's getMyAttainment) rather than stored
 * here, so this only ever holds the target itself.
 */

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const COLLECTION = 'lilypad_sales_quotas'

const salesQuotaSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'lilypad_accounts',
      required: true,
      index: true
    },
    // 'YYYY-MM'
    period: {
      type: String,
      required: true,
      trim: true
    },
    quotaAmount: {
      type: Number,
      required: true,
      default: 0
    },
    setByName: {
      type: String,
      trim: true,
      default: ''
    }
  },
  { timestamps: true }
)

salesQuotaSchema.index({ user: 1, period: 1 }, { unique: true })

module.exports = mongoose.model(COLLECTION, salesQuotaSchema)
