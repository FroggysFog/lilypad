/**
 * LilyPad ERP - Sales OS Seasonal Reactivation
 * Pure hand-written queries, no LLM involved - flags leads that were
 * contacted/quoted but went quiet, timed to each division's own buying
 * cycle. Calendar-aware: outside a division's active window, this
 * returns an empty set rather than staleness-only results, so a rep
 * isn't nudged to reactivate haunt accounts in February.
 */

const LilyPadSalesLead = require('../models/lilypadSalesLead')

const FROGGYS_FOG_STALE_DAYS = 60
const TRAINING_SMOKE_STALE_DAYS = 90

// Froggy's Fog: haunt/theatrical pre-season and restock window.
const FROGGYS_FOG_SEASON_MONTHS = [7, 8, 9, 10]
// Training Smoke: municipal fiscal year-end budget cycles.
const TRAINING_SMOKE_SEASON_MONTHS = [6, 9, 10]

const WINDOW_NAMES = {
  froggys_fog: 'Haunt Pre-Season Ordering (July-Oct)',
  training_smoke: 'Municipal Fiscal Year-End (June, Sept-Oct)'
}

function isInSeasonalWindow (division, month) {
  if (division === 'froggys_fog') return FROGGYS_FOG_SEASON_MONTHS.includes(month)
  if (division === 'training_smoke') return TRAINING_SMOKE_SEASON_MONTHS.includes(month)
  return false
}

/**
 * Returns { leads, inSeasonalWindow, currentWindowName } - leads is
 * always [] when the division's window is currently closed, so the
 * frontend can distinguish "no dormant accounts right now" from
 * "wrong time of year to be asking."
 */
async function getSeasonalReactivationLeads (division) {
  const currentMonth = new Date().getMonth() + 1
  const currentWindowName = WINDOW_NAMES[division] || ''
  const inSeasonalWindow = isInSeasonalWindow(division, currentMonth)

  if (!inSeasonalWindow) {
    return { leads: [], inSeasonalWindow: false, currentWindowName }
  }

  const query = { status: { $in: ['contacted', 'quoted'] } }

  if (division === 'froggys_fog') {
    query.division = 'froggys_fog'
    query.updatedAt = { $lte: new Date(Date.now() - FROGGYS_FOG_STALE_DAYS * 24 * 60 * 60 * 1000) }
  } else if (division === 'training_smoke') {
    query.division = 'training_smoke'
    query.updatedAt = { $lte: new Date(Date.now() - TRAINING_SMOKE_STALE_DAYS * 24 * 60 * 60 * 1000) }
  } else {
    return { leads: [], inSeasonalWindow: false, currentWindowName: '' }
  }

  const leads = await LilyPadSalesLead.find(query)
    .sort({ 'aiScore.intentScore': -1 })
    .limit(20)
    .lean()

  return { leads, inSeasonalWindow: true, currentWindowName }
}

module.exports = { getSeasonalReactivationLeads }
