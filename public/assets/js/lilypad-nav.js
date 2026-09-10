/**
 * LilyPad ERP - Shared Sidebar Navigation
 * Single source of truth for the sidebar menu, generated from data instead
 * of hand-copied into every page. Before this file existed, the sidebar
 * markup had drifted into 18 genuinely different versions across 26
 * pages (confirmed by hashing each page's sidebar-menu block) - some
 * pages missing menu items other pages had, item order differing, etc.
 * Every page now renders `#sidebar-menu` from this one array instead of
 * carrying its own copy.
 *
 * Runs synchronously at script-tag execution time (NOT inside a
 * DOMContentLoaded listener) and must be loaded before assets/js/script.js
 * in every page's <script> block order - that theme script looks for
 * `.sidebar-menu a.active` on load to auto-expand the right submenu, so
 * the nav has to already be injected with the correct active link by the
 * time script.js's own init logic runs.
 */

const LILYPAD_NAV_SECTIONS = [
  { type: 'single', href: 'dashboard.html', icon: 'ti-dashboard', label: 'Main Dashboard' },
  {
    type: 'group',
    icon: 'ti-ticket',
    label: 'Operations',
    items: [
      { href: 'tickets.html', icon: 'ti-ticket', label: 'Ticket Operations' },
      { href: 'tasks.html', icon: 'ti-list-check', label: 'Task Manager' },
      { href: 'calendar.html', icon: 'ti-calendar', label: 'Calendar' },
      { href: 'email.html', icon: 'ti-mail', label: 'Email' },
      { href: 'knowledge-base.html', icon: 'ti-book', label: 'Knowledge Base & SOPs' }
    ]
  },
  {
    type: 'group',
    icon: 'ti-cash-banknote',
    label: 'Accounting',
    items: [
      { href: 'past-due-payments.html', icon: 'ti-cash-banknote', label: 'Past Due Payments' },
      { href: 'reminder-templates.html', icon: 'ti-mail-cog', label: 'Reminder Templates' }
    ]
  },
  {
    type: 'group',
    icon: 'ti-users-group',
    label: 'Customers',
    items: [
      { href: 'customers.html', icon: 'ti-users-group', label: 'Customer Directory' },
      { href: 'salesforce-accounts.html', icon: 'ti-building', label: 'Accounts' }
    ]
  },
  {
    type: 'group',
    icon: 'ti-package',
    label: 'Orders',
    items: [
      { href: 'orders.html', icon: 'ti-package', label: 'Order History' }
    ]
  },
  {
    type: 'group',
    icon: 'ti-user-search',
    label: 'Prospecting',
    items: [
      { href: 'prospects.html', icon: 'ti-user-search', label: 'Lead Prospector' },
      { href: 'customer-intelligence.html', icon: 'ti-chart-arrows', label: 'Customer Intelligence' },
      { href: 'opportunities.html', icon: 'ti-target-arrow', label: 'Opportunities' }
    ]
  },
  {
    type: 'group',
    icon: 'ti-settings-2',
    label: 'Administration & Setup',
    id: 'adminSetupNavItem',
    adminOnly: true,
    items: [
      { href: 'admin-email.html', icon: 'ti-mail-forward', label: 'Inbound Email & Anti-Spam' },
      { href: 'admin-team.html', icon: 'ti-users', label: 'Team & User Permissions' },
      { href: 'admin-roles.html', icon: 'ti-shield-lock', label: 'Roles & Permissions' },
      { href: 'admin-forms.html', icon: 'ti-adjustments', label: 'Dynamic Form Builder' },
      { href: 'api-credentials.html', icon: 'ti-key', label: 'API Credentials Vault' },
      { href: 'salesforce-explorer.html', icon: 'ti-database-search', label: 'Salesforce Explorer' },
      { href: 'cart-explorer.html', icon: 'ti-shopping-cart', label: 'Cart.com Explorer' }
    ]
  }
]

