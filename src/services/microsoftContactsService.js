/**
 * LilyPad ERP - Outlook Contacts (Microsoft Graph /me/contacts)
 * Read-only view into the connected user's personal Outlook contact
 * list - distinct from the ERP's own customer/staff directories
 * (LilyPadCustomer, LilyPadAccount), which are separate data with
 * separate purposes. Rides on the same per-user Microsoft 365
 * connection as calendar/mail (Contacts.Read), not a new OAuth flow.
 */

const microsoftCalendarService = require('./microsoftCalendarService')

function mapContact (c) {
  const primaryEmail = (c.emailAddresses && c.emailAddresses[0]) || null
  return {
    id: c.id,
    displayName: c.displayName || '',
    email: primaryEmail ? primaryEmail.address : '',
    phone: (c.businessPhones && c.businessPhones[0]) || c.mobilePhone || '',
    companyName: c.companyName || '',
    jobTitle: c.jobTitle || ''
  }
}

/**
 * `search` uses Graph's $search (fuzzy, matches across name/email) when
 * present - falls back to a plain alphabetical listing otherwise, since
 * $search and $orderby can't be combined in the same request.
 */
async function getContacts (ownerId, { search, top = 50 } = {}) {
  const params = new URLSearchParams({
    $top: String(top),
    $select: 'id,displayName,emailAddresses,businessPhones,mobilePhone,companyName,jobTitle'
  })

  if (search && search.trim()) {
    params.set('$search', `"${search.trim().replace(/"/g, '')}"`)
  } else {
    params.set('$orderby', 'displayName')
  }

  const data = await microsoftCalendarService.graphRequestForUser(ownerId, 'get', `/me/contacts?${params.toString()}`)
  return (data.value || []).map(mapContact)
}

module.exports = {
  getContacts
}
