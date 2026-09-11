/**
 * LilyPad ERP - Dashboard Role Presets & Preferences Service
 * Provides role-tailored workspace layouts and modular widget registries.
 *
 * ROLE_PRESETS below is a fallback, not the source of truth - an admin
 * can override which widgets/KPIs a role's Command Center shows from
 * admin-roles.html (see lilypadRolePermission.js's allowedWidgets/
 * allowedKpis), which is checked first. ROLE_PRESETS only still applies
 * to a role nobody has explicitly configured there yet, so existing
 * accounts keep their current dashboard the moment this feature ships.
 */

const LilyPadAccount = require('../models/lilypadAccount')
const LilyPadRolePermission = require('../models/lilypadRolePermission')

const ALL_WIDGETS = [
  {
    id: 'my-day',
    title: 'My Day & Work Queue',
    description: "Unified daily workspace: Today's scheduled focus on top, backlog queue divided underneath with drag-and-drop triage",
    category: 'Core Operations',
    icon: 'ti-layout-kanban',
    defaultWidth: 12,
    allowedRoles: ['*']
  },
  {
    id: 'rma-bench',
    title: 'Depot Repair & RMA Diagnostics',
    description: 'Machine diagnostic queue, burn-in tests, and bench repair status',
    category: 'Operations',
    icon: 'ti-tool',
    defaultWidth: 6,
    allowedRoles: ['admin', 'support', 'tech', 'operations', 'user']
  },
  {
    id: 'sales-pipeline',
    title: 'Sales Opportunities & Deals',
    description: 'Active Salesforce deals, quote statuses, and follow-ups due',
    category: 'Sales',
    icon: 'ti-chart-arrows',
    defaultWidth: 6,
    allowedRoles: ['admin', 'sales', 'operations']
  },
  {
    id: 'lapsed-customers',
    title: 'Fluid Reorder & Lapsed Radar',
    description: 'Venues and accounts due for fluid replenishment (60+ days)',
    category: 'Sales',
    icon: 'ti-radar',
    defaultWidth: 6,
    allowedRoles: ['admin', 'sales', 'marketing', 'operations']
  },
  {
    id: 'shipping-dock',
    title: 'Shipping & Fulfillment Board',
    description: 'Cart.com and wholesale orders ready for packing and freight pickup',
    category: 'Logistics',
    icon: 'ti-truck-delivery',
    defaultWidth: 6,
    allowedRoles: ['admin', 'warehouse', 'logistics', 'operations']
  },
  {
    id: 'past-due-ar',
    title: 'A/R Dunning & Past Due Watchlist',
    description: 'Past due accounts over 30 days and automated reminder status',
    category: 'Finance',
    icon: 'ti-coin',
    defaultWidth: 6,
    allowedRoles: ['admin', 'finance', 'accounting', 'operations']
  },
  {
    id: 'priority-conversations',
    title: 'Priority Conversations',
    description: 'AI email sender cards, rollup summaries, open blockers, and quick responses',
    category: 'Communications',
    icon: 'ti-user-star',
    defaultWidth: 6,
    allowedRoles: ['*']
  },
  {
    id: 'suggested-tasks',
    title: 'Suggested Email Tasks',
    description: 'AI-extracted action items from incoming emails awaiting triage & approval',
    category: 'Productivity',
    icon: 'ti-bulb',
    defaultWidth: 6,
    allowedRoles: ['*']
  },
  {
    id: 'quick-actions',
    title: 'Quick Launch Hub',
    description: 'Role-tailored shortcut buttons for fast daily execution',
    category: 'Productivity',
    icon: 'ti-bolt',
    defaultWidth: 12,
    allowedRoles: ['*']
  },
  {
    id: 'company-bulletin',
    title: 'Company Announcements & Safety Alerts',
    description: 'Facility notices, dock schedules, and team messages',
    category: 'Company',
    icon: 'ti-speakerphone',
    defaultWidth: 12,
    allowedRoles: ['*']
  }
]

