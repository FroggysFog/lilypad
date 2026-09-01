/**
 * LilyPad ERP - Dynamic Intake Form Schema
 * Defines category-specific intake forms with dynamic fields.
 */

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const COLLECTION = 'intake_forms'

const fieldDefinitionSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    description: 'Property key name stored in ticket.formData (e.g., budgetCode, deviceType)'
  },
  label: {
    type: String,
    required: true,
    trim: true,
    description: 'Human-readable label displayed on the intake form'
  },
  type: {
    type: String,
    required: true,
    enum: ['text', 'textarea', 'number', 'select', 'date', 'checkbox', 'file'],
    default: 'text'
  },
  placeholder: {
    type: String,
    default: ''
  },
  options: [{
    label: String,
    value: String
  }],
  required: {
    type: Boolean,
    default: false
  },
  defaultValue: {
    type: Schema.Types.Mixed,
    default: null
  },
  order: {
    type: Number,
    default: 0
  },
  helpText: {
    type: String,
    default: ''
  }
}, { _id: true })

const intakeFormSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    description: 'Category / Form Name (e.g., "Hardware Procurement", "Client ERP Onboarding")'
  },
  slug: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true,
    index: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  icon: {
    type: String,
    default: 'ti-file-text',
    description: 'Tabler icon identifier for UI rendering (e.g. ti-device-laptop, ti-tool, ti-building)'
  },
  target: {
    type: String,
    enum: ['internal', 'external', 'both'],
    default: 'both',
    description: 'Audience eligibility for this intake form'
  },
  defaultPriority: {
    type: String,
    enum: ['Low', 'Normal', 'High', 'Urgent'],
    default: 'Normal'
  },
  defaultAssignee: {
    type: Schema.Types.ObjectId,
    ref: 'lilypad_accounts',
    default: null
  },
  fields: [fieldDefinitionSchema],
  active: {
    type: Boolean,
    default: true,
    index: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
})

// Auto-generate slug before save if not provided
intakeFormSchema.pre('validate', function (next) {
  if (this.name && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }
  next()
})

// Static helpers
intakeFormSchema.statics.getActiveForms = function (target) {
  const query = { active: true }
  if (target && target !== 'both') {
    query.target = { $in: [target, 'both'] }
  }
  return this.find(query).sort({ order: 1, name: 1 })
}

intakeFormSchema.statics.getBySlug = function (slug) {
  return this.findOne({ slug, active: true })
}

module.exports = mongoose.model(COLLECTION, intakeFormSchema)

