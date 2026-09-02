/**
 * LilyPad ERP - Salesforce Connection Service
 * Ported from lilypad-hub's services/salesforceService.js (OAuth Connected
 * App flow only - that project's legacy username/password branch isn't
 * used since Froggy's Fog's real org uses a Connected App).
 *
 * The one real change from the original: OAuth tokens are persisted to a
 * LilyPadSetting Mongo document instead of a local JSON file, since
 * Render's filesystem is wiped on every deploy outside the one disk
 * mounted for KB uploads (unrelated to this feature).
 */

const crypto = require('crypto')
const jsforce = require('jsforce')
const axios = require('axios')
const LilyPadSetting = require('../models/lilypadSetting')

const SETTING_KEY = 'salesforceTokens'

let cachedTokens = null

async function loadPersistedSalesforceTokens () {
  if (cachedTokens) return cachedTokens
  const setting = await LilyPadSetting.findOne({ key: SETTING_KEY })
  cachedTokens = (setting && setting.value) || {}
  return cachedTokens
}

async function persistSalesforceTokens (tokenData) {
  const current = await loadPersistedSalesforceTokens()
  cachedTokens = {
    accessToken: tokenData.access_token || current.accessToken || '',
    refreshToken: tokenData.refresh_token || current.refreshToken || '',
    instanceUrl: tokenData.instance_url || current.instanceUrl || '',
    updatedAt: new Date().toISOString()
  }
  await LilyPadSetting.findOneAndUpdate(
    { key: SETTING_KEY },
    { value: cachedTokens },
    { upsert: true }
  )
  return cachedTokens
}

function toBase64Url (value) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function generateSalesforcePkcePair () {
  const verifier = crypto.randomBytes(32).toString('base64url')
  const challenge = toBase64Url(crypto.createHash('sha256').update(verifier).digest())
  return { verifier, challenge }
}

function getSalesforceOAuthConfig () {
  const clientId = process.env.SF_CLIENT_ID || process.env.SF_CONSUMER_KEY || ''
  const clientSecret = process.env.SF_CLIENT_SECRET || process.env.SF_CONSUMER_SECRET || ''

  return {
    loginUrl: process.env.SF_LOGIN_URL || 'https://login.salesforce.com',
    authUrl: process.env.SF_AUTH_URL || 'https://login.salesforce.com/services/oauth2/authorize',
    tokenUrl: process.env.SF_TOKEN_URL || 'https://login.salesforce.com/services/oauth2/token',
    clientId,
    clientSecret,
    callbackUrl: process.env.SF_CALLBACK_URL || 'http://localhost:8118/auth/salesforce/callback'
  }
}

function getSalesforceAuthUrl (options = {}) {
  const config = getSalesforceOAuthConfig()
  if (!config.clientId) {
    throw new Error('Salesforce OAuth client ID is not configured. Add SF_CLIENT_ID to the environment.')
  }

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId,
    redirect_uri: config.callbackUrl,
    scope: 'api refresh_token',
    code_challenge_method: 'S256'
  })

  if (options.codeChallenge) {
    params.set('code_challenge', options.codeChallenge)
  }

  return `${config.authUrl}?${params.toString()}`
}

async function exchangeSalesforceCode (code, codeVerifier) {
  const config = getSalesforceOAuthConfig()
  if (!config.clientId || !config.clientSecret) {
    throw new Error('Salesforce OAuth Connected App is not fully configured.')
  }

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: config.callbackUrl
  })

  if (codeVerifier) {
    params.set('code_verifier', codeVerifier)
  }

  const response = await axios.post(config.tokenUrl, params.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json'
    }
  })

  const tokenData = response.data || {}
  if (!tokenData.access_token) {
    throw new Error('Salesforce OAuth token exchange failed.')
  }

  return persistSalesforceTokens(tokenData)
}

async function refreshSalesforceToken (refreshToken) {
  const config = getSalesforceOAuthConfig()
  if (!config.clientId || !config.clientSecret || !refreshToken) {
    throw new Error('Salesforce OAuth refresh token is not configured.')
  }

  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: config.clientId,
    client_secret: config.clientSecret
  })

  const response = await axios.post(config.tokenUrl, params.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json'
    }
  })

  const tokenData = response.data || {}
  if (!tokenData.access_token) {
    throw new Error('Salesforce token refresh failed.')
  }

  return persistSalesforceTokens({ ...tokenData, refresh_token: refreshToken })
}

async function getSalesforceOAuthStatus () {
  const config = getSalesforceOAuthConfig()
  const tokens = await loadPersistedSalesforceTokens()
  return {
    configured: Boolean(config.clientId && config.clientSecret),
    connected: Boolean(tokens.accessToken || tokens.refreshToken),
    instanceUrl: tokens.instanceUrl || '',
    loginUrl: config.loginUrl
  }
}

/**
 * Initializes and returns an authenticated Salesforce connection.
 */
