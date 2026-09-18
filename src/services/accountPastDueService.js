/**
 * LilyPad ERP - Account 360 Past Due A/R
 * Joins a Salesforce Account to its overdue balances across both sync
 * sources sharing the lilypad_past_due_accounts collection. The Salesforce
 * leg is a clean two-hop exact-ID join; the Cart.com leg has no such ID
 * link (see lilypadCartOrder.js), so it reuses the same domain-first,
 * fuzzy-name-fallback matching lilypadSalesforceAccounts.js's
 * findMatchedCustomersForAccount already does for Leads - kept consistent
 * with whatever the account's "cartOrderStats" elsewhere on this page
 * already counts as this account's Cart.com orders, rather than risking a
 * customer seeing a cart order in Related Records but its overdue balance
 * excluded because a different matching pass was used.
 */

const LilyPadOrder = require('../models/lilypadOrder')
const LilyPadCartOrder = require('../models/lilypadCartOrder')
const LilyPadPastDueAccount = require('../models/lilypadPastDueAccount')
const { normalizeDomain, normalizeCompanyName, isNameMatch } = require('./customerIntelligence/fuzzyMatchService')

function escapeRegExp (value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function findMatchedCartOrderIds (account) {
  const domain = normalizeDomain(account.website)
  const projection = 'sourceRecordId'

  if (domain) {
    const byDomain = await LilyPadCartOrder.find({ customerEmail: new RegExp('@' + escapeRegExp(domain) + '$', 'i') })
      .select(projection)
      .lean()
    if (byDomain.length) return byDomain.map((o) => o.sourceRecordId)
  }

  const normalizedName = normalizeCompanyName(account.name)
  const firstToken = normalizedName.split(' ')[0]
  if (firstToken) {
    const candidates = await LilyPadCartOrder.find({ customerCompany: new RegExp(escapeRegExp(firstToken), 'i') })
      .select(`${projection} customerCompany`)
      .lean()
    const matched = candidates.filter((c) => isNameMatch(normalizedName, c.customerCompany))
    if (matched.length) return matched.map((o) => o.sourceRecordId)
  }

  return []
}

async function getPastDueForAccount (account) {
  const [sfOrderIds, cartOrderIds] = await Promise.all([
    LilyPadOrder.find({ accountId: account.sourceRecordId }).select('sourceRecordId').lean(),
    findMatchedCartOrderIds(account)
  ])

  const sfIds = sfOrderIds.map((o) => o.sourceRecordId).filter(Boolean)

  const records = await LilyPadPastDueAccount.find({
    $or: [
      { source: 'salesforce', sourceRecordId: { $in: sfIds } },
      { source: 'cart', sourceRecordId: { $in: cartOrderIds } }
    ]
  }).sort({ amountDue: -1 }).lean()

  return records
}

module.exports = { getPastDueForAccount }
