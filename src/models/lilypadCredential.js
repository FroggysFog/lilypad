/**
 * LilyPad ERP - Credentials Vault Schema
 * Staging area for API keys/values that ultimately belong in Render's
 * environment variables. Not a replacement for Render's own secret
 * storage - just a shared, admin-only place to keep and copy them from.
 */

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const COLLECTION = 'lilypad_credentials'

const credentialSchema = new Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true
    },
    key: {
      type: String,
      required: true,
      trim: true
    },
    value: {
      type: String,
      required: true
    },
    category: {
      type: String,
      trim: true,
      default: 'Other'
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model(COLLECTION, credentialSchema)
