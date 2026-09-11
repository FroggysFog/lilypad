/**
 * LilyPad ERP - Per-User Microsoft Email (Outlook) Client
 * Rides on the same per-user Microsoft 365 connection as
 * microsoftCalendarService.js (same LilyPadMicrosoftAccount token, same
 * "Connect Microsoft 365" flow) rather than a separate OAuth app/scope -
 * one Microsoft identity per user, several Graph features.
 *
 * AI Email Triage Module, stage 2: reads for inbox/sent/archive are
 * served from LilyPadEmailCache (stage 1's sync engine keeps it fresh)
 * instead of hitting Graph live on every page load - Drafts is the one
 * folder deliberately NOT cached, since it changes on every composer
 * keystroke and a stale cache there would show a user their own
 * half-finished edits disappearing/reappearing. Every write action
 * (send/reply/forward/delete/move) still goes straight to Graph, then
 * triggers a small incremental delta resync so the cache catches up
 * immediately instead of waiting on the 15-minute fallback scheduler.
 */

const axios = require('axios')
const microsoftCalendarService = require('./microsoftCalendarService')
const microsoftEmailSyncService = require('./microsoftEmailSyncService')
const LilyPadEmailCache = require('../models/lilypadEmailCache')

const PUBLIC_TO_CACHE_FOLDER = { inbox: 'inbox', sent: 'sentitems', archive: 'archive', drafts: 'drafts', deleted: 'deleteditems', junk: 'junkemail' }
const MAX_INLINE_ATTACHMENT_BYTES = 3 * 1024 * 1024 // Graph's hard cutoff for a direct base64 attachment - above this, a resumable upload session is required regardless of our own ceiling below.
// Graph itself allows up to 150MB per message attachment via upload
// session, but this app runs on a 512MB dyno (see render.yaml's note
// on the in-house crawler for the same constraint) - holding a much
// bigger file in server memory at once, even transiently, is a real
// risk. 20MB comfortably covers normal PDFs/images/decks without
// getting near that ceiling.
const MAX_ATTACHMENT_BYTES = 20 * 1024 * 1024
// Graph requires each fragment's size to be a multiple of 320 KiB
// (except the final one) - this is 12 * 327680, comfortably under
// Graph's recommended 4-5MB-per-fragment guidance.
const UPLOAD_CHUNK_SIZE = 12 * 327680

function mapGraphRecipient (r) {
  const ea = (r && r.emailAddress) || r || {}
  return { name: ea.name || '', address: (ea.address || '').toLowerCase() }
}

function toGraphRecipients (list) {
  return (list || []).filter(Boolean).map((entry) => {
    const address = typeof entry === 'string' ? entry : entry.address
    const name = typeof entry === 'string' ? undefined : entry.name
    return { emailAddress: { address, name } }
  })
}

function mapCacheDocToSummary (doc) {
  return {
    id: doc.graphMessageId,
    conversationId: doc.graphConversationId || '',
    subject: doc.subject || '(No subject)',
    bodyPreview: doc.bodyPreview || '',
    from: (doc.from && doc.from.address) ? doc.from : null,
    toRecipients: doc.toRecipients || [],
    receivedDateTime: doc.receivedDateTime,
    isRead: Boolean(doc.isRead),
    hasAttachments: Boolean(doc.hasAttachments),
    isActionable: Boolean(doc.triage && doc.triage.isActionable),
    urgency: (doc.triage && doc.triage.urgency) || 'normal'
  }
}

function mapCacheDocToDetail (doc) {
  return {
    ...mapCacheDocToSummary(doc),
    ccRecipients: doc.ccRecipients || [],
    bodyHtml: doc.bodyHtml || null,
    bodyText: null,
    triageSummary: (doc.triage && doc.triage.summary) || ''
  }
}

async function getDraftsLive (ownerId, { top, skip }) {
  const params = new URLSearchParams({
    $top: String(top),
    $skip: String(skip),
    $orderby: 'lastModifiedDateTime desc',
    $select: 'id,subject,bodyPreview,toRecipients,hasAttachments,lastModifiedDateTime'
  })
  const data = await microsoftCalendarService.graphRequestForUser(ownerId, 'get', `/me/mailFolders/drafts/messages?${params.toString()}`)
  return (data.value || []).map((m) => ({
    id: m.id,
    conversationId: '',
    subject: m.subject || '(No subject)',
    bodyPreview: m.bodyPreview || '',
    from: null,
    toRecipients: (m.toRecipients || []).map(mapGraphRecipient),
    receivedDateTime: m.lastModifiedDateTime,
    isRead: true,
    hasAttachments: Boolean(m.hasAttachments)
  }))
}