// Detail pages don't have their own sidebar entry - they're reached by
// clicking into a list page - so the parent list page's link is what
// should highlight as active when viewing a detail page.
const DETAIL_PAGE_ACTIVE_MAP = {
  'customer-detail.html': 'customers.html',
  'order-detail.html': 'orders.html',
  'salesforce-account-detail.html': 'salesforce-accounts.html',
  'opportunity-detail.html': 'opportunities.html'
}

function lilypadNavCurrentPage () {
  let path = window.location.pathname.split('/').pop() || 'dashboard.html'
  // Tolerate a server that serves clean URLs without the .html extension
  // (e.g. a static preview tool rewriting /customers.html -> /customers) -
  // production's Express static middleware keeps the real extension, but
  // matching either way costs nothing and avoids every nav link silently
  // failing to highlight under a different local dev server.
  if (!path.includes('.')) path += '.html'
  return DETAIL_PAGE_ACTIVE_MAP[path] || path
}

function lilypadNavRenderSingle (item, currentPage) {
  const active = item.href === currentPage ? ' class="active"' : ''
  return `<li>
      <ul>
        <li><a href="${item.href}"${active}><i class="ti ${item.icon}"></i><span>${item.label}</span></a></li>
      </ul>
    </li>`
}

function lilypadNavRenderGroup (group, currentPage) {
  const idAttr = group.id ? ` id="${group.id}"` : ''
  const styleAttr = group.adminOnly ? ' style="display:none;"' : ''
  const itemsHtml = group.items.map((item) => {
    const active = item.href === currentPage ? ' class="active"' : ''
    return `<li><a href="${item.href}"${active}><i class="ti ${item.icon}"></i><span>${item.label}</span></a></li>`
  }).join('\n')

  // The toggle link deliberately gets NO "subdrop" class here, even when
  // this group contains the active page - script.js's own on-load pass
  // (initSidebarMenu, "Expand parent menus if active link is inside")
  // is what adds subdrop/active to the correct one, by walking up from
  // whichever leaf link actually has .active. Hardcoding subdrop on
  // every group here (what the original static markup did on every
  // page, confirmed via git history - not something this rewrite
  // introduced) makes every group look "already open" to that script's
  // click handler, which reads isAlreadyOpen straight off the subdrop
  // class - so the first click on any group closes a group that was
  // never visually open, and only the second click actually opens it.
  return `<li class="submenu"${idAttr}${styleAttr}>
      <a href="javascript:void(0);">
        <i class="ti ${group.icon}"></i><span>${group.label}</span><span class="menu-arrow"></span>
      </a>
      <ul>
        ${itemsHtml}
      </ul>
    </li>`
}

function lilypadRenderSidebarNav () {
  const currentPage = lilypadNavCurrentPage()

  const sectionsHtml = LILYPAD_NAV_SECTIONS.map((section) =>
    section.type === 'single' ? lilypadNavRenderSingle(section, currentPage) : lilypadNavRenderGroup(section, currentPage)
  ).join('\n')

  return `<ul>
    ${sectionsHtml}
    <li class="menu-title"><span>Account</span></li>
    <li>
      <ul>
        <li><a href="javascript:void(0);" onclick="doLogout()"><i class="ti ti-logout text-danger"></i><span class="text-danger fw-semibold">Sign Out</span></a></li>
      </ul>
    </li>
  </ul>`
}

/**
 * Every page href that could ever appear in the nav, flattened - the
 * canonical page catalog the Roles & Permissions admin page and the
 * server-side page gate both build their checklists/allowlists from,
 * so there's exactly one place page identifiers are defined.
 */
function lilypadNavAllPages () {
  const pages = []
  LILYPAD_NAV_SECTIONS.forEach((section) => {
    if (section.type === 'single') pages.push(section.href)
    else section.items.forEach((item) => pages.push(item.href))
  })
  return pages
}

/**
 * Prunes the already-rendered sidebar down to just the pages a role is
 * allowed to see. `allowedPages` of null/undefined means "no
 * restriction" (true admins, or a status check that failed open) - every
 * link stays. An empty array is a real "sees nothing configured yet."
 * Runs after the initial render (permissions arrive from /account/me,
 * an async call) rather than blocking first paint on it.
 */
