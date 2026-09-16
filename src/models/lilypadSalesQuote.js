/**
 * LilyPad ERP - Sales OS Trial Quote
 * Deliberately its own collection, not LilyPadOrder - LilyPadOrder is
 * strictly Salesforce-synced (sourceRecordId required+unique) and is
 * exactly what the Ask-a-Report revenue widget sums via grandTotal.
 * A $0 draft sample-evaluation quote from a scraped lead has no place
 * in that collection; once a sample actually converts to a real sale,
 * that becomes a normal Salesforce Order synced in the usual way.
 */

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const COLLECTION = 'lilypad_sales_quotes'

const quoteItemSchema = new Schema({
  sku: { type: String, trim: true, default: '' },
  quantity: { type: Number, default: 1 },
  unitPrice: { type: Number, default: 0 },
  description: { type: String, trim: true, default: '' }
}, { _id: false })

const addressSchema = new Schema({
  street: String,
  city: String,
  state: String,
  zip: String
}, { _id: false })

const salesQuoteSchema = new Schema({
  sourceLeadId: { type: Schema.Types.ObjectId, ref: 'lilypad_sales_leads', required: true, index: true },
  division: { type: String, enum: ['froggys_fog', 'training_smoke'], required: true },
  customerName: { type: String, required: true, trim: true },
  contactName: { type: String, trim: true, default: '' },
  contactEmail: { type: String, trim: true, lowercase: true, default: '' },
  contactPhone: { type: String, trim: true, default: '' },
  shippingAddress: addressSchema,
  items: [quoteItemSchema],
  orderType: { type: String, enum: ['SAMPLE_EVALUATION'], default: 'SAMPLE_EVALUATION' },
  status: { type: String, enum: ['draft_quote', 'sent', 'converted', 'declined'], default: 'draft_quote', index: true },
  notes: { type: String, trim: true, default: '' }
}, { timestamps: true })

module.exports = mongoose.model(COLLECTION, salesQuoteSchema)
