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

function escapeHtml (value) {
  return String(value == null ? '' : value).replace(/[&<>'"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]))
}

// Real Teams file attachments must reference a driveItem already in
// OneDrive/SharePoint - there's no way to attach raw bytes directly to a
// chat message (chatMessageHostedContent is for small inline images/code
// snippets only, 4MB max, and doesn't render as a downloadable file the
// way a real attachment does). One folder per LilyPad user's OneDrive
// keeps these easy to find/clean up later rather than littering the
// drive root.
const UPLOAD_FOLDER = 'LilyPad Chat Attachments'
const GUID_PATTERN = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/

function sanitizeFileName (name) {
  return String(name || 'file').replace(/[\\/:*?"<>|]/g, '_').slice(0, 200)
}

/**
 * Uploads a file to the sender's own OneDrive, then sends it as a real
 * Teams attachment (contentType: 'reference') on the given chat - the
 * other party sees an actual downloadable file in Teams, not a LilyPad-
 * only side channel. `caption` is optional plain text shown alongside
 * the attachment.
 */
async function sendAttachment (ownerId, chatId, fileBuffer, fileName, mimeType, caption) {
  if (!chatId || !fileBuffer || !fileName) throw new Error('Chat ID, file, and file name are required')

  const safeName = sanitizeFileName(fileName)
  const uploadPath = `/me/drive/root:/${encodeURIComponent(UPLOAD_FOLDER)}/${Date.now()}-${encodeURIComponent(safeName)}:/content`
  let item = await microsoftCalendarService.graphUploadForUser(ownerId, uploadPath, fileBuffer, mimeType)

  // The content PUT's own response is a driveItem, but doesn't always
  // carry webDavUrl - re-fetch with an explicit $select (the exact field
  // Graph's own docs say to use as a chat attachment's contentUrl) when
  // it's missing rather than assuming the first response has everything.
  if (!item.webDavUrl && item.id) {
    item = await microsoftCalendarService.graphRequestForUser(ownerId, 'get', `/me/drive/items/${item.id}?$select=id,eTag,webDavUrl,name`)
  }

  const eTagMatch = GUID_PATTERN.exec(item.eTag || '')
  const attachmentId = eTagMatch ? eTagMatch[0] : item.id
  const contentUrl = item.webDavUrl
  if (!contentUrl) throw new Error('Uploaded file, but Microsoft Graph did not return a usable file URL for the attachment.')

  const captionHtml = caption ? escapeHtml(caption) + ' ' : ''
  return microsoftCalendarService.graphRequestForUser(ownerId, 'post', `/chats/${encodeURIComponent(chatId)}/messages`, {
    body: { contentType: 'html', content: `${captionHtml}<attachment id="${attachmentId}"></attachment>` },
    attachments: [{ id: attachmentId, contentType: 'reference', contentUrl, name: safeName }]
  })
}

/**
 * One batched call for however many people are visible across the chat
 * list, rather than a Graph request per person - Graph's batch presence
 * endpoint takes up to 650 ids at once. Requires Presence.Read.All (see
 * microsoftCalendarService.js's SCOPES) - the frontend treats a failure
 * here as non-fatal, since presence is a nice-to-have, not something
 * chat itself depends on.
 */
async function getPresences (ownerId, userIds) {
  const ids = Array.isArray(userIds) ? userIds.filter(Boolean).slice(0, 650) : []
  if (!ids.length) return []
  const result = await microsoftCalendarService.graphRequestForUser(ownerId, 'post', '/communications/getPresencesByUserId', { ids })
  return result.value || []
}

module.exports = {
  getStatus,
  getChats,
  getMessages,
  sendMessage,
  sendAttachment,
  getPresences
}
