/**
 * LilyPad ERP - Cart.com Order Schema
 * Local copy of Cart.com orders, scoped to whatever cartOrderSyncService
 * decides is in-scope (see that file for why this isn't "every order").
 * Fields are all confirmed against live /api/v1/orders.json,
 * /api/v1/order_payments.json, and /api/v1/customers/*.json responses
 * rather than guessed - see cartOrderSyncService.js for the mapping.
 */

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const COLLECTION = 'lilypad_cart_orders'

const cartOrderItemSchema = new Schema(
  {
    itemNumber: { type: String, trim: true, default: '' },
    itemName: { type: String, trim: true, default: '' },
    price: { type: Number, default: 0 },
    quantity: { type: Number, default: 0 }
  },
  { _id: false }
)

const cartOrderSchema = new Schema(
  {
    cartOrderId: {
      type: Number,
      required: true,
      unique: true,
      index: true
    },
    orderNumber: { type: String, trim: true, default: '' },
    orderStatusId: { type: Number, default: null },
    orderStatusName: { type: String, trim: true, default: '' },
    orderedAt: { type: Date, default: null },
    dueDate: { type: Date, default: null },
    grandTotal: { type: Number, default: 0 },
    subtotal: { type: Number, default: 0 },
    taxTotal: { type: Number, default: 0 },
    shippingTotal: { type: Number, default: 0 },
    discountTotal: { type: Number, default: 0 },
    amountPaid: { type: Number, default: 0 },
    balanceDue: { type: Number, default: 0 },
    isPastDue: { type: Boolean, default: false },
    customerId: { type: Number, default: null },
    customerName: { type: String, trim: true, default: '' },
    customerEmail: { type: String, trim: true, lowercase: true, default: '' },
    customerPhone: { type: String, trim: true, default: '' },
    customerCompany: { type: String, trim: true, default: '' },
    salesPerson: { type: String, trim: true, default: '' },
    adminComments: { type: String, trim: true, default: '' },
    publicComments: { type: String, trim: true, default: '' },
    items: { type: [cartOrderItemSchema], default: [] },
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

module.exports = mongoose.model(COLLECTION, cartOrderSchema)
