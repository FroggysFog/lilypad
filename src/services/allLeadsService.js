/**
 * LilyPad ERP - Unified "All Leads" Browser
 * Flattens three separate, unconnected lead sources into one list -
 * LilyPadSalesLead (Sales OS), LilyPadStagedLead (Lead Prospector
 * staging), LilyPadCustomer (Salesforce-synced trade-show leads).
 * Same category-array/role-gating/per-category-resilience pattern as
 * globalSearchService.js, reused rather than reinvented - the
 * difference is this browses by default (no search term required) and
 * only three sources are "leads," not this app's whole search surface.
 */

const LilyPadSalesLead = require('../models/lilypadSalesLead')
const LilyPadStagedLead = require('../models/lilypadStagedLead')
const LilyPadCustomer = require('../models/lilypadCustomer')
const { getAllowedPagesForRole } = require('./pagePermissionService')

const RESULT_LIMIT = 20

function rx (term) {
  return { $regex: term, $options: 'i' }
}

const CATEGORIES = [
  {
    type: 'salesLead',
    page: 'sales-battle-plan.html',
    run: async (term, { division }) => {
      const query = {}
      if (division) query.division = division
      if (term) {
        query.$or = [
          { companyName: rx(term) },
          { 'contact.name': rx(term) },
          { 'contact.email': rx(term) },
          { 'address.city': rx(term) }
        ]
      }
      const docs = await LilyPadSalesLead.find(query).sort({ createdAt: -1 }).limit(RESULT_LIMIT).lean()
      return docs.map((d) => ({
        source: 'salesLead',
        sourceLabel: 'Sales OS',
        id: d._id,
        title: d.companyName,
        subtitle: (d.contact && d.contact.name) || [d.address && d.address.city, d.address && d.address.state].filter(Boolean).join(', '),
        status: d.status,
        badge: d.aiScore && d.aiScore.intentScore ? `Score ${d.aiScore.intentScore}` : '',
        detailUrl: 'sales-battle-plan.html',
        createdAt: d.createdAt
      }))
    }
  },
  {
    type: 'stagedLead',
    page: 'prospects.html',
    run: async (term) => {
      const query = { status: { $nin: ['imported', 'rejected'] } }
      if (term) {
        query.$or = [
          { companyName: rx(term) },
          { firstName: rx(term) },
          { lastName: rx(term) },
          { email: rx(term) }
        ]
      }
      const docs = await LilyPadStagedLead.find(query).sort({ createdAt: -1 }).limit(RESULT_LIMIT).lean()
      return docs.map((d) => ({
        source: 'stagedLead',
        sourceLabel: 'Prospector',
        id: d._id,
        title: d.companyName || `${d.firstName || ''} ${d.lastName || ''}`.trim(),
        subtitle: [`${d.firstName || ''} ${d.lastName || ''}`.trim(), d.jobTitle].filter(Boolean).join(' - '),
        status: d.status,
        badge: d.isDuplicate ? 'Possible duplicate' : '',
        // No per-lead detail page or batch deep-link exists today
        // (getBatchLeads is always scoped to one batch, prospects.html
        // has no ?batch= param) - link to the list, same pattern as
        // cart-explorer/past-due in globalSearchService.js.
        detailUrl: 'prospects.html',
        createdAt: d.createdAt
      }))
    }
  },
  {
    type: 'customerLead',
    page: 'customers.html',
    run: async (term) => {
      const query = {}
      if (term) {
        query.$or = [
          { name: rx(term) },
          { company: rx(term) },
          { email: rx(term) }
        ]
      }
      const docs = await LilyPadCustomer.find(query).sort({ createdDate: -1 }).limit(RESULT_LIMIT).lean()
      return docs.map((d) => ({
        source: 'customerLead',
        sourceLabel: 'Directory',
        id: d._id,
        title: d.company || d.name,
        subtitle: d.name,
        status: d.leadStatus,
        badge: '',
        detailUrl: `customer-detail.html?id=${d._id}`,
        createdAt: d.createdDate
      }))
    }
  }
]

/**
 * @param {object} opts - { term, division, source, effectiveRole }
 * `source` (optional) restricts to one category id; otherwise all
 * allowed categories run. Empty `term` returns each source's most
 * recent records - this is a browse-first page, not search-on-demand.
 */
async function getAllLeads ({ term = '', division = '', source = '', effectiveRole } = {}) {
  const clean = String(term || '').trim()
  const allowedPages = await getAllowedPagesForRole(effectiveRole)
  const isAllowed = (page) => allowedPages === null || allowedPages.includes(page)

  const categories = CATEGORIES.filter((c) => isAllowed(c.page) && (!source || source === c.type))

  const countsBySource = {}
  let results = []

  await Promise.all(
    categories.map(async (c) => {
      try {
        const rows = await c.run(clean, { division })
        countsBySource[c.type] = rows.length
        results = results.concat(rows)
      } catch (err) {
        countsBySource[c.type] = 0
      }
    })
  )

  results.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))

  return { results, countsBySource, availableSources: categories.map((c) => c.type) }
}

module.exports = { getAllLeads }
