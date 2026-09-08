/**
 * LilyPad ERP - ProPublica Nonprofit Explorer Hook
 * Free, keyless fallback used only for Non-Profit sector runs: validates
 * that a prospected organization is a real 501(c) filer and pulls its
 * key officers from IRS Form 990 filings. Best-effort - a lookup miss
 * (name doesn't match, API hiccup) never fails the batch, it just leaves
 * nonProfitVerified: false on the staged lead.
 */

const axios = require('axios')
const winston = require('../logger')

const REQUEST_TIMEOUT_MS = 15000

function getProPublicaBaseUrl () {
  return (process.env.PROPUBLICA_BASE_URL || 'https://projects.propublica.org/nonprofits/api/v2').replace(/\/$/, '')
}

/**
 * Looks up an organization by name. Returns the best (first) match or
 * null if nothing came back - ProPublica's search is a simple keyword
 * match, not fuzzy/scored, so callers should treat this as "does a
 * plausible filer exist" rather than a guaranteed exact match.
 */
async function searchOrganizations (name) {
  const query = String(name || '').trim()
  if (!query) return null

  try {
    const response = await axios.get(`${getProPublicaBaseUrl()}/search.json`, {
      params: { q: query },
      timeout: REQUEST_TIMEOUT_MS
    })
    const organizations = (response.data && response.data.organizations) || []
    return organizations.length ? organizations[0] : null
  } catch (error) {
    winston.warn(`ProPublica search failed for "${query}": ${error.message}`)
    return null
  }
}

/**
 * Fetches full filing detail (including key officers, when the org's most
 * recent e-filed 990 discloses them) for a known EIN.
 */
async function getOrganization (ein) {
  const cleanEin = String(ein || '').trim()
  if (!cleanEin) return null

  try {
    const response = await axios.get(`${getProPublicaBaseUrl()}/organizations/${encodeURIComponent(cleanEin)}.json`, {
      timeout: REQUEST_TIMEOUT_MS
    })
    return response.data && response.data.organization ? response.data : null
  } catch (error) {
    winston.warn(`ProPublica organization lookup failed for EIN ${cleanEin}: ${error.message}`)
    return null
  }
}

/**
 * Convenience wrapper for leadProspectorService: given a company name,
 * returns { verified, ein, keyOfficers } - never throws.
 */
async function verifyNonProfit (companyName) {
  const match = await searchOrganizations(companyName)
  if (!match || !match.ein) {
    return { verified: false, ein: '', keyOfficers: [] }
  }

  const detail = await getOrganization(match.ein)
  const filings = (detail && detail.filings_with_data) || []
  const latestFiling = filings[0] || {}

  return {
    verified: true,
    ein: String(match.ein),
    subsectionCode: match.subseccd || null,
    keyOfficers: latestFiling.principal_officer_name ? [latestFiling.principal_officer_name] : []
  }
}

module.exports = {
  searchOrganizations,
  getOrganization,
  verifyNonProfit
}
