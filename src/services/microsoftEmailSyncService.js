/**
 * LilyPad ERP - Email Delta Sync Engine (AI Email Triage Module, stage 1)
 * Fills LilyPadEmailCache from each connected user's Microsoft mailbox
 * using Graph delta queries, kept fresh in near-real-time via a webhook
 * subscription on the inbox plus a periodic fallback sync (both folders)
 * in case a webhook is ever missed or not yet configured.
 *
 * Rides on the existing per-user Microsoft 365 connection
 * (microsoftCalendarService.js / LilyPadMicrosoftAccount) rather than a
 * second OAuth flow - graphRequestForUser handles token refresh the same
 * way calendar sync already does. Reading mail and subscribing to mail
 * changes both work under the Mail.Read scope already granted for the
 * Email page - no new Azure permission is needed for THIS stage (only
 * sending/composing in a later stage needs Mail.ReadWrite/Mail.Send).
 */

const crypto = require('crypto')
const microsoftCalendarService = require('./microsoftCalendarService')
const LilyPadEmailCache = require('../models/lilypadEmailCache')
const LilyPadEmailSyncState = require('../models/lilypadEmailSyncState')

const DELTA_SELECT_FIELDS = 'id,conversationId,subject,body,bodyPreview,from,toRecipients,ccRecipients,receivedDateTime,isRead,hasAttachments,importance'
// Graph caps mail resource subscriptions at 3 days - renew well before
// that, both here (5 min safety margin on creation) and via the cron
// below (renews anything expiring within the next 12h).
const SUBSCRIPTION_LIFETIME_MS = (3 * 24 * 60 * 60 * 1000) - (5 * 60 * 1000)
const RENEW_WITHIN_MS = 12 * 60 * 60 * 1000

function mapRecipient (r) {
  return {
    name: (r && r.emailAddress && r.emailAddress.name) || '',
    address: ((r && r.emailAddress && r.emailAddress.address) || '').toLowerCase()
  }
}

function mapGraphMessageToCacheFields (m, folder) {
  return {
    folder,
    graphConversationId: m.conversationId || '',
    subject: m.subject || '',
    bodyHtml: (m.body && m.body.contentType === 'html') ? m.body.content : '',
    bodyPreview: m.bodyPreview || '',
    from: m.from ? mapRecipient(m.from) : {},
    toRecipients: (m.toRecipients || []).map(mapRecipient),
    ccRecipients: (m.ccRecipients || []).map(mapRecipient),
    receivedDateTime: m.receivedDateTime ? new Date(m.receivedDateTime) : null,
    isRead: Boolean(m.isRead),
    hasAttachments: Boolean(m.hasAttachments),
    importance: m.importance || 'normal'
  }
}

async function upsertOrRemove (ownerId, folder, item) {
  if (item['@removed']) {
    await LilyPadEmailCache.updateOne({ owner: ownerId, graphMessageId: item.id }, { $set: { deleted: true } })
    return
  }

  await LilyPadEmailCache.updateOne(
    { owner: ownerId, graphMessageId: item.id },
    { $set: { owner: ownerId, graphMessageId: item.id, ...mapGraphMessageToCacheFields(item, folder) } },
    { upsert: true }
  )
}

/**
 * Pulls everything new/changed since this (owner, folder)'s last saved
 * deltaLink, paging through @odata.nextLink until Graph hands back the
 * final @odata.deltaLink for next time. A brand-new sync state (no
 * deltaLink yet) starts from a full delta from scratch, which Graph
 * treats as "give me everything," so first sync = full backfill.
 */
