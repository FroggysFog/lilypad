/**
 * LilyPad ERP - Generic Settings Schema
 * Small key/value store for things that don't warrant their own model:
 * the reminder-automation on/off flag, persisted Salesforce OAuth tokens.
 */

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const COLLECTION = 'lilypad_settings'

const settingSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    value: {
      type: Schema.Types.Mixed,
      default: null
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model(COLLECTION, settingSchema)
