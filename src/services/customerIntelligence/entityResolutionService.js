/**
 * LilyPad ERP - Entity Resolution
 * Builds one LilyPadCustomerProfile per Salesforce Account by joining in
 * everything else that might describe the same real business: Orders and
 * Opportunities via their clean accountId->sourceRecordId link, and
 * Leads/Cart.com orders/Tickets via domain or fuzzy company-name matching
 * (nothing in this codebase does that join today - see fuzzyMatchService.js).
 *
 * This is a full rebuild, not an incremental update - same "derive fresh
 * every run" pattern pastDueSyncService.js already uses for Past Due
 * Accounts. At this data's scale (thousands of accounts, not millions)
 * that's simpler and safer than maintaining incremental deltas.
 */

const LilyPadSalesforceAccount = require('../../models/lilypadSalesforceAccount')
const LilyPadCustomer = require('../../models/lilypadCustomer')
const LilyPadOrder = require('../../models/lilypadOrder')
const LilyPadOpportunity = require('../../models/lilypadOpportunity')
const LilyPadCartOrder = require('../../models/lilypadCartOrder')
const LilyPadTicket = require('../../models/lilypadTicket')
const LilyPadCustomerProfile = require('../../models/lilypadCustomerProfile')
const { normalizeCompanyName, normalizeDomain, isNameMatch } = require('./fuzzyMatchService')
const { summarizeProductMix } = require('./productCategoryService')
const winston = require('../../logger')

const ACTIVE_WINDOW_DAYS = 180
const CHURN_WINDOW_DAYS = 540
const MS_PER_DAY = 24 * 60 * 60 * 1000

function daysSince (date) {
  if (!date) return null
  return Math.floor((Date.now() - date.getTime()) / MS_PER_DAY)
}

function latestOf (dates) {
  const valid = dates.filter(Boolean)
  if (!valid.length) return null
  return new Date(Math.max(...valid.map((d) => d.getTime())))
}

/**
 * Order dates are synced as plain Salesforce date strings (YYYY-MM-DD),
 * not a Date type - $dateFromString with onError/onNull converts them
 * safely inside the aggregation instead of relying on lexicographic
 * $max/$min string comparison, which only happens to work if every
 * record's format is consistent.
 */
async function aggregateOrderStats (accountSourceIds) {
  const rows = await LilyPadOrder.aggregate([
    { $match: { accountId: { $in: accountSourceIds } } },
    {
      $addFields: {
        effectiveDateParsed: { $dateFromString: { dateString: '$effectiveDate', onError: null, onNull: null } }
      }
    },
    {
      $group: {
        _id: '$accountId',
        totalOrders: { $sum: 1 },
        lifetimeRevenue: { $sum: '$grandTotal' },
        openBalanceDue: { $sum: '$totalDue' },
        firstOrderDate: { $min: '$effectiveDateParsed' },
        lastOrderDate: { $max: '$effectiveDateParsed' },
        items: { $push: '$items' }
      }
    }
  ])

  return new Map(rows.map((row) => [row._id, {
    totalOrders: row.totalOrders,
    lifetimeRevenue: row.lifetimeRevenue || 0,
    openBalanceDue: row.openBalanceDue || 0,
    firstOrderDate: row.firstOrderDate,
    lastOrderDate: row.lastOrderDate,
    items: (row.items || []).flat()
  }]))
}

async function aggregateOpportunityStats (accountSourceIds) {
  const rows = await LilyPadOpportunity.aggregate([
    { $match: { accountId: { $in: accountSourceIds } } },
    {
      $addFields: {
        closeDateParsed: { $dateFromString: { dateString: '$closeDate', onError: null, onNull: null } }
      }
    },
    {
      $group: {
        _id: '$accountId',
        openCount: { $sum: { $cond: ['$isClosed', 0, 1] } },
        closedWonCount: { $sum: { $cond: ['$isWon', 1, 0] } },
        closedLostCount: { $sum: { $cond: [{ $and: ['$isClosed', { $eq: ['$isWon', false] }] }, 1, 0] } },
        totalWonAmount: { $sum: { $cond: ['$isWon', '$amount', 0] } },
        lastCloseDate: { $max: '$closeDateParsed' }
      }
    }
  ])

  return new Map(rows.map((row) => [row._id, {
    openCount: row.openCount,
    closedWonCount: row.closedWonCount,
    closedLostCount: row.closedLostCount,
    totalWonAmount: row.totalWonAmount || 0,
    lastCloseDate: row.lastCloseDate
  }]))
}

function firstToken (normalizedName) {
  return (normalizedName.split(' ')[0]) || ''
}

