/**
 * LilyPad ERP - Past Due Account Sync
 * Ported from lilypad-hub's server.js overdue-customer logic. Fetches
 * overdue invoice records from Salesforce (custom SOQL override, or a
 * Report ID, or a default query against a custom Invoice__c object -
 * whichever the org has configured via env vars) and upserts them into
 * LilyPadPastDueAccount.
 */

const { querySalesforce, fetchSalesforceReport } = require('./salesforceService')
const LilyPadPastDueAccount = require('../models/lilypadPastDueAccount')

const SALESFORCE_OVERDUE_REPORT_ID = process.env.SF_OVERDUE_REPORT_ID || ''
const SALESFORCE_OVERDUE_SOQL = process.env.SF_OVERDUE_SOQL || ''

function parseCurrencyLikeNumber (value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  const normalized = String(value || '').replace(/[^0-9.-]/g, '')
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

function normalizeIsoDate (value) {
  if (!value) return null
  const raw = String(value).trim()
  if (!raw) return null

  const direct = new Date(raw)
  if (!Number.isNaN(direct.getTime())) {
    return direct.toISOString().slice(0, 10)
  }

  return null
}

function computeDaysLateFromDate (dueDateValue, now) {
  const iso = normalizeIsoDate(dueDateValue)
  if (!iso) return 0
  const dueDate = new Date(`${iso}T00:00:00.000Z`)
  const diffMs = now.getTime() - dueDate.getTime()
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
}

function extractSalesforceReportRows (reportPayload) {
  const rows = []
  const payload = reportPayload && typeof reportPayload === 'object' ? reportPayload : {}
  const metadataColumns = (payload.reportMetadata && payload.reportMetadata.detailColumns) || []
  const detailInfo = (payload.reportExtendedMetadata && payload.reportExtendedMetadata.detailColumnInfo) || {}
  const factMap = payload.factMap || {}
  const bucket = factMap['T!T'] || {}
  const detailRows = Array.isArray(bucket.rows) ? bucket.rows : []

  for (const row of detailRows) {
    const cells = Array.isArray(row && row.dataCells) ? row.dataCells : []
    const mapped = {}

    metadataColumns.forEach((columnName, index) => {
      const info = detailInfo[columnName] || {}
      const cell = cells[index] || {}
      const keys = [
        columnName,
        String(info.label || ''),
        String(info.entityColumnName || '')
      ].map((key) => key.trim()).filter(Boolean)

      for (const key of keys) {
        mapped[key] = cell.value !== undefined && cell.value !== null ? cell.value : cell.label
      }
    })

    rows.push(mapped)
  }

  return rows
}

function pickAny (source, keys) {
  for (const key of keys) {
    const value = source[key]
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return value
    }
  }
  return null
}

function normalizeSalesforceOverdueRecord (raw, nowIso) {
  const source = raw && typeof raw === 'object' ? raw : {}
  const now = new Date(nowIso)

  const accountName = String(
    pickAny(source, ['Account.Name', 'ACCOUNT.NAME', 'Account Name', 'Name', 'ACCOUNT_NAME', 'Customer Name']) || 'Salesforce Account'
  ).trim()

  const amountDue = parseCurrencyLikeNumber(pickAny(source, [
    'Amount_Due__c', 'Balance_Due__c', 'Outstanding_Balance__c', 'Invoice_Amount__c', 'Amount', 'Past Due Amount', 'OVERDUE_AMOUNT'
  ]))

  const dueDateValue = normalizeIsoDate(pickAny(source, [
    'Due_Date__c', 'Invoice_Due_Date__c', 'Payment_Due_Date__c', 'Due Date', 'DUE_DATE'
  ]))

  const salesRep = String(pickAny(source, [
    'Owner.Name', 'Account.Owner.Name', 'Sales Rep', 'Owner', 'ACCOUNT_OWNER'
  ]) || 'Salesforce Owner').trim()

  const payerName = String(pickAny(source, [
    'Billing_Contact_Name__c', 'Payer_Name__c', 'Primary Contact', 'Contact Name'
  ]) || accountName).trim()

  const payerEmail = String(pickAny(source, [
    'Billing_Email__c', 'Payer_Email__c', 'Email', 'Contact Email'
  ]) || '').trim()

  const status = String(pickAny(source, ['AR_Status__c', 'Collection_Status__c', 'Status']) || '').trim()

  const sourceRecordId = String(pickAny(source, ['Id', 'ID', 'id']) || `${accountName}|${dueDateValue}|${amountDue}`).trim()

  return {
    accountName,
    amountDue,
    originalDueDate: dueDateValue,
    finalDueDate: dueDateValue,
    salesRep,
    payerName,
    payerEmail,
    orderNumber: String(pickAny(source, ['Order_Number__c', 'OrderNumber']) || '').trim(),
    poNumber: String(pickAny(source, ['PO_Number__c', 'PO Number']) || '').trim(),
    poDate: normalizeIsoDate(pickAny(source, ['PO_Date__c', 'PO Date'])),
    paymentMethod: String(pickAny(source, ['Payment_Method__c', 'Payment Method']) || '').trim(),
    status,
    sourceRecordId
  }
}