async function getSalesforceConnection () {
  const config = getSalesforceOAuthConfig()
  if (!config.clientId || !config.clientSecret) {
    throw new Error('Salesforce Connected App is not configured. Add SF_CLIENT_ID and SF_CLIENT_SECRET.')
  }

  const tokens = await loadPersistedSalesforceTokens()
  if (!tokens.accessToken && !tokens.refreshToken) {
    throw new Error('Salesforce Connected App is configured, but no OAuth token exists yet. Complete the OAuth authorization flow by visiting /auth/salesforce/connect.')
  }

  if (tokens.accessToken) {
    return new jsforce.Connection({
      loginUrl: config.loginUrl,
      instanceUrl: tokens.instanceUrl || undefined,
      accessToken: tokens.accessToken
    })
  }

  const refreshed = await refreshSalesforceToken(tokens.refreshToken)
  return new jsforce.Connection({
    loginUrl: config.loginUrl,
    instanceUrl: refreshed.instanceUrl || undefined,
    accessToken: refreshed.accessToken
  })
}

/**
 * Executes a SOQL query against Salesforce.
 */
async function querySalesforce (soqlQuery) {
  try {
    const conn = await getSalesforceConnection()
    const result = await conn.query(soqlQuery)
    return result.records
  } catch (error) {
    const details = error.response && error.response.data
      ? `: ${typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data)}`
      : ''
    throw new Error(`Salesforce query failed${details || `: ${error.message}`}`)
  }
}

async function queryAllSalesforce (soqlQuery) {
  const conn = await getSalesforceConnection()
  const records = []
  let result = await conn.query(soqlQuery)
  records.push(...(result.records || []))

  while (!result.done && result.nextRecordsUrl) {
    result = await conn.queryMore(result.nextRecordsUrl)
    records.push(...(result.records || []))
  }

  return records
}

/**
 * Same pagination as queryAllSalesforce, but invokes onPage per batch
 * (Salesforce's own page size, ~2000 records) instead of accumulating
 * every record in memory before returning. Use this for objects that can
 * grow large (e.g. Orders) so a sync processes and upserts one page at a
 * time rather than holding the whole result set at once.
 */
async function queryAllSalesforcePages (soqlQuery, onPage) {
  const conn = await getSalesforceConnection()
  let result = await conn.query(soqlQuery)
  await onPage(result.records || [])

  while (!result.done && result.nextRecordsUrl) {
    result = await conn.queryMore(result.nextRecordsUrl)
    await onPage(result.records || [])
  }
}

/**
 * Fetches a Salesforce report payload including detailed rows.
 */
async function fetchSalesforceReport (reportId) {
  const id = String(reportId || '').trim()
  if (!id) {
    throw new Error('Salesforce report id is required.')
  }

  const conn = await getSalesforceConnection()
  const apiVersion = conn.version || '58.0'
  const path = `/services/data/v${apiVersion}/analytics/reports/${encodeURIComponent(id)}?includeDetails=true`
  return conn.request(path)
}

/**
 * Lists every sObject in the org (name, label, custom/standard, queryable),
 * so admins can find the real object holding data (invoices, AR, etc.)
 * instead of guessing field/object API names.
 */
async function describeGlobalSalesforce () {
  const conn = await getSalesforceConnection()
  const result = await conn.describeGlobal()
  return (result.sobjects || [])
    .filter((obj) => obj.queryable)
    .map((obj) => ({
      name: obj.name,
      label: obj.label,
      custom: Boolean(obj.custom),
      keyPrefix: obj.keyPrefix || ''
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

/**
 * Describes one sObject's fields (API name, label, type) so an admin can
 * see exactly what's queryable before writing a SOQL sync.
 */
async function describeSalesforceObject (objectName) {
  const conn = await getSalesforceConnection()
  const result = await conn.sobject(objectName).describe()
  return {
    name: result.name,
    label: result.label,
    fields: (result.fields || []).map((f) => ({
      name: f.name,
      label: f.label,
      type: f.type,
      custom: Boolean(f.custom),
      referenceTo: f.referenceTo || []
    }))
  }
}

/**
 * Pulls a handful of sample rows for an object using its simple
 * (non-compound) fields, so an admin can see real data before deciding
 * this is the right object/fields for a sync query.
 */
async function previewSalesforceObject (objectName, options = {}) {
  const limit = Math.max(1, Math.min(10, Number(options.limit || 5)))
  const described = await describeSalesforceObject(objectName)

  const SKIP_TYPES = new Set(['address', 'location', 'base64'])
  const fieldNames = described.fields
    .filter((f) => !SKIP_TYPES.has(f.type))
    .slice(0, 30)
    .map((f) => f.name)

  if (!fieldNames.length) {
    return { object: described.name, fields: [], rows: [] }
  }

  const soql = `SELECT ${fieldNames.join(', ')} FROM ${described.name} LIMIT ${limit}`
  const rows = await querySalesforce(soql)
  return { object: described.name, fields: fieldNames, rows, soql }
}

module.exports = {
  getSalesforceConnection,
  querySalesforce,
  queryAllSalesforce,
  queryAllSalesforcePages,
  fetchSalesforceReport,
  describeGlobalSalesforce,
  describeSalesforceObject,
  previewSalesforceObject,
  getSalesforceAuthUrl,
  generateSalesforcePkcePair,
  exchangeSalesforceCode,
  getSalesforceOAuthStatus,
  refreshSalesforceToken
}
