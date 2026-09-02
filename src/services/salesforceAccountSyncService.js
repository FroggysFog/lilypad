/**
 * LilyPad ERP - Salesforce Account Sync
 * Queries Salesforce Accounts (companies) and upserts them into
 * LilyPadSalesforceAccount. Uses standard Account fields only - none of
 * these are custom fields, so this is less likely than Leads/Invoices to
 * need an org-specific override, but SF_ACCOUNTS_SOQL is supported anyway
 * for consistency with the other sync services.
 */

const { queryAllSalesforcePages } = require('./salesforceService')
const LilyPadSalesforceAccount = require('../models/lilypadSalesforceAccount')

const DEFAULT_ACCOUNTS_SOQL = `
    SELECT Id, Name, Type, Industry, Phone, Website, Owner.Name,
           AnnualRevenue, NumberOfEmployees, Description,
           BillingStreet, BillingCity, BillingState, BillingPostalCode, BillingCountry,
           ShippingStreet, ShippingCity, ShippingState, ShippingPostalCode, ShippingCountry,
           CreatedDate, LastModifiedDate
    FROM Account
    ORDER BY LastModifiedDate DESC
`

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
  const soql = (process.env.SF_ACCOUNTS_SOQL || '').trim() || DEFAULT_ACCOUNTS_SOQL
  let synced = 0
  let total = 0

  await queryAllSalesforcePages(soql, async (page) => {
    const normalized = page
      .map(normalizeAccountRecord)
      .filter((r) => r.sourceRecordId)

    total += normalized.length
    for (const record of normalized) {
      await LilyPadSalesforceAccount.findOneAndUpdate(
        { sourceRecordId: record.sourceRecordId },
        { $set: { ...record, lastSyncAt: new Date() } },
        { upsert: true }
      )
      synced += 1
    }
  })

  return { synced, total }
}

module.exports = {
  normalizeAccountRecord,
  syncSalesforceAccounts
}
