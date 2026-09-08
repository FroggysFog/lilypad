/**
 * LilyPad ERP - Resolved Customer Profile
 * One document per real-world business, built by entityResolutionService.js
 * from data scattered across LilyPadSalesforceAccount (the anchor - the
 * only collection with a clean ID join to Orders/Opportunities),
 * LilyPadCustomer (Leads, fuzzy-matched), LilyPadOrder, LilyPadOpportunity,
 * LilyPadCartOrder, and LilyPadTicket (fuzzy-matched, best-effort).
 *
 * This is a derived/materialized collection, fully rebuilt by a batch job
 * (same pattern as pastDueSyncService.js deriving past-due from orders) -
 * not maintained incrementally. Treat every field here as a snapshot as
 * of `lastResolvedAt`, not a live value.
 */

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const COLLECTION = 'lilypad_customer_profiles'

const ENGAGEMENT_STATUSES = ['never_purchased', 'active', 'dormant', 'churned', 'lead_only']
const MATCH_CONFIDENCE = ['id', 'domain', 'fuzzy_name', 'none']

const productMixEntrySchema = new Schema({
  category: { type: String, trim: true, default: 'other' },
  itemCount: { type: Number, default: 0 },
  revenue: { type: Number, default: 0 }
}, { _id: false })

const customerProfileSchema = new Schema(
  {
    salesforceAccountId: {
      type: Schema.Types.ObjectId,
      ref: 'lilypad_salesforce_accounts',
      required: true,
      unique: true,
      index: true
    },
    accountSourceRecordId: {
      type: String,
      required: true,
      index: true
    },
    name: { type: String, trim: true, default: '' },
    domain: { type: String, trim: true, lowercase: true, default: '', index: true },
    industry: { type: String, trim: true, default: '' },

    // Fuzzy-matched Leads - see fuzzyMatchService.js. matchConfidence
    // reflects the weakest link used across ALL matched sub-collections
    // on this profile, so a rep can see at a glance whether the rollup
    // below is trustworthy or a best-effort guess.
    matchedLeadIds: [{ type: Schema.Types.ObjectId, ref: 'lilypad_customers' }],
    matchConfidence: { type: String, enum: MATCH_CONFIDENCE, default: 'none' },

    orderStats: {
      totalOrders: { type: Number, default: 0 },
      lifetimeRevenue: { type: Number, default: 0 },
      firstOrderDate: { type: Date, default: null },
      lastOrderDate: { type: Date, default: null },
      openBalanceDue: { type: Number, default: 0 }
    },

    opportunityStats: {
      openCount: { type: Number, default: 0 },
      closedWonCount: { type: Number, default: 0 },
      closedLostCount: { type: Number, default: 0 },
      totalWonAmount: { type: Number, default: 0 },
      lastCloseDate: { type: Date, default: null }
    },

    cartOrderStats: {
      totalOrders: { type: Number, default: 0 },
      lifetimeRevenue: { type: Number, default: 0 },
      lastOrderDate: { type: Date, default: null }
    },

    ticketStats: {
      totalTickets: { type: Number, default: 0 },
      lastTicketDate: { type: Date, default: null },
      matchConfidence: { type: String, enum: MATCH_CONFIDENCE, default: 'none' }
    },

    productMix: [productMixEntrySchema],

    // Computed rollups combining the sections above - what the
    // recommendation layer and UI actually query against, so they don't
    // each need to re-derive "days since last order" from raw dates.
    daysSinceLastOrder: { type: Number, default: null },
    daysSinceLastContact: { type: Number, default: null },
    engagementStatus: { type: String, enum: ENGAGEMENT_STATUSES, default: 'lead_only', index: true },

    // Multi-location/chain detection (siblingDetectionService.js) - profiles
    // sharing this key are suspected locations of the same operator.
    siblingGroupKey: { type: String, trim: true, default: '', index: true },
    siblingProfileIds: [{ type: Schema.Types.ObjectId, ref: 'lilypad_customer_profiles' }],

    recommendation: {
      score: { type: Number, default: null },
      reason: { type: String, default: '' },
      model: { type: String, trim: true, default: '' },
      generatedAt: { type: Date, default: null }
    },

    lastResolvedAt: { type: Date, default: null }
  },
  { timestamps: true }
)

customerProfileSchema.index({ engagementStatus: 1, daysSinceLastOrder: -1 })
customerProfileSchema.index({ 'recommendation.score': -1 })

customerProfileSchema.statics.ENGAGEMENT_STATUSES = ENGAGEMENT_STATUSES
customerProfileSchema.statics.MATCH_CONFIDENCE = MATCH_CONFIDENCE

module.exports = mongoose.model(COLLECTION, customerProfileSchema)
