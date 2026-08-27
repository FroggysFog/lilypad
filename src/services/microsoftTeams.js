const axios = require('axios')
const crypto = require('crypto')

const AUTHORITY = 'https://login.microsoftonline.com'
const GRAPH = 'https://graph.microsoft.com/v1.0'
const SCOPES = ['openid', 'profile', 'offline_access', 'User.Read', 'Chat.ReadWrite', 'ChannelMessage.Read.All', 'ChannelMessage.Send']

let accessToken = null
let refreshToken = null
let tokenExpiresAt = 0
let oauthState = null

function getConfig () {
  return {
    tenantId: process.env.MICROSOFT_TENANT_ID,
    clientId: process.env.MICROSOFT_CLIENT_ID,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    redirectUri: process.env.MICROSOFT_REDIRECT_URI || 'http://localhost:8118/auth/microsoft/callback'
  }
}

function isConfigured () {
  const config = getConfig()
  return Boolean(config.tenantId && config.clientId && config.clientSecret)
}

function getStatus () {
  const config = getConfig()
  return {
    configured: isConfigured(),
    connected: Boolean(accessToken || refreshToken),
    redirectUri: config.redirectUri,
    scopes: SCOPES
  }
}

function getAuthorizationUrl () {
  if (!isConfigured()) throw new Error('Microsoft Teams integration is not configured')

  const config = getConfig()
  oauthState = crypto.randomBytes(24).toString('hex')
  const params = new URLSearchParams({
    client_id: config.clientId,
    response_type: 'code',
    redirect_uri: config.redirectUri,
    response_mode: 'query',
    scope: SCOPES.join(' '),
    state: oauthState
  })

  return `${AUTHORITY}/${config.tenantId}/oauth2/v2.0/authorize?${params.toString()}`
}

async function exchangeCode (code, state) {
  if (!code || !state || state !== oauthState) throw new Error('Invalid Microsoft OAuth state')
  if (!isConfigured()) throw new Error('Microsoft Teams integration is not configured')

  const config = getConfig()
  const response = await axios.post(
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

  setTokens(response.data)
  oauthState = null
}

function setTokens (tokens) {
  accessToken = tokens.access_token
  refreshToken = tokens.refresh_token || refreshToken
  tokenExpiresAt = Date.now() + ((tokens.expires_in || 3600) - 60) * 1000
}

async function ensureAccessToken () {
  if (accessToken && Date.now() < tokenExpiresAt) return accessToken
  if (!refreshToken) throw new Error('Microsoft Teams is not connected')

  const config = getConfig()
  const response = await axios.post(
    `${AUTHORITY}/${config.tenantId}/oauth2/v2.0/token`,
    new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
      scope: SCOPES.join(' ')
    }).toString(),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  )

  setTokens(response.data)
  return accessToken
}

async function graphRequest (method, path, data) {
  const token = await ensureAccessToken()
  const response = await axios({
    method,
    url: `${GRAPH}${path}`,
    data,
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

async function getChats () {
  const result = await graphRequest('get', '/me/chats?$expand=members&$top=50')
  return result.value || []
}

async function getMessages (chatId) {
  if (!chatId) throw new Error('Chat ID is required')
  const result = await graphRequest('get', `/chats/${encodeURIComponent(chatId)}/messages?$top=50`)
  return (result.value || []).reverse()
}

async function sendMessage (chatId, content) {
  if (!chatId || !content) throw new Error('Chat ID and message content are required')
  return graphRequest('post', `/chats/${encodeURIComponent(chatId)}/messages`, {
    body: { contentType: 'text', content }
  })
}

function disconnect () {
  accessToken = null
  refreshToken = null
  tokenExpiresAt = 0
}

module.exports = {
  disconnect,
  exchangeCode,
  getAuthorizationUrl,
  getChats,
  getMessages,
  getStatus,
  sendMessage
}
