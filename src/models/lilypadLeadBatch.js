/**
 * LilyPad ERP - Lead Prospector Batch Schema
 * One document per "deep prospecting run" a sales rep kicks off from
 * prospects.html. The worker (leadProspectorWorker.js) pages through
 * Apollo.io against the criteria stored here, writing progress back to
 * this same document so the UI can poll it for a live progress bar.
 */

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const COLLECTION = 'lilypad_lead_batches'

const SECTORS = ['commercial', 'non_profit', 'government', 'all']
const STATUSES = ['queued', 'processing', 'completed', 'failed', 'paused']
// 'refresh' re-crawls accounts already in the CRM to update stale contact
// info, instead of discovering new businesses - see existingAccountsAdapter.js.
const SOURCE_MODES = ['apollo', 'in_house', 'refresh']
// Niche verticals served by the in-house directory-crawl pipeline instead
// of Apollo's title-based search - each maps to a discoveryAdapter config
// (see src/services/prospecting/discovery/directoryAdapter.js).
const VERTICALS = [
  'fire_department', 'fire_training', 'haunted_attraction', 'theme_park',
  'theater_professional', 'theater_community', 'av_lighting_design',
  'entertainment_venue', 'family_entertainment_center', 'roller_rink',
  'bar_nightclub', 'museum', 'childrens_museum'
]

const leadBatchSchema = new Schema(
  {
    createdByUserId: {
      type: Schema.Types.ObjectId,
      ref: 'lilypad_accounts',
      required: true
    },
    createdByName: {
      type: String,
      trim: true,
      default: ''
    },
    sector: {
      type: String,
      enum: SECTORS,
      required: true,
      default: 'all'
    },
    sourceMode: {
      type: String,
      enum: SOURCE_MODES,
      default: 'apollo'
    },
    // Required when sourceMode is 'in_house' - selects which directory
    // adapter config to enumerate candidate businesses from.
    targetVertical: {
      type: String,
      enum: [...VERTICALS, ''],
      default: ''
    },
    targetIndustry: {
      type: [String],
      default: []
    },
    targetLocations: {
      type: [String],
      default: []
    },
    // ZIP codes only make sense for Apollo mode - Apollo's location filters
    // are city/state/country strings with no native ZIP/radius support, so
    // these get resolved to "City, State" strings (see zipLookupService.js)
    // and merged into targetLocations before the search request goes out.
    targetZipCodes: {
      type: [String],
      default: []
    },
    zipRadiusMiles: {
      type: Number,
      default: 25,
      min: 1,
      max: 100
    },
    targetTitles: {
      type: [String],
      default: []
    },
    requestedCount: {
      type: Number,
      required: true,
      min: 1,
      max: 50000
    },
    fetchedCount: {
      type: Number,
      default: 0
    },
    importedCount: {
      type: Number,
      default: 0
    },
    duplicateCount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: STATUSES,
      default: 'queued',
      index: true
    },
    currentPage: {
      type: Number,
      default: 0
    },
    perPage: {
      type: Number,
      default: 100
    },
    statusMessage: {
      type: String,
      trim: true,
      default: ''
    },
    errorMessage: {
      type: String,
      default: null
    },
    startedAt: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
)

leadBatchSchema.index({ createdByUserId: 1, createdAt: -1 })

leadBatchSchema.statics.SECTORS = SECTORS
leadBatchSchema.statics.STATUSES = STATUSES
leadBatchSchema.statics.SOURCE_MODES = SOURCE_MODES
leadBatchSchema.statics.VERTICALS = VERTICALS

module.exports = mongoose.model(COLLECTION, leadBatchSchema)
