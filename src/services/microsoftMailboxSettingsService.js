/**
 * LilyPad ERP - Out of Office / Automatic Replies
 * Thin wrapper over Graph's /me/mailboxSettings.automaticRepliesSetting -
 * the same per-user Microsoft 365 connection as everything else
 * (MailboxSettings.ReadWrite), not a new OAuth flow.
 */

const microsoftCalendarService = require('./microsoftCalendarService')

function mapSettings (setting) {
  return {
    status: setting.status || 'disabled', // 'disabled' | 'alwaysEnabled' | 'scheduled'
    externalAudience: setting.externalAudience || 'all', // 'none' | 'contactsOnly' | 'all'
    internalReplyMessage: setting.internalReplyMessage || '',
    externalReplyMessage: setting.externalReplyMessage || '',
    scheduledStartDateTime: (setting.scheduledStartDateTime && setting.scheduledStartDateTime.dateTime) || null,
    scheduledEndDateTime: (setting.scheduledEndDateTime && setting.scheduledEndDateTime.dateTime) || null
  }
}

async function getAutomaticReplies (ownerId) {
  const data = await microsoftCalendarService.graphRequestForUser(ownerId, 'get', '/me/mailboxSettings?$select=automaticRepliesSetting')
  return mapSettings(data.automaticRepliesSetting || {})
}

/**
 * `status` drives which other fields matter - 'scheduled' needs both
 * dates, 'alwaysEnabled' needs neither, 'disabled' turns replies off
 * without discarding the saved message text (so re-enabling later
 * doesn't mean retyping it).
 */
async function setAutomaticReplies (ownerId, { status, externalAudience, internalReplyMessage, externalReplyMessage, scheduledStartDateTime, scheduledEndDateTime }) {
  const payload = {
    status: ['disabled', 'alwaysEnabled', 'scheduled'].includes(status) ? status : 'disabled',
    externalAudience: ['none', 'contactsOnly', 'all'].includes(externalAudience) ? externalAudience : 'all',
    internalReplyMessage: internalReplyMessage || '',
    externalReplyMessage: externalReplyMessage || ''
  }

  if (payload.status === 'scheduled') {
    if (!scheduledStartDateTime || !scheduledEndDateTime) {
      throw new Error('A scheduled out-of-office needs both a start and end date.')
    }
    payload.scheduledStartDateTime = { dateTime: new Date(scheduledStartDateTime).toISOString(), timeZone: 'UTC' }
    payload.scheduledEndDateTime = { dateTime: new Date(scheduledEndDateTime).toISOString(), timeZone: 'UTC' }
  }

  const data = await microsoftCalendarService.graphRequestForUser(ownerId, 'patch', '/me/mailboxSettings', { automaticRepliesSetting: payload })
  return mapSettings(data.automaticRepliesSetting || payload)
}

module.exports = {
  getAutomaticReplies,
  setAutomaticReplies
}
