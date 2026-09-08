/**
 * LilyPad ERP - In-House Web Crawler
 * The shared engine behind every in-house discovery tier: whether a
 * candidate business URL came from a known directory (directoryAdapter),
 * a driven search form (formSearchAdapter), or a search-engine query
 * (webSearchAdapter), it ends up here to have its About/Team/Leadership/
 * Contact pages found and read. Playwright is used instead of a plain
 * HTTP fetch because most small-business sites (Squarespace, Wix,
 * WordPress page builders) render staff listings client-side - a raw
 * HTML GET would see an empty shell.
 *
 * Respects a lightweight subset of robots.txt (a global "User-agent: *"
 * Disallow list) before visiting any page - not a full parser, but
 * enough to honor the overwhelmingly common case for small sites and
 * avoid crawling paths a site has explicitly opted out of.
 */

const { chromium } = require('playwright')
const axios = require('axios')
const winston = require('../../../logger')

const NAV_TIMEOUT_MS = 20000
const MAX_KEY_PAGES_PER_SITE = 6
const MAX_CRAWL_DEPTH = 2
const MAX_SITE_CRAWL_MS = 45000
const MAX_PAGE_TEXT_CHARS = 20000
const USER_AGENT = 'Mozilla/5.0 (compatible; LilyPadProspector/1.0; +https://froggysfog.com)'
const PAGE_VISIT_DELAY_MS = 1000

const KEY_PAGE_KEYWORDS = [
  'about', 'team', 'staff', 'leadership', 'our-team', 'meet-the-team',
  'who-we-are', 'contact', 'management', 'department', 'directory', 'people', 'roster'
]

let browserPromise = null

function getBrowser () {
  if (!browserPromise) {
    browserPromise = chromium.launch({ headless: true })
  }
  return browserPromise
}

/** Call once when the process is shutting down, or between large batches to free memory. */
async function closeBrowser () {
  if (browserPromise) {
    const browser = await browserPromise
    await browser.close().catch(() => {})
    browserPromise = null
  }
}

