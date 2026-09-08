/**
 * LilyPad ERP - Email Pattern Deduction
 * First piece of the in-house replacement for Apollo's bulk_match email
 * reveal. Pure function, no network I/O - smtpVerifierService probes
 * these candidates against the domain's real mail server to find which
 * one (if any) actually exists.
 *
 * Pattern order is roughly frequency-ranked from observed B2B email
 * conventions (first.last@ and flast@ dominate), since each candidate
 * costs one SMTP round-trip against a server that may be rate-limited
 * or greylisted - cheapest-to-try-first matters here.
 */

const COMBINING_DIACRITICS_RANGE_START = 0x0300
const COMBINING_DIACRITICS_RANGE_END = 0x036f

function stripDiacritics (value) {
  let result = ''
  for (const ch of value.normalize('NFD')) {
    const code = ch.codePointAt(0)
    if (code >= COMBINING_DIACRITICS_RANGE_START && code <= COMBINING_DIACRITICS_RANGE_END) continue
    result += ch
  }
  return result
}

// e.g. "René" -> "rene", "Zoë" -> "zoe" - decomposes accented letters into
// base letter + combining mark, then drops the mark, so patterns generated
// for accented names still match plain-ASCII inbox naming conventions.
function cleanPart (value) {
  return stripDiacritics(String(value || '').toLowerCase())
    .replace(/[^a-z0-9]/g, '')
}

function normalizeDomain (value) {
  return String(value || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
}

/**
 * Returns ordered, deduped candidate addresses for a person at a domain.
 * Returns [] if there isn't enough information (no first name, or no
 * domain) to build a plausible candidate at all.
 */
function generateCandidateEmails (firstName, lastName, domain) {
  const first = cleanPart(firstName)
  const last = cleanPart(lastName)
  const cleanDomain = normalizeDomain(domain)
  if (!first || !cleanDomain) return []

  const localParts = [first]
  if (last) {
    const f = first[0]
    const l = last[0]
    localParts.push(
      `${first}.${last}`,
      `${first}${last}`,
      `${f}${last}`,
      `${first}${l}`,
      `${first}_${last}`,
      `${f}.${last}`,
      `${last}.${first}`,
      `${last}${first}`,
      last
    )
  }

  return Array.from(new Set(localParts))
    .filter(Boolean)
    .map((localPart) => `${localPart}@${cleanDomain}`)
}

module.exports = { generateCandidateEmails, cleanPart, normalizeDomain }
