/**
 * LilyPad ERP - Sync Scheduler
 * Periodically pulls Customers/Leads, Orders, Accounts, and
 * Opportunities from Salesforce, and Orders from Cart.com, into local
 * Mongo collections (deriving Past Due from each), so the app has an
 * up-to-date local copy without anyone having to click each page's
 * "Sync" button. Same setInterval/setTimeout pattern as
 * reminderEmailService's startReminderScheduler. Kept the
 * "Salesforce"-named exports/file when Cart.com was added rather than
 * a cosmetic rename, since app.js already wires up this exact function.
 */

const { getSalesforceOAuthStatus } = require('./salesforceService')
const { getCartOAuthStatus } = require('./cartService')
const { syncCustomersFromSalesforce } = require('./customerSyncService')
const { syncPastDueAccountsFromSalesforce } = require('./pastDueSyncService')
const { syncOrdersFromSalesforce } = require('./orderSyncService')
const { syncSalesforceAccounts } = require('./salesforceAccountSyncService')
const { syncOpportunitiesFromSalesforce } = require('./opportunitySyncService')
const { syncCartOrders } = require('./cartOrderSyncService')
const { syncCartPastDueAccounts } = require('./cartPastDueSyncService')

const SALESFORCE_SYNC_JOBS = [
  { name: 'Customers', run: syncCustomersFromSalesforce },
  // Orders must run before Past Due Accounts - past due records are now
  // derived from synced Order data instead of a separate Salesforce query.
  { name: 'Orders', run: syncOrdersFromSalesforce },
  { name: 'Past Due Accounts', run: syncPastDueAccountsFromSalesforce },
  { name: 'Salesforce Accounts', run: syncSalesforceAccounts },
  { name: 'Opportunities', run: syncOpportunitiesFromSalesforce }
]

// Cart.com Orders must run before Cart.com Past Due, same reason as the
// Salesforce jobs above - Past Due is derived from local Cart Orders.
const CART_SYNC_JOBS = [
  { name: 'Cart.com Orders', run: syncCartOrders },
  { name: 'Cart.com Past Due', run: syncCartPastDueAccounts }
]

function logHeapUsedMb (winston, label) {
  if (!winston) return
  const heapUsedMb = Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
  winston.info(`Salesforce sync memory: ${label} - heap used ${heapUsedMb}MB`)
}

/**
 * Salesforce and Cart.com are independent integrations sharing one
 * scheduler loop - each is gated on its own connection status so one
 * being disconnected (expired token, not yet set up, etc.) doesn't
 * block the other's sync from running.
 */
async function runScheduledSalesforceSync (winston) {
  const [salesforceStatus, cartStatus] = await Promise.all([
    getSalesforceOAuthStatus(),
    getCartOAuthStatus()
  ])

  const jobs = []
  if (salesforceStatus.connected) jobs.push(...SALESFORCE_SYNC_JOBS)
  else if (winston) winston.info('Scheduled sync: Salesforce is not connected, skipping its jobs.')
  if (cartStatus.connected) jobs.push(...CART_SYNC_JOBS)
  else if (winston) winston.info('Scheduled sync: Cart.com is not connected, skipping its jobs.')

  if (!jobs.length) return { skipped: true, reason: 'Neither Salesforce nor Cart.com is connected.' }

  logHeapUsedMb(winston, 'before sync')

  const results = {}
  for (const job of jobs) {
    try {
      results[job.name] = await job.run()
    } catch (err) {
      results[job.name] = { error: err.message }
      if (winston) winston.error(`Scheduled sync failed for ${job.name}: ${err.message}`)
    }
    logHeapUsedMb(winston, `after ${job.name}`)
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
