/**
 * LilyPad ERP - Cart.com Product/Catalog Schema
 * Local copy of Cart.com's product catalog, synced via the static Catalog
 * API token (see cartService.js's cartCatalogRequest) rather than the
 * OAuth flow, whose read_catalog scope is rejected for reasons Cart.com
 * hasn't resolved. Fields are a deliberately curated subset of the real
 * payload (~100 fields) - see cartProductSyncService.js for the mapping
 * and why most of the raw payload (storefront theming/e-commerce config)
 * is skipped.
 *
 * This is distinct from lilypadInventoryItem.js, which is a manually
 * hand-maintained stock tracker for fields Cart.com doesn't provide
 * (incoming ETA, notes) - do not conflate the two collections.
 */

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const COLLECTION = 'lilypad_cart_products'

const cartProductSchema = new Schema(
  {
    cartProductId: {
      type: Number,
      required: true,
      unique: true,
      index: true
    },
    itemNumber: { type: String, trim: true, default: '', index: true },
    itemName: { type: String, trim: true, default: '' },
    shortDescription: { type: String, trim: true, default: '' },
    manufacturerId: { type: Number, default: null },
    primaryCategoryId: { type: Number, default: null },
    productStatusId: { type: Number, default: null },
    price: { type: Number, default: 0 },
    retail: { type: Number, default: 0 },
    cost: { type: Number, default: 0 },
    quantityOnHand: { type: Number, default: 0 },
    quantityOnOrder: { type: Number, default: 0 },
    isDiscontinued: { type: Boolean, default: false },
    isHidden: { type: Boolean, default: false },
    isKit: { type: Boolean, default: false },
    isChildProduct: { type: Boolean, default: false },
    isNonInventory: { type: Boolean, default: false },
    lowStockWarningThreshold: { type: Number, default: null },
    enableLowStockWarning: { type: Boolean, default: false },
    weight: { type: Number, default: null },
    weightUnit: { type: String, trim: true, default: '' },
    gtin: { type: String, trim: true, default: '' },
    urlRewrite: { type: String, trim: true, default: '' },
    cartCreatedAt: { type: Date, default: null },
    cartUpdatedAt: { type: Date, default: null },
    sourceRecordId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    lastSyncAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
)

module.exports = mongoose.model(COLLECTION, cartProductSchema)
