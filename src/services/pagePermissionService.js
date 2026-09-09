/**
 * LilyPad ERP - Page Permission Resolution
 * assets/js/lilypad-nav.js is the one canonical page catalog (also used
 * to render the sidebar) - required directly here instead of duplicating
 * the page list, so the admin checklist, the client-side nav pruning,
 * and this server-side gate can never drift out of sync with each other.
 */

const path = require('path')
const { lilypadNavAllPages, LILYPAD_NAV_SECTIONS, DETAIL_PAGE_ACTIVE_MAP } = require(path.join(__dirname, '../../public/assets/js/lilypad-nav.js'))
const LilyPadRolePermission = require('../models/lilypadRolePermission')

const ALL_PAGES = lilypadNavAllPages()

// "Administration & Setup" pages are admin-only by nature, independent
// of whatever a role's permission doc says - closes off the case where
// someone accidentally (or a bug elsewhere) grants a non-admin role one
// of these via the allowedPages array.
const ADMIN_ONLY_PAGES = new Set(
  LILYPAD_NAV_SECTIONS
    .filter((section) => section.adminOnly)
    .flatMap((section) => section.items.map((item) => item.href))
)

/**
 * null return means "unrestricted" (admins) - callers must check for
 * that explicitly rather than treating it as an empty allow-list.
 */
async function getAllowedPagesForRole (role) {
  if (role === 'admin') return null
  const doc = await LilyPadRolePermission.findOne({ role })
  const allowed = doc ? doc.allowedPages : []
  return allowed.filter((page) => !ADMIN_ONLY_PAGES.has(page))
}

/**
 * Detail pages (customer-detail.html, etc) aren't their own nav entries -
 * they inherit whatever permission their parent list page has. A page
 * that's neither a nav entry nor a mapped detail page (login.html,
 * profile-settings.html, client-portal.html, this feature's own
 * access-restricted.html) is intentionally left ungated.
 */
function resolveGatedPage (page) {
  if (ALL_PAGES.includes(page)) return page
  if (DETAIL_PAGE_ACTIVE_MAP[page]) return DETAIL_PAGE_ACTIVE_MAP[page]
  return null
}

async function isPageAllowed (role, page) {
  if (role === 'admin') return true

  const gatedPage = resolveGatedPage(page)
  if (!gatedPage) return true // not a page this feature controls

  const allowed = await getAllowedPagesForRole(role)
  return allowed.includes(gatedPage)
}

module.exports = {
  ALL_PAGES,
  getAllowedPagesForRole,
  isPageAllowed
}
