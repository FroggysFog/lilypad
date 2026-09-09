/**
 * LilyPad ERP - ZIP Code Lookup Service
 * Resolves US ZIP codes to city/state so they can feed Apollo's
 * person_locations/organization_locations filters, which only accept
 * city/state/country strings - confirmed via Apollo's own API docs that
 * ZIP/postal codes and radius search aren't supported server-side, so the
 * radius expansion has to happen on our end before the request goes out.
 *
 * Backed by the `zipcodes` npm package (offline, bundled US ZIP dataset -
 * no network call, no API key, no rate limit) rather than a live
 * geocoding API, since ZIP resolution is now a required step of every
 * Apollo search and shouldn't depend on a third-party service being up.
 * Its dataset has occasional gaps (confirmed live: "02101", a PO-box-only
 * downtown Boston ZIP, isn't in it, while its neighbors like "02108" are) -
 * callers should treat an unresolved ZIP as "ask the user to try a nearby
 * one," not as evidence the whole ZIP is invalid.
 */

const zipcodes = require('zipcodes')

const ZIP_PATTERN = /^\d{5}$/
const DEFAULT_RADIUS_MILES = 25
const MAX_RADIUS_MILES = 100

function isValidZip (value) {
  return ZIP_PATTERN.test(String(value || '').trim())
}

/** Single ZIP -> { zip, city, state, country } or null if unresolvable. */
function lookupZip (zip) {
  const clean = String(zip || '').trim()
  if (!isValidZip(clean)) return null
  const result = zipcodes.lookup(clean)
  return result ? { zip: clean, city: result.city, state: result.state, country: result.country || 'US' } : null
}

/**
 * Expands one ZIP code into every "City, State" string within radiusMiles
 * (including the ZIP's own city) - the set Apollo's location filters can
 * actually search on. Deduped since a dense metro area's ZIPs mostly share
 * a handful of city names.
 */
function expandZipToLocations (zip, radiusMiles) {
  const center = lookupZip(zip)
  if (!center) return []

  const miles = Math.min(MAX_RADIUS_MILES, Math.max(1, Number(radiusMiles) || DEFAULT_RADIUS_MILES))
  const nearbyZips = zipcodes.radius(center.zip, miles) || []

  const locations = new Set([`${center.city}, ${center.state}`])
  for (const nearZip of nearbyZips) {
    const resolved = zipcodes.lookup(nearZip)
    if (resolved && resolved.city && resolved.state) {
      locations.add(`${resolved.city}, ${resolved.state}`)
    }
  }

  return Array.from(locations)
}

/**
 * Expands a list of ZIP codes into a deduped list of "City, State" strings.
 * Unresolvable ZIPs are collected separately so the caller can surface a
 * clear error instead of the search silently narrowing to nothing.
 */
function expandZipCodesToLocations (zipList, radiusMiles) {
  const zips = Array.isArray(zipList) ? zipList : []
  const locations = new Set()
  const unresolvedZips = []

  for (const rawZip of zips) {
    const clean = String(rawZip || '').trim()
    if (!clean) continue
    if (!isValidZip(clean)) {
      unresolvedZips.push(clean)
      continue
    }
    const expanded = expandZipToLocations(clean, radiusMiles)
    if (!expanded.length) {
      unresolvedZips.push(clean)
      continue
    }
    expanded.forEach((loc) => locations.add(loc))
  }

  return { locations: Array.from(locations), unresolvedZips }
}

module.exports = {
  DEFAULT_RADIUS_MILES,
  MAX_RADIUS_MILES,
  isValidZip,
  lookupZip,
  expandZipToLocations,
  expandZipCodesToLocations
}
