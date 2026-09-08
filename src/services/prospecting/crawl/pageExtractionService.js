/**
 * LilyPad ERP - LLM Structured Extraction
 * Turns the messy page text crawlerService hands back into the exact
 * fields the sales team needs: Name, Email, Phone, Company, Department,
 * Business, Role. This is the piece that makes the in-house pipeline
 * viable at all - regex/DOM heuristics break on every site's different
 * markup, but a short, well-defined extraction task like "find the named
 * people and their roles on this page" is exactly what a small, cheap
 * model handles reliably.
 *
 * Uses Claude's tool-use (a forced tool call) rather than asking for
 * freeform JSON in the response text - this guarantees a parseable,
 * schema-shaped result instead of the model wrapping its answer in
 * prose or markdown fences. Uses the official @anthropic-ai/sdk (not
 * raw HTTP) - its client already retries 429/5xx/connection errors with
 * backoff, so there's no hand-rolled retry loop here.
 */

const Anthropic = require('@anthropic-ai/sdk')
const winston = require('../../../logger')

const REQUEST_TIMEOUT_MS = 30000
const MAX_RETRIES = 3
const MAX_TOTAL_PAGE_TEXT_CHARS = 14000
// Cheapest/fastest current model - appropriate here since extraction is a
// short, well-bounded task (find named people + roles on a page), not one
// that benefits from a larger model's reasoning depth.
const DEFAULT_MODEL = 'claude-haiku-4-5'

function getExtractionConfig () {
  return {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    model: process.env.PROSPECTOR_EXTRACTION_MODEL || DEFAULT_MODEL
  }
}

function isExtractionConfigured () {
  return Boolean(getExtractionConfig().apiKey)
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

const EXTRACTION_TOOL = {
  name: 'record_extracted_contacts',
  description: 'Records the people and organization details found on the provided web page(s).',
  input_schema: {
    type: 'object',
    properties: {
      organization: {
        type: 'object',
        description: 'Details about the overall business/organization the pages belong to.',
        properties: {
          name: { type: 'string', description: 'The organization/business name, e.g. "Arena Stage" or "City of Springfield Fire Department".' },
          description: { type: 'string', description: 'A one to two sentence description of what the organization does, if determinable.' },
          generalPhone: { type: 'string', description: 'A general/main phone number for the organization, if listed. Empty string if none found.' },
          city: { type: 'string' },
          state: { type: 'string' },
          country: { type: 'string' }
        },
        required: ['name']
      },
      people: {
        type: 'array',
        description: 'Every named individual found on the page(s), with their role. Do not invent people who are not explicitly named in the text - omit rather than guess.',
        items: {
          type: 'object',
          properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            jobTitle: { type: 'string', description: 'Their role/title exactly as stated, e.g. "Facilities Manager", "Fire Chief", "Technical Director", "Owner".' },
            department: { type: 'string', description: 'The department or division they belong to, if stated (e.g. "Operations", "Purchasing", "Special Effects"). Empty string if not stated.' },
            email: { type: 'string', description: 'Their direct email address if explicitly shown on the page. Empty string if not shown - never guess or construct one.' },
            phone: { type: 'string', description: 'Their direct phone number if explicitly shown. Empty string if not shown.' }
          },
          required: ['firstName', 'jobTitle']
        }
      }
    },
    required: ['organization', 'people']
  }
}

const SYSTEM_PROMPT = 'You extract structured contact information from web page text for a B2B sales prospecting tool. ' +
  'You are given the text of one or more pages from a single business website (About, Team, Leadership, or Contact pages). ' +
  'Extract every named person and their role, plus organization-level details. Only report information that is explicitly ' +
  'present in the text - never invent names, titles, emails, or phone numbers. If a page is a navigation menu or contains ' +
  'no named individuals, return an empty people array.'

function buildUserPrompt (pages, hint) {
  const truncatedPages = []
  let budget = MAX_TOTAL_PAGE_TEXT_CHARS
  for (const p of pages) {
    if (budget <= 0) break
    const text = String(p.text || '').slice(0, budget)
    truncatedPages.push(`--- Page: ${p.url} (title: "${p.title || ''}") ---\n${text}`)
    budget -= text.length
  }

  const hintLine = hint ? `Context hint: this business is expected to be a "${hint}".\n\n` : ''
  return `${hintLine}${truncatedPages.join('\n\n')}`
}

/**
 * Sends crawled page text to Claude for structured extraction. `hint`
 * (e.g. "haunted attraction", "fire department") gives the model a
 * category cue, since job titles for small/niche businesses often don't
 * match standard corporate vocabulary - it helps the model recognize
 * "Owner" or "Fire Chief" as the relevant buyer role rather than
 * expecting something like "Purchasing Manager".
 */
async function extractContactsFromPages (pages, hint) {
  const config = getExtractionConfig()
  if (!config.apiKey) {
    throw new Error('LLM extraction is not configured. Add ANTHROPIC_API_KEY to the environment.')
  }

  const pagesWithText = (pages || []).filter((p) => p && p.text && p.text.trim().length > 20)
  if (!pagesWithText.length) {
    return { organization: null, people: [] }
  }

  const client = getClient(config.apiKey)

  try {
    const response = await client.messages.create({
      model: config.model,
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      tools: [EXTRACTION_TOOL],
      tool_choice: { type: 'tool', name: EXTRACTION_TOOL.name },
      messages: [
        { role: 'user', content: buildUserPrompt(pagesWithText, hint) }
      ]
    })

    const toolUse = response.content.find((block) => block.type === 'tool_use')
    if (!toolUse) {
      winston.warn('Extraction: model response had no tool_use block, treating as no contacts found')
      return { organization: null, people: [] }
    }

    const result = toolUse.input || {}
    return {
      organization: result.organization || null,
      people: Array.isArray(result.people) ? result.people : []
    }
  } catch (error) {
    // Most-specific-first: the SDK's typed exceptions already retried
    // 429/5xx/connection errors internally (maxRetries above) before
    // surfacing here, so anything reaching this catch is either a
    // non-retryable client error (400/401/404) or retries exhausted.
    if (error instanceof Anthropic.AuthenticationError) {
      throw new Error('LLM extraction failed: invalid ANTHROPIC_API_KEY.')
    }
    if (error instanceof Anthropic.RateLimitError) {
      throw new Error('LLM extraction failed: rate limited after retries. This key may still be in a low usage tier.')
    }
    if (error instanceof Anthropic.APIError) {
      throw new Error(`LLM extraction request failed (${error.status}): ${error.message}`)
    }
    throw error
  }
}

module.exports = {
  isExtractionConfigured,
  extractContactsFromPages
}
