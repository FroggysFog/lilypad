/**
 * LilyPad ERP - Per-User Microsoft Calendar Sync
 * Separate from services/microsoftTeams.js (a single shared, in-memory
 * connection) - this is one connection per LilyPad user, persisted to
 * Mongo (lilypadMicrosoftAccount.js), so the server can read/write any
 * connected person's calendar at any time regardless of who's currently
 * browsing. Reuses the same MICROSOFT_TENANT_ID/CLIENT_ID/CLIENT_SECRET
 * app registration as Teams, but needs its own redirect URI registered
 * in Azure (a second "Redirect URI" entry on the same App Registration)
 * and its own delegated scope (Calendars.ReadWrite) added there, since
 * an app's requested scopes must already exist on the registration
 * before a user can consent to them at OAuth time.
 */

const axios = require('axios')
const LilyPadMicrosoftAccount = require('../models/lilypadMicrosoftAccount')

const AUTHORITY = 'https://login.microsoftonline.com'
const GRAPH = 'https://graph.microsoft.com/v1.0'
const SCOPES = ['openid', 'profile', 'offline_access', 'User.Read', 'Calendars.ReadWrite']

function getConfig () {
  return {
    tenantId: process.env.MICROSOFT_TENANT_ID,
    clientId: process.env.MICROSOFT_CLIENT_ID,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    redirectUri: process.env.MICROSOFT_CALENDAR_REDIRECT_URI || 'http://localhost:8118/auth/microsoft-calendar/callback'
  }
}

function isConfigured () {
  const config = getConfig()
  return Boolean(config.tenantId && config.clientId && config.clientSecret)
}

function buildAuthorizationUrl (state) {
  if (!isConfigured()) throw new Error('Microsoft Calendar integration is not configured on the server.')

  const config = getConfig()
  const params = new URLSearchParams({
    client_id: config.clientId,
    response_type: 'code',
    redirect_uri: config.redirectUri,
    response_mode: 'query',
    scope: SCOPES.join(' '),
    state
  })

  return `${AUTHORITY}/${config.tenantId}/oauth2/v2.0/authorize?${params.toString()}`
}

async function exchangeCodeForUser (userId, code) {
  if (!isConfigured()) throw new Error('Microsoft Calendar integration is not configured on the server.')

  const config = getConfig()
  const tokenResponse = await axios.post(
    `${AUTHORITY}/${config.tenantId}/oauth2/v2.0/token`,
    new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      redirect_uri: config.redirectUri,
      grant_type: 'authorization_code',
      scope: SCOPES.join(' ')
    }).toString(),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  )

  const tokens = tokenResponse.data
  const me = await axios.get(`${GRAPH}/me`, { headers: { Authorization: `Bearer ${tokens.access_token}` } })

  await LilyPadMicrosoftAccount.findOneAndUpdate(
    { user: userId },
    {
      user: userId,
      msUserId: me.data.id,
      msEmail: me.data.mail || me.data.userPrincipalName || '',
      msDisplayName: me.data.displayName || '',
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || '',
      tokenExpiresAt: new Date(Date.now() + ((tokens.expires_in || 3600) - 60) * 1000),
      connectedAt: new Date()
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )
}

async function refreshTokenForAccount (account) {
  const config = getConfig()
  const response = await axios.post(
    `${AUTHORITY}/${config.tenantId}/oauth2/v2.0/token`,
    new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: account.refreshToken,
      grant_type: 'refresh_token',
      scope: SCOPES.join(' ')
    }).toString(),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  )

  const tokens = response.data
  account.accessToken = tokens.access_token
  account.refreshToken = tokens.refresh_token || account.refreshToken
  account.tokenExpiresAt = new Date(Date.now() + ((tokens.expires_in || 3600) - 60) * 1000)
  await account.save()
  return account.accessToken
}

async function ensureAccessToken (userId) {
  const account = await LilyPadMicrosoftAccount.findOne({ user: userId })
  if (!account || !account.refreshToken) {
    throw new Error('This user has not connected a Microsoft account.')
  }

  if (account.accessToken && account.tokenExpiresAt && Date.now() < account.tokenExpiresAt.getTime()) {
    return account.accessToken
  }

  return refreshTokenForAccount(account)
}

async function graphRequestForUser (userId, method, path, data) {
  const token = await ensureAccessToken(userId)
  const response = await axios({
    method,
    url: `${GRAPH}${path}`,
    data,
    headers: { Authorization: `Bearer ${token}` },
    validateStatus: (status) => status < 500
  })

  if (response.status >= 400) {
    const message = (response.data && response.data.error && response.data.error.message) || `Graph API error ${response.status}`
    const err = new Error(message)
    err.graphStatus = response.status
    throw err
  }

  return response.data
}

async function getStatus (userId) {
  const account = await LilyPadMicrosoftAccount.findOne({ user: userId })
  return {
    configured: isConfigured(),
    connected: Boolean(account && account.refreshToken),
    msEmail: account ? account.msEmail : '',
    connectedAt: account ? account.connectedAt : null
  }
}

async function disconnect (userId) {
  await LilyPadMicrosoftAccount.deleteOne({ user: userId })
}

async function getConnectedUserIds () {
  const accounts = await LilyPadMicrosoftAccount.find({ refreshToken: { $ne: '' } }, 'user')
  return accounts.map((a) => a.user)
}

function toGraphEventPayload ({ title, description, location, start, end, allDay }) {
  return {
    subject: title,
    body: { contentType: 'text', content: description || '' },
    location: { displayName: location || '' },
    isAllDay: Boolean(allDay),
    start: { dateTime: new Date(start).toISOString(), timeZone: 'UTC' },
    end: { dateTime: new Date(end).toISOString(), timeZone: 'UTC' }
  }
}

/**
 * Graph's calendarView expands recurring events into individual
 * occurrences within the range - exactly what a calendar grid needs to
 * render, unlike a plain /events list.
 */
async function getEventsForUser (userId, startISO, endISO) {
  const params = new URLSearchParams({
    startDateTime: startISO,
    endDateTime: endISO,
    $top: '250',
    $select: 'id,subject,bodyPreview,location,start,end,isAllDay'
  })
  const data = await graphRequestForUser(userId, 'get', `/me/calendarview?${params.toString()}`)
  return (data.value || []).map((e) => ({
    msEventId: e.id,
    title: e.subject || '(No title)',
    description: e.bodyPreview || '',
    location: (e.location && e.location.displayName) || '',
    start: e.start && e.start.dateTime ? `${e.start.dateTime}Z` : null,
    end: e.end && e.end.dateTime ? `${e.end.dateTime}Z` : null,
    allDay: Boolean(e.isAllDay)
  }))
}

async function createEventForUser (userId, eventFields) {
  const data = await graphRequestForUser(userId, 'post', '/me/events', toGraphEventPayload(eventFields))
  return data.id
}

async function updateEventForUser (userId, msEventId, eventFields) {
  await graphRequestForUser(userId, 'patch', `/me/events/${encodeURIComponent(msEventId)}`, toGraphEventPayload(eventFields))
}

async function deleteEventForUser (userId, msEventId) {
  try {
    await graphRequestForUser(userId, 'delete', `/me/events/${encodeURIComponent(msEventId)}`)
  } catch (err) {
    if (err.graphStatus !== 404) throw err // already gone is fine
  }
}

module.exports = {
  isConfigured,
  buildAuthorizationUrl,
  exchangeCodeForUser,
  getStatus,
  disconnect,
  getConnectedUserIds,
  getEventsForUser,
  createEventForUser,
  updateEventForUser,
  deleteEventForUser
}