/**
 * Buckets records by the first token of their normalized name, so a
 * fuzzy match only has to compare against records sharing that token
 * instead of the whole collection - O(n) per lookup instead of O(n) per
 * account. Trades a small amount of recall (a match whose two names
 * happen to lead with different words, e.g. reordered) for keeping this
 * tractable at real data volumes.
 */
function buildNameBuckets (records, nameField) {
  const buckets = new Map()
  for (const record of records) {
    const normalized = normalizeCompanyName(record[nameField])
    if (!normalized) continue
    const token = firstToken(normalized)
    if (!buckets.has(token)) buckets.set(token, [])
    buckets.get(token).push({ ...record, _normalizedName: normalized })
  }
  return buckets
}

function findFuzzyMatches (normalizedName, buckets) {
  const bucket = buckets.get(firstToken(normalizedName)) || []
  return bucket.filter((record) => isNameMatch(normalizedName, record._normalizedName))
}

/**
 * Resolves matches for one account against one pre-indexed source
 * collection: domain match first (high confidence - email domain equals
 * the account's own website domain), fuzzy name match as fallback.
 * Returns { records, confidence }.
 */
function resolveMatches (domain, normalizedName, byDomain, nameBuckets) {
  if (domain && byDomain.has(domain)) {
    return { records: byDomain.get(domain), confidence: 'domain' }
  }
  if (normalizedName) {
    const matches = findFuzzyMatches(normalizedName, nameBuckets)
    if (matches.length) return { records: matches, confidence: 'fuzzy_name' }
  }
  return { records: [], confidence: 'none' }
}

async function buildLeadIndex () {
  const leads = await LilyPadCustomer.find({}).select('_id company email').lean()
  const byDomain = new Map()
  for (const lead of leads) {
    const domain = normalizeDomain(lead.email)
    if (!domain) continue
    if (!byDomain.has(domain)) byDomain.set(domain, [])
    byDomain.get(domain).push(lead)
  }
  return { byDomain, nameBuckets: buildNameBuckets(leads, 'company') }
}

async function buildCartOrderIndex () {
  const cartOrders = await LilyPadCartOrder.find({}).select('customerCompany customerEmail grandTotal orderedAt items').lean()
  const byDomain = new Map()
  for (const order of cartOrders) {
    const domain = normalizeDomain(order.customerEmail)
    if (!domain) continue
    if (!byDomain.has(domain)) byDomain.set(domain, [])
    byDomain.get(domain).push(order)
  }
  return { byDomain, nameBuckets: buildNameBuckets(cartOrders, 'customerCompany') }
}

async function buildTicketIndex () {
  const tickets = await LilyPadTicket.find({
    $or: [{ 'externalReporter.company': { $ne: '' } }, { 'externalReporter.email': { $ne: '' } }]
  }).select('externalReporter createdAt').lean()

  const byDomain = new Map()
  for (const ticket of tickets) {
    const domain = normalizeDomain(ticket.externalReporter && ticket.externalReporter.email)
    if (!domain) continue
    if (!byDomain.has(domain)) byDomain.set(domain, [])
    byDomain.get(domain).push(ticket)
  }

  const withCompany = tickets.map((t) => ({ ...t, company: (t.externalReporter && t.externalReporter.company) || '' }))
  return { byDomain, nameBuckets: buildNameBuckets(withCompany, 'company') }
}

function computeEngagementStatus ({ hasOrderHistory, daysSinceLastOrder, hasOpenOpportunity, hasLead }) {
  if (hasOpenOpportunity) return 'active'
  if (!hasOrderHistory) return hasLead ? 'lead_only' : 'never_purchased'
  if (daysSinceLastOrder === null) return 'dormant'
  if (daysSinceLastOrder <= ACTIVE_WINDOW_DAYS) return 'active'
  if (daysSinceLastOrder <= CHURN_WINDOW_DAYS) return 'dormant'
  return 'churned'
}

/**
 * `accountFilter`: optional Mongo query restricting which accounts get
 * (re)resolved - e.g. { industry: /haunt/i } to scope a rebuild to one
 * segment instead of the full backlog. Omit for a full rebuild.
 */
