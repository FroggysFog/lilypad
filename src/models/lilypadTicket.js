/**
 * LilyPad ERP - Uniform Core Ticket Schema
 * Normalized Mongoose schema supporting both internal & external requests
 * with dynamic formData attributes and standardized 'To-Do' workflow.
 */

const mongoose = require('mongoose')
const Schema = mongoose.Schema
const counters = require('./counters')

const COLLECTION = 'lilypad_tickets'

const ticketSchema = new Schema({
  uid: {
    type: Number,
    unique: true,
    index: true
  },
  formattedUid: {
    type: String,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['To-Do', 'In Progress', 'Complete', 'Blocked'],
    default: 'To-Do',
    index: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Normal', 'High', 'Urgent'],
    default: 'Normal',
    index: true
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'intake_forms',
    index: true
  },
  categoryName: {
    type: String,
    trim: true,
    default: 'General'
  },
  source: {
    type: String,
    enum: ['internal', 'external', 'api', 'email'],
    default: 'internal',
    index: true
  },
  assignee: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  reporter: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  externalReporter: {
    name: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, lowercase: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    company: { type: String, trim: true, default: '' }
  },
  dueDate: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  tags: [{
    type: String,
    trim: true
  }],
  /**
   * Flexible metadata object storing all dynamic intake form fields
   * e.g., { budgetCode: "ENG-102", deviceModel: "MacBook M3", urgencyReason: "..." }
   */
  formData: {
    type: Schema.Types.Mixed,
    default: {}
  },
  history: [{
    action: { type: String, required: true },
    by: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    byName: { type: String, default: 'System' },
    description: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now }
  }],
  comments: [{
    author: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    authorName: { type: String, default: '' },
    isInternal: { type: Boolean, default: false },
    body: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    mimeType: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  workLogs: [{
    user: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    userName: { type: String, default: 'Agent' },
    hours: { type: Number, required: true },
    note: { type: String, default: '' },
    loggedAt: { type: Date, default: Date.now }
  }],
  trackingToken: {
    type: String,
    sparse: true,
    index: true
  },
  deleted: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true
})

// Auto-assign sequential UID before creation
ticketSchema.pre('save', async function (next) {
  if (this.isNew && !this.uid) {
    try {
      const counter = await counters.findOneAndUpdate(
        { _id: 'lilypad_tickets' },
        { $inc: { next: 1 } },
        { upsert: true, new: true }
      )
      this.uid = counter.next
      this.formattedUid = `LP-${counter.next}`
    } catch (err) {
      return next(err)
    }
  }

  if (this.isModified('status')) {
    if (this.status === 'Complete' && !this.completedAt) {
      this.completedAt = new Date()
    } else if (this.status !== 'Complete') {
      this.completedAt = null
    }
  }

  next()
})

// ==========================================
// Static Query & Management Helpers
// ==========================================

/**
 * Retrieve uniform 'To-Do' tickets for the primary management dashboard
 */
ticketSchema.statics.getTodoList = function (options = {}) {
  const query = {
    deleted: false
  }

  if (options.status) {
    query.status = options.status
  }

  if (options.assignee) {
    query.assignee = options.assignee
  }

  if (options.category) {
    query.category = options.category
  }

  if (options.priority) {
    query.priority = options.priority
  }

  if (options.search) {
    query.$or = [
      { title: { $regex: options.search, $options: 'i' } },
      { formattedUid: { $regex: options.search, $options: 'i' } },
      { 'externalReporter.name': { $regex: options.search, $options: 'i' } },
      { 'externalReporter.company': { $regex: options.search, $options: 'i' } }
    ]
  }

  return this.find(query)
    .populate('assignee', 'fullname email image title')
    .populate('reporter', 'fullname email image')
    .populate('category', 'name icon slug')
    .sort({ priority: -1, createdAt: -1 })
    .limit(options.limit || 100)
}

/**
 * Assign a ticket to a team member
 */
ticketSchema.statics.assignTicket = async function (ticketId, assigneeId, performedByUser) {
  const ticket = await this.findById(ticketId)
  if (!ticket) throw new Error('Ticket not found')

  ticket.assignee = assigneeId || null
  ticket.history.push({
    action: 'assigned',
    by: performedByUser ? performedByUser._id : null,
    byName: performedByUser ? performedByUser.fullname : 'System',
    description: assigneeId ? `Assigned ticket to team member` : `Unassigned ticket`
  })

  return ticket.save()
}

/**
 * Update workflow status (To-Do, In Progress, Complete, Blocked)
 */
ticketSchema.statics.updateStatus = async function (ticketId, newStatus, performedByUser) {
  const ticket = await this.findById(ticketId)
  if (!ticket) throw new Error('Ticket not found')

  const prevStatus = ticket.status
  ticket.status = newStatus

  ticket.history.push({
    action: 'status_changed',
    by: performedByUser ? performedByUser._id : null,
    byName: performedByUser ? performedByUser.fullname : 'System',
    description: `Status changed from "${prevStatus}" to "${newStatus}"`
  })

  return ticket.save()
}

module.exports = mongoose.model(COLLECTION, ticketSchema)

