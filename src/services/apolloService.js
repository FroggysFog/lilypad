/**
 * LilyPad ERP - Apollo.io API Client
 * Primary data provider for the Lead Prospector module. Mirrors the shape
 * of cartService.js (config-from-env + axios + wrapped errors), plus a
 * retry/backoff layer since Apollo deep runs page through thousands of
 * records and will hit its per-minute rate limit along the way.
 *
 * Apollo auth: current API accepts the key via the `X-Api-Key` header
 * (the older `api_key` body field still works on some plans, so it's sent
 * too as a harmless no-op fallback).
 */

const axios = require('axios')
const winston = require('../logger')

const REQUEST_TIMEOUT_MS = 30000
const MAX_RETRIES = 5
const BASE_BACKOFF_MS = 1000
const MAX_BACKOFF_MS = 30000

function getApolloConfig () {
  return {
    apiKey: process.env.APOLLO_API_KEY || '',
    baseUrl: (process.env.APOLLO_BASE_URL || 'https://api.apollo.io/v1').replace(/\/$/, '')
  }
}

function isApolloConfigured () {
  return Boolean(getApolloConfig().apiKey)
}

function sleep (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Retryable statuses: 429 (rate limited), and 500/502/503/504 (Apollo-side
 * transient failures). Anything else (400/401/403/404/422) is a caller
 * error and should surface immediately instead of being retried.
 */
const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504])

function computeBackoffMs (attempt, retryAfterHeader) {
  if (retryAfterHeader) {
    const seconds = Number(retryAfterHeader)
    if (!Number.isNaN(seconds) && seconds > 0) return Math.min(seconds * 1000, MAX_BACKOFF_MS)
  }
  const exponential = BASE_BACKOFF_MS * Math.pow(2, attempt)
  const jitter = Math.floor(Math.random() * 250)
  return Math.min(exponential + jitter, MAX_BACKOFF_MS)
}

/**
 * POSTs to an Apollo endpoint with exponential backoff on rate-limit /
 * transient errors. Used by both searchPeople and bulkEnrichPeople so
 * every external call in a deep run gets the same resilience.
 */
async function apolloPost (path, body) {
  const config = getApolloConfig()
  if (!config.apiKey) {
    throw new Error('Apollo.io is not configured. Add APOLLO_API_KEY to the environment.')
  }

  const cleanPath = String(path || '').trim()
  if (!cleanPath.startsWith('/')) {
    throw new Error('Apollo request path must start with "/".')
  }

  let lastError = null

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await axios.post(
        `${config.baseUrl}${cleanPath}`,
        { api_key: config.apiKey, ...body },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': config.apiKey
          },
          timeout: REQUEST_TIMEOUT_MS
        }
      )
      return response.data
    } catch (error) {
      const status = error.response && error.response.status
      const retryAfterHeader = error.response && error.response.headers && error.response.headers['retry-after']
      const bodyText = error.response && error.response.data
        ? (typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data))
        : error.message

      if (RETRYABLE_STATUSES.has(status) && attempt < MAX_RETRIES) {
        const backoffMs = computeBackoffMs(attempt, retryAfterHeader)
        winston.warn(`Apollo request to ${cleanPath} got ${status}, retrying in ${backoffMs}ms (attempt ${attempt + 1}/${MAX_RETRIES})`)
        await sleep(backoffMs)
        lastError = error
        continue
      }

      const wrapped = new Error(`Apollo.io request failed${status ? ` (${status})` : ''}: ${bodyText}`)
      wrapped.apolloStatus = status || null
      wrapped.retryable = RETRYABLE_STATUSES.has(status)
      throw wrapped
    }
  }

  const status = lastError && lastError.response && lastError.response.status
  throw new Error(`Apollo.io request failed after ${MAX_RETRIES} retries${status ? ` (last status ${status})` : ''}.`)
}

/**
 * Searches Apollo's mixed_people index. `filters` is the caller-normalized
 * shape produced by leadProspectorService's sector logic:
 *   { personTitles, personLocations, organizationLocations, keywordTags, organizationNumEmployeesRanges }
 * Returns { people, pagination: { page, perPage, totalEntries, totalPages } }.
 *
 * Uses /mixed_people/api_search, not the older /mixed_people/search -
 * confirmed live that the old one now hard-rejects API callers with a
 * 422 (SEARCH.ROUTING.LEGACY_PEOPLE_SEARCH_DEPRECATED). The replacement
 * isn't a drop-in swap: per Apollo's own docs for the new endpoint,
 * results come back with last_name_obfuscated instead of a real last
 * name and no email/phone at all - full details only exist after
 * bulkEnrichPeople() unlocks them (see apolloNormalizer.js, which now
 * prefers the enriched last name over this endpoint's obfuscated one).
 * q_organization_keyword_tags also isn't in the new endpoint's
 * documented parameter list, so industry keywords are folded into
 * q_keywords (a general keyword search, still supported) instead of
 * risking an unknown-parameter rejection.
 */
async function searchPeople (filters, page, perPage) {
  const f = filters || {}
  const body = {
    page: page || 1,
    per_page: Math.min(Math.max(perPage || 25, 1), 100)
  }

  if (f.personTitles && f.personTitles.length) body.person_titles = f.personTitles
  if (f.personLocations && f.personLocations.length) body.person_locations = f.personLocations
  if (f.organizationLocations && f.organizationLocations.length) body.organization_locations = f.organizationLocations
  if (f.organizationNumEmployeesRanges && f.organizationNumEmployeesRanges.length) {
    body.organization_num_employees_ranges = f.organizationNumEmployeesRanges
  }

  const keywordParts = [...(f.keywordTags || []), f.qKeywords].filter(Boolean)
  if (keywordParts.length) body.q_keywords = keywordParts.join(' ')

  const data = await apolloPost('/mixed_people/api_search', body)
  const people = Array.isArray(data.people) ? data.people : []
  // Never actually confirmed live which shape Apollo returns for this
  // field (the old endpoint's 422 meant a successful response was never
  // seen) - tolerate both a nested `pagination` object and top-level
  // total_entries/total_pages so this doesn't silently mis-paginate if
  // the assumption is wrong.
  const pagination = data.pagination || data

  return {
    people,
    pagination: {
      page: pagination.page || body.page,
      perPage: pagination.per_page || body.per_page,
      totalEntries: pagination.total_entries || 0,
      totalPages: pagination.total_pages || 1
    }
  }
}

/**
 * Unlocks verified emails/direct dials for a page of search results.
 * Apollo's bulk_match endpoint accepts up to 10 identifiers per call, so
 * this chunks internally - callers can pass any number of person records.
 */
async function bulkEnrichPeople (people) {
  const BULK_CHUNK_SIZE = 10
  const list = Array.isArray(people) ? people : []
  if (!list.length) return []

  const chunks = []
  for (let i = 0; i < list.length; i += BULK_CHUNK_SIZE) {
    chunks.push(list.slice(i, i + BULK_CHUNK_SIZE))
  }

  const enrichedResults = []
  for (const chunk of chunks) {
    const details = chunk.map((person) => ({
      id: person.id,
      first_name: person.first_name,
      last_name: person.last_name,
      organization_name: person.organization && person.organization.name
    }))

    const data = await apolloPost('/people/bulk_match', {
      details,
      reveal_personal_emails: true,
      reveal_phone_number: true
    })

    const matches = Array.isArray(data.matches) ? data.matches : []
    enrichedResults.push(...matches)
  }

  return enrichedResults
}

module.exports = {
  getApolloConfig,
  isApolloConfigured,
  searchPeople,
  bulkEnrichPeople
}
