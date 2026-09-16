/**
 * LilyPad ERP - Ask-a-Report Query Engine
 * The LLM is never allowed to write a database query, compute a number,
 * or assert a fact not present in a real aggregation result - it only
 * ever fills in structured parameters (rep name, date range, group-by)
 * for one hand-written query (runRevenueReport below). The card's prose
 * summary is built with a deterministic template from those real
 * numbers, not a second LLM call, so it can never disagree with the
 * totals shown next to it.
 *
 * Same forced-tool-choice Anthropic SDK pattern as
 * emailTriageExtractionService.js/receiptExtractionService.js, except
 * this one is a router (tool_choice: 'auto', may decline) rather than an
 * always-forced single tool - a Reports page has to be able to say
 * "that's not something I can answer yet" instead of guessing.
 */

const Anthropic = require('@anthropic-ai/sdk')
const LilyPadOrder = require('../models/lilypadOrder')
const { categorizeLineItem } = require('./customerIntelligence/productCategoryService')
const { ALLOWED_OWNERS } = require('./brandFilter')

const REQUEST_TIMEOUT_MS = 30000
const MAX_RETRIES = 3
// Stronger model than the Haiku-tier per-item classifiers - parsing an
// ambiguous date range/rep name out of free text benefits from more
// reasoning depth, same tiering logic emailSenderRollupService.js uses
// for its harder synthesis pass.
const DEFAULT_MODEL = 'claude-sonnet-5'

function getConfig () {
  return {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    model: process.env.REPORT_QUERY_MODEL || DEFAULT_MODEL
  }
}

function isConfigured () {
  return Boolean(getConfig().apiKey)
}

let cachedClient = null
let cachedClientKey = null

function getClient (apiKey) {
  if (!cachedClient || cachedClientKey !== apiKey) {
    cachedClient = new Anthropic({ apiKey, maxRetries: MAX_RETRIES, timeout: REQUEST_TIMEOUT_MS })
    cachedClientKey = apiKey
  }
  return cachedClient
}

const REVENUE_QUERY_TOOL = {
  name: 'emit_revenue_query',
  description: 'Structured parameters for a revenue report over LilyPad order data.',
  input_schema: {
    type: 'object',
    required: ['start_date_iso', 'end_date_iso', 'group_by'],
    properties: {
      rep_name: { type: ['string', 'null'], description: 'The sales rep or house account this question is about, exactly as named in the question. Null if the question is company-wide (no specific rep mentioned).' },
      start_date_iso: { type: 'string', description: 'Start of the date range, YYYY-MM-DD, inclusive.' },
      end_date_iso: { type: 'string', description: 'End of the date range, YYYY-MM-DD, inclusive.' },
      group_by: { type: 'string', enum: ['category', 'none'], description: '"category" if the question asks for a breakdown by product type (e.g. fluids/machines/other), else "none".' }
    }
  }
}

function buildSystemPrompt () {
  const today = new Date().toISOString().slice(0, 10)
  return `You translate a natural-language revenue question into structured query parameters for an internal ERP, via the emit_revenue_query tool. Today's date is ${today}. ` +
    `Known reps/house accounts (match the question's name against this list case-insensitively; if the question names someone not on this list, still pass through what they said in rep_name so the caller can report "no match" rather than silently answering for the wrong scope): ${ALLOWED_OWNERS.join(', ')}. ` +
    'Resolve relative dates ("last month", "September", "this quarter") into absolute YYYY-MM-DD dates relative to today. ' +
    'If the question is not a revenue question this tool can answer (e.g. it asks about tickets, tasks, or anything not about order revenue), do NOT call the tool - reply in plain text briefly explaining you can only answer revenue questions right now.'
}

function validateRepName (rawName) {
  if (!rawName) return { repName: '', repLabel: 'Company-wide', matched: true }
  const match = ALLOWED_OWNERS.find((o) => o.toLowerCase() === String(rawName).trim().toLowerCase())
  if (match) return { repName: match, repLabel: match, matched: true }
  return { repName: '', repLabel: `Company-wide (no record found for "${rawName}")`, matched: false }
}

/**
 * Parses a free-text question into validated report parameters, or
 * { handled: false } if the model declined (out of scope for this
 * tool) or the API isn't configured.
 */