const ALL_KPIS = [
  { id: 'kpi-todo', label: 'To-Do Queue', icon: 'ti-clock', color: 'primary', allowedRoles: ['*'] },
  { id: 'kpi-in-progress', label: 'In Progress', icon: 'ti-loader', color: 'primary', allowedRoles: ['*'] },
  { id: 'kpi-urgent', label: 'Urgent / High', icon: 'ti-alert-triangle', color: 'danger', allowedRoles: ['*'] },
  { id: 'kpi-complete', label: 'Completed', icon: 'ti-circle-check', color: 'secondary', allowedRoles: ['*'] },
  { id: 'kpi-suggested-tasks', label: 'Email AI Tasks', icon: 'ti-bulb', color: 'warning', allowedRoles: ['*'] },
  { id: 'kpi-deals', label: 'Active Deals ($)', icon: 'ti-currency-dollar', color: 'primary', allowedRoles: ['admin', 'sales', 'operations'] },
  { id: 'kpi-orders-shipping', label: 'Orders to Ship', icon: 'ti-package', color: 'warning', allowedRoles: ['admin', 'warehouse', 'logistics', 'operations'] },
  { id: 'kpi-past-due-total', label: 'Past Due A/R ($)', icon: 'ti-report-money', color: 'danger', allowedRoles: ['admin', 'finance', 'accounting', 'operations'] },
  { id: 'kpi-rma-active', label: 'Active RMAs', icon: 'ti-tool', color: 'warning', allowedRoles: ['admin', 'support', 'tech', 'operations', 'user'] }
]

const ROLE_PRESETS = {
  // 1. Support & Machine Diagnostic Technician
  support: {
    roleName: 'Support & Machine Technician',
    kpis: ['kpi-todo', 'kpi-in-progress', 'kpi-urgent', 'kpi-rma-active'],
    widgets: ['quick-actions', 'my-day', 'priority-conversations', 'suggested-tasks', 'rma-bench'],
    layoutMode: 'bento'
  },
  tech: {
    roleName: 'Support & Machine Technician',
    kpis: ['kpi-todo', 'kpi-in-progress', 'kpi-urgent', 'kpi-rma-active'],
    widgets: ['quick-actions', 'my-day', 'priority-conversations', 'suggested-tasks', 'rma-bench'],
    layoutMode: 'bento'
  },

  // 2. Sales & Account Executive
  sales: {
    roleName: 'Sales & Account Executive',
    kpis: ['kpi-deals', 'kpi-todo', 'kpi-in-progress', 'kpi-complete'],
    widgets: ['quick-actions', 'my-day', 'priority-conversations', 'suggested-tasks', 'sales-pipeline', 'lapsed-customers'],
    layoutMode: 'bento'
  },

  // 3. Warehouse & Logistics Operations
  warehouse: {
    roleName: 'Warehouse & Logistics Operations',
    kpis: ['kpi-orders-shipping', 'kpi-todo', 'kpi-urgent', 'kpi-complete'],
    widgets: ['quick-actions', 'shipping-dock', 'my-day', 'priority-conversations', 'suggested-tasks', 'company-bulletin'],
    layoutMode: 'bento'
  },
  logistics: {
    roleName: 'Warehouse & Logistics Operations',
    kpis: ['kpi-orders-shipping', 'kpi-todo', 'kpi-urgent', 'kpi-complete'],
    widgets: ['quick-actions', 'shipping-dock', 'my-day', 'priority-conversations', 'suggested-tasks', 'company-bulletin'],
    layoutMode: 'bento'
  },

  // 4. Finance & A/R Specialist
  finance: {
    roleName: 'Finance & Accounts Receivable',
    kpis: ['kpi-past-due-total', 'kpi-todo', 'kpi-in-progress', 'kpi-complete'],
    widgets: ['quick-actions', 'past-due-ar', 'my-day', 'priority-conversations', 'suggested-tasks', 'company-bulletin'],
    layoutMode: 'bento'
  },
  accounting: {
    roleName: 'Finance & Accounts Receivable',
    kpis: ['kpi-past-due-total', 'kpi-todo', 'kpi-in-progress', 'kpi-complete'],
    widgets: ['quick-actions', 'past-due-ar', 'my-day', 'priority-conversations', 'suggested-tasks', 'company-bulletin'],
    layoutMode: 'bento'
  },

  // 5. Executive / Operations Leadership (Scott)
  admin: {
    roleName: 'Operations Leadership & Admin',
    kpis: ['kpi-todo', 'kpi-in-progress', 'kpi-urgent', 'kpi-complete'],
    widgets: ['company-bulletin', 'quick-actions', 'my-day', 'priority-conversations', 'suggested-tasks', 'sales-pipeline', 'past-due-ar', 'shipping-dock', 'rma-bench'],
    layoutMode: 'bento'
  },
  operations: {
    roleName: 'Operations Leadership & Admin',
    kpis: ['kpi-todo', 'kpi-in-progress', 'kpi-urgent', 'kpi-complete'],
    widgets: ['company-bulletin', 'quick-actions', 'my-day', 'priority-conversations', 'suggested-tasks', 'sales-pipeline', 'past-due-ar', 'shipping-dock', 'rma-bench'],
    layoutMode: 'bento'
  },

  // 6. Default Staff Member
  user: {
    roleName: 'Staff Member',
    kpis: ['kpi-todo', 'kpi-in-progress', 'kpi-urgent', 'kpi-complete'],
    widgets: ['quick-actions', 'my-day', 'priority-conversations', 'suggested-tasks', 'company-bulletin'],
    layoutMode: 'bento'
  }
}