async function fetchSalesforceOverdueCustomers (options = {}) {
  const limit = Number(options.limit || 250)
  const nowIso = new Date().toISOString()

  const soqlOverride = String(options.soql || SALESFORCE_OVERDUE_SOQL || '').trim()
  const reportId = String(options.reportId || SALESFORCE_OVERDUE_REPORT_ID || '').trim()

  let sourceRows = []

  if (soqlOverride) {
    sourceRows = await querySalesforce(soqlOverride)
  } else if (reportId) {
    const reportPayload = await fetchSalesforceReport(reportId)
    sourceRows = extractSalesforceReportRows(reportPayload)
  } else {
    sourceRows = await querySalesforce(`
            SELECT Id, Name, Amount_Due__c, Due_Date__c, AR_Status__c,
                   Owner.Name, Billing_Contact_Name__c, Billing_Email__c
            FROM Invoice__c
            WHERE Amount_Due__c > 0
            ORDER BY Due_Date__c ASC
            LIMIT ${Math.max(1, Math.min(500, limit))}
        `)
  }

  return (Array.isArray(sourceRows) ? sourceRows : [])
    .map((row) => normalizeSalesforceOverdueRecord(row, nowIso))
    .filter((row) => Number(row.amountDue || 0) > 0)
    .slice(0, Math.max(1, Math.min(500, limit)))
}

/**
 * Pulls overdue accounts from Salesforce and upserts them into
 * LilyPadPastDueAccount by sourceRecordId. Preserves any locally-edited
 * payer info (payerEmail/payerPhone/payerNotes) unless Salesforce now has
 * a non-empty value for it.
 */
async function syncPastDueAccountsFromSalesforce (options = {}) {
  const records = await fetchSalesforceOverdueCustomers(options)
  let synced = 0

  for (const record of records) {
    const existing = await LilyPadPastDueAccount.findOne({ sourceRecordId: record.sourceRecordId })

    const update = {
      accountName: record.accountName,
      amountDue: record.amountDue,
      originalDueDate: record.originalDueDate,
      finalDueDate: record.finalDueDate,
      salesRep: record.salesRep,
      orderNumber: record.orderNumber,
      poNumber: record.poNumber,
      poDate: record.poDate,
      paymentMethod: record.paymentMethod,
      status: record.status,
      lastSyncAt: new Date()
    }

    // Don't clobber a payer email a staff member already filled in locally
    // if Salesforce doesn't have one.
    if (record.payerEmail || !(existing && existing.payerEmail)) {
      update.payerName = record.payerName
      if (record.payerEmail) update.payerEmail = record.payerEmail
    }

    await LilyPadPastDueAccount.findOneAndUpdate(
      { sourceRecordId: record.sourceRecordId },
      { $set: update, $setOnInsert: { sourceRecordId: record.sourceRecordId } },
      { upsert: true }
    )
    synced += 1
  }

  return { synced, total: records.length }
}

module.exports = {
  parseCurrencyLikeNumber,
  normalizeIsoDate,
  computeDaysLateFromDate,
  extractSalesforceReportRows,
  normalizeSalesforceOverdueRecord,
  fetchSalesforceOverdueCustomers,
  syncPastDueAccountsFromSalesforce
}
