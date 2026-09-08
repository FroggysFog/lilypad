/**
 * LilyPad ERP - Form-Driven Discovery Adapter (Tier 2)
 * For directories whose real listing data only appears after a
 * location/keyword search rather than being present on a passive page
 * load - confirmed necessary for the Roller Skating Association's rink
 * directory (live-tested: a bare page load shows an empty search form,
 * but filling in a city and clicking search returns real rinks with
 * name/address/owner/phone). Each source below is queried across a seed
 * list of major metros to approximate nationwide coverage, since the
 * search is radius-based (50mi as tested) rather than a full listing.
 *
 * Hauntworld's attraction search was investigated for this same tier
 * and does NOT belong here - driving its visible form just navigates to
 * the same thin per-state SEO pages already covered by directoryAdapter,
 * not a real result set. Its actual data likely lives behind an AJAX
 * endpoint that would need separate reverse-engineering (inspecting
 * network requests the form's JS makes) - not yet done.
 */

const { submitFormAndCollectLinks } = require('../crawl/crawlerService')
const winston = require('../../../logger')

// One major metro per state (plus DC) - approximates nationwide coverage
// at a 50-mile search radius. Not exhaustive for large/rural states, but
// a real, working starting point; denser seeding (2-3 cities per state)
// is a natural follow-up once this is validated against real batches.
const US_METRO_SEEDS = [
  'Birmingham, AL', 'Anchorage, AK', 'Phoenix, AZ', 'Little Rock, AR', 'Los Angeles, CA',
  'Denver, CO', 'Hartford, CT', 'Wilmington, DE', 'Washington, DC', 'Miami, FL',
  'Atlanta, GA', 'Honolulu, HI', 'Boise, ID', 'Chicago, IL', 'Indianapolis, IN',
  'Des Moines, IA', 'Wichita, KS', 'Louisville, KY', 'New Orleans, LA', 'Portland, ME',
  'Baltimore, MD', 'Boston, MA', 'Detroit, MI', 'Minneapolis, MN', 'Jackson, MS',
  'St. Louis, MO', 'Billings, MT', 'Omaha, NE', 'Las Vegas, NV', 'Manchester, NH',
  'Newark, NJ', 'Albuquerque, NM', 'New York, NY', 'Charlotte, NC', 'Fargo, ND',
  'Columbus, OH', 'Oklahoma City, OK', 'Portland, OR', 'Philadelphia, PA', 'Providence, RI',
  'Columbia, SC', 'Sioux Falls, SD', 'Nashville, TN', 'Dallas, TX', 'Houston, TX',
  'Salt Lake City, UT', 'Burlington, VT', 'Virginia Beach, VA', 'Seattle, WA', 'Charleston, WV',
  'Milwaukee, WI', 'Cheyenne, WY'
]

const FORM_SOURCES = {
  roller_rink: {
    label: 'Roller Skating Association rink directory (location search)',
    searchUrl: 'https://web.rollerskating.com/search',
    buildFormConfig: (metro) => ({
      textInputs: { '#content1_Directory1_DirectorySearch1_txtLocation': metro },
      submitSelector: '#content1_Directory1_DirectorySearch1_btnSimpleSearch',
      // Result pages are individual rink detail links shaped like
      // /SomeCategory/Rink-Name-12345 - the trailing numeric id reliably
      // distinguishes a real listing from nav/footer/social links.
      linkPattern: /web\.rollerskating\.com\/[^/]+\/[^/]+-\d+$/i
    }),
    seeds: US_METRO_SEEDS
  }
}

function getFormSource (vertical) {
  return FORM_SOURCES[vertical] || null
}

function listAvailableVerticals () {
  return Object.keys(FORM_SOURCES)
}

/**
 * Runs the source's search once per seed metro, deduping results by
 * href across all of them (the same rink often appears in multiple
 * overlapping 50-mile searches near state borders).
 */
async function discoverCandidateUrls (vertical) {
  const source = getFormSource(vertical)
  if (!source) {
    throw new Error(`No form-search source configured for vertical "${vertical}". Available: ${listAvailableVerticals().join(', ')}`)
  }

  const seen = new Set()
  const candidates = []

  for (const seed of source.seeds) {
    let links = []
    try {
      links = await submitFormAndCollectLinks(source.searchUrl, source.buildFormConfig(seed))
    } catch (err) {
      winston.warn(`Form search adapter: search for "${seed}" failed for vertical ${vertical}: ${err.message}`)
      continue
    }

    for (const link of links) {
      if (seen.has(link.href)) continue
      seen.add(link.href)
      candidates.push({ url: link.href, listingText: link.text, vertical, listingSource: `${source.label} (${seed})` })
    }
  }

  return candidates
}

module.exports = {
  getFormSource,
  listAvailableVerticals,
  discoverCandidateUrls
}
