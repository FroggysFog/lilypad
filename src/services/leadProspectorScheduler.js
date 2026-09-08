/**
 * LilyPad ERP - Lead Prospector Recovery Sweep
 * Lead Prospector runs are kicked off on-demand (POST /api/leads/prospect
 * enqueues immediately), not on a fixed interval like the Salesforce
 * sync - but the in-memory job queue in leadProspectorWorker.js doesn't
 * survive a process restart. This sweep runs once shortly after boot
 * (same 30s-after-listen pattern as salesforceSyncScheduler.js's initial
 * run) and re-enqueues any batch still marked 'queued' or 'processing'
 * from before the restart, so a deep run left mid-page never gets stuck.
 */

const LilyPadLeadBatch = require('../models/lilypadLeadBatch')
const { enqueueBatch } = require('./leadProspectorWorker')

async function recoverInFlightBatches (winston) {
  const staleBatches = await LilyPadLeadBatch.find({ status: { $in: ['queued', 'processing'] } })
  if (!staleBatches.length) return { recovered: 0 }

  for (const batch of staleBatches) {
    if (winston) winston.info(`Lead Prospector: resuming batch ${batch._id} from page ${batch.currentPage || 0} after restart.`)
    enqueueBatch(batch._id)
  }

  return { recovered: staleBatches.length }
}

function startLeadProspectorRecoverySweep (winston) {
  setTimeout(() => {
    recoverInFlightBatches(winston).catch((err) => {
      if (winston) winston.error('Lead Prospector recovery sweep failed: ' + err.message)
    })
  }, 30000)
}

module.exports = {
  recoverInFlightBatches,
  startLeadProspectorRecoverySweep
}
