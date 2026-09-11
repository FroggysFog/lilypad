/**
 * LilyPad ERP - Roles & Permissions Admin Controller
 * Configures which nav pages each role can see (lilypadRolePermission.js),
 * which Command Center widgets/KPIs each role gets (dashboardRolePresets.js
 * checks this same collection's allowedWidgets/allowedKpis before falling
 * back to its own hardcoded presets), and lets an admin "preview as"
 * another role for their own session (see pageAccessGate/getMe for how
 * the preview is applied).
 */

const path = require('path')
const { LILYPAD_NAV_SECTIONS } = require(path.join(__dirname, '../../public/assets/js/lilypad-nav.js'))
const LilyPadRolePermission = require('../models/lilypadRolePermission')
const LilyPadAccount = require('../models/lilypadAccount')
const dashboardRolePresets = require('../services/dashboardRolePresets')

const controller = {}

/**
 * GET /api/v1/lilypad/role-permissions
 * The nav catalog (grouped, for rendering a checklist the same shape as
 * the sidebar) plus the dashboard widget/KPI catalogs, plus every role
 * currently in use or already configured, each with its saved
 * allowedPages/allowedWidgets/allowedKpis (admin is omitted - it's
 * always everything, not editable). allowedWidgets/allowedKpis reflect
 * the *effective* set for a role that's never been explicitly
 * configured (dashboardRolePresets.js's legacy fallback), so the
 * checklist starts pre-checked with whatever that role actually sees
 * today rather than blank.
 */
controller.getRolePermissions = async function (req, res) {
  try {
    // Administration & Setup is excluded - it's admin-only regardless of
    // what a role's permission doc says (see pagePermissionService.js's
    // ADMIN_ONLY_PAGES), so offering it as a checkbox here would be
    // misleading - checking it would silently do nothing.
    const catalog = LILYPAD_NAV_SECTIONS.filter((section) => !section.adminOnly).map((section) => ({
      label: section.label,
      items: section.type === 'single'
        ? [{ href: section.href, label: section.label }]
        : section.items.map((item) => ({ href: item.href, label: item.label }))
    }))

    const widgetCatalog = dashboardRolePresets.ALL_WIDGETS.map((w) => ({
      id: w.id, title: w.title, description: w.description, category: w.category, icon: w.icon
    }))
    const kpiCatalog = dashboardRolePresets.ALL_KPIS.map((k) => ({
      id: k.id, label: k.label, icon: k.icon, color: k.color
    }))

    const rolesInUse = await LilyPadAccount.distinct('role', { deleted: { $ne: true } })
    const permissionDocs = await LilyPadRolePermission.find({})

    const roleNames = new Set([...rolesInUse, ...permissionDocs.map((d) => d.role)])
    roleNames.delete('admin') // always full access, not configurable

    const allowedPagesByRole = new Map(permissionDocs.map((d) => [d.role, d.allowedPages]))

    const roles = await Promise.all(Array.from(roleNames).sort().map(async (role) => {
      const effectiveWidgets = await dashboardRolePresets.getAvailableWidgetsForRole(role)
      const effectiveKpis = await dashboardRolePresets.getAvailableKpisForRole(role)
      return {
        role,
        allowedPages: allowedPagesByRole.get(role) || [],
        allowedWidgets: effectiveWidgets.map((w) => w.id),
        allowedKpis: effectiveKpis.map((k) => k.id),
        inUse: rolesInUse.includes(role)
      }
    }))

    return res.status(200).json({ success: true, data: { catalog, widgetCatalog, kpiCatalog, roles } })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * PUT /api/v1/lilypad/role-permissions/:role
 * allowedWidgets/allowedKpis are only written when the request actually
 * includes them (as arrays) - keeps this endpoint backward compatible
 * with saving just page access, and avoids a page-only save silently
 * wiping out a role's dashboard config or vice versa.
 */
controller.setRolePermissions = async function (req, res) {
  try {
    const role = String(req.params.role || '').trim().toLowerCase()
    if (!role || role === 'admin') {
      return res.status(400).json({ success: false, error: 'Invalid role.' })
    }

    const allowedPages = Array.isArray(req.body.allowedPages) ? req.body.allowedPages.map((p) => String(p).trim()) : []
    const update = { role, allowedPages }

    if (Array.isArray(req.body.allowedWidgets)) {
      update.allowedWidgets = req.body.allowedWidgets.map((w) => String(w).trim())
    }
    if (Array.isArray(req.body.allowedKpis)) {
      update.allowedKpis = req.body.allowedKpis.map((k) => String(k).trim())
    }

    const doc = await LilyPadRolePermission.findOneAndUpdate(
      { role },
      update,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    return res.status(200).json({ success: true, data: doc })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/preview-role
 * Admin-only (own session): sets/clears req.session.previewRole. Not
 * itself a security boundary - it's a UX convenience so an admin can see
 * what a role sees without a second account; see pageAccessGate.js for
 * where it's actually consumed.
 */
controller.setPreviewRole = async function (req, res) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Only admins can use preview mode.' })
    }

    const role = req.body.role ? String(req.body.role).trim().toLowerCase() : null
    if (role === 'admin') {
      return res.status(400).json({ success: false, error: "Previewing as \"admin\" isn't meaningful - that's your own role." })
    }

    req.session.previewRole = role
    return res.status(200).json({ success: true, data: { previewRole: role } })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

module.exports = controller
