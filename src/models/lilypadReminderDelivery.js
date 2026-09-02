/**
 * LilyPad ERP - Reminder Delivery Log Schema
 * Records every collections reminder send attempt (manual or scheduled).
 */

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const COLLECTION = 'lilypad_reminder_deliveries'

const reminderDeliverySchema = new Schema(
  {
    accountName: {
      type: String,
      trim: true,
      default: ''
    },
    recipientEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: ''
    },
    templateKey: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['sent', 'failed'],
      required: true
    },
    subject: {
      type: String,
      default: ''
    },
    senderEmail: {
      type: String,
      trim: true,
      default: ''
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    failedReason: {
      type: String,
      default: ''
    },
    messageId: {
      type: String,
      default: ''
    },
    isTest: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model(COLLECTION, reminderDeliverySchema)