function normalizeRoleKey(role) {
  const clean = String(role || '').trim().toLowerCase()
  if (clean.includes('sale')) return 'sales'
  if (clean.includes('support') || clean.includes('tech') || clean.includes('rma')) return 'support'
  if (clean.includes('ware') || clean.includes('ship') || clean.includes('logist') || clean.includes('pack')) return 'warehouse'
  if (clean.includes('finan') || clean.includes('account') || clean.includes('billing')) return 'finance'
  if (clean.includes('admin') || clean.includes('exec') || clean.includes('operat') || clean.includes('lead')) return 'admin'
  return ROLE_PRESETS[clean] ? clean : 'user'
}

function getLegacyPresetForRole(role) {
  const key = normalizeRoleKey(role)
  return ROLE_PRESETS[key] || ROLE_PRESETS.user
}

function isWidgetAllowedForRole(widget, role) {
  if (!widget.allowedRoles || widget.allowedRoles.includes('*')) return true
  const normRole = normalizeRoleKey(role)
  if (normRole === 'admin') return true
  return widget.allowedRoles.some(r => r === normRole || r === role)
}

function getAvailableWidgetsForRoleLegacy(role) {
  return ALL_WIDGETS.filter(w => isWidgetAllowedForRole(w, role))
}

function getAvailableKpisForRoleLegacy(role) {
  const normRole = normalizeRoleKey(role)
  if (normRole === 'admin') return ALL_KPIS
  return ALL_KPIS.filter(k => !k.allowedRoles || k.allowedRoles.includes('*') || k.allowedRoles.includes(normRole))
}

// Deliberately the literal role string only, not normalizeRoleKey's
// bucket - "operations"/"exec"/"lead" all normalize into the same
// legacy fallback bucket as admin (full access when nobody's
// configured them), but unlike literal admin, they're still meant to
// be restrictable once an admin actually saves an override for them.
function isAdminRole(role) {
  return String(role || '').trim().toLowerCase() === 'admin'
}

/**
 * The admin-saved override doc for this role, keyed by the account's raw
 * role string (same key admin-roles.html already uses for allowedPages) -
 * not the normalizeRoleKey bucket the *legacy* preset below falls back
 * to, so a custom role (e.g. "marketing", defined straight from admin-
 * roles.html) can get its own dashboard config without needing a code
 * change to teach normalizeRoleKey a new bucket.
 */
async function getRoleOverride(role) {
  if (!role || isAdminRole(role)) return null
  return LilyPadRolePermission.findOne({ role: String(role).trim().toLowerCase() })
}

/**
 * Ceiling AND default in one - once an admin has saved a widget/KPI
 * list for a role, that list is both everything the role's Command
 * Center shows out of the box and everything "Customize Workspace" can
 * add back. A role nobody's configured yet still gets the older
 * hand-curated ROLE_PRESETS/allowedRoles behavior unchanged.
 */
async function getAvailableWidgetsForRole(role) {
  if (isAdminRole(role)) return ALL_WIDGETS

  const override = await getRoleOverride(role)
  if (override && Array.isArray(override.allowedWidgets)) {
    const idSet = new Set(override.allowedWidgets)
    return ALL_WIDGETS.filter(w => idSet.has(w.id))
  }
  return getAvailableWidgetsForRoleLegacy(role)
}

