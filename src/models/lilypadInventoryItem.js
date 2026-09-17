/**
 * LilyPad ERP - Inventory Item
 * There is no real-time stock feed anywhere in this app - Cart.com's
 * already-integrated API only ever touches orders/customers/payments,
 * never products/inventory (confirmed by reading its entire client),
 * and no purchase-order/supplier model exists to source "on the way"
 * or an arrival date from. This is a manually-maintained record
 * instead of a fabricated one: every count starts real (zero/empty)
 * and only changes when someone actually updates it here, rather than
 * a UI that invents plausible-looking numbers with nothing behind them.
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