function lilypadNavApplyPermissions (allowedPages) {
  if (allowedPages == null) return
  const allowed = new Set(allowedPages)
  const container = document.getElementById('sidebar-menu')
  if (!container) return

  container.querySelectorAll('.sidebar-menu > ul > li').forEach((li) => {
    if (li.classList.contains('menu-title')) return // "Account" section header
    const links = Array.from(li.querySelectorAll('a[href]')).filter((a) => a.getAttribute('href') !== 'javascript:void(0);')
    if (!links.length) return // Sign Out row, or a group toggle with no direct href

    links.forEach((a) => {
      const parentLi = a.closest('li')
      if (parentLi && parentLi !== li && !allowed.has(a.getAttribute('href'))) parentLi.remove()
    })

    // A "single" top-level item's own href lives on li > ul > li > a - if
    // that leaf survived above, this li stays; if the group's own href
    // (a top-level single item) isn't allowed, or a group's items were
    // all pruned above leaving it empty, remove the whole entry.
    const remainingLinks = li.querySelectorAll('a[href]')
    const hasRealLink = Array.from(remainingLinks).some((a) => a.getAttribute('href') !== 'javascript:void(0);')
    if (!hasRealLink) li.remove()
  })
}

/**
 * A slim, unmissable banner so an admin using "Preview as" never loses
 * track of the fact they're not looking at their own real view. Exiting
 * clears the session-side preview and reloads.
 */
function lilypadNavShowPreviewBanner (role) {
  if (document.getElementById('lilypadPreviewBanner')) return
  const banner = document.createElement('div')
  banner.id = 'lilypadPreviewBanner'
  banner.style.cssText = 'position:sticky;top:0;z-index:1080;background:#7c3aed;color:#fff;padding:8px 16px;font-size:13px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:12px;'
  banner.innerHTML = `<i class="ti ti-eye"></i> Previewing as <span style="text-transform:capitalize;">${role}</span> - this is what that role sees, not your own account.
    <button type="button" style="background:#fff;color:#7c3aed;border:none;border-radius:20px;padding:2px 12px;font-weight:600;cursor:pointer;">Exit Preview</button>`
  banner.querySelector('button').onclick = async () => {
    try { await fetch('/api/v1/lilypad/preview-role', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role: null }) }) } catch (e) {}
    window.location.reload()
  }
  document.body.prepend(banner)
}

const lilypadNavContainer = typeof document !== 'undefined' ? document.getElementById('sidebar-menu') : null
if (lilypadNavContainer) {
  lilypadNavContainer.innerHTML = lilypadRenderSidebarNav()

  // Self-contained on purpose: every page already fetches its own
  // /account/me for topbar name/role display, so this is a second, small
  // call rather than requiring ~20 pages to each remember to wire nav
  // pruning + the preview banner into their own bootstrap code.
  fetch('/api/v1/lilypad/account/me').then((r) => r.json()).then((result) => {
    if (!result.success) return
    lilypadNavApplyPermissions(result.data.allowedPages)
    if (result.data.previewRole) lilypadNavShowPreviewBanner(result.data.previewRole)
  }).catch(() => {})
}

// Node-side reuse (pagePermissionService.js) needs the raw page catalog,
// not the DOM-rendering functions above (document doesn't exist there).
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LILYPAD_NAV_SECTIONS, DETAIL_PAGE_ACTIVE_MAP, lilypadNavAllPages }
}

// Canonical Sign Out handler - actually destroys the server-side
// session via /logout. Several older pages (dashboard.html, tickets.html
// confirmed) only cleared client-side sessionStorage/localStorage keys
// and never called the real logout endpoint, leaving the session cookie
// valid despite the UI redirecting to the login page. Declaring it here
// fixes those pages automatically; on pages that already defined their
// own identical doLogout(), this one is simply overridden by the later
// declaration in that page's own script - harmless, not a conflict.
async function doLogout () {
  try { await fetch('/logout') } catch (e) {}
  window.location.href = 'login.html'
}
