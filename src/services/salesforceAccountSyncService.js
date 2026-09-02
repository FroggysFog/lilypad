/**
 * LilyPad ERP - Salesforce Account Sync
 * Queries Salesforce Accounts (companies) and upserts them into
 * LilyPadSalesforceAccount. Uses standard Account fields only - none of
 * these are custom fields, so this is less likely than Leads/Invoices to
 * need an org-specific override, but SF_ACCOUNTS_SOQL is supported anyway
 * for consistency with the other sync services.
 *
 * This org has ~125,000 Accounts total (66.7MB, the single largest
 * collection when MongoDB's storage quota was exhausted) - the vast
 * majority almost certainly belong to Smply/FrightProps, the other
 * brands sharing this Salesforce instance (same issue Orders had before
 * the owner/brand filter). Scoped the same way Past Due's Orders are.
 */

const { queryAllSalesforcePages, singleFlight } = require('./salesforceService')
const LilyPadSalesforceAccount = require('../models/lilypadSalesforceAccount')
const winston = require('../logger')
const { ALLOWED_OWNERS, EXCLUDED_ACCOUNT_PATTERN } = require('./brandFilter')

function soqlEscape (value) {
  return String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

const OWNER_IN_CLAUSE = ALLOWED_OWNERS.map((name) => `'${soqlEscape(name)}'`).join(',')

const DEFAULT_ACCOUNTS_SOQL = `
    SELECT Id, Name, Type, Industry, Phone, Website, Owner.Name,
           AnnualRevenue, NumberOfEmployees, Description,
           BillingStreet, BillingCity, BillingState, BillingPostalCode, BillingCountry,
           ShippingStreet, ShippingCity, ShippingState, ShippingPostalCode, ShippingCountry,
           CreatedDate, LastModifiedDate
    FROM Account
    WHERE Owner.Name IN (${OWNER_IN_CLAUSE})
      AND (NOT Name LIKE '%Fright Props%') AND (NOT Name LIKE '%FrightProps%')
    ORDER BY LastModifiedDate DESC
`

async function cleanupOutOfScopeAccounts () {
  const result = await LilyPadSalesforceAccount.deleteMany({
    $or: [
      { ownerName: { $nin: ALLOWED_OWNERS } },
      { name: EXCLUDED_ACCOUNT_PATTERN }
    ]
  })
  if (result.deletedCount) {
    winston.info(`Salesforce Account sync cleanup: removed ${result.deletedCount} out-of-scope accounts (other brand or unrecognized owner)`)
  }
  return result.deletedCount || 0
}

function normalizeAccountRecord (raw) {
  const source = raw && typeof raw === 'object' ? raw : {}
  const owner = source.Owner && typeof source.Owner === 'object' ? source.Owner : {}

  return {
    name: String(source.Name || '').trim(),
    type: String(source.Type || '').trim(),
    industry: String(source.Industry || '').trim(),
    phone: String(source.Phone || '').trim(),
    website: String(source.Website || '').trim(),
    ownerName: String(owner.Name || '').trim(),
    annualRevenue: Number(source.AnnualRevenue || 0),
    numberOfEmployees: Number(source.NumberOfEmployees || 0),
    billingAddress: {
      street: String(source.BillingStreet || '').trim(),
      city: String(source.BillingCity || '').trim(),
      state: String(source.BillingState || '').trim(),
      postalCode: String(source.BillingPostalCode || '').trim(),
      country: String(source.BillingCountry || '').trim()
    },
    shippingAddress: {
      street: String(source.ShippingStreet || '').trim(),
      city: String(source.ShippingCity || '').trim(),
      state: String(source.ShippingState || '').trim(),
      postalCode: String(source.ShippingPostalCode || '').trim(),
      country: String(source.ShippingCountry || '').trim()
    },
    description: String(source.Description || ''),
    sourceRecordId: String(source.Id || '').trim()
  }
}

async function syncSalesforceAccounts () {
  const removed = await cleanupOutOfScopeAccounts()
  const soql = (process.env.SF_ACCOUNTS_SOQL || '').trim() || DEFAULT_ACCOUNTS_SOQL
  let synced = 0
  let total = 0

  await queryAllSalesforcePages(soql, async (page) => {
    const normalized = page
      .map(normalizeAccountRecord)
      .filter((r) => r.sourceRecordId)

    total += normalized.length
    if (normalized.length) {
      const bulkResult = await LilyPadSalesforceAccount.bulkWrite(
        normalized.map((record) => ({
          updateOne: {
            filter: { sourceRecordId: record.sourceRecordId },
            update: { $set: { ...record, lastSyncAt: new Date() } },
            upsert: true
          }
        })),
        { ordered: false }
      )
      synced += (bulkResult.upsertedCount || 0) + (bulkResult.modifiedCount || 0)
    }
    winston.info(`Salesforce Account sync progress: ${total} accounts processed`)
  })

  return { synced, total, removed }
}

module.exports = {
  normalizeAccountRecord,
  syncSalesforceAccounts: singleFlight(syncSalesforceAccounts)
}
