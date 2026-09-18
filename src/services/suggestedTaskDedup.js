/**
 * LilyPad ERP - Suggested Task Title Dedup
 * Shared by every pipeline that creates LilyPadSuggestedTask docs
 * (emailTriageExtractionService.js, teamsChatTriageService.js) - skips
 * creating a suggestion that closely restates one already pending from
 * the same source thread/chat, so a back-and-forth conversation where
 * each message freshly retypes basically the same ask doesn't spawn a
 * fresh, slightly differently-worded suggestion every time.
 */

const TITLE_SIMILARITY_THRESHOLD = 0.6

/**
 * Normalized bag-of-words overlap, relative to the smaller title - not
 * full Jaccard (divided by the union), since two titles of noticeably
 * different length describing the same ask (a terse restatement vs. a
 * fuller one) should still count as similar rather than being
 * penalized for the length difference.
 */
function titleWords (title) {
  return new Set(String(title || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean))
}

function isSimilarTitle (a, b) {
  const wordsA = titleWords(a)
  const wordsB = titleWords(b)
  if (!wordsA.size || !wordsB.size) return false
  let shared = 0
  wordsA.forEach((w) => { if (wordsB.has(w)) shared++ })
  return shared / Math.min(wordsA.size, wordsB.size) >= TITLE_SIMILARITY_THRESHOLD
}

module.exports = { titleWords, isSimilarTitle, TITLE_SIMILARITY_THRESHOLD }