function sleep (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const robotsCache = new Map()

function parseRobotsTxt (text) {
  const lines = String(text || '').split('\n').map((l) => l.trim())
  const disallow = []
  let inGlobalGroup = false
  for (const line of lines) {
    if (/^user-agent:\s*\*/i.test(line)) { inGlobalGroup = true; continue }
    if (/^user-agent:/i.test(line)) { inGlobalGroup = false; continue }
    if (inGlobalGroup) {
      const match = line.match(/^disallow:\s*(\S*)/i)
      if (match && match[1]) disallow.push(match[1])
    }
  }
  return { disallow }
}

async function getRobotsRules (origin) {
  if (robotsCache.has(origin)) return robotsCache.get(origin)
  let rules = { disallow: [] }
  try {
    const response = await axios.get(`${origin}/robots.txt`, { timeout: 5000, validateStatus: () => true })
    if (response.status === 200 && typeof response.data === 'string') {
      rules = parseRobotsTxt(response.data)
    }
  } catch (err) {
    // No robots.txt or unreachable - treat as "everything allowed" rather
    // than blocking a crawl over a network hiccup.
  }
  robotsCache.set(origin, rules)
  return rules
}

async function isUrlCrawlAllowed (urlString) {
  try {
    const url = new URL(urlString)
    const rules = await getRobotsRules(url.origin)
    return !rules.disallow.some((prefix) => prefix && url.pathname.startsWith(prefix))
  } catch (err) {
    return true
  }
}

/**
 * Scores a link's likelihood of being a real roster/contact page rather
 * than a merely-nearby page under the same section. An exact path-segment
 * match ("/about-us/people/" -> segment "people") is a much stronger
 * signal than a loose substring match, which otherwise lets an unrelated
 * page sharing a parent path - "/about-us/employment-at-the-alley/"
 * contains "about" - outscore the actual roster page.
 */
function scoreLinkForKeyPages (href, text) {
  let segments = []
  let words = []
  try {
    segments = new URL(href).pathname.toLowerCase().split('/').filter(Boolean)
    words = segments.flatMap((segment) => segment.split('-'))
  } catch (err) {
    // malformed URL - fall through with no segments, substring scoring below still applies
  }
  const linkText = text.toLowerCase()
  const linkTextWords = linkText.split(/\s+/)
  const haystack = `${href} ${text}`.toLowerCase()

  let score = 0
  for (const keyword of KEY_PAGE_KEYWORDS) {
    if (segments.includes(keyword) || words.includes(keyword)) score += 5
    else if (linkText === keyword || linkTextWords.includes(keyword)) score += 3
    else if (haystack.includes(keyword)) score += 1
  }
  return score
}

/** Strips hash fragments and trailing slashes so "#anchor" variants of a
 * page already visited don't waste a crawl slot on duplicate content. */
function normalizeUrlForDedup (urlString) {
  try {
    const url = new URL(urlString)
    url.hash = ''
    return url.toString().replace(/\/$/, '')
  } catch (err) {
    return urlString
  }
}

const MIN_REAL_PAGE_TEXT_CHARS = 40
const FALLBACK_NAV_TIMEOUT_MS = 8000

async function loadAndReadCurrentPage (page, url, waitUntil, timeoutMs) {
  try {
    await page.goto(url, { waitUntil, timeout: timeoutMs })
  } catch (err) {
    // A page with long-polling/websocket activity (chat widgets, live
    // ticket-availability updates) may never fully settle within the
    // timeout - fall back to whatever DOM state exists rather than
    // treating that as a hard failure. A genuine navigation failure
    // (DNS/connection errors, browser crash) still propagates.
    if (!/Timeout .* exceeded/i.test(err.message)) throw err
  }
  await page.waitForTimeout(400) // let any remaining client-rendered widgets settle

  const title = await page.title().catch(() => '')
  const text = await page.evaluate(() => (document.body ? document.body.innerText : '')).catch(() => '')

  return { url: page.url(), title, text: String(text || '').slice(0, MAX_PAGE_TEXT_CHARS) }
}

/**
 * Loads a page the fast way (domcontentloaded) first - correct for the
 * overwhelming majority of sites and far cheaper than waiting for full
 * network idle on every single page of every business. Only when that
 * comes back suspiciously empty AND redirected somewhere else (the
 * signature of a site bouncing through a session-sync hop, common with
 * ticketing platforms like Tessitura/AudienceView) does it pay the much
 * more expensive networkidle wait, and only once, with a shorter
 * dedicated timeout so one uncooperative site can't blow the crawl
 * budget for the whole business.
 */
async function readPageText (page, url) {
  if (!(await isUrlCrawlAllowed(url))) {
    winston.warn(`Crawler: skipping ${url} - disallowed by robots.txt`)
    return null
  }

  let result = await loadAndReadCurrentPage(page, url, 'domcontentloaded', NAV_TIMEOUT_MS)

  if (result.text.length < MIN_REAL_PAGE_TEXT_CHARS && result.url !== url) {
    winston.warn(`Crawler: ${url} bounced to ${result.url} with near-empty content, retrying with a network-idle wait`)
    try {
      result = await loadAndReadCurrentPage(page, url, 'networkidle', FALLBACK_NAV_TIMEOUT_MS)
    } catch (err) {
      winston.warn(`Crawler: network-idle retry of ${url} failed (${err.message}), keeping the bounced result`)
    }
  }

  return result
}

async function getRankedMatchingLinks (page, originToMatch) {
  const links = await page.$$eval('a[href]', (anchors) =>
    anchors.map((a) => ({ href: a.href, text: (a.innerText || '').trim() })).filter((l) => l.href)
  ).catch(() => [])

  return links
    .filter((l) => {
      try { return new URL(l.href).origin === originToMatch } catch (err) { return false }
    })
    .map((l) => ({ ...l, score: scoreLinkForKeyPages(l.href, l.text) }))
    .filter((l) => l.score > 0)
    .sort((a, b) => b.score - a.score)
}

/**
 * Breadth-first crawl of a business's site, following About/Team/
 * Leadership/Contact-looking links up to MAX_CRAWL_DEPTH hops and
 * MAX_KEY_PAGES_PER_SITE total pages. Depth > 1 matters in practice: a
 * lot of sites' "Staff & Board" link lands on a menu/index page (e.g.
 * "Executive Leadership / Board / Staff" as sub-links) rather than an
 * actual roster, so following one more level of matching links is
 * necessary to reach the page that actually names people.
 */
async function discoverKeyPages (baseUrl) {
  const browser = await getBrowser()
  const context = await browser.newContext({ userAgent: USER_AGENT })
  const page = await context.newPage()
  const pages = []
  // Hard ceiling on total wall-clock time for one business, independent of
  // per-page timeouts - a single uncooperative site (slow network-idle
  // fallbacks, a chain of redirects) must never stall an entire batch of
  // hundreds of businesses waiting behind it.
  const deadline = Date.now() + MAX_SITE_CRAWL_MS

  try {
    const home = await readPageText(page, baseUrl)
    if (!home) return []
    pages.push(home)

    const homeOrigin = new URL(home.url).origin
    const seen = new Set([normalizeUrlForDedup(home.url), normalizeUrlForDedup(baseUrl)])
    let frontier = (await getRankedMatchingLinks(page, homeOrigin))
      .filter((l) => !seen.has(normalizeUrlForDedup(l.href)))
      .map((l) => ({ href: l.href, depth: 1 }))

    while (frontier.length && pages.length < MAX_KEY_PAGES_PER_SITE && Date.now() < deadline) {
      const { href: target, depth } = frontier.shift()
      const normalizedTarget = normalizeUrlForDedup(target)
      if (seen.has(normalizedTarget)) continue
      seen.add(normalizedTarget)

      await sleep(PAGE_VISIT_DELAY_MS)
      try {
        const pageData = await readPageText(page, target)
        if (!pageData) continue
        pages.push(pageData)

        if (depth < MAX_CRAWL_DEPTH && pages.length < MAX_KEY_PAGES_PER_SITE) {
          const deeperLinks = (await getRankedMatchingLinks(page, homeOrigin))
            .filter((l) => !seen.has(normalizeUrlForDedup(l.href)))
            .map((l) => ({ href: l.href, depth: depth + 1 }))
          // Deeper links go to the front of the queue - once we're on a
          // page that scored as "Team"-like, its own sub-links (e.g. an
          // "Executive Leadership" page reached from a "Staff & Board"
          // hub) are more likely to be the real roster than other
          // same-depth candidates still waiting from the homepage.
          frontier = deeperLinks.concat(frontier)
        }
      } catch (err) {
        winston.warn(`Crawler: failed to visit ${target}: ${err.message}`)
      }
    }
  } finally {
    await context.close().catch(() => {})
  }

  return pages
}

/**
 * Visits a directory/listing page (LORT's theater list, a haunt
 * directory's search results, etc.) and returns the outbound links on
 * it - used by directoryAdapter.js to turn one known listing page into
 * many candidate business URLs, each of which then goes through
 * discoverKeyPages() individually.
 */
async function enumerateListingLinks (listingUrl, options) {
  const opts = options || {}
  const linkSelector = opts.linkSelector || 'a[href]'
  const excludeOwnDomain = Boolean(opts.excludeOwnDomain)

  const browser = await getBrowser()
  const context = await browser.newContext({ userAgent: USER_AGENT })
  const page = await context.newPage()

  try {
    if (!(await isUrlCrawlAllowed(listingUrl))) {
      winston.warn(`Crawler: skipping listing ${listingUrl} - disallowed by robots.txt`)
      return []
    }

    await page.goto(listingUrl, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT_MS })
    await page.waitForTimeout(500)

    const links = await page.$$eval(linkSelector, (anchors) =>
      anchors.map((a) => ({ href: a.href, text: (a.innerText || '').trim() })).filter((l) => l.href)
    ).catch(() => [])

    const listingOrigin = new URL(page.url()).origin
    const filtered = links.filter((l) => {
      try {
        const linkOrigin = new URL(l.href).origin
        return excludeOwnDomain ? linkOrigin !== listingOrigin : true
      } catch (err) {
        return false
      }
    })

    const seen = new Set()
    return filtered.filter((l) => {
      if (seen.has(l.href)) return false
      seen.add(l.href)
      return true
    })
  } finally {
    await context.close().catch(() => {})
  }
}

