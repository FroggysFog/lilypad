/**
 * LilyPad ERP - Order Schema
 * Synced from Salesforce Order (+ OrderItem line items) records.
 */

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const COLLECTION = 'lilypad_orders'

const addressSchema = new Schema({
  street: { type: String, trim: true, default: '' },
  city: { type: String, trim: true, default: '' },
  state: { type: String, trim: true, default: '' },
  postalCode: { type: String, trim: true, default: '' },
  country: { type: String, trim: true, default: '' }
}, { _id: false })

const orderItemSchema = new Schema({
  productName: { type: String, trim: true, default: '' },
  sku: { type: String, trim: true, default: '' },
  quantity: { type: Number, default: 0 },
  unitPrice: { type: Number, default: 0 },
  totalPrice: { type: Number, default: 0 }
}, { _id: false })

const orderSchema = new Schema(
  {
    orderNumber: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      trim: true,
      default: ''
    },
    effectiveDate: {
      type: String,
      default: null
    },
    endDate: {
      type: String,
      default: null
    },
    totalAmount: {
      type: Number,
      default: 0
    },
    accountId: {
      type: String,
      trim: true,
      default: ''
    },
    accountName: {
      type: String,
      trim: true,
      default: ''
    },
    accountPhone: {
      type: String,
      trim: true,
      default: ''
    },
    billingAddress: addressSchema,
    shippingAddress: addressSchema,
    description: {
      type: String,
      default: ''
    },
    items: [orderItemSchema],
    sourceRecordId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    lastSyncAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model(COLLECTION, orderSchema)
