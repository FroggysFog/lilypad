/**
 * LilyPad ERP - Account Qualification & Tiering
 * Classifies a resolved customer profile into a worklist tier, purely
 * from data already synced from Salesforce/Cart.com. "Has a rep" means
 * the linked LilyPadSalesforceAccount already has a Salesforce Owner
 * (ownerName/ownerSourceId) - the exact definition repMatchingService.js
 * uses for "My Accounts" - so this never introduces a second,
 * competing source of truth for account ownership. This function never
 * writes anything itself; entityResolutionService.js's rebuild is the
 * only caller, and Owner is only ever changed by a rep's own explicit
 * claim (see lilypadCustomerIntelligence.js's claimAccount) or in
 * Salesforce directly - never by this classification.
 */

const QUALIFICATION_RULES = {
  MIN_LIFETIME_SPEND: 500,
  MIN_ORDER_COUNT: 5,
  INSTANT_QUALIFY_ORDER_AMOUNT: 1200
}

// ~18 months. Only ever used to flag a managed account as worth a
// rep's attention (see isDormant below) - never to touch its
// Salesforce Owner. Releasing a dormant account back to the pool is a
// human decision made from that flag, not an automatic one.
const DORMANT_MANAGED_DAYS = 548

/**
 * @param {object} input
 * @param {number} input.totalSpend - combined Salesforce Order + Cart.com order lifetime revenue
 * @param {number} input.orderCount - combined order count across both sources
 * @param {number} input.maxSingleOrderAmount - largest single order across both sources
 * @param {number|null} input.daysSinceLastOrder - from entityResolutionService's own computation
 * @param {boolean} input.hasActiveRep - whether the linked account already has a Salesforce Owner
 * @param {Date|null} input.previousFirstQualifiedAt - carried forward from the prior rebuild, if any
 */
function computeAccountTier ({ totalSpend, orderCount, maxSingleOrderAmount, daysSinceLastOrder, hasActiveRep, previousFirstQualifiedAt }) {
  const qualifies = totalSpend >= QUALIFICATION_RULES.MIN_LIFETIME_SPEND ||
    orderCount >= QUALIFICATION_RULES.MIN_ORDER_COUNT ||
    maxSingleOrderAmount >= QUALIFICATION_RULES.INSTANT_QUALIFY_ORDER_AMOUNT

  // Real Salesforce data shows every account gets an Owner at
  // creation (round-robin/default assignment), regardless of order
  // size - so "has an owner" is not evidence of a worked relationship,
  // and tier can't just mirror it or this filter would do nothing.
  // Tier is driven by qualification: a small, non-qualifying account
  // is self-serve (kept off worklists) even if Salesforce nominally
  // assigned it an owner - this never touches that Owner field, it
  // only affects LilyPad's own worklist visibility. A qualifying
  // account becomes 'managed' if it already has a real owner (that
  // relationship is respected, never reassigned), or 'available_pool'
  // if it genuinely has none yet, for a rep to claim.
  let accountTier
  if (!qualifies) {
    accountTier = 'self_serve'
  } else if (hasActiveRep) {
    accountTier = 'managed'
  } else {
    accountTier = 'available_pool'
  }

  const firstQualifiedAt = qualifies ? (previousFirstQualifiedAt || new Date()) : null

  // Surfaced only for a rep to see and act on manually (e.g. via the
  // reverse of the claim flow) - never acted on automatically here.
  const isDormant = accountTier === 'managed' && daysSinceLastOrder != null && daysSinceLastOrder >= DORMANT_MANAGED_DAYS

  return {
    accountTier,
    qualification: {
      qualifies,
      totalSpend,
      orderCount,
      maxSingleOrderAmount,
      firstQualifiedAt,
      isDormant
    }
  }
}

module.exports = { computeAccountTier, QUALIFICATION_RULES, DORMANT_MANAGED_DAYS }
