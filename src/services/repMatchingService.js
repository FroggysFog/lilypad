/**
 * LilyPad ERP - Sales Rep Matching
 * Resolves a logged-in LilyPadAccount to the Salesforce/Cart.com records
 * they own, for "My Accounts / My Pipeline" scoping. Salesforce and
 * Cart.com only ever gave us free-text owner names (ownerName,
 * salesPerson) - there's no id-based join - so the default match is a
 * case-insensitive exact match against the rep's fullname, with
 * LilyPadAccount.salesforceUserId as an admin-settable escape hatch for
 * reps whose LilyPad name and Salesforce owner display name diverge.
 */

const LilyPadSalesforceAccount = require('../models/lilypadSalesforceAccount')

function escapeRegExp (value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function exactNameFilter (fieldName, fullname) {
  const clean = String(fullname || '').trim()
  if (!clean) return null
  return { [fieldName]: new RegExp('^' + escapeRegExp(clean) + '$', 'i') }
}

// Builds an $or filter matching either the precise Salesforce Owner.Id
// (if the rep has one pinned) or their fullname against a free-text
// owner field. Returns a filter that matches nothing (never everything)
// when the rep has neither an id nor a usable name, so a broken account
// doesn't accidentally fall back to showing the whole org's data.
function buildOwnerFilter (user, idFieldName, nameFieldName) {
  const clauses = []
  if (user && user.salesforceUserId) {
    clauses.push({ [idFieldName]: user.salesforceUserId })
  }
  const nameClause = exactNameFilter(nameFieldName, user && user.fullname)
  if (nameClause) clauses.push(nameClause)
  return clauses.length ? { $or: clauses } : { _id: null }
}

function getOpportunityOwnerFilter (user) {
  return buildOwnerFilter(user, 'ownerSourceId', 'ownerName')
}

function getSalesforceAccountOwnerFilter (user) {
  return buildOwnerFilter(user, 'ownerSourceId', 'ownerName')
}

// Cart.com's salesPerson field has no Salesforce Id behind it - name-only.
function getCartOrderOwnerFilter (user) {
  const nameClause = exactNameFilter('salesPerson', user && user.fullname)
  return nameClause || { _id: null }
}

// LilyPadCustomerProfile is a derived/rebuilt rollup with no owner field
// of its own - it only links out via salesforceAccountId. Scoping it to
// a rep means first resolving which LilyPadSalesforceAccount docs that
// rep owns, then filtering profiles by that id set.
async function resolveOwnedSalesforceAccountIds (user) {
  const ids = await LilyPadSalesforceAccount.find(getSalesforceAccountOwnerFilter(user)).distinct('_id')
  return ids
}

module.exports = {
  getOpportunityOwnerFilter,
  getSalesforceAccountOwnerFilter,
  getCartOrderOwnerFilter,
  resolveOwnedSalesforceAccountIds
}
