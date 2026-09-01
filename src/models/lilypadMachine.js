/**
 * LilyPad ERP - Machine Master Page Schema
 * Per-machine source of truth: documents, images, videos, and common
 * issues / quick troubleshooting steps.
 */

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const COLLECTION = 'lilypad_machines'

function slugify(name) {
  return name
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const machineSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    category: {
      type: String,
      trim: true,
      default: 'General'
    },
    media: [
      {
        type: { type: String, enum: ['document', 'image', 'video'], required: true },
        filename: { type: String, required: true },
        originalName: { type: String, required: true },
        path: { type: String, required: true },
        size: { type: Number, default: 0 },
        mimeType: { type: String, default: '' },
        title: { type: String, trim: true, default: '' },
        uploadedBy: { type: Schema.Types.ObjectId, ref: 'lilypad_accounts', default: null },
        uploadedAt: { type: Date, default: Date.now }
      }
    ],
    issues: [
      {
        symptom: { type: String, required: true, trim: true },
        steps: [{ type: String, trim: true }],
        resolution: { type: String, trim: true, default: '' },
        createdBy: { type: Schema.Types.ObjectId, ref: 'lilypad_accounts', default: null },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    deleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

machineSchema.pre('validate', function (next) {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name)
  }
  next()
})

machineSchema.statics.slugify = slugify

module.exports = mongoose.model(COLLECTION, machineSchema)