async function parseReportQuestion (question) {
  const config = getConfig()
  if (!config.apiKey) return { handled: false, reason: 'AI reporting is not configured. Add ANTHROPIC_API_KEY to the environment.' }

  const client = getClient(config.apiKey)
  const response = await client.messages.create({
    model: config.model,
    max_tokens: 1024,
    system: [{ type: 'text', text: buildSystemPrompt(), cache_control: { type: 'ephemeral' } }],
    tools: [REVENUE_QUERY_TOOL],
    tool_choice: { type: 'auto' },
    messages: [{ role: 'user', content: question }]
  })

  const toolUse = response.content.find((block) => block.type === 'tool_use')
  if (!toolUse) {
    const textBlock = response.content.find((block) => block.type === 'text')
    return { handled: false, reason: (textBlock && textBlock.text) || 'I can only answer revenue questions right now - try asking about revenue by rep, date range, or product category.' }
  }

  const input = toolUse.input || {}
  const { repName, repLabel, matched } = validateRepName(input.rep_name)

  return {
    handled: true,
    params: {
      repName,
      startDate: input.start_date_iso,
      endDate: input.end_date_iso,
      groupBy: input.group_by === 'category' ? 'category' : 'none'
    },
    repLabel,
    repMatched: matched
  }
}

const CATEGORY_LABELS = { fluids: 'Fluids', machines: 'Machines', other: 'Other' }

function displayCategoryFor (rawCategory) {
  if (rawCategory === 'fluid_consumable') return 'fluids'
  if (rawCategory === 'fog_machine' || rawCategory === 'haze_machine') return 'machines'
  return 'other'
}

/**
 * The one real, hand-written query - sums LilyPadOrder.grandTotal
 * (the field this codebase already treats as revenue, see
 * entityResolutionService.js's lifetime-revenue rollup) over a date/rep
 * filter, optionally broken down by product category via the existing
 * productCategoryService classifier.
 */
async function runRevenueReport (params) {
  const query = {}
  if (params.startDate || params.endDate) {
    query.effectiveDate = {}
    if (params.startDate) query.effectiveDate.$gte = params.startDate
    if (params.endDate) query.effectiveDate.$lte = params.endDate
  }
  if (params.repName) query.ownerName = params.repName

  const orders = await LilyPadOrder.find(query, 'grandTotal items').lean()
  const total = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0)

  let breakdown = null
  if (params.groupBy === 'category') {
    const byCategory = { fluids: 0, machines: 0, other: 0 }
    for (const order of orders) {
      for (const item of order.items || []) {
        const bucket = displayCategoryFor(categorizeLineItem(item.productName, item.sku))
        byCategory[bucket] += Number(item.totalPrice) || 0
      }
    }
    breakdown = Object.keys(byCategory).map((key) => ({
      category: key,
      label: CATEGORY_LABELS[key],
      revenue: byCategory[key],
      pct: total > 0 ? Math.round((byCategory[key] / total) * 100) : 0
    }))
  }

  return { total, orderCount: orders.length, breakdown }
}

function formatCurrency (amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0)
}

function formatDateRangeLabel (startDate, endDate) {
  const fmt = (d) => {
    const parsed = new Date(d + 'T00:00:00Z')
    return isNaN(parsed.getTime()) ? d : parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
  }
  if (!startDate || !endDate) return 'the selected period'
  return `${fmt(startDate)} - ${fmt(endDate)}`
}

function buildSummaryText (params, repLabel, result) {
  let summary = `${repLabel} generated ${formatCurrency(result.total)} in revenue from ${formatDateRangeLabel(params.startDate, params.endDate)} (${result.orderCount} order${result.orderCount === 1 ? '' : 's'}).`
  if (result.breakdown && result.total > 0) {
    const parts = result.breakdown
      .filter((b) => b.revenue > 0)
      .sort((a, b) => b.revenue - a.revenue)
      .map((b) => `${b.label}: ${formatCurrency(b.revenue)} (${b.pct}%)`)
    if (parts.length) summary += ` Breakdown - ${parts.join(', ')}.`
  }
  return summary
}

function buildTitle (repLabel, params) {
  return `${repLabel} - ${formatDateRangeLabel(params.startDate, params.endDate)} Revenue`
}

/**
 * Full orchestration for the Reports page's preview step - read-only,
 * nothing persisted until the user explicitly saves it.
 */
async function generatePreview (question) {
  const parsed = await parseReportQuestion(question)
  if (!parsed.handled) return parsed

  const result = await runRevenueReport(parsed.params)
  const summary = buildSummaryText(parsed.params, parsed.repLabel, result)
  const title = buildTitle(parsed.repLabel, parsed.params)

  return { handled: true, title, summary, result, params: parsed.params, repLabel: parsed.repLabel, repMatched: parsed.repMatched }
}

module.exports = {
  isConfigured,
  generatePreview,
  runRevenueReport,
  buildSummaryText,
  buildTitle
}
