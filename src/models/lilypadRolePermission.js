/**
 * LilyPad ERP - Per-Role Page Permissions
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
    }]
  },
  { timestamps: true }
)

module.exports = mongoose.model(COLLECTION, rolePermissionSchema)
