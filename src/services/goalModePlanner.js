/**
 * LilyPad ERP - Goal-Mode Prompt Compiler
 * Turns an open-ended sourcing request ("find all fire departments in
 * TN, get the Training Chief...") into a structured execution plan for
 * waterfallScraper.js. Forced tool call, not freeform JSON parsing -
 * same reliability reasoning as every other AI pass in this app.
 */

const Anthropic = require('@anthropic-ai/sdk')

const REQUEST_TIMEOUT_MS = 30000
const MAX_RETRIES = 3
const DEFAULT_MODEL = 'claude-haiku-4-5'

function getConfig () {
  return {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    model: process.env.GOAL_MODE_PLANNER_MODEL || DEFAULT_MODEL
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

const PLAN_TOOL = {
  name: 'emit_goal_plan',
  description: 'Structured sourcing criteria extracted from a plain-English lead sourcing request.',
  input_schema: {
    type: 'object',
    required: ['division', 'target_entity', 'role_hierarchy', 'required_fields', 'target_count'],
    properties: {
      division: { type: 'string', enum: ['froggys_fog', 'training_smoke'], description: 'froggys_fog for haunts/FECs/theatrical; training_smoke for fire/hazmat/rescue.' },
      target_entity: { type: 'string', description: 'What kind of organization, e.g. "Municipal Fire Department".' },
      state: { type: ['string', 'null'], description: 'Two-letter US state code, or null if not mentioned.' },
      city: { type: ['string', 'null'] },
      role_hierarchy: { type: 'array', items: { type: 'string' }, description: 'Ordered contact-role preference, most-preferred first, e.g. ["training_chief","fire_chief","captain"].' },
      required_fields: { type: 'array', items: { type: 'string' }, description: 'Fields that must be present for a lead to pass, from: contactName, phone, email.' },
      target_count: { type: 'number', description: 'Desired number of verified leads - default 25 if not stated.' }
    }
  }
}

const SYSTEM_PROMPT = 'You compile a sales rep\'s plain-English lead sourcing request into structured criteria for an internal ERP, ' +
  'via the emit_goal_plan tool. Infer division from context (fire/hazmat/rescue = training_smoke; haunts/FECs/theatrical = froggys_fog). ' +
  'role_hierarchy should reflect the exact preference order stated (e.g. "Training Chief, fallback to Fire Chief or Captain" -> ' +
  '["training_chief","fire_chief","captain"]). Default target_count to 25 if not stated.'

async function compilePromptToGoalPlan (userPrompt) {
  const config = getConfig()
  if (!config.apiKey) throw new Error('Goal-mode planning is not configured. Add ANTHROPIC_API_KEY to the environment.')

  const client = getClient(config.apiKey)
  const response = await client.messages.create({
    model: config.model,
    max_tokens: 512,
    system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
    tools: [PLAN_TOOL],
    tool_choice: { type: 'tool', name: PLAN_TOOL.name },
    messages: [{ role: 'user', content: userPrompt }]
  })

  const toolUse = response.content.find((block) => block.type === 'tool_use')
  const input = (toolUse && toolUse.input) || {}

  return {
    division: ['froggys_fog', 'training_smoke'].includes(input.division) ? input.division : 'training_smoke',
    targetEntity: String(input.target_entity || '').slice(0, 200),
    state: input.state ? String(input.state).trim().toUpperCase().slice(0, 2) : '',
    city: input.city ? String(input.city).trim() : '',
    roleHierarchy: Array.isArray(input.role_hierarchy) && input.role_hierarchy.length ? input.role_hierarchy : ['training_chief', 'fire_chief', 'captain'],
    requiredFields: Array.isArray(input.required_fields) && input.required_fields.length ? input.required_fields : ['contactName', 'phone'],
    targetCount: Number.isFinite(input.target_count) && input.target_count > 0 ? Math.min(input.target_count, 200) : 25
  }
}

module.exports = { compilePromptToGoalPlan, isConfigured }
