/**
 * LilyPad ERP - Goal-Mode Sourcing Job
 * Tracks one "type a prompt, get verified leads" background run -
 * waterfallScraper.js is the engine; this is just its progress/audit
 * trail so the UI can poll it.
 */

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const COLLECTION = 'lilypad_sales_scrape_jobs'

const scrapeJobSchema = new Schema({
  rawPrompt: { type: String, required: true },
  division: { type: String, enum: ['froggys_fog', 'training_smoke'], required: true },
  status: { type: String, enum: ['planning', 'running', 'verifying', 'completed', 'failed'], default: 'planning', index: true },
  criteria: {
    targetEntity: { type: String, default: '' },
    state: { type: String, default: '' },
    city: { type: String, default: '' },
    roleHierarchy: [String],
    requiredFields: [String],
    targetCount: { type: Number, default: 25 }
  },
  progress: {
    discovered: { type: Number, default: 0 },
    verified: { type: Number, default: 0 },
    failed: { type: Number, default: 0 }
  },
  provenanceSummary: {
    tier1_registry: { type: Number, default: 0 },
    tier2_directory: { type: Number, default: 0 },
    tier3_ai_search: { type: Number, default: 0 }
  },
  logs: [{
    timestamp: { type: Date, default: Date.now },
    message: String,
    level: { type: String, enum: ['info', 'warn', 'error'], default: 'info' }
  }]
}, { timestamps: true })

module.exports = mongoose.model(COLLECTION, scrapeJobSchema)
