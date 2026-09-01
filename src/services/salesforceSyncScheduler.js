/**
 * LilyPad ERP - Salesforce Sync Scheduler
 * Periodically pulls Customers/Leads, Past Due Invoices, Orders,
 * Accounts, and Opportunities from Salesforce into local Mongo
 * collections, so the app has an up-to-date local copy without anyone
 * having to click each page's "Sync" button. Same setInterval/setTimeout
 * pattern as reminderEmailService's startReminderScheduler.
 */

const { getSalesforceOAuthStatus } = require('./salesforceService')
const { syncCustomersFromSalesforce } = require('./customerSyncService')
const { syncPastDueAccountsFromSalesforce } = require('./pastDueSyncService')
const { syncOrdersFromSalesforce } = require('./orderSyncService')
const { syncSalesforceAccounts } = require('./salesforceAccountSyncService')
const { syncOpportunitiesFromSalesforce } = require('./opportunitySyncService')

const SYNC_JOBS = [
  { name: 'Customers', run: syncCustomersFromSalesforce },
  // Orders must run before Past Due Accounts - past due records are now
  // derived from synced Order data instead of a separate Salesforce query.
  { name: 'Orders', run: syncOrdersFromSalesforce },
  { name: 'Past Due Accounts', run: syncPastDueAccountsFromSalesforce },
  { name: 'Salesforce Accounts', run: syncSalesforceAccounts },
  { name: 'Opportunities', run: syncOpportunitiesFromSalesforce }
]

async function runScheduledSalesforceSync (winston) {
  const status = await getSalesforceOAuthStatus()
  if (!status.connected) return { skipped: true, reason: 'Salesforce is not connected.' }

  const results = {}
  for (const job of SYNC_JOBS) {
    try {
      results[job.name] = await job.run()
    } catch (err) {
      results[job.name] = { error: err.message }
      if (winston) winston.error(`Scheduled Salesforce sync failed for ${job.name}: ${err.message}`)
    }
  }
  return { skipped: false, results }
}

function startSalesforceSyncScheduler (winston) {
  const intervalMinutes = Number(process.env.SF_SYNC_CHECK_MINUTES || 60)
  const intervalMs = Math.max(5 * 60 * 1000, intervalMinutes * 60 * 1000)

  if (winston) winston.info(`Salesforce sync scheduler started (${intervalMinutes} minute interval).`)

  setInterval(() => {
    runScheduledSalesforceSync(winston).catch((err) => {
      if (winston) winston.error('Scheduled Salesforce sync failed: ' + err.message)
    })
  }, intervalMs)

  setTimeout(() => {
    runScheduledSalesforceSync(winston).catch((err) => {
      if (winston) winston.error('Initial Salesforce sync failed: ' + err.message)
    })
  }, 30000)
}

module.exports = {
  runScheduledSalesforceSync,
  startSalesforceSyncScheduler
}
