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

module.exports = {
  ALLOWED_OWNERS,
  EXCLUDED_ACCOUNT_PATTERN
}
