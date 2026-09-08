/**
 * LilyPad ERP - AI Recommendation Layer
 * The synthesis step that makes this "AI-driven" rather than just a
 * sorted query: given the engagement signals entityResolutionService.js
 * already computed (recency, product mix, sibling locations, ticket
 * history), asks Claude to weigh them together and produce a ranked
 * score plus a plain-English reason a rep can act on - "bought a fog
 * machine 14 months ago, no fluid reorders since, no open opportunity"
 * is a synthesis of four separate fields, not something a single sort
 * column can express.
 *
 * Batches multiple profiles into one request (PROFILES_PER_REQUEST) to
 * keep API calls and cost down rather than one call per account.
 */

const Anthropic = require('@anthropic-ai/sdk')
const LilyPadCustomerProfile = require('../../models/lilypadCustomerProfile')
const winston = require('../../logger')

const REQUEST_TIMEOUT_MS = 60000
const MAX_RETRIES = 3
const PROFILES_PER_REQUEST = 15
const DEFAULT_MODEL = 'claude-haiku-4-5'

function getConfig () {
  return {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    model: process.env.RECOMMENDATION_MODEL || DEFAULT_MODEL
  }
}

function isRecommendationConfigured () {
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

const RECOMMENDATION_TOOL = {
  name: 'record_recommendations',
  description: 'Records a priority score and reason for each customer profile provided.',
  input_schema: {
    type: 'object',
    properties: {
      recommendations: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            profileId: { type: 'string', description: 'Must exactly match the id given in the input.' },
            score: { type: 'number', description: '0-100. Higher means more worth a sales rep contacting right now.' },
            reason: { type: 'string', description: 'One to two sentences, specific and actionable - name the concrete signal(s) driving the score.' }
          },
          required: ['profileId', 'score', 'reason']
        }
      }
    },
    required: ['recommendations']
  }
}

const SYSTEM_PROMPT = 'You are a B2B sales analyst for a company that sells atmospheric fog/haze machines, fluid, and ' +
  'accessories to venues like haunted attractions, theaters, theme parks, and fire departments. You are given a batch ' +
  'of existing customer accounts with their engagement signals (order history, open opportunities, product mix, ' +
  'support ticket history, and whether they are part of a multi-location chain). Score each one 0-100 on how worth a ' +
  'sales rep\'s attention it is RIGHT NOW, and give a specific, one-to-two-sentence reason grounded in the actual data ' +
  'given - never invent facts not present in the input. Favor these patterns when scoring: (1) a customer who ordered ' +
  'a machine but never ordered fluid/consumables (upsell gap), (2) a previously active customer who has gone quiet ' +
  '(reactivation candidate), (3) an account with real order history but no salesperson ever opened an opportunity ' +
  '(under-served), (4) a sibling location of a chain where other locations already buy from us but this one has not. ' +
  'A brand-new account with zero history everywhere should score low - there is nothing here to act on yet.'

function summarizeProfileForPrompt (profile) {
  return {
    profileId: String(profile._id),
    name: profile.name,
    industry: profile.industry,
    engagementStatus: profile.engagementStatus,
    daysSinceLastOrder: profile.daysSinceLastOrder,
    daysSinceLastContact: profile.daysSinceLastContact,
    orderStats: profile.orderStats,
    opportunityStats: profile.opportunityStats,
    cartOrderStats: profile.cartOrderStats,
    ticketStats: { totalTickets: profile.ticketStats.totalTickets, lastTicketDate: profile.ticketStats.lastTicketDate },
    productMix: profile.productMix,
    isPartOfChain: Boolean(profile.siblingGroupKey),
    siblingLocationCount: (profile.siblingProfileIds || []).length
  }
}

async function scoreBatch (client, model, profiles) {
  const response = await client.messages.create({
    model,
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    tools: [RECOMMENDATION_TOOL],
    tool_choice: { type: 'tool', name: RECOMMENDATION_TOOL.name },
    messages: [
      { role: 'user', content: JSON.stringify(profiles.map(summarizeProfileForPrompt)) }
    ]
  })

  const toolUse = response.content.find((block) => block.type === 'tool_use')
  if (!toolUse) {
    winston.warn('Recommendation: model response had no tool_use block for this batch')
    return []
  }

  return Array.isArray(toolUse.input.recommendations) ? toolUse.input.recommendations : []
}

/**
 * `filter`: optional Mongo query restricting which profiles get scored
 * (e.g. { engagementStatus: { $in: ['dormant', 'churned'] } }). Omit to
 * score every profile - expensive at real scale, so callers should
 * usually pass a filter for a normal run.
 */
async function generateRecommendations (filter) {
  const config = getConfig()
  if (!config.apiKey) {
    throw new Error('Recommendations are not configured. Add ANTHROPIC_API_KEY to the environment.')
  }

  const profiles = await LilyPadCustomerProfile.find(filter || {})
  if (!profiles.length) return { scored: 0 }

  const client = getClient(config.apiKey)
  let scored = 0

  for (let i = 0; i < profiles.length; i += PROFILES_PER_REQUEST) {
    const chunk = profiles.slice(i, i + PROFILES_PER_REQUEST)
    let recommendations = []
    try {
      recommendations = await scoreBatch(client, config.model, chunk)
    } catch (err) {
      winston.warn(`Recommendation batch ${i / PROFILES_PER_REQUEST + 1} failed: ${err.message}`)
      continue
    }

    const byId = new Map(recommendations.map((r) => [r.profileId, r]))
    const bulkOps = []
    for (const profile of chunk) {
      const rec = byId.get(String(profile._id))
      if (!rec) continue
      bulkOps.push({
        updateOne: {
          filter: { _id: profile._id },
          update: {
            $set: {
              recommendation: {
                score: rec.score,
                reason: rec.reason,
                model: config.model,
                generatedAt: new Date()
              }
            }
          }
        }
      })
    }

    if (bulkOps.length) {
      await LilyPadCustomerProfile.bulkWrite(bulkOps, { ordered: false })
      scored += bulkOps.length
    }
  }

  winston.info(`Recommendations: scored ${scored} of ${profiles.length} profiles.`)
  return { scored, total: profiles.length }
}

module.exports = {
  isRecommendationConfigured,
  generateRecommendations
}