const FORM_RESULT_WAIT_MS = 2500

/**
 * Drives a real search form (fills text inputs, selects dropdown
 * options, clicks the submit control) and returns the links present on
 * whatever page results - used for directories whose actual listing
 * data only appears after a location/keyword search rather than being
 * present on a passive page load (confirmed necessary for the Roller
 * Skating Association's rink directory; Hauntworld's attraction data
 * turned out to need something deeper - reverse-engineering an AJAX
 * endpoint - so this alone doesn't unlock every interactive directory).
 *
 * `config`:
 *   textInputs: { cssSelector: value }
 *   selects: { cssSelector: labelOrValue }
 *   submitSelector: cssSelector for the button/input/link that triggers the search
 *   linkPattern: optional RegExp - only links whose href matches are returned
 *     (most directory result pages mix real listings with nav/footer/social
 *     links; a pattern on the result URL shape - e.g. a numeric listing id
 *     suffix - filters those out far more reliably than a keyword blocklist)
 */
async function submitFormAndCollectLinks (url, config) {
  const cfg = config || {}
  const browser = await getBrowser()
  const context = await browser.newContext({ userAgent: USER_AGENT })
  const page = await context.newPage()

  try {
    if (!(await isUrlCrawlAllowed(url))) {
      winston.warn(`Crawler: skipping form search ${url} - disallowed by robots.txt`)
      return []
    }

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT_MS })
    await page.waitForTimeout(500)

    for (const [selector, value] of Object.entries(cfg.textInputs || {})) {
      await page.fill(selector, value).catch((err) => {
        winston.warn(`Crawler: form field ${selector} not found/fillable on ${url}: ${err.message}`)
      })
    }

    for (const [selector, labelOrValue] of Object.entries(cfg.selects || {})) {
      await page.selectOption(selector, { label: labelOrValue }).catch(() =>
        page.selectOption(selector, labelOrValue).catch((err) => {
          winston.warn(`Crawler: select ${selector} not found/settable on ${url}: ${err.message}`)
        })
      )
    }

    await Promise.all([
      page.waitForLoadState('networkidle', { timeout: NAV_TIMEOUT_MS }).catch(() => {}),
      page.click(cfg.submitSelector, { timeout: 10000 })
    ])
    await page.waitForTimeout(FORM_RESULT_WAIT_MS)

    const links = await page.$$eval('a[href]', (anchors) =>
      anchors.map((a) => ({ href: a.href, text: (a.innerText || '').trim() })).filter((l) => l.href && l.text)
    ).catch(() => [])

    const matched = cfg.linkPattern ? links.filter((l) => cfg.linkPattern.test(l.href)) : links

    const seen = new Set()
    return matched.filter((l) => {
      if (seen.has(l.href)) return false
      seen.add(l.href)
      return true
    })
  } finally {
    await context.close().catch(() => {})
  }
}

module.exports = {
  discoverKeyPages,
  enumerateListingLinks,
  submitFormAndCollectLinks,
  closeBrowser
}
