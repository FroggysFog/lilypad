/**
 * LilyPad ERP - Per-User Microsoft Email (Outlook) Read Access
 * Rides on the same per-user Microsoft 365 connection as
 * microsoftCalendarService.js (same LilyPadMicrosoftAccount token, same
 * "Connect Microsoft 365" flow) rather than a separate OAuth app/scope -
 * one Microsoft identity per user, several Graph features. Read-only for
 * now (Mail.Read); sending/replying is a later pass.
 */

const microsoftCalendarService = require('./microsoftCalendarService')

const FOLDER_IDS = {
  inbox: 'inbox',
  sent: 'sentitems'
}

function mapMessageSummary (m) {
  return {
    id: m.id,
    subject: m.subject || '(No subject)',
    bodyPreview: m.bodyPreview || '',
    from: (m.from && m.from.emailAddress) ? { name: m.from.emailAddress.name, address: m.from.emailAddress.address } : null,
    toRecipients: (m.toRecipients || []).map((r) => ({ name: r.emailAddress.name, address: r.emailAddress.address })),
    receivedDateTime: m.receivedDateTime,
    isRead: Boolean(m.isRead),
    hasAttachments: Boolean(m.hasAttachments)
  }
}

/**
 * @param {string} folder - 'inbox' | 'sent'
 */
async function getMessages (userId, folder, { top = 25, skip = 0 } = {}) {
  const folderId = FOLDER_IDS[folder] || FOLDER_IDS.inbox
  const params = new URLSearchParams({
    $top: String(top),
    $skip: String(skip),
    $orderby: 'receivedDateTime desc',
    $select: 'id,subject,bodyPreview,from,toRecipients,receivedDateTime,isRead,hasAttachments'
  })

  const data = await microsoftCalendarService.graphRequestForUser(userId, 'get', `/me/mailFolders/${folderId}/messages?${params.toString()}`)
  return (data.value || []).map(mapMessageSummary)
}

async function getMessageById (userId, messageId) {
  const params = new URLSearchParams({
    $select: 'id,subject,body,from,toRecipients,ccRecipients,receivedDateTime,isRead,hasAttachments'
  })
  const m = await microsoftCalendarService.graphRequestForUser(userId, 'get', `/me/messages/${encodeURIComponent(messageId)}?${params.toString()}`)

  return {
    ...mapMessageSummary(m),
    ccRecipients: (m.ccRecipients || []).map((r) => ({ name: r.emailAddress.name, address: r.emailAddress.address })),
    bodyHtml: (m.body && m.body.contentType === 'html') ? m.body.content : null,
    bodyText: (m.body && m.body.contentType === 'text') ? m.body.content : null
  }
}

async function markAsRead (userId, messageId) {
  await microsoftCalendarService.graphRequestForUser(userId, 'patch', `/me/messages/${encodeURIComponent(messageId)}`, { isRead: true })
}

module.exports = {
  getMessages,
  getMessageById,
  markAsRead
}