async function rebuildCustomerProfiles (accountFilter) {
  const accounts = await LilyPadSalesforceAccount.find(accountFilter || {})
    .select('_id name website industry sourceRecordId')
    .lean()

  if (!accounts.length) return { profilesBuilt: 0 }

  const accountSourceIds = accounts.map((a) => a.sourceRecordId).filter(Boolean)

  const [orderStatsByAccountId, oppStatsByAccountId, leadIndex, cartOrderIndex, ticketIndex] = await Promise.all([
    aggregateOrderStats(accountSourceIds),
    aggregateOpportunityStats(accountSourceIds),
    buildLeadIndex(),
    buildCartOrderIndex(),
    buildTicketIndex()
  ])

  const bulkOps = []

  for (const account of accounts) {
    const domain = normalizeDomain(account.website)
    const normalizedName = normalizeCompanyName(account.name)

    const leadMatch = resolveMatches(domain, normalizedName, leadIndex.byDomain, leadIndex.nameBuckets)
    const cartMatch = resolveMatches(domain, normalizedName, cartOrderIndex.byDomain, cartOrderIndex.nameBuckets)
    const ticketMatch = resolveMatches(domain, normalizedName, ticketIndex.byDomain, ticketIndex.nameBuckets)

    const orderStats = orderStatsByAccountId.get(account.sourceRecordId) || { totalOrders: 0, lifetimeRevenue: 0, openBalanceDue: 0, firstOrderDate: null, lastOrderDate: null, items: [] }
    const oppStats = oppStatsByAccountId.get(account.sourceRecordId) || { openCount: 0, closedWonCount: 0, closedLostCount: 0, totalWonAmount: 0, lastCloseDate: null }

    const cartRevenue = cartMatch.records.reduce((sum, o) => sum + (o.grandTotal || 0), 0)
    const cartLastDate = latestOf(cartMatch.records.map((o) => o.orderedAt))
    const cartItems = cartMatch.records.flatMap((o) => o.items || [])

    const productMix = summarizeProductMix([...orderStats.items, ...cartItems])

    const lastTicketDate = latestOf(ticketMatch.records.map((t) => t.createdAt))

    const mostRecentOrderLikeDate = latestOf([orderStats.lastOrderDate, cartLastDate])
    const daysSinceLastOrder = daysSince(mostRecentOrderLikeDate)
    const daysSinceLastContact = daysSince(latestOf([mostRecentOrderLikeDate, oppStats.lastCloseDate, lastTicketDate]))

    const hasOrderHistory = orderStats.totalOrders > 0 || cartMatch.records.length > 0
    const engagementStatus = computeEngagementStatus({
      hasOrderHistory,
      daysSinceLastOrder,
      hasOpenOpportunity: oppStats.openCount > 0,
      hasLead: leadMatch.records.length > 0
    })

    // Overall confidence is the weakest link actually used - if only the
    // ticket match came from fuzzy-name while lead/cart matched on
    // domain, a rep should still see "fuzzy" so they know to sanity-check.
    const confidences = [leadMatch, cartMatch, ticketMatch].filter((m) => m.records.length).map((m) => m.confidence)
    const matchConfidence = confidences.includes('fuzzy_name') ? 'fuzzy_name' : (confidences.includes('domain') ? 'domain' : 'none')

    bulkOps.push({
      updateOne: {
        filter: { salesforceAccountId: account._id },
        update: {
          $set: {
            salesforceAccountId: account._id,
            accountSourceRecordId: account.sourceRecordId,
            name: account.name || '',
            domain,
            industry: account.industry || '',
            matchedLeadIds: leadMatch.records.map((l) => l._id),
            matchConfidence,
            orderStats: {
              totalOrders: orderStats.totalOrders,
              lifetimeRevenue: orderStats.lifetimeRevenue,
              firstOrderDate: orderStats.firstOrderDate,
              lastOrderDate: orderStats.lastOrderDate,
              openBalanceDue: orderStats.openBalanceDue
            },
            opportunityStats: {
              openCount: oppStats.openCount,
              closedWonCount: oppStats.closedWonCount,
              closedLostCount: oppStats.closedLostCount,
              totalWonAmount: oppStats.totalWonAmount,
              lastCloseDate: oppStats.lastCloseDate
            },
            cartOrderStats: {
              totalOrders: cartMatch.records.length,
              lifetimeRevenue: cartRevenue,
              lastOrderDate: cartLastDate
            },
            ticketStats: {
              totalTickets: ticketMatch.records.length,
              lastTicketDate,
              matchConfidence: ticketMatch.confidence
            },
            productMix,
            daysSinceLastOrder,
            daysSinceLastContact,
            engagementStatus,
            lastResolvedAt: new Date()
          }
        },
        upsert: true
      }
    })
  }

  const BATCH_SIZE = 500
  let modified = 0
  let upserted = 0
  for (let i = 0; i < bulkOps.length; i += BATCH_SIZE) {
    const chunk = bulkOps.slice(i, i + BATCH_SIZE)
    const result = await LilyPadCustomerProfile.bulkWrite(chunk, { ordered: false })
    modified += result.modifiedCount || 0
    upserted += result.upsertedCount || 0
  }

  winston.info(`Entity resolution: rebuilt ${bulkOps.length} customer profiles (${upserted} new, ${modified} updated).`)
  return { profilesBuilt: bulkOps.length, upserted, modified }
}

module.exports = {
  rebuildCustomerProfiles,
  computeEngagementStatus
}
