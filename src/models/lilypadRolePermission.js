/**
 * LilyPad ERP - Per-Role Page & Dashboard Permissions
 * One document per role name, listing which nav pages (matching the
 * `href` values in assets/js/lilypad-nav.js's LILYPAD_NAV_SECTIONS -
 * that file is the single canonical page catalog, required directly by
 * pagePermissionService.js rather than duplicated here) that role can
 * see. 'admin' is never looked up - it always has full access,
 * enforced in code, not by seeding this collection.
 *
 * No document for a given role means "sees nothing yet" - a brand new
 * role starts locked down until an admin explicitly grants pages,
 * matching "only let Sales see X" being the default expectation for
 * anything not yet configured. The one-time migration that ships this
 * feature seeds 'agent' and 'user' with every page, so existing accounts
 * don't lose access the moment this deploys.
 *
 * allowedWidgets/allowedKpis are the same idea applied to the Command
 * Center (see dashboardRolePresets.js) - which of the dashboard's
 * modular widgets and KPI cards a role's Command Center shows, both as
 * the default layout and as the ceiling on what that role can add back
 * via "Customize Workspace". Unlike allowedPages, these default to
 * undefined (not an empty array) rather than being required at doc
 * creation time - a role saved before this field existed, or one an
 * admin has only ever configured for pages, should keep using
 * dashboardRolePresets.js's hardcoded fallback preset until an admin
 * actually visits the dashboard section and saves a choice, not fall
 * back to "shows nothing".
 */

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const COLLECTION = 'lilypad_role_permissions'

const rolePermissionSchema = new Schema(
  {
    role: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    allowedPages: [{
      type: String,
      trim: true
    }],
    allowedWidgets: {
      type: [String],
      default: undefined
    },
    allowedKpis: {
      type: [String],
      default: undefined
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model(COLLECTION, rolePermissionSchema)