async function runDeltaSync (ownerId, folder) {
  let state = await LilyPadEmailSyncState.findOne({ owner: ownerId, folder })
  if (!state) state = new LilyPadEmailSyncState({ owner: ownerId, folder })

  let url = state.deltaLink || `/me/mailFolders('${folder}')/messages/delta?$select=${DELTA_SELECT_FIELDS}`
  let newDeltaLink = null
  let processedCount = 0

  try {
    while (url) {
      const page = await microsoftCalendarService.graphRequestForUser(ownerId, 'get', url)
      for (const item of page.value || []) {
        await upsertOrRemove(ownerId, folder, item)
        processedCount++
      }
      if (page['@odata.nextLink']) {
        url = page['@odata.nextLink']
      } else {
        newDeltaLink = page['@odata.deltaLink'] || null
        url = null
      }
    }

    state.deltaLink = newDeltaLink || state.deltaLink
    state.lastSyncedAt = new Date()
    state.lastSyncError = ''
    await state.save()
  } catch (err) {
    // A 410 Gone means the delta token itself expired or was
    // invalidated - Graph's documented recovery is to drop it and do a
    // full resync from scratch next time, not to keep retrying the same
    // dead token forever.
    if (err.graphStatus === 410) {
      state.deltaLink = ''
      state.lastSyncError = 'Delta token expired - will do a full resync next run.'
      await state.save()
      return { processedCount, deltaExpired: true }
    }
    state.lastSyncError = err.message
    await state.save()
    throw err
  }

  return { processedCount }
}

/**
 * Creates a fresh Graph webhook subscription watching this user's
 * inbox for new/changed/deleted messages. clientState is a per-
 * subscription secret checked on every inbound notification - without
 * it, anyone who discovers the webhook URL could trigger sync churn by
 * forging notifications.
 */
async function subscribeToInbox (ownerId) {
  const webhookUrl = process.env.MICROSOFT_EMAIL_WEBHOOK_URL
  if (!webhookUrl) throw new Error('MICROSOFT_EMAIL_WEBHOOK_URL is not configured.')

  let state = await LilyPadEmailSyncState.findOne({ owner: ownerId, folder: 'inbox' })
  if (!state) state = new LilyPadEmailSyncState({ owner: ownerId, folder: 'inbox' })

  const clientState = crypto.randomBytes(24).toString('hex')
  const expirationDateTime = new Date(Date.now() + SUBSCRIPTION_LIFETIME_MS).toISOString()

  const result = await microsoftCalendarService.graphRequestForUser(ownerId, 'post', '/subscriptions', {
    changeType: 'created,updated,deleted',
    notificationUrl: webhookUrl,
    resource: "me/mailFolders('inbox')/messages",
    expirationDateTime,
    clientState
  })

  state.subscriptionId = result.id
  state.subscriptionExpiresAt = new Date(result.expirationDateTime)
  state.subscriptionClientState = clientState
  await state.save()
  return state
}

async function renewSubscription (state) {
  const expirationDateTime = new Date(Date.now() + SUBSCRIPTION_LIFETIME_MS).toISOString()
  await microsoftCalendarService.graphRequestForUser(state.owner, 'patch', `/subscriptions/${encodeURIComponent(state.subscriptionId)}`, { expirationDateTime })
  state.subscriptionExpiresAt = new Date(expirationDateTime)
  await state.save()
}

/**
 * Ensures every currently-connected user has a live inbox subscription,
 * creating one where missing/expired - covers newly-connected users and
 * the case where MICROSOFT_EMAIL_WEBHOOK_URL wasn't set yet on an
 * earlier run.
 */
async function ensureSubscriptionsForConnectedUsers () {
  const connectedIds = await microsoftCalendarService.getConnectedUserIds()
  const results = []
  for (const ownerId of connectedIds) {
    const state = await LilyPadEmailSyncState.findOne({ owner: ownerId, folder: 'inbox' })
    if (state && state.subscriptionId && state.subscriptionExpiresAt && state.subscriptionExpiresAt > new Date()) continue
    try {
      await subscribeToInbox(ownerId)
      results.push({ owner: String(ownerId), subscribed: true })
    } catch (err) {
      results.push({ owner: String(ownerId), error: err.message })
    }
  }
  return results
}

