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

const shipmentSchema = new Schema({
  trackingNumber: { type: String, trim: true, default: '' },
  trackingNumberAlt: { type: String, trim: true, default: '' },
  carrier: { type: String, trim: true, default: '' },
  service: { type: String, trim: true, default: '' },
  shippingCost: { type: Number, default: 0 },
  shipmentWeight: { type: Number, default: 0 },
  magentoOrderNumber: { type: String, trim: true, default: '' },
  shipDate: { type: String, trim: true, default: '' },
  sourceRecordId: { type: String, trim: true, default: '' }
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
    ownerName: {
      type: String,
      trim: true,
      default: ''
    },
    name: {
      type: String,
      trim: true,
      default: ''
    },
    recordTypeName: {
      type: String,
      trim: true,
      default: ''
    },
    priceBookName: {
      type: String,
      trim: true,
      default: ''
    },
    orderSource: {
      type: String,
      trim: true,
      default: ''
    },
    caseStatus: {
      type: String,
      trim: true,
      default: ''
    },
    orderEntryRep: {
      type: String,
      trim: true,
      default: ''
    },
    isReductionOrder: {
      type: Boolean,
      default: false
    },
    poNumber: {
      type: String,
      trim: true,
      default: ''
    },
    poDate: {
      type: String,
      default: null
    },
    billToContactName: {
      type: String,
      trim: true,
      default: ''
    },
    billToContactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: ''
    },
    billToContactPhone: {
      type: String,
      trim: true,
      default: ''
    },
    shipToContactName: {
      type: String,
      trim: true,
      default: ''
    },
    netTerms: {
      type: String,
      trim: true,
      default: ''
    },
    daysPastDue: {
      type: Number,
      default: 0
    },
    totalDue: {
      type: Number,
      default: 0
    },
    initialDueDate: {
      type: String,
      default: null
    },
    finalDueDate: {
      type: String,
      default: null
    },
    shippedDate: {
      type: String,
      default: null
    },
    paymentMethod: {
      type: String,
      trim: true,
      default: ''
    },
    cartOrderId: {
      type: String,
      trim: true,
      default: ''
    },
    discountAmount: {
      type: Number,
      default: 0
    },
    couponCode: {
      type: String,
      trim: true,
      default: ''
    },
    subtotal: {
      type: Number,
      default: 0
    },
    taxAmount: {
      type: Number,
      default: 0
    },
    shippingAmount: {
      type: Number,
      default: 0
    },
    shippingRefunded: {
      type: Number,
      default: 0
    },
    subtotalRefunded: {
      type: Number,
      default: 0
    },
    totalRefunded: {
      type: Number,
      default: 0
    },
    totalInvoiced: {
      type: Number,
      default: 0
    },
    totalPaid: {
      type: Number,
      default: 0
    },
    grandTotal: {
      type: Number,
      default: 0
    },
    netShipping: {
      type: Number,
      default: 0
    },
    netDueAmount: {
      type: Number,
      default: 0
    },
    adjustedAmount: {
      type: Number,
      default: 0
    },
    productCost: {
      type: Number,
      default: 0
    },
    orderProfitability: {
      type: Number,
      default: 0
    },
    grossMargin: {
      type: Number,
      default: 0
    },
    orderProductsVolume: {
      type: Number,
      default: 0
    },
    originalOrderDate: {
      type: String,
      default: null
    },
    attainmentDate: {
      type: String,
      default: null
    },
    customerEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: ''
    },
    customerId: {
      type: String,
      trim: true,
      default: ''
    },
    orderBillingCompany: {
      type: String,
      trim: true,
      default: ''
    },
    orderBillingName: {
      type: String,
      trim: true,
      default: ''
    },
    orderBillingPhone: {
      type: String,
      trim: true,
      default: ''
    },
    orderShippingCompany: {
      type: String,
      trim: true,
      default: ''
    },
    orderShippingName: {
      type: String,
      trim: true,
      default: ''
    },
    orderShippingPhone: {
      type: String,
      trim: true,
      default: ''
    },
    shippingDescription: {
      type: String,
      trim: true,
      default: ''
    },
    weight: {
      type: Number,
      default: 0
    },
    internalOrderNotes: {
      type: String,
      default: ''
    },
    externalOrderNotes: {
      type: String,
      default: ''
    },
    billingAddress: addressSchema,
    shippingAddress: addressSchema,
    description: {
      type: String,
      default: ''
    },
    items: [orderItemSchema],
    shipments: [shipmentSchema],
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
