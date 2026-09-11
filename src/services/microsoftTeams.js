/**
 * LilyPad ERP - Teams Chat (per-user)
 * Rides on the same per-user Microsoft 365 connection as calendar and
 * mail (see microsoftCalendarService.js) rather than its own OAuth flow
 * or token cache - there used to be a separate single shared,
 * in-memory-only Teams connection here (whoever last authorized it
 * became "the" Teams identity for every LilyPad user), which broke the
 * moment a second person connected. graphRequestForUser already knows
 * how to get/refresh a given user's access token, so this file is just
 * Teams-shaped Graph calls parameterized by ownerId.
 */

const microsoftCalendarService = require('./microsoftCalendarService')
const LilyPadMicrosoftAccount = require('../models/lilypadMicrosoftAccount')

const PAGE_SIZE = 30
const GRAPH = 'https://graph.microsoft.com/v1.0'

async function getStatus (ownerId) {
  const account = await LilyPadMicrosoftAccount.findOne({ user: ownerId })
  return {
    configured: microsoftCalendarService.isConfigured(),
    connected: Boolean(account && account.refreshToken),
    meId: account ? account.msUserId : null,
    meName: account ? account.msDisplayName : null
  }
}

/**
 * Untitled 1:1/group chats have no `topic` - Graph leaves it to the
 * client to build a name from the other members, the way Teams itself
 * shows "Caitlin and David" or "Caitlin, +2" instead of a blank title.
 */
function computeChatDisplayName (chat, meId) {
  if (chat.topic) return chat.topic

  const others = (chat.members || [])
    .filter((m) => m.userId !== meId)
    .map((m) => m.displayName)
    .filter(Boolean)

  if (!others.length) return chat.chatType === 'oneOnOne' ? 'Direct message' : 'Group chat'
  if (others.length <= 2) return others.join(' and ')
  return `${others[0]}, +${others.length - 1}`
}

async function getChats (ownerId) {
  const account = await LilyPadMicrosoftAccount.findOne({ user: ownerId })
  const meId = account ? account.msUserId : null
  const result = await microsoftCalendarService.graphRequestForUser(ownerId, 'get', '/me/chats?$expand=members&$top=50')
  const chats = result.value || []
  chats.forEach((chat) => { chat.displayName = computeChatDisplayName(chat, meId) })
  return chats
}

/**
 * Chat history, newest page first by default. Pass the `nextLink` from
 * a previous call's result to page further back in history - each page
 * is reversed to chronological order before returning, so the caller
 * can just prepend a page's `messages` above what it already has.
 */
async function getMessages (ownerId, chatId, options = {}) {
  if (!chatId) throw new Error('Chat ID is required')
  // nextLink comes back to us from the client (it round-trips through
  // the "load older" button) - it must be validated as an actual Graph
  // URL before use, or a forged value could make the server attach its
  // Bearer token to a request against an attacker-controlled host.
  if (options.nextLink && !options.nextLink.startsWith(GRAPH + '/')) {
    throw new Error('Invalid pagination link')
  }
  const path = options.nextLink || `/chats/${encodeURIComponent(chatId)}/messages?$top=${PAGE_SIZE}`
  const result = await microsoftCalendarService.graphRequestForUser(ownerId, 'get', path)
  return {
    messages: (result.value || []).reverse(),
    nextLink: result['@odata.nextLink'] || null
  }
}

async function sendMessage (ownerId, chatId, content) {
  if (!chatId || !content) throw new Error('Chat ID and message content are required')
  return microsoftCalendarService.graphRequestForUser(ownerId, 'post', `/chats/${encodeURIComponent(chatId)}/messages`, {
    body: { contentType: 'text', content }
  })
}

module.exports = {
  getStatus,
  getChats,
  getMessages,
  sendMessage
}
