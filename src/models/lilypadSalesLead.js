/**
 * LilyPad ERP - Sales OS Lead
 * Distinct from LilyPadStagedLead (the existing Apollo/crawl-based
 * prospector's staging table) and LilyPadCustomer (Salesforce-synced
 * trade-show leads) - this is the new division-aware, AI-scored
 * pipeline for Sales OS sources (USFA registry, Google Maps CSV
 * imports, manual/inbound) that the existing prospector doesn't cover.
 * `division` distinguishes Froggy's Fog leads from Training Smoke leads
 * within this one collection - Training Smoke has no other presence
 * anywhere in this app yet (see sales-brain/CLAUDE.md).
 */

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const COLLECTION = 'lilypad_sales_leads'

const salesLeadSchema = new Schema({
  division: {
    type: String,
    enum: ['froggys_fog', 'training_smoke'],
    required: true,
    index: true
  },
  companyName: { type: String, required: true, trim: true },
  domain: { type: String, trim: true, sparse: true, index: true },
  phone: { type: String, trim: true },
  address: {
    street: String,
    city: String,
    state: String,
    zip: String
  },
  source: {
    type: String,
    enum: ['usfa_registry', 'manual_import', 'gmaps_csv', 'inbound', 'apollo', 'apify_gmaps'],
    default: 'manual_import'
  },
  metadata: {
    stationCount: { type: Number, default: 1 },
    reviewCount: { type: Number, default: 0 },
    googleRating: { type: Number, default: 0 },
    googlePlaceId: { type: String, trim: true, default: '' },
    categories: [String],
    // Which curated sub-vertical (leadTargetingMatrix.js) this lead was
    // sourced under, e.g. 'haunts' or 'worship' - lets contact research
    // prioritize the right titles for THIS lead instead of just a
    // division-wide default.
    sector: { type: String, trim: true, default: '' },
    titleHierarchy: [String]
  },
  contact: {
    name: String,
    title: String,
    email: { type: String, trim: true, lowercase: true },
    // The person's own direct number - distinct from the department's
    // HQ `phone` field above.
    phone: { type: String, trim: true, default: '' },
    // Set by deptContactResearchService.js - which role tier actually
    // matched (a slugified version of the lead's own titleHierarchy
    // entry, e.g. "technical_director", or a division default like
    // "training_chief"/"owner" - the most-preferred role is tried
    // first, the rest are fallbacks only used when nothing earlier was
    // found) and how confident that match is, so a human can judge
    // before trusting it. Not an enum - role names are data-driven from
    // leadTargetingMatrix.js, not a fixed code list.
    roleMatched: { type: String, trim: true, default: 'none' },
    sourceUrl: { type: String, trim: true, default: '' },
    confidence: { type: String, enum: ['', 'high', 'medium', 'low'], default: '' },
    researchedAt: { type: Date, default: null }
  },
  aiScore: {
    intentScore: { type: Number, default: 0, min: 0, max: 100, index: true },
    recommendedSku: String,
    // A brief, factual description of the lead/their business - not a
    // drafted outreach email. Renamed from pitchHook, which asked the
    // model for 2 email-ready sentences; reps wanted a quick read on
    // what the business is, not copy to paste into a cold email.
    leadDescription: String,
    reasoning: String,
    scoredAt: Date
  },
  status: {
    type: String,
    enum: ['unprocessed', 'scored', 'contacted', 'quoted', 'converted', 'disqualified'],
    default: 'unprocessed',
    index: true
  },
  disqualificationReason: String,
  notes: [{
    body: String,
    createdAt: { type: Date, default: Date.now }
  }],
  // Sales Command Center's claim mechanism - internal to LilyPad only,
  // no Salesforce write-back (unlike claiming a LilyPadCustomerProfile's
  // matched Salesforce Account - see lilypadCustomerIntelligence.js).
  // These are prospecting leads, not existing Salesforce Accounts, so
  // there's nothing in Salesforce to update. id: null means unclaimed.
  assignedRep: {
    id: { type: Schema.Types.ObjectId, ref: 'lilypad_accounts', default: null },
    name: { type: String, default: null },
    claimedAt: { type: Date, default: null }
  },
  // Set by waterfallScraper.js - which tier actually produced this
  // lead/contact, so a rep can judge reliability at a glance (a free
  // registry hit vs. an AI-search-resolved contact carry different
  // trust levels).
  provenance: {
    sourceTier: { type: String, enum: ['tier1_registry', 'tier2_directory', 'tier3_ai_search', 'manual'], default: 'manual' },
    sourceDetails: { type: String, trim: true, default: '' },
    verificationConfidence: { type: Number, default: 0 }
  },
  jobId: { type: Schema.Types.ObjectId, ref: 'lilypad_sales_scrape_jobs', default: null }
}, { timestamps: true })

salesLeadSchema.index({ division: 1, status: 1, 'aiScore.intentScore': -1 })
salesLeadSchema.index({ 'assignedRep.id': 1 })

module.exports = mongoose.model(COLLECTION, salesLeadSchema)
