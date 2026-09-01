/**
 * LilyPad ERP - Reminder Email Template Schema
 * Editable per-stage collections reminder templates, with {{token}}
 * substitution against a past-due account record.
 */

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const COLLECTION = 'lilypad_email_templates'

const emailTemplateSchema = new Schema(
  {
    templateKey: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    templateName: {
      type: String,
      required: true,
      trim: true
    },
    subject: {
      type: String,
      required: true,
      trim: true
    },
    body: {
      type: String,
      required: true
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model(COLLECTION, emailTemplateSchema)
