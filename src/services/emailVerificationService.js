/**
 * LilyPad ERP - Email Verification Hook
 * Secondary verification for staged leads before a rep trusts an email
 * enough to promote it. Ships as a stub (no external call, no API key
 * required) - set EMAIL_VERIFIER_PROVIDER to "zerobounce" or
 * "millionverifier" plus the matching API key to switch to a real check.
 * Every implementation returns the same normalized shape so
 * leadProspectorService never needs to know which provider is active.
 */

const axios = require('axios')
const winston = require('../logger')

const REQUEST_TIMEOUT_MS = 15000

function getProvider () {
  return String(process.env.EMAIL_VERIFIER_PROVIDER || 'stub').trim().toLowerCase()
}

/**
 * No-op default: passes Apollo's own emailStatus straight through instead
 * of calling out to a paid verifier. This is the "stubbed" hook called
 * for in the spec - swap EMAIL_VERIFIER_PROVIDER to enable a real one.
 */
async function verifyWithStub (email, apolloEmailStatus) {
  return {
    provider: 'stub',
    result: apolloEmailStatus || 'unverified',
    checkedAt: new Date()
  }
}

async function verifyWithZeroBounce (email) {
  const apiKey = process.env.ZEROBOUNCE_API_KEY || ''
  if (!apiKey) throw new Error('ZEROBOUNCE_API_KEY is not configured.')

  try {
    const response = await axios.get('https://api.zerobounce.net/v2/validate', {
      params: { api_key: apiKey, email },
      timeout: REQUEST_TIMEOUT_MS
    })
    // ZeroBounce statuses: valid, invalid, catch-all, unknown, spamtrap, abuse, do_not_mail
    const status = response.data && response.data.status
    let normalized = 'unverified'
    if (status === 'valid') normalized = 'verified'
    else if (status === 'catch-all') normalized = 'catch_all'
    else if (status === 'invalid') normalized = 'invalid'
    return { provider: 'zerobounce', result: normalized, checkedAt: new Date() }
  } catch (error) {
    winston.warn(`ZeroBounce verification failed for ${email}: ${error.message}`)
    return { provider: 'zerobounce', result: 'unverified', checkedAt: new Date() }
  }
}

async function verifyWithMillionVerifier (email) {
  const apiKey = process.env.MILLIONVERIFIER_API_KEY || ''
  if (!apiKey) throw new Error('MILLIONVERIFIER_API_KEY is not configured.')

  try {
    const response = await axios.get('https://api.millionverifier.com/api/v3/', {
      params: { api: apiKey, email, timeout: 10 },
      timeout: REQUEST_TIMEOUT_MS
    })
    // MillionVerifier results: ok, catch_all, invalid, unknown, disposable
    const result = response.data && response.data.result
    let normalized = 'unverified'
    if (result === 'ok') normalized = 'verified'
    else if (result === 'catch_all') normalized = 'catch_all'
    else if (result === 'invalid') normalized = 'invalid'
    return { provider: 'millionverifier', result: normalized, checkedAt: new Date() }
  } catch (error) {
    winston.warn(`MillionVerifier verification failed for ${email}: ${error.message}`)
    return { provider: 'millionverifier', result: 'unverified', checkedAt: new Date() }
  }
}

/**
 * Single entry point leadProspectorService calls per staged lead with an
 * email. `apolloEmailStatus` is Apollo's own guess (verified/extrapolated/
 * unverified/catch_all), used as the stub's passthrough value.
 */
async function verifyEmail (email, apolloEmailStatus) {
  if (!email) return { provider: '', result: '', checkedAt: null }

  const provider = getProvider()
  if (provider === 'zerobounce') return verifyWithZeroBounce(email)
  if (provider === 'millionverifier') return verifyWithMillionVerifier(email)
  return verifyWithStub(email, apolloEmailStatus)
}

module.exports = { verifyEmail }