/**
 * @param {string} folder - 'inbox' | 'sent' | 'archive' | 'drafts'
 * Inbox excludes cold-inbound (graymail) messages by default once
 * they've been scored (stage 3) - they're quarantined into the
 * separate graymail digest instead of cluttering the main list.
 */
async function getMessages (ownerId, folder, { top = 25, skip = 0 } = {}) {
  const cacheFolder = PUBLIC_TO_CACHE_FOLDER[folder] || 'inbox'
  if (cacheFolder === 'drafts') return getDraftsLive(ownerId, { top, skip })

  const query = { owner: ownerId, folder: cacheFolder, deleted: false }
  if (cacheFolder === 'inbox') query['triage.isColdInbound'] = { $ne: true }

  const docs = await LilyPadEmailCache.find(query)
    .sort({ receivedDateTime: -1 })
    .skip(skip)
    .limit(top)
  return docs.map(mapCacheDocToSummary)
}

/**
 * The quarantined graymail digest - cold-inbound messages, most recent
 * first, for the frontend to group by sender into a collapsed daily
 * view rather than showing them inline in the inbox.
 */
async function getGraymailDigest (ownerId, { top = 100 } = {}) {
  const docs = await LilyPadEmailCache.find({ owner: ownerId, folder: 'inbox', deleted: false, 'triage.isColdInbound': true })
    .sort({ receivedDateTime: -1 })
    .limit(top)
  return docs.map(mapCacheDocToSummary)
}

async function getMessageLive (ownerId, graphMessageId) {
  const params = new URLSearchParams({
    $select: 'id,subject,body,bodyPreview,from,toRecipients,ccRecipients,receivedDateTime,isRead,hasAttachments,conversationId'
  })
  const m = await microsoftCalendarService.graphRequestForUser(ownerId, 'get', `/me/messages/${encodeURIComponent(graphMessageId)}?${params.toString()}`)
  return {
    id: m.id,
    conversationId: m.conversationId || '',
    subject: m.subject || '(No subject)',
    bodyPreview: m.bodyPreview || '',
    from: m.from ? mapGraphRecipient(m.from) : null,
    toRecipients: (m.toRecipients || []).map(mapGraphRecipient),
    ccRecipients: (m.ccRecipients || []).map(mapGraphRecipient),
    receivedDateTime: m.receivedDateTime,
    isRead: Boolean(m.isRead),
    hasAttachments: Boolean(m.hasAttachments),
    bodyHtml: (m.body && m.body.contentType === 'html') ? m.body.content : null,
    bodyText: (m.body && m.body.contentType === 'text') ? m.body.content : null
  }
}

/**
 * Cache first (fast path for inbox/sent/archive); falls through to a
 * live Graph fetch for anything not in the cache - drafts (never
 * cached) and the rare race where an action hasn't resynced yet.
 */
async function getMessageById (ownerId, graphMessageId) {
  const doc = await LilyPadEmailCache.findOne({ owner: ownerId, graphMessageId, deleted: false })
  if (doc) return mapCacheDocToDetail(doc)
  return getMessageLive(ownerId, graphMessageId)
}

/**
 * A conversation can span folders (inbox + your own sent replies), so
 * this deliberately doesn't filter by folder - just owner + conversation.
 */
async function getThread (ownerId, conversationId) {
  if (!conversationId) return []
  const docs = await LilyPadEmailCache.find({ owner: ownerId, graphConversationId: conversationId, deleted: false })
    .sort({ receivedDateTime: 1 })
  return docs.map(mapCacheDocToDetail)
}

async function markAsRead (ownerId, graphMessageId) {
  await microsoftCalendarService.graphRequestForUser(ownerId, 'patch', `/me/messages/${encodeURIComponent(graphMessageId)}`, { isRead: true })
  await LilyPadEmailCache.updateOne({ owner: ownerId, graphMessageId }, { $set: { isRead: true } })
}

// --- Compose / drafts --------------------------------------------------

