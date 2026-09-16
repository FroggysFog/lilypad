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
    enum: ['usfa_registry', 'manual_import', 'gmaps_csv', 'inbound'],
    default: 'manual_import'
  },
  metadata: {
    stationCount: { type: Number, default: 1 },
    reviewCount: { type: Number, default: 0 },
    googleRating: { type: Number, default: 0 }
  },
  contact: {
    name: String,
    title: String,
    email: { type: String, trim: true, lowercase: true },
    // The person's own direct number - distinct from the department's
    // HQ `phone` field above.
    phone: { type: String, trim: true, default: '' },
    // Set by deptContactResearchService.js - which role tier actually
    // matched (training_chief is preferred; fire_chief/captain are
    // fallbacks only used when no training chief was found) and how
    // confident that match is, so a human can judge before trusting it.
    roleMatched: { type: String, enum: ['training_chief', 'fire_chief', 'captain', 'none'], default: 'none' },
    sourceUrl: { type: String, trim: true, default: '' },
    confidence: { type: String, enum: ['', 'high', 'medium', 'low'], default: '' },
    researchedAt: { type: Date, default: null }
  },
  aiScore: {
    intentScore: { type: Number, default: 0, min: 0, max: 100, index: true },
    recommendedSku: String,
    pitchHook: String,
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

module.exports = mongoose.model(COLLECTION, salesLeadSchema)
