/**
 * LilyPad ERP - Per-User Microsoft Account Connection
 * Unlike microsoftTeams.js's single shared, in-memory-only connection
 * (one person authorizes it, tokens lost on restart), Calendar needs
 * "everyone's calendar" - each LilyPad user connects their own Microsoft
 * account once, and their tokens are stored here so the server can read/
 * write that person's calendar on their behalf at any time, regardless
 * of who's currently browsing the Calendar page.
 */

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const COLLECTION = 'lilypad_microsoft_accounts'

const microsoftAccountSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'lilypad_accounts',
      required: true,
      unique: true,
      index: true
    },
    msUserId: { type: String, default: '' },
    msEmail: { type: String, trim: true, default: '' },
    msDisplayName: { type: String, trim: true, default: '' },
    accessToken: { type: String, default: '' },
    refreshToken: { type: String, default: '' },
    tokenExpiresAt: { type: Date, default: null },
    connectedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
)

module.exports = mongoose.model(COLLECTION, microsoftAccountSchema)
