/**
 * LilyPad ERP - Sales Command Center Overview
 * Real-data widgets for the Sales Command Center's daily-workspace
 * panels - pipeline/win-rate from Salesforce Opportunities, sales
 * velocity from this rep's own Sales OS lead activity, recent
 * shipments from synced Orders, and a sync-health snapshot. Every
 * number here comes from an existing collection; nothing is invented
 * or estimated.
 */

const LilyPadOpportunity = require('../models/lilypadOpportunity')
const LilyPadOrder = require('../models/lilypadOrder')
const LilyPadSalesLead = require('../models/lilypadSalesLead')
const LilyPadSalesQuote = require('../models/lilypadSalesQuote')
const LilyPadSalesforceAccount = require('../models/lilypadSalesforceAccount')
const { getOpportunityOwnerFilter, getOrderOwnerFilter } = require('./repMatchingService')

function startOfWeek () {
  const d = new Date()
  const day = d.getDay() // 0 = Sunday
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - day)
  return d
}

/**
 * Open deals grouped by stage (count + amount), plus a win rate over
 * this rep's own closed Opportunities - all real Salesforce data,
 * scoped to the viewing rep the same way the dashboard's existing
 * sales-pipeline widget already does (repMatchingService.js).
 */
async function getPipelineSnapshot (user) {
  const ownerFilter = getOpportunityOwnerFilter(user)

  const [byStage, closedRollup] = await Promise.all([
    LilyPadOpportunity.aggregate([
      { $match: { ...ownerFilter, isClosed: false } },
      { $group: { _id: '$stageName', count: { $sum: 1 }, amount: { $sum: '$amount' } } },
      { $sort: { amount: -1 } }
    ]),
    LilyPadOpportunity.aggregate([
      { $match: { ...ownerFilter, isClosed: true } },
      { $group: { _id: '$isWon', count: { $sum: 1 }, amount: { $sum: '$amount' } } }
    ])
  ])

  const won = closedRollup.find((r) => r._id === true) || { count: 0, amount: 0 }
  const lost = closedRollup.find((r) => r._id === false) || { count: 0, amount: 0 }
  const totalClosed = won.count + lost.count

  return {
    byStage: byStage.map((s) => ({ stageName: s._id || 'Unknown', count: s.count, amount: s.amount })),
    winRate: totalClosed ? Math.round((won.count / totalClosed) * 1000) / 10 : null,
    closedWonCount: won.count,
    closedWonAmount: won.amount,
    closedLostCount: lost.count
  }
}

/**
 * This week's Sales OS activity for the viewing rep - claimed leads,
 * leads moved to "contacted", quotes created against their claimed
 * leads, and conversions. Tied directly to the actions the Command
 * Center itself drives (claim -> contact -> quote), unlike
 * Opportunity.activities[] (a real field, but unused in this org's
 * actual data - every Opportunity has zero logged activities today).
 *
 * "Contacted this week" uses updatedAt as an approximation (the
 * existing "Mark Contacted" action doesn't stamp a dedicated
 * contactedAt field) - close enough for a velocity indicator, not
 * exact if a lead was touched for some unrelated reason.
 */
async function getSalesVelocity (user) {
  const since = startOfWeek()

  const [claimedThisWeek, contactedThisWeek, convertedThisWeek, myLeadIds] = await Promise.all([
    LilyPadSalesLead.countDocuments({ 'assignedRep.id': user._id, 'assignedRep.claimedAt': { $gte: since } }),
    LilyPadSalesLead.countDocuments({ 'assignedRep.id': user._id, status: 'contacted', updatedAt: { $gte: since } }),
    LilyPadSalesLead.countDocuments({ 'assignedRep.id': user._id, status: 'converted', updatedAt: { $gte: since } }),
    LilyPadSalesLead.find({ 'assignedRep.id': user._id }).select('_id').lean()
  ])

  const quotesThisWeek = await LilyPadSalesQuote.countDocuments({
    sourceLeadId: { $in: myLeadIds.map((l) => l._id) },
    createdAt: { $gte: since }
  })

  return { claimedThisWeek, contactedThisWeek, quotesThisWeek, convertedThisWeek }
}

/**
 * Most recent real shipments across this rep's own Orders (Salesforce's
 * Shipworks_Data__c, synced via orderSyncService.js's
 * fetchShipworksDataByOrderId) - the same underlying data
 * order-detail.html already displays per single order, rolled up here
 * across a rep's whole book.
 */
async function getRecentShipments (user, limit = 8) {
  const ownerFilter = getOrderOwnerFilter(user)
  const rows = await LilyPadOrder.aggregate([
    { $match: ownerFilter },
    { $unwind: '$shipments' },
    { $match: { 'shipments.shipDate': { $ne: '' } } },
    { $sort: { 'shipments.shipDate': -1 } },
    { $limit: limit },
    {
      $project: {
        _id: 0,
        orderId: '$_id',
        orderNumber: 1,
        accountName: 1,
        trackingNumber: '$shipments.trackingNumber',
        carrier: '$shipments.carrier',
        service: '$shipments.service',
        shipDate: '$shipments.shipDate'
      }
    }
  ])
  return rows
}

/**
 * Global (not rep-scoped) snapshot of how fresh each synced collection
 * is, plus where the Sales OS lead pipeline currently stands - the
 * "is my data up to date" panel every rep benefits from seeing, not
 * just one person's.
 */
async function getSyncStatus () {
  const [lastOrderSync, lastOpportunitySync, lastAccountSync, leadStatusCounts] = await Promise.all([
    LilyPadOrder.findOne({}).sort({ lastSyncAt: -1 }).select('lastSyncAt').lean(),
    LilyPadOpportunity.findOne({}).sort({ lastSyncAt: -1 }).select('lastSyncAt').lean(),
    LilyPadSalesforceAccount.findOne({}).sort({ lastSyncAt: -1 }).select('lastSyncAt').lean(),
    LilyPadSalesLead.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
  ])

  const leadCounts = {}
  leadStatusCounts.forEach((row) => { leadCounts[row._id] = row.count })

  return {
    lastOrderSyncAt: lastOrderSync ? lastOrderSync.lastSyncAt : null,
    lastOpportunitySyncAt: lastOpportunitySync ? lastOpportunitySync.lastSyncAt : null,
    lastAccountSyncAt: lastAccountSync ? lastAccountSync.lastSyncAt : null,
    leadCounts
  }
}

async function getOverview (user) {
  const [pipeline, velocity, shipments, syncStatus] = await Promise.all([
    getPipelineSnapshot(user),
    getSalesVelocity(user),
    getRecentShipments(user),
    getSyncStatus()
  ])
  return { pipeline, velocity, shipments, syncStatus }
}

module.exports = { getOverview, getPipelineSnapshot, getSalesVelocity, getRecentShipments, getSyncStatus }
