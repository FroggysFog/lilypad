/**
 * LilyPad ERP - Apify Google Maps Scraper Client
 * Real, verified API surface (not assumed from training knowledge -
 * checked live against Apify's own docs): actor `compass/crawler-
 * google-places`, run via its synchronous run-sync-get-dataset-items
 * endpoint, which executes the actor AND returns the resulting dataset
 * in one HTTP call - no separate poll-for-completion step needed, since
 * this is a small, bounded search (a handful to a few dozen results),
 * not the kind of large crawl Apollo/the in-house crawler pipeline are
 * built to paginate through.
 */

const axios = require('axios')

const ACTOR_RUN_URL = 'https://api.apify.com/v2/acts/compass~crawler-google-places/run-sync-get-dataset-items'
// The actor runs inline for this endpoint - a real search can take well
// over a minute, longer than this app's usual AI-call timeouts.
const REQUEST_TIMEOUT_MS = 180000

function getToken () {
  return process.env.APIFY_API_TOKEN || ''
}

function isApifyConfigured () {
  return Boolean(getToken())
}

/**
 * Returns the raw Apify dataset items array (real field names: title,
 * phone, city, state, postalCode, reviewsCount, totalScore, etc.) -
 * gmapsImporter.js's rowToLeadFields already expects this exact shape.
 *
 * Accepts multiple search terms in one call - Apify's actor already
 * supports a `searchStringsArray` natively, so a sector's whole curated
 * term list (e.g. "haunted house", "haunted trail", "screampark") runs
 * as one billed request, not one per term. `maxCrawledPlacesPerSearch`
 * applies PER search string though, so it's divided down to keep the
 * total roughly at `maxResults` instead of `maxResults * termCount`.
 */
async function searchGoogleMaps ({ searchTerm, searchTerms, location, maxResults = 25 }) {
  if (!isApifyConfigured()) throw new Error('Apify is not configured. Add APIFY_API_TOKEN to the environment.')

  const terms = (searchTerms && searchTerms.length ? searchTerms : [searchTerm]).filter(Boolean)
  const perTermCap = Math.max(5, Math.ceil(maxResults / Math.max(terms.length, 1)))

  const response = await axios.post(
    ACTOR_RUN_URL,
    {
      searchStringsArray: terms,
      locationQuery: location,
      maxCrawledPlacesPerSearch: Math.min(perTermCap, 200)
    },
    {
      params: { token: getToken() },
      timeout: REQUEST_TIMEOUT_MS
    }
  )

  return Array.isArray(response.data) ? response.data : []
}

module.exports = { isApifyConfigured, searchGoogleMaps }
