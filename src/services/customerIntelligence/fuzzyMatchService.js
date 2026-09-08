/**
 * LilyPad ERP - Fuzzy Company Matching
 * Nothing in this codebase resolves "the same real business" across
 * Leads/Orders/Cart orders/Tickets today - each source system spells a
 * company name differently ("Acme Inc", "ACME, Inc.", "acme llc"), and
 * only Orders/Opportunities have a real ID join to Salesforce Accounts.
 * This provides the normalization + similarity primitives
 * entityResolutionService.js needs to bridge everything else.
 */

const BUSINESS_SUFFIX_WORDS = new Set([
  'inc', 'incorporated', 'llc', 'lc', 'ltd', 'limited', 'corp', 'corporation',
  'co', 'company', 'llp', 'lp', 'pllc', 'pc', 'group', 'holdings', 'enterprises'
])

/**
 * "Acme Fog & Haze, Inc." -> "acme fog haze" - lowercased, punctuation
 * stripped, common legal-entity suffixes dropped, whitespace collapsed.
 * This is the string two different systems' spelling of the same company
 * should collapse to.
 */
function normalizeCompanyName (value) {
  const cleaned = String(value || '')
    .toLowerCase()
    // Apostrophes/quotes are removed outright (not space-replaced) so a
    // possessive collapses onto one token - "Froggy's" -> "froggys",
    // matching "Froggys" elsewhere - rather than splitting into
    // ["froggy", "s"], which would never match anything.
    .replace(/['"]/g, '')
    .replace(/[.,()&]/g, ' ')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .filter((word) => !BUSINESS_SUFFIX_WORDS.has(word))
    .join(' ')
    .trim()

  return cleaned
}

function normalizeDomain (value) {
  if (!value) return ''
  let v = String(value).trim().toLowerCase()
  if (v.includes('@')) v = v.split('@')[1] || ''
  return v.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].split('?')[0]
}

/**
 * Token-overlap (Jaccard) similarity between two normalized name strings
 * - simple, dependency-free, and adequate for short company names where
 * word order barely matters ("Fog Depot" vs "The Fog Depot Co").
 * Returns 0-1.
 */
function nameSimilarity (a, b) {
  const tokensA = new Set(normalizeCompanyName(a).split(' ').filter(Boolean))
  const tokensB = new Set(normalizeCompanyName(b).split(' ').filter(Boolean))
  if (!tokensA.size || !tokensB.size) return 0

  let intersection = 0
  for (const token of tokensA) {
    if (tokensB.has(token)) intersection++
  }
  const union = tokensA.size + tokensB.size - intersection
  return union === 0 ? 0 : intersection / union
}

/**
 * Threshold above which two names are treated as the same business for
 * matching purposes. Deliberately conservative (0.6) - a false match
 * silently merges two different companies' history, which is worse for
 * a sales recommendation than missing a real match (which just means
 * that record stays unlinked, still visible, not corrupted).
 */
const NAME_MATCH_THRESHOLD = 0.6

function isNameMatch (a, b) {
  return nameSimilarity(a, b) >= NAME_MATCH_THRESHOLD
}

module.exports = {
  normalizeCompanyName,
  normalizeDomain,
  nameSimilarity,
  isNameMatch,
  NAME_MATCH_THRESHOLD
}