async function getAvailableKpisForRole(role) {
  if (isAdminRole(role)) return ALL_KPIS

  const override = await getRoleOverride(role)
  if (override && Array.isArray(override.allowedKpis)) {
    const idSet = new Set(override.allowedKpis)
    return ALL_KPIS.filter(k => idSet.has(k.id))
  }
  return getAvailableKpisForRoleLegacy(role)
}

async function getPresetForRole(role) {
  const legacy = getLegacyPresetForRole(role)
  if (isAdminRole(role)) return legacy

  const override = await getRoleOverride(role)
  if (override && (Array.isArray(override.allowedWidgets) || Array.isArray(override.allowedKpis))) {
    return {
      roleName: legacy.roleName,
      widgets: Array.isArray(override.allowedWidgets) ? override.allowedWidgets : legacy.widgets,
      kpis: Array.isArray(override.allowedKpis) ? override.allowedKpis : legacy.kpis,
      layoutMode: legacy.layoutMode || 'bento'
    }
  }
  return legacy
}

async function getPreferencesForAccount(account) {
  if (!account) return getPresetForRole('user')

  const role = account.role || 'user'
  const preset = await getPresetForRole(role)
  const allowedWidgets = (await getAvailableWidgetsForRole(role)).map(w => w.id)
  const allowedKpis = (await getAvailableKpisForRole(role)).map(k => k.id)

  const prefs = account.dashboardPreferences || {}

  if (prefs.customized && Array.isArray(prefs.widgets) && prefs.widgets.length > 0) {
    const filteredWidgets = prefs.widgets.filter(wId => allowedWidgets.includes(wId))
    
    // Ensure priority-conversations and suggested-tasks are available on the dashboard for everyone
    if (!filteredWidgets.includes('priority-conversations') && allowedWidgets.includes('priority-conversations')) {
      filteredWidgets.push('priority-conversations')
    }
    if (!filteredWidgets.includes('suggested-tasks') && allowedWidgets.includes('suggested-tasks')) {
      filteredWidgets.push('suggested-tasks')
    }

    const filteredKpis = Array.isArray(prefs.kpis) && prefs.kpis.length > 0 
      ? prefs.kpis.filter(kId => allowedKpis.includes(kId))
      : preset.kpis

    return {
      role: account.role,
      roleName: preset.roleName,
      customized: true,
      layoutMode: prefs.layoutMode || 'bento',
      widgets: filteredWidgets.length > 0 ? filteredWidgets : preset.widgets,
      kpis: filteredKpis.length > 0 ? filteredKpis : preset.kpis
    }
  }

  return {
    role: account.role,
    roleName: preset.roleName,
    customized: false,
    layoutMode: preset.layoutMode || 'bento',
    widgets: preset.widgets.filter(wId => allowedWidgets.includes(wId)),
    kpis: preset.kpis.filter(kId => allowedKpis.includes(kId))
  }
}

async function savePreferencesForAccount(accountId, preferences, userRole) {
  const allowedWidgets = (await getAvailableWidgetsForRole(userRole)).map(w => w.id)
  const allowedKpis = (await getAvailableKpisForRole(userRole)).map(k => k.id)

  const sanitizedWidgets = (Array.isArray(preferences.widgets) ? preferences.widgets : [])
    .filter(wId => allowedWidgets.includes(wId))

  const sanitizedKpis = (Array.isArray(preferences.kpis) ? preferences.kpis : [])
    .filter(kId => allowedKpis.includes(kId))

  const update = {
    dashboardPreferences: {
      widgets: sanitizedWidgets,
      kpis: sanitizedKpis,
      layoutMode: preferences.layoutMode || 'bento',
      customized: true
    }
  }

  return LilyPadAccount.findByIdAndUpdate(accountId, update, { new: true })
}

async function resetPreferencesForAccount(accountId, userRole) {
  const preset = await getPresetForRole(userRole)
  const update = {
    dashboardPreferences: {
      widgets: preset.widgets,
      kpis: preset.kpis,
      layoutMode: preset.layoutMode || 'bento',
      customized: false
    }
  }
  return LilyPadAccount.findByIdAndUpdate(accountId, update, { new: true })
}

module.exports = {
  ALL_WIDGETS,
  ALL_KPIS,
  ROLE_PRESETS,
  normalizeRoleKey,
  getPresetForRole,
  getRoleOverride,
  getAvailableWidgetsForRole,
  getAvailableKpisForRole,
  getPreferencesForAccount,
  savePreferencesForAccount,
  resetPreferencesForAccount
}