async function createDraft (ownerId, { subject, bodyHtml, toRecipients, ccRecipients }) {
  const result = await microsoftCalendarService.graphRequestForUser(ownerId, 'post', '/me/messages', {
    subject: subject || '',
    body: { contentType: 'HTML', content: bodyHtml || '' },
    toRecipients: toGraphRecipients(toRecipients),
    ccRecipients: toGraphRecipients(ccRecipients)
  })
  return result.id
}

async function updateDraft (ownerId, graphMessageId, { subject, bodyHtml, toRecipients, ccRecipients }) {
  const payload = {}
  if (subject !== undefined) payload.subject = subject
  if (bodyHtml !== undefined) payload.body = { contentType: 'HTML', content: bodyHtml }
  if (toRecipients !== undefined) payload.toRecipients = toGraphRecipients(toRecipients)
  if (ccRecipients !== undefined) payload.ccRecipients = toGraphRecipients(ccRecipients)
  await microsoftCalendarService.graphRequestForUser(ownerId, 'patch', `/me/messages/${encodeURIComponent(graphMessageId)}`, payload)
}

async function discardDraft (ownerId, graphMessageId) {
  await microsoftCalendarService.graphRequestForUser(ownerId, 'delete', `/me/messages/${encodeURIComponent(graphMessageId)}`)
}

async function addAttachmentToDraft (ownerId, graphMessageId, file) {
  if (file.size > MAX_ATTACHMENT_BYTES) {
    const err = new Error(`"${file.originalname}" is larger than ${Math.round(MAX_ATTACHMENT_BYTES / (1024 * 1024))}MB - not supported yet.`)
    err.statusCode = 413
    throw err
  }

  if (file.size <= MAX_INLINE_ATTACHMENT_BYTES) {
    await microsoftCalendarService.graphRequestForUser(ownerId, 'post', `/me/messages/${encodeURIComponent(graphMessageId)}/attachments`, {
      '@odata.type': '#microsoft.graph.fileAttachment',
      name: file.originalname,
      contentType: file.mimetype,
      contentBytes: file.buffer.toString('base64')
    })
    return
  }

  await uploadLargeAttachment(ownerId, graphMessageId, file)
}

/**
 * Graph's resumable upload session for anything over the 3MB direct-
 * attach limit: create a session (a real, authenticated Graph call),
 * then PUT the file in fixed-size chunks straight to the returned
 * uploadUrl. That URL is itself pre-authenticated (a short-lived token
 * is embedded in it) - Graph's own docs say not to send our Bearer
 * token to it, so this goes through plain axios rather than
 * graphRequestForUser, which always attaches one.
 */
