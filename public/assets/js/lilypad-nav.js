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
  {
    type: 'group',
    icon: 'ti-ticket',
    label: 'Operations',
    // Rendered as a top tab row (below the topbar search) instead of a
    // sidebar submenu - see lilypadNavRenderTopTabs. Still walked by
    // lilypadNavAllPages() same as any other group, so these pages stay
    // fully covered by ALL_PAGES/ADMIN_ONLY_PAGES and the Roles &
    // Permissions checklist exactly as before - only where they render
    // changed, not whether they're permission-gated. Dashboard leads the
    // row (not the sidebar) on purpose - landing there with its tab
    // already showing active is what makes the row's purpose obvious on
    // first login, instead of a row of tabs nothing points to.
    renderAs: 'topTabs',
    items: [
      { href: 'dashboard.html', icon: 'ti-dashboard', label: 'Dashboard' },
      { href: 'tickets.html', icon: 'ti-ticket', label: 'Ticket Operations' },
      { href: 'tasks.html', icon: 'ti-list-check', label: 'Task Manager' },
      { href: 'calendar.html', icon: 'ti-calendar', label: 'Calendar' },
      { href: 'meeting-recaps.html', icon: 'ti-transcript', label: 'Meeting Recaps' },
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
    icon: 'ti-currency-dollar',
    label: 'Sales',
    items: [
      { href: 'prospects.html', icon: 'ti-user-search', label: 'Lead Prospector' },
      { href: 'customer-intelligence.html', icon: 'ti-chart-arrows', label: 'Customer Intelligence' },
      { href: 'opportunities.html', icon: 'ti-target-arrow', label: 'Opportunities' }
    ]
  },
  {
    type: 'group',
    icon: 'ti-settings-2',
    label: 'Administrative',
    id: 'adminSetupNavItem',
    adminOnly: true,
    items: [
      { href: 'admin-email.html', icon: 'ti-mail-forward', label: 'Inbound Email & Anti-Spam' },
      { href: 'admin-team.html', icon: 'ti-users', label: 'Team & User Permissions' },
      { href: 'admin-sales-quotas.html', icon: 'ti-target', label: 'Sales Quotas' },
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

  const sectionsHtml = LILYPAD_NAV_SECTIONS
    .filter((section) => section.renderAs !== 'topTabs')
    .map((section) =>
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
 * The "Operations" group (renderAs: 'topTabs' above) renders here instead
 * of the sidebar - the pages every role uses daily, one click away below
 * the topbar's search bar rather than buried in a collapsible submenu.
 * Uses a real injected stylesheet (lilypadInjectTopTabStyles) rather than
 * inline styles so :hover can actually be expressed in CSS.
 */
function lilypadNavRenderTopTabs (currentPage) {
  const section = LILYPAD_NAV_SECTIONS.find((s) => s.renderAs === 'topTabs')
  if (!section) return ''

  const tabsHtml = section.items.map((item) => {
    const isActive = item.href === currentPage
    const cls = 'lilypad-top-tab' + (isActive ? ' active' : '')
    return `<a href="${item.href}" class="${cls}" data-lilypad-top-tab="${item.href}"><i class="ti ${item.icon} fs-16"></i><span>${item.label}</span></a>`
  }).join('\n')

  return `<div class="d-flex flex-wrap" id="lilypadTopTabsRow">${tabsHtml}</div>`
}

/**
 * One-time stylesheet for the tab row - a bordered card (var(--bs-card-bg)/
 * var(--border-color), the same tokens every .card in the app already
 * uses, so this adapts to dark mode for free) holding tabs whose active
 * state is a bold, colored label with a short underline directly under
 * it - not a permanent highlight box, that's reserved for :hover, which
 * can only be expressed via a real CSS rule, not the inline styles the
 * first pass used.
 *
 * Colors come from the topbar's OWN theme tokens (--topbar-item-*), the
 * same ones .topbar-link (the notification bell, search, profile menu)
 * already uses - not --bs-primary/--bs-card-bg. This app's theme
 * customizer has an independent "Topbar Color" picker (light, dark, or
 * one of several bold/gradient presets - see style.css's
 * [data-topbar=...] blocks) whose colored/dark variants deliberately
 * override --topbar-item-hover-color to a fixed light shade instead of
 * the user's chosen accent color, since an arbitrary accent can be
 * illegible against a bold topbar background. Hardcoding --bs-primary
 * here would fight that and could land unreadable on those topbars;
 * riding the same tokens every other topbar element uses means this
 * always lands correctly whatever topbar color is selected.
 */
function lilypadInjectTopTabStyles () {
  if (document.getElementById('lilypadTopTabStyles')) return
  const style = document.createElement('style')
  style.id = 'lilypadTopTabStyles'
  style.textContent = `
    #lilypadTopTabsRow {
      background: var(--topbar-item-bg);
      border: 1px solid var(--topbar-item-border);
      border-radius: 10px;
      padding: 4px 8px;
      margin: 8px 0 12px;
      gap: 2px;
    }
    .lilypad-top-tab {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 14px;
      border-radius: 8px 8px 0 0;
      border-bottom: 2px solid transparent;
      color: var(--topbar-item-color);
      font-size: 14px;
      text-decoration: none;
      transition: color .15s ease, background-color .15s ease, border-color .15s ease;
    }
    .lilypad-top-tab:hover {
      color: var(--topbar-item-hover-color);
      background-color: var(--topbar-item-hover-bg);
    }
    .lilypad-top-tab.active {
      color: var(--topbar-item-hover-color);
      font-weight: 700;
      border-bottom-color: var(--topbar-item-hover-color);
    }
  `
  document.head.appendChild(style)
}

/**
 * Appended as a second row inside the existing sticky <header> rather
 * than as a sibling in the page body - the header already carries the
 * correct sidebar-width left margin (see .navbar-header in style.css),
 * so anything placed inside it inherits that alignment for free instead
 * of needing its own per-page layout math.
 */
function lilypadInjectTopTabs () {
  const header = document.querySelector('header.navbar-header')
  if (!header) return
  const html = lilypadNavRenderTopTabs(lilypadNavCurrentPage())
  if (!html) return
  lilypadInjectTopTabStyles()
  const wrapper = document.createElement('div')
  wrapper.innerHTML = html
  header.appendChild(wrapper.firstElementChild)
}

/**
 * Same idea as lilypadNavApplyPermissions, but for the flat top-tab row
 * instead of the grouped sidebar tree - removes any tab the role can't
 * access, then removes the whole row if that leaves it empty.
 */
function lilypadTopTabsApplyPermissions (allowedPages) {
  if (allowedPages == null) return
  const allowed = new Set(allowedPages)
  const row = document.getElementById('lilypadTopTabsRow')
  if (!row) return

  row.querySelectorAll('a[data-lilypad-top-tab]').forEach((a) => {
    if (!allowed.has(a.getAttribute('data-lilypad-top-tab'))) a.remove()
  })
  if (!row.querySelector('a')) row.remove()
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
  lilypadInjectTopTabs()

  // Self-contained on purpose: every page already fetches its own
  // /account/me for topbar name/role display, so this is a second, small
  // call rather than requiring ~20 pages to each remember to wire nav
  // pruning + the preview banner into their own bootstrap code.
  fetch('/api/v1/lilypad/account/me').then((r) => r.json()).then((result) => {
    if (!result.success) return
    lilypadNavApplyPermissions(result.data.allowedPages)
    lilypadTopTabsApplyPermissions(result.data.allowedPages)
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