/**
 * Renews any inbox subscription expiring within RENEW_WITHIN_MS. Falls
 * back to creating a brand-new subscription if renewal itself fails
 * (e.g. Graph already expired/deleted it) rather than leaving that
 * user un-subscribed until some later pass notices again.
 */
async function renewExpiringSubscriptions () {
  const soon = new Date(Date.now() + RENEW_WITHIN_MS)
  const states = await LilyPadEmailSyncState.find({
    folder: 'inbox',
    subscriptionId: { $ne: '' },
    subscriptionExpiresAt: { $lte: soon }
  })

  const results = []
  for (const state of states) {
    try {
      await renewSubscription(state)
      results.push({ owner: String(state.owner), renewed: true })
    } catch (err) {
      try {
        await subscribeToInbox(state.owner)
        results.push({ owner: String(state.owner), resubscribed: true })
      } catch (err2) {
        results.push({ owner: String(state.owner), error: err2.message })
      }
    }
  }
  return results
}

/**
 * Called from the webhook controller after it's already ack'd Graph
 * with a 202 - looks up which owner each notification's subscriptionId
 * belongs to, verifies clientState (rejecting anything that doesn't
 * match rather than trusting the subscriptionId lookup alone), and runs
 * one delta sync per distinct owner regardless of how many individual
 * message notifications arrived in this batch.
 */
async function handleWebhookNotification (notifications) {
  const owners = new Set()
  for (const note of notifications || []) {
    if (!note.subscriptionId || !note.clientState) continue
    const state = await LilyPadEmailSyncState.findOne({ subscriptionId: note.subscriptionId })
    if (!state || note.clientState !== state.subscriptionClientState) continue
    owners.add(String(state.owner))
  }
  await Promise.allSettled(Array.from(owners).map((ownerId) => runDeltaSync(ownerId, 'inbox')))
}

async function runScheduledSync (winston) {
  const connectedIds = await microsoftCalendarService.getConnectedUserIds()

  for (const ownerId of connectedIds) {
    for (const folder of ['inbox', 'sentitems', 'archive']) {
      try {
        await runDeltaSync(ownerId, folder)
      } catch (err) {
        if (winston) winston.error(`Email sync failed for ${ownerId}/${folder}: ${err.message}`)
      }
    }
  }

  if (process.env.MICROSOFT_EMAIL_WEBHOOK_URL) {
    try {
      await ensureSubscriptionsForConnectedUsers()
    } catch (err) {
      if (winston) winston.error('ensureSubscriptionsForConnectedUsers failed: ' + err.message)
    }
    try {
      await renewExpiringSubscriptions()
    } catch (err) {
      if (winston) winston.error('renewExpiringSubscriptions failed: ' + err.message)
    }
  }
}

/**
 * Same setInterval/setTimeout pattern as salesforceSyncScheduler.js and
 * reminderEmailService.js - this is the fallback path (webhooks are the
 * fast path) so it only needs to run every several minutes, not
 * continuously.
 */
function startEmailSyncScheduler (winston) {
  const intervalMinutes = Number(process.env.EMAIL_SYNC_CHECK_MINUTES || 15)
  const intervalMs = Math.max(5 * 60 * 1000, intervalMinutes * 60 * 1000)

  if (winston) winston.info(`Email sync scheduler started (${intervalMinutes} minute interval).`)

  setInterval(() => {
    runScheduledSync(winston).catch((err) => {
      if (winston) winston.error('Scheduled email sync failed: ' + err.message)
    })
  }, intervalMs)

  setTimeout(() => {
    runScheduledSync(winston).catch((err) => {
      if (winston) winston.error('Initial email sync failed: ' + err.message)
    })
  }, 30000)
}

module.exports = {
  runDeltaSync,
  subscribeToInbox,
  ensureSubscriptionsForConnectedUsers,
  renewExpiringSubscriptions,
  handleWebhookNotification,
  runScheduledSync,
  startEmailSyncScheduler
}