async function uploadLargeAttachment (ownerId, graphMessageId, file) {
  const session = await microsoftCalendarService.graphRequestForUser(
    ownerId,
    'post',
    `/me/messages/${encodeURIComponent(graphMessageId)}/attachments/createUploadSession`,
    {
      AttachmentItem: {
        attachmentType: 'file',
        name: file.originalname,
        size: file.size
      }
    }
  )

  const totalSize = file.buffer.length
  for (let start = 0; start < totalSize; start += UPLOAD_CHUNK_SIZE) {
    const end = Math.min(start + UPLOAD_CHUNK_SIZE, totalSize)
    const chunk = file.buffer.subarray(start, end)
    await axios.put(session.uploadUrl, chunk, {
      headers: {
        'Content-Length': String(chunk.length),
        'Content-Range': `bytes ${start}-${end - 1}/${totalSize}`
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity
    })
  }
}

/**
 * Best-effort resync after a write action - the action itself already
 * succeeded in Graph by the time this runs, so a failure here only
 * means the local cache is stale until the next 15-minute fallback
 * sync, not that the user's action failed.
 */
async function resyncFolders (ownerId, folders) {
  await Promise.allSettled(folders.map((folder) => microsoftEmailSyncService.runDeltaSync(ownerId, folder)))
}

async function sendDraft (ownerId, graphMessageId) {
  await microsoftCalendarService.graphRequestForUser(ownerId, 'post', `/me/messages/${encodeURIComponent(graphMessageId)}/send`)
  await resyncFolders(ownerId, ['sentitems'])
}

// --- Reply / forward -----------------------------------------------------

/**
 * Graph's one-shot /reply, /replyAll, /forward actions are simplest and
 * are what these functions use when there's nothing to attach - but
 * none of them accept attachments in the same call. Attaching a file
 * means falling back to the createReply/createReplyAll/createForward
 * actions instead, which draft the reply (already pre-filled with the
 * quoted original, exactly like the one-shot actions produce) without
 * sending it, so a file can be added to that draft before sending it
 * for real via a normal send call.
 */
async function prependCommentToDraftBody (ownerId, draft, comment) {
  if (!comment) return
  const existingBody = (draft.body && draft.body.content) || ''
  await microsoftCalendarService.graphRequestForUser(ownerId, 'patch', `/me/messages/${encodeURIComponent(draft.id)}`, {
    body: { contentType: 'HTML', content: `${comment}${existingBody}` }
  })
}

async function sendDraftWithAttachments (ownerId, draft, comment, attachments) {
  await prependCommentToDraftBody(ownerId, draft, comment)
  for (const file of attachments) {
    await addAttachmentToDraft(ownerId, draft.id, file)
  }
  await microsoftCalendarService.graphRequestForUser(ownerId, 'post', `/me/messages/${encodeURIComponent(draft.id)}/send`)
}

async function replyToMessage (ownerId, graphMessageId, { comment, replyAll, attachments = [] }) {
  if (!attachments.length) {
    const action = replyAll ? 'replyAll' : 'reply'
    await microsoftCalendarService.graphRequestForUser(ownerId, 'post', `/me/messages/${encodeURIComponent(graphMessageId)}/${action}`, { comment: comment || '' })
  } else {
    const action = replyAll ? 'createReplyAll' : 'createReply'
    const draft = await microsoftCalendarService.graphRequestForUser(ownerId, 'post', `/me/messages/${encodeURIComponent(graphMessageId)}/${action}`, {})
    await sendDraftWithAttachments(ownerId, draft, comment, attachments)
  }
  await resyncFolders(ownerId, ['inbox', 'sentitems'])
}

async function forwardMessage (ownerId, graphMessageId, { comment, toRecipients, attachments = [] }) {
  if (!attachments.length) {
    await microsoftCalendarService.graphRequestForUser(ownerId, 'post', `/me/messages/${encodeURIComponent(graphMessageId)}/forward`, {
      comment: comment || '',
      toRecipients: toGraphRecipients(toRecipients)
    })
  } else {
    const draft = await microsoftCalendarService.graphRequestForUser(ownerId, 'post', `/me/messages/${encodeURIComponent(graphMessageId)}/createForward`, {})
    await microsoftCalendarService.graphRequestForUser(ownerId, 'patch', `/me/messages/${encodeURIComponent(draft.id)}`, {
      toRecipients: toGraphRecipients(toRecipients)
    })
    await sendDraftWithAttachments(ownerId, draft, comment, attachments)
  }
  await resyncFolders(ownerId, ['inbox', 'sentitems'])
}

// --- Delete / move ---------------------------------------------------------

async function deleteMessage (ownerId, graphMessageId) {
  await microsoftCalendarService.graphRequestForUser(ownerId, 'delete', `/me/messages/${encodeURIComponent(graphMessageId)}`)
  await LilyPadEmailCache.updateOne({ owner: ownerId, graphMessageId }, { $set: { deleted: true } })
}

const MOVE_DESTINATION_IDS = { archive: 'archive', inbox: 'inbox', deleted: 'deleteditems', junk: 'junkemail' }

async function moveMessage (ownerId, graphMessageId, destination) {
  const destinationId = MOVE_DESTINATION_IDS[destination]
  if (!destinationId) throw new Error('Unsupported destination folder.')

  await microsoftCalendarService.graphRequestForUser(ownerId, 'post', `/me/messages/${encodeURIComponent(graphMessageId)}/move`, { destinationId })
  // Graph's move returns a new message id in the destination folder -
  // the old cached doc (old folder, old id) is now stale, not just
  // out of date, so it's removed rather than updated in place.
  await LilyPadEmailCache.deleteOne({ owner: ownerId, graphMessageId })
  // destinationId here IS the cache/sync-engine folder name (e.g.
  // 'deleteditems') - destination itself is the public-facing key (e.g.
  // 'deleted') and no longer matches 1:1 now that junk/deleted exist, so
  // resyncing on the raw `destination` would target a folder name the
  // sync engine doesn't recognize.
  await resyncFolders(ownerId, [destinationId])
}

module.exports = {
  getMessages,
  getGraymailDigest,
  getMessageById,
  getThread,
  markAsRead,
  createDraft,
  updateDraft,
  discardDraft,
  addAttachmentToDraft,
  sendDraft,
  replyToMessage,
  forwardMessage,
  deleteMessage,
  moveMessage
}
