/**
 * LilyPad ERP - Cart.com Connection Service
 * Ported from lilypad-hub's Cart.com OAuth2 integration. Cart.com's OAuth
 * exchange isn't a standard authorization_code grant - it's a signed
 * exchange: SHA256(appSecret + code + client_id + scope + redirect_uri),
 * all lowercased, POSTed as auth_id + signature (the code itself isn't
 * sent, only used in the signature). This part of the old prototype was
 * a specific, deterministic algorithm (not a guess), so it's ported as-is
 * with real credentials (App ID/Secret from the "LilyPad" Cart.com app)
 * instead of the placeholder client_id '12' it shipped with.
 *
 * What was NOT ported: the old prototype's order/customer-fetching code
 * brute-forced combinations of guessed base URLs (including an
 * AmeriCommerce subdomain guess), guessed endpoint paths, and five
 * different guessed auth header formats, with no confirmation any
 * specific combination worked. Rather than repeat that, cartRequest()
 * below just makes a single request the admin specifies, surfaced
 * through the Cart.com Explorer page - the same pattern the Salesforce
 * Explorer used to replace guessing at field names with actually looking
 * them up.
 *
 * Tokens persisted to LilyPadSetting, same pattern as Salesforce's.
 */

const crypto = require('crypto')
const axios = require('axios')
const LilyPadSetting = require('../models/lilypadSetting')

const SETTING_KEY = 'cartTokens'
const SCOPE = 'read_orders,read_customers,read_reports'
const REQUEST_TIMEOUT_MS = 30000

let cachedTokens = null

async function loadPersistedCartTokens () {
  if (cachedTokens) return cachedTokens
  const setting = await LilyPadSetting.findOne({ key: SETTING_KEY })
  cachedTokens = (setting && setting.value) || {}
  return cachedTokens
}

async function persistCartTokens (tokenData) {
  const current = await loadPersistedCartTokens()
  cachedTokens = {
    accessToken: tokenData.access_token || current.accessToken || '',
    refreshToken: tokenData.refresh_token || current.refreshToken || '',
    updatedAt: new Date().toISOString()
  }
  await LilyPadSetting.findOneAndUpdate(
    { key: SETTING_KEY },
    { value: cachedTokens },
    { upsert: true }
  )
  return cachedTokens
}

function getCartOAuthConfig () {
  return {
    storeUrl: (process.env.CART_STORE_URL || 'https://www.froggysfog.com').replace(/\/$/, ''),
    clientId: process.env.CART_APP_ID || '',
    appSecret: process.env.CART_APP_SECRET || '',
    callbackUrl: process.env.CART_CALLBACK_URL || 'http://localhost:8118/auth/cart/callback'
  }
}

function getCartAuthUrl () {
  const config = getCartOAuthConfig()
  if (!config.clientId) {
    throw new Error('Cart.com App ID is not configured. Add CART_APP_ID to the environment.')
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    scope: SCOPE,
    redirect_uri: config.callbackUrl
  })

  return `${config.storeUrl}/api/oauth?${params.toString()}`
}

async function exchangeCartCode (authId, code) {
  const config = getCartOAuthConfig()
  if (!config.clientId || !config.appSecret) {
    throw new Error('Cart.com Connected App is not fully configured.')
  }

  const signatureString = `${config.appSecret}${code}${config.clientId}${SCOPE}${config.callbackUrl}`.toLowerCase()
  const signature = crypto.createHash('sha256').update(signatureString).digest('hex')

  let response
  try {
    response = await axios.post(`${config.storeUrl}/api/oauth/access_token`, {
      client_id: config.clientId,
      auth_id: authId,
      signature
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: REQUEST_TIMEOUT_MS
    })
  } catch (error) {
    const details = error.response && error.response.data
      ? `: ${typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data)}`
      : ''
    throw new Error(`Cart.com token exchange failed${details || `: ${error.message}`}`)
  }

  const tokenData = response.data || {}
  if (!tokenData.access_token) {
    throw new Error('Cart.com OAuth token exchange failed: no access token in response.')
  }

  return persistCartTokens(tokenData)
}

async function getCartOAuthStatus () {
  const config = getCartOAuthConfig()
  const tokens = await loadPersistedCartTokens()
  return {
    configured: Boolean(config.clientId && config.appSecret),
    connected: Boolean(tokens.accessToken),
    storeUrl: config.storeUrl
  }
}

/**
 * Makes an authenticated GET against the connected Cart.com store using
 * whatever relative path is given (e.g. "/api/v1/orders.json"). Always
 * relative to the configured store - deliberately doesn't accept
 * absolute URLs, so this can't be used to reach anywhere but the
 * connected store even though it's exposed through an admin endpoint.
 */
async function cartRequest (path) {
  const config = getCartOAuthConfig()
  const tokens = await loadPersistedCartTokens()
  if (!tokens.accessToken) {
    throw new Error('Cart.com is not connected yet. Visit /auth/cart/connect to authorize.')
  }

  const cleanPath = String(path || '').trim()
  if (!cleanPath || !cleanPath.startsWith('/')) {
    throw new Error('Path must be a relative path starting with "/" (e.g. /api/v1/orders.json).')
  }

  try {
    const response = await axios.get(`${config.storeUrl}${cleanPath}`, {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
      timeout: REQUEST_TIMEOUT_MS
    })
    return { status: response.status, data: response.data }
  } catch (error) {
    const status = error.response && error.response.status
    const body = error.response && error.response.data
    throw new Error(`Cart.com request failed${status ? ` (${status})` : ''}: ${body ? JSON.stringify(body) : error.message}`)
  }
}

module.exports = {
  getCartOAuthConfig,
  getCartAuthUrl,
  exchangeCartCode,
  getCartOAuthStatus,
  cartRequest
}
