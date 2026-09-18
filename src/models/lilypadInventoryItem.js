/**
 * LilyPad ERP - Inventory Item
 * Real Cart.com catalog/stock data now exists (see lilypadCartProduct.js/
 * cartProductSyncService.js) via a separate static Catalog API token -
 * the OAuth app's read_catalog scope is rejected for reasons Cart.com
 * hasn't resolved, which is why this manual model was originally built.
 * It now serves as a supplemental overlay, joined onto synced products by
 * SKU in lilypadInventory.js's controller.list, for exactly the fields
 * Cart.com's product data doesn't provide: onTheWay, estimatedArrivalDate,
 * notes (no purchase-order/supplier model exists to source those from).
 * Every count still starts real (zero/empty) and only changes when
 * someone actually updates it here, not a UI that invents numbers.
 */

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const COLLECTION = 'lilypad_inventory_items'

const inventoryItemSchema = new Schema({
  name: { type: String, required: true, trim: true },
  machineType: { type: String, trim: true, default: '' },
  manufacturer: { type: String, trim: true, default: '' },
  sku: { type: String, trim: true, default: '', index: true },
  onHand: { type: Number, default: 0, min: 0 },
  onTheWay: { type: Number, default: 0, min: 0 },
  // Tracked separately from onHand rather than computed - lets a unit
  // already committed/quoted but not yet shipped be excluded from what
  // shows as sellable, without a reservation system to derive it from.
  availableToSell: { type: Number, default: 0, min: 0 },
  estimatedArrivalDate: { type: Date, default: null },
  notes: { type: String, trim: true, default: '' },
  updatedByName: { type: String, trim: true, default: '' }
}, { timestamps: true })

module.exports = mongoose.model(COLLECTION, inventoryItemSchema)
