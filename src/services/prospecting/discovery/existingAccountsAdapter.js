/**
 * LilyPad ERP - Existing Account Refresh Adapter
 * Not a discovery source in the usual sense - instead of finding new
 * businesses, this re-points the exact same crawl -> extract -> stage
 * pipeline at accounts already in the CRM, refreshing stale contact
 * info rather than growing the list. A refreshed contact naturally
 * dedupes back to the SAME account through the existing domain-match
 * logic in leadProspectorService.findDuplicateMatch, since the crawled
 * domain IS that account's own website - no special-casing needed
 * downstream, which is why this adapter only has to produce candidate
 * URLs in the same shape every other adapter does.
 */

const LilyPadSalesforceAccount = require('../../../models/lilypadSalesforceAccount')

const DEFAULT_STALE_DAYS = Number(process.env.PROSPECTOR_REFRESH_STALE_DAYS || 90)
const MAX_ACCOUNTS_PER_RUN = 2000

function escapeRegExp (value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function normalizeWebsiteUrl (website) {
  const raw = String(website || '').trim()
  if (!raw) return null
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
}

/**
 * `filters.industryKeywords`: restricts to accounts whose name/industry/
 * description mentions any of these (e.g. ["haunt", "haunted attraction"])
 * - the batch's existing targetIndustry field feeds this. Empty/omitted
 * means "every account with a website," which is a much bigger, slower,
 * more expensive run - callers should pass keywords for a normal batch.
 * `filters.limit`: hard cap since each candidate costs a real crawl + LLM call.
 * `filters.staleDays`: skip accounts crawled more recently than this.
 */
async function discoverAccountsForRefresh (filters) {
  const opts = filters || {}
  const keywords = (opts.industryKeywords || []).map((k) => String(k).trim()).filter(Boolean)
  const limit = Math.min(MAX_ACCOUNTS_PER_RUN, Math.max(1, opts.limit || 200))
  const staleDays = Number.isFinite(opts.staleDays) ? opts.staleDays : DEFAULT_STALE_DAYS
  const staleCutoff = new Date(Date.now() - staleDays * 24 * 60 * 60 * 1000)

  const query = {
    website: { $exists: true, $ne: '' },
    $or: [
      { lastProspectorCrawlAt: { $exists: false } },
      { lastProspectorCrawlAt: null },
      { lastProspectorCrawlAt: { $lt: staleCutoff } }
    ]
  }

  if (keywords.length) {
    const patterns = keywords.map((k) => new RegExp(escapeRegExp(k), 'i'))
    query.$and = [{
      $or: [
        { name: { $in: patterns } },
        { industry: { $in: patterns } },
        { description: { $in: patterns } }
      ]
    }]
  }

  const accounts = await LilyPadSalesforceAccount.find(query)
    .select('_id name website industry sourceRecordId')
    .sort({ lastProspectorCrawlAt: 1 })
    .limit(limit)

  return accounts
    .map((account) => {
      const url = normalizeWebsiteUrl(account.website)
      if (!url) return null
      return {
        url,
        listingText: account.name,
        accountId: String(account._id),
        accountSourceRecordId: account.sourceRecordId,
        industry: account.industry || '',
        listingSource: 'Existing CRM account refresh'
      }
    })
    .filter(Boolean)
}

async function markAccountRefreshed (accountId) {
  if (!accountId) return
  await LilyPadSalesforceAccount.updateOne({ _id: accountId }, { $set: { lastProspectorCrawlAt: new Date() } })
}

module.exports = {
  discoverAccountsForRefresh,
  markAccountRefreshed
}
