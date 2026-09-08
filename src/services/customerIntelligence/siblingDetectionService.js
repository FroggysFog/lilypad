/**
 * LilyPad ERP - Sibling / Multi-Location Detection
 * Finds groups of existing CustomerProfiles that are likely different
 * locations of the same operator - e.g. a haunt chain with a separate
 * Salesforce Account per city, all sharing one corporate website or
 * phone number. Surfacing these is the direct answer to "find new leads
 * tied to accounts we already have": if 1 of a chain's 4 locations has
 * ever ordered from us, the other 3 are a warm, already-half-qualified
 * lead, not a cold one.
 *
 * Two independent signals, since either alone under- or over-groups:
 *   - shared website domain (highest confidence - multiple SF Accounts
 *     pointing at the same domain almost certainly means one operator)
 *   - shared normalized phone number (catches chains that use one
 *     corporate phone across locations even when each location has its
 *     own distinct website, or no website at all)
 * A profile can belong to at most one sibling group per run - domain
 * grouping takes priority when a profile qualifies for both.
 */

const LilyPadCustomerProfile = require('../../models/lilypadCustomerProfile')
const LilyPadSalesforceAccount = require('../../models/lilypadSalesforceAccount')

function normalizePhone (phone) {
  const digits = String(phone || '').replace(/\D/g, '')
  // Drop a leading US country code so "15551234567" groups with "5551234567".
  return digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits
}

/**
 * Groups an array of {profileId, key} pairs by key, keeping only groups
 * with more than one member (a group of one isn't a sibling relationship).
 */
function groupByKey (entries) {
  const groups = new Map()
  for (const entry of entries) {
    if (!entry.key) continue
    if (!groups.has(entry.key)) groups.set(entry.key, [])
    groups.get(entry.key).push(entry.profileId)
  }
  for (const [key, ids] of groups) {
    if (ids.length < 2) groups.delete(key)
  }
  return groups
}

async function detectSiblingGroups () {
  const profiles = await LilyPadCustomerProfile.find({}).select('_id domain salesforceAccountId').lean()
  if (!profiles.length) return { groupsFound: 0, profilesGrouped: 0 }

  const accountIds = profiles.map((p) => p.salesforceAccountId)
  const accounts = await LilyPadSalesforceAccount.find({ _id: { $in: accountIds } }).select('_id phone').lean()
  const phoneByAccountId = new Map(accounts.map((a) => [String(a._id), normalizePhone(a.phone)]))

  const domainGroups = groupByKey(profiles.map((p) => ({ profileId: p._id, key: p.domain })))
  const alreadyGrouped = new Set()
  for (const ids of domainGroups.values()) {
    for (const id of ids) alreadyGrouped.add(String(id))
  }

  const phoneEntries = profiles
    .filter((p) => !alreadyGrouped.has(String(p._id)))
    .map((p) => ({ profileId: p._id, key: phoneByAccountId.get(String(p.salesforceAccountId)) }))
  const phoneGroups = groupByKey(phoneEntries)

  const bulkOps = []
  let profilesGrouped = 0

  for (const [domain, ids] of domainGroups) {
    for (const id of ids) {
      const siblings = ids.filter((otherId) => String(otherId) !== String(id))
      bulkOps.push({
        updateOne: {
          filter: { _id: id },
          update: { $set: { siblingGroupKey: `domain:${domain}`, siblingProfileIds: siblings } }
        }
      })
      profilesGrouped++
    }
  }

  for (const [phone, ids] of phoneGroups) {
    for (const id of ids) {
      const siblings = ids.filter((otherId) => String(otherId) !== String(id))
      bulkOps.push({
        updateOne: {
          filter: { _id: id },
          update: { $set: { siblingGroupKey: `phone:${phone}`, siblingProfileIds: siblings } }
        }
      })
      profilesGrouped++
    }
  }

  if (bulkOps.length) {
    await LilyPadCustomerProfile.bulkWrite(bulkOps, { ordered: false })
  }

  return { groupsFound: domainGroups.size + phoneGroups.size, profilesGrouped }
}

module.exports = { detectSiblingGroups }
