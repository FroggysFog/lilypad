/**
 * LilyPad ERP - Global Cross-Collection Search
 * Backs the topbar search box (public/assets/js/lilypad-global-search.js)
 * and public/search-results.html. Queries every user-facing collection
 * in parallel, each capped and role-gated against the exact page that
 * collection is normally browsed from - see pagePermissionService.js.
 */

const LilyPadTicket = require('../models/lilypadTicket')
const LilyPadTask = require('../models/lilypadTask')
const LilyPadCustomer = require('../models/lilypadCustomer')
const LilyPadSalesforceAccount = require('../models/lilypadSalesforceAccount')
const LilyPadOpportunity = require('../models/lilypadOpportunity')
const LilyPadOrder = require('../models/lilypadOrder')
const LilyPadCartOrder = require('../models/lilypadCartOrder')
const LilyPadPastDueAccount = require('../models/lilypadPastDueAccount')
const { getAllowedPagesForRole } = require('./pagePermissionService')

const RESULT_LIMIT = 10

function rx (term) {
  return { $regex: term, $options: 'i' }
}

// One entry per searchable category. `page` is the backing list page used
// for the role gate (see pagePermissionService.js) - a category is
// skipped entirely (not returned as an empty array) when the requesting
// role can't see that page, so the frontend can tell "no access" apart
// from "no matches".
const CATEGORIES = [
  {
    type: 'ticket',
    page: 'tickets.html',
    run: async (term) => {
      const docs = await LilyPadTicket.find({
        deleted: false,
        $or: [
          { title: rx(term) },
          { formattedUid: rx(term) },
          { description: rx(term) },
          { 'externalReporter.name': rx(term) },
          { 'externalReporter.company': rx(term) }
        ]
      }).sort({ createdAt: -1 }).limit(RESULT_LIMIT)
      return docs.map((t) => ({
        type: 'ticket',
        id: t._id,
        title: t.title,
        subtitle: t.formattedUid,
        detailUrl: `tickets.html?ticket=${t._id}`
      }))
    }
  },
  {
    type: 'task',
    page: 'tasks.html',
    // Personal collection, enforced server-side by getTaskById - must go
    // through the same getMyTasks scoping tasks.html itself uses, never
    // a raw collection-wide query, or results would list tasks that then
    // 404 for this user on click.
    run: async (term, user) => {
      const docs = await LilyPadTask.getMyTasks(user._id, { search: term, limit: RESULT_LIMIT })
      return docs.map((t) => ({
        type: 'task',
        id: t._id,
        title: t.title,
        subtitle: t.formattedUid,
        detailUrl: `tasks.html?task=${t._id}`
      }))
    }
  },
  {
    type: 'lead',
    page: 'customers.html',
    run: async (term) => {
      const docs = await LilyPadCustomer.find({
        $or: [
          { name: rx(term) },
          { company: rx(term) },
          { email: rx(term) },
          { phone: rx(term) },
          { industry: rx(term) }
        ]
      }).sort({ createdAt: -1 }).limit(RESULT_LIMIT)
      return docs.map((c) => ({
        type: 'lead',
        id: c._id,
        title: c.name,
        subtitle: c.company,
        detailUrl: `customer-detail.html?id=${c._id}`
      }))
    }
  },
  {
    type: 'salesforceAccount',
    page: 'salesforce-accounts.html',
    run: async (term) => {
      const docs = await LilyPadSalesforceAccount.find({
        $or: [
          { name: rx(term) },
          { phone: rx(term) },
          { website: rx(term) }
        ]
      }).sort({ createdAt: -1 }).limit(RESULT_LIMIT)
      return docs.map((a) => ({
        type: 'salesforceAccount',
        id: a._id,
        title: a.name,
        subtitle: a.type,
        detailUrl: `salesforce-account-detail.html?id=${a._id}`
      }))
    }
  },
  {
    type: 'opportunity',
    page: 'opportunities.html',
    run: async (term) => {
      const docs = await LilyPadOpportunity.find({
        $or: [
          { name: rx(term) },
          { accountName: rx(term) }
        ]
      }).sort({ closeDate: -1 }).limit(RESULT_LIMIT)
      return docs.map((o) => ({
        type: 'opportunity',
        id: o._id,
        title: o.name,
        subtitle: o.accountName,
        detailUrl: `opportunity-detail.html?id=${o._id}`
      }))
    }
  },
  {
    type: 'order',
    page: 'orders.html',
    run: async (term) => {
      const docs = await LilyPadOrder.find({
        $or: [
          { orderNumber: rx(term) },
          { accountName: rx(term) },
          { customerEmail: rx(term) },
          { billToContactEmail: rx(term) },
          { billToContactPhone: rx(term) }
        ]
      }).sort({ createdAt: -1 }).limit(RESULT_LIMIT)
      return docs.map((o) => ({
        type: 'order',
        id: o._id,
        title: o.orderNumber,
        subtitle: o.accountName,
        detailUrl: `order-detail.html?id=${o._id}`
      }))
    }
  },
  {
    type: 'cartOrder',
    page: 'cart-explorer.html',
    run: async (term) => {
      const docs = await LilyPadCartOrder.find({
        $or: [
          { orderNumber: rx(term) },
          { customerName: rx(term) },
          { customerEmail: rx(term) },
          { customerPhone: rx(term) },
          { customerCompany: rx(term) }
        ]
      }).sort({ orderedAt: -1 }).limit(RESULT_LIMIT)
      // No detail page or GET-by-id API exists for Cart Orders at all -
      // carry the summary fields inline so the right pane needs no
      // extra fetch, and link "view" straight at the list page.
      return docs.map((o) => ({
        type: 'cartOrder',
        id: o._id,
        title: o.orderNumber,
        subtitle: o.customerName,
        detailUrl: 'cart-explorer.html',
        inlineDetail: {
          'Order #': o.orderNumber,
          Customer: o.customerName,
          Company: o.customerCompany,
          Email: o.customerEmail,
          Phone: o.customerPhone,
          'Grand Total': o.grandTotal,
          'Balance Due': o.balanceDue,
          Status: o.orderStatusName
        }
      }))
    }
  },
  {
    type: 'pastDueAccount',
    page: 'past-due-payments.html',
    run: async (term) => {
      const docs = await LilyPadPastDueAccount.find({
        $or: [
          { accountName: rx(term) },
          { payerName: rx(term) },
          { payerEmail: rx(term) },
          { payerPhone: rx(term) }
        ]
      }).sort({ createdAt: -1 }).limit(RESULT_LIMIT)
      // Has a real GET-by-id endpoint (getPastDueAccountDetail) but no
      // dedicated page - right pane fetches it for the richer record,
      // "view in list" still points at the list page.
      return docs.map((a) => ({
        type: 'pastDueAccount',
        id: a._id,
        title: a.accountName,
        subtitle: a.payerName,
        detailUrl: 'past-due-payments.html',
        detailApiUrl: `/api/v1/lilypad/past-due/${a._id}`
      }))
    }
  }
]

/**
 * @param {string} term - raw search text, already required to be >= 2 chars by the caller
 * @param {object} user - req.user (needed for task ownership scoping)
 * @param {string} effectiveRole - role after resolving admin preview-role, see lilypadSearch.js
 */
async function globalSearch (term, user, effectiveRole) {
  const clean = String(term || '').trim()
  if (clean.length < 2) return {}

  const allowedPages = await getAllowedPagesForRole(effectiveRole)
  const isAllowed = (page) => allowedPages === null || allowedPages.includes(page)

  const results = {}
  await Promise.all(
    CATEGORIES.filter((c) => isAllowed(c.page)).map(async (c) => {
      try {
        results[c.type] = await c.run(clean, user)
      } catch (err) {
        // One category failing (bad data, a transient query error) shouldn't
        // sink every other category's results.
        results[c.type] = []
      }
    })
  )

  return results
}

module.exports = { globalSearch }
