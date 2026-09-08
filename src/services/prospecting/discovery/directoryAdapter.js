/**
 * LilyPad ERP - Directory Discovery Adapter (Tier 1)
 * Turns a known, public, purpose-built directory listing into a list of
 * candidate business URLs, using crawlerService's generic link
 * enumeration - no per-site CSS selectors to maintain, since directory
 * sites already put every listing's outbound link on the page.
 *
 * Each entry here was verified live before being added (see the
 * conversation history / commit notes) - confirmed the listing's real
 * data is present in the DOM on a passive page load, not behind a
 * search form a user has to drive first. Sites where that's NOT true
 * (Hauntworld's attraction search, the Roller Skating Association's
 * rink directory) need formSearchAdapter.js instead, which drives the
 * search interaction before reading results - not yet built.
 */

const { enumerateListingLinks } = require('../crawl/crawlerService')
const winston = require('../../../logger')

/**
 * `listingUrls`: one or more pages to enumerate (a single hub page for
 * most sources; FirefighterNow only needed one, but a source could list
 * several if it paginates as separate URLs rather than one big page).
 * `excludeOwnDomain`: drop links back to the directory's own site
 * (nav/social/footer links) - true for every source below since none of
 * them link to individual listings on their own domain.
 * `linkFilter`: optional extra predicate to drop known-noise links
 * (affiliate/job-board links, social media, etc.) that excludeOwnDomain
 * alone doesn't catch.
 */
const DIRECTORY_SOURCES = {
  theater_professional: {
    label: 'League of Resident Theatres (LORT) member theaters',
    listingUrls: ['https://lort.org/theatres'],
    excludeOwnDomain: true
  },
  fire_training: {
    label: 'FirefighterNow state-by-state fire academy directory',
    listingUrls: ['https://firefighternow.com/find-fire-academy/'],
    excludeOwnDomain: true,
    linkFilter: (link) => !/firejobs\.com/i.test(link.href)
  },
  childrens_museum: {
    label: "Association of Children's Museums - Find a Children's Museum",
    listingUrls: ['https://findachildrensmuseum.org/'],
    excludeOwnDomain: true,
    // This tool appears to render only a subset of its ~470 members on
    // initial load (likely a map-driven widget) rather than the full
    // roster - confirmed real museum links come back, just not
    // comprehensively. Treat as a partial source until a form-driven
    // version exists.
    linkFilter: (link) => !/childrensmuseums\.org/i.test(link.href) && !link.href.startsWith('mailto:')
  }
}

function getDirectorySource (vertical) {
  return DIRECTORY_SOURCES[vertical] || null
}

function listAvailableVerticals () {
  return Object.keys(DIRECTORY_SOURCES)
}

/**
 * Enumerates every candidate business URL for a vertical across all of
 * its configured listing pages, deduped by normalized href.
 */
async function discoverCandidateUrls (vertical) {
  const source = getDirectorySource(vertical)
  if (!source) {
    throw new Error(`No directory source configured for vertical "${vertical}". Available: ${listAvailableVerticals().join(', ')}`)
  }

  const seen = new Set()
  const candidates = []

  for (const listingUrl of source.listingUrls) {
    let links = []
    try {
      links = await enumerateListingLinks(listingUrl, { excludeOwnDomain: source.excludeOwnDomain })
    } catch (err) {
      winston.warn(`Directory adapter: failed to enumerate ${listingUrl} for vertical ${vertical}: ${err.message}`)
      continue
    }

    const filtered = source.linkFilter ? links.filter(source.linkFilter) : links
    for (const link of filtered) {
      if (seen.has(link.href)) continue
      seen.add(link.href)
      candidates.push({ url: link.href, listingText: link.text, vertical, listingSource: source.label })
    }
  }

  return candidates
}

module.exports = {
  getDirectorySource,
  listAvailableVerticals,
  discoverCandidateUrls
}
