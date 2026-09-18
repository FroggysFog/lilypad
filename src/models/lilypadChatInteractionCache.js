/**
 * LilyPad ERP - Teams Chat Interaction Cache
 * One doc per (owner, Teams chat) - mirrors lilypadContactInteractionScore.js's
 * shape but keyed by chat instead of email address, since Teams chats have
 * no equivalent of a sender's rolling 60-day velocity score. Candidate
 * selection for chat is simply "any chat with new activity since last
 * check" (see teamsChatTriageService.js) - no priority/manual/keyword
 * rules like email's stage 5, so this doc only needs to remember what was
 * last seen, not a scored history.
 */

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const COLLECTION = 'lilypad_chat_interaction_caches'

const chatInteractionCacheSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'lilypad_accounts', required: true },
    chatId: { type: String, required: true },
    chatType: { type: String, default: '' },
    // Cached from microsoftTeams.js's computeChatDisplayName() so a card
    // renders without a live Graph call.
    displayName: { type: String, default: '' },
    // Last time the scheduler examined this chat at all (whether or not
    // it triggered a Claude call) - distinct from rollup.generatedAt,
    // which only updates when a summary was actually (re)generated.
    lastCheckedAt: { type: Date, default: null },
    rollup: {
      summary: { type: String, default: '' },
      urgency: { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' },
      generatedAt: { type: Date, default: null },
      // The newest real (non-system) message id folded into the current
      // summary - the staleness key: unchanged since last check means
      // skip the Claude call entirely, not just skip showing a new card.
      lastProcessedMessageId: { type: String, default: '' },
      // Same "hide until new activity" semantics as email's dismissCard -
      // checked against lastProcessedMessageId at dismiss time.
      dismissedAt: { type: Date, default: null },
      dismissedAtMessageId: { type: String, default: '' }
    }
  },
  { timestamps: true }
)

chatInteractionCacheSchema.index({ owner: 1, chatId: 1 }, { unique: true })

module.exports = mongoose.model(COLLECTION, chatInteractionCacheSchema)
