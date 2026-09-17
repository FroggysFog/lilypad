/**
 * LilyPad ERP - Shared Brand/Owner Filter
 * This Salesforce org is shared with other brands (Smply, FrightProps)
 * on the same instance. Records not owned by one of these Froggy's Fog
 * staff, or billed to an account matching FrightProps, belong to a
 * different brand and shouldn't sync into LilyPad. Shared by
 * pastDueSyncService.js (via Orders) and salesforceAccountSyncService.js
 * so the allowlist only needs updating in one place.
 */

const ALLOWED_OWNERS = [
  'Joey Olaerts',
  "Froggy's Fog",
  'Scott Lynd',
  'Katie Lane',
  'Eli Phipps',
  'Mitchell Wolf',
  'Chris Markgraf',
  'Adam Pogue'
]

const EXCLUDED_ACCOUNT_PATTERN = /fright\s*props/i

// Orders/Opportunities/Leads/Cart Orders have a much wider real Froggy's
// Fog staff roster than ALLOWED_OWNERS above (support staff, other sales
// reps who never own an Account) - reusing ALLOWED_OWNERS as a strict
// filter on those would wrongly drop plenty of real Froggy's Fog data.
// These three individuals are confirmed Smply (not Froggy's Fog) despite
// never appearing as an Account Owner, so they're excluded by name/alias
// instead of relying on an allowlist. Full names for Owner.Name-based
// fields (Orders, Opportunities, Cart Orders' salesPerson, Past Due's
// salesRep); short usernames for Lead.Owner.Alias.
const EXCLUDED_OWNER_NAMES = ['Graham Howell', 'David Campbell', 'George Zima']
const EXCLUDED_OWNER_ALIASES = ['ghowell', 'dcamp', 'gzima']

function isExcludedOwnerName (value) {
  const normalized = String(value || '').trim().toLowerCase()
  if (!normalized) return false
  return EXCLUDED_OWNER_NAMES.some((name) => name.toLowerCase() === normalized)
}

function isExcludedOwnerAlias (value) {
  const normalized = String(value || '').trim().toLowerCase()
  if (!normalized) return false
  return EXCLUDED_OWNER_ALIASES.includes(normalized)
}

module.exports = {
  ALLOWED_OWNERS,
  EXCLUDED_ACCOUNT_PATTERN,
  EXCLUDED_OWNER_NAMES,
  EXCLUDED_OWNER_ALIASES,
  isExcludedOwnerName,
  isExcludedOwnerAlias
}
