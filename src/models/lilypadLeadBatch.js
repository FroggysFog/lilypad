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
    targetIndustry: {
      type: [String],
      default: []
    },
    targetLocations: {
      type: [String],
      default: []
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

module.exports = mongoose.model(COLLECTION, leadBatchSchema)
