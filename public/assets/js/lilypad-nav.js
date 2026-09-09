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

const lilypadNavContainer = document.getElementById('sidebar-menu')
if (lilypadNavContainer) {
  lilypadNavContainer.innerHTML = lilypadRenderSidebarNav()
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
