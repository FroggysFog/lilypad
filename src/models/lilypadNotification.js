/**
 * LilyPad ERP - Notification Schema
 * Cross-user notifications (e.g. @mentions in ticket comments), independent
 * of the client-side toast/localStorage layer.
 */

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const COLLECTION = 'lilypad_notifications'

const notificationSchema = new Schema({
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'lilypad_accounts',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['mention'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    trim: true,
    default: ''
  },
  ticketId: {
    type: Schema.Types.ObjectId,
    ref: 'lilypad_tickets'
  },
  ticketUid: {
    type: String,
    trim: true
  },
  triggeredBy: {
    type: Schema.Types.ObjectId,
    ref: 'lilypad_accounts',
    default: null
  },
  triggeredByName: {
    type: String,
    trim: true,
    default: ''
  },
  read: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true
})

module.exports = mongoose.model(COLLECTION, notificationSchema)
