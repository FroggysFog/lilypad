/**
 * LilyPad ERP - Personal Task Manager Schema
 * Still lighter than lilypad_tickets (no worklogs, no formData, no
 * internal-vs-external distinction) but does support attachments and
 * subtasks. A task lives on exactly one person's list at a time (the
 * `owner` field) and moves to someone else's list when "shared"
 * (assigned). `createdBy` is kept separately so the person who handed a
 * task off can still find it again under "Assigned by Me" after it's no
 * longer on their own list.
 *
 * Subtasks can each carry their own `assignee`, independent of the
 * parent task's owner - see getMyTasks() below, which surfaces a task
 * to anyone with an incomplete assigned subtask on it, and
 * checkAllSubtasksComplete(), which blocks marking the parent Done
 * until every subtask is.
 */

const mongoose = require('mongoose')
const Schema = mongoose.Schema
const counters = require('./counters')

const COLLECTION = 'lilypad_tasks'

const taskSchema = new Schema({
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
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['To-Do', 'In Progress', 'Done'],
    default: 'To-Do',
    index: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Normal', 'High', 'Urgent'],
    default: 'Normal',
    index: true
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
  // Whose list this task currently lives on - reassigning this is what
  // "sharing"/"assigning" a task means here.
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'lilypad_accounts',
    required: true,
    index: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'lilypad_accounts',
    required: true,
    index: true
  },
  // Additional people tagged on the task, distinct from `owner` - tagging
  // doesn't move the task off the owner's list the way sharing/assign
  // does, it just adds more people who also see it under "My Tasks".
  taggedUsers: [{
    type: Schema.Types.ObjectId,
    ref: 'lilypad_accounts',
    index: true
  }],
  // Optional cross-reference to a support ticket this task grew out of -
  // tasks and tickets stay separate concepts, this is just a pointer.
  linkedTicket: {
    type: Schema.Types.ObjectId,
    ref: 'lilypad_tickets',
    default: null
  },
  comments: [{
    author: { type: Schema.Types.ObjectId, ref: 'lilypad_accounts', default: null },
    authorName: { type: String, default: '' },
    body: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    mimeType: String,
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'lilypad_accounts', default: null },
    uploadedByName: { type: String, default: '' },
    uploadedAt: { type: Date, default: Date.now }
  }],
  // Each subtask can carry its own assignee, separate from the parent
  // task's owner - "this task needs 3 people to sign off" is modeled as
  // 3 subtasks, one per person. done/completedAt/completedBy record who
  // actually finished their piece and when (completedBy is intentionally
  // NOT always the assignee - the task owner/creator/a tagged user can
  // also close someone else's subtask as a management override).
  subtasks: [{
    text: { type: String, required: true, trim: true },
    assignee: { type: Schema.Types.ObjectId, ref: 'lilypad_accounts', default: null },
    done: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
    completedBy: { type: Schema.Types.ObjectId, ref: 'lilypad_accounts', default: null },
    completedByName: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
  }],
  history: [{
    action: { type: String, required: true },
    by: { type: Schema.Types.ObjectId, ref: 'lilypad_accounts', default: null },
    byName: { type: String, default: 'System' },
    description: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now }
  }],
  deleted: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true
})

taskSchema.pre('save', async function (next) {
  if (this.isNew && !this.uid) {
    try {
      const counter = await counters.findOneAndUpdate(
        { _id: 'lilypad_tasks' },
        { $inc: { next: 1 } },
        { upsert: true, new: true }
      )
      this.uid = counter.next
      this.formattedUid = `TSK-${counter.next}`
    } catch (err) {
      return next(err)
    }
  }

  if (this.isModified('status')) {
    if (this.status === 'Done' && !this.completedAt) {
      this.completedAt = new Date()
    } else if (this.status !== 'Done') {
      this.completedAt = null
    }
  }

  next()
})

/**
 * The current user's own list - tasks currently owned by them.
 */
taskSchema.statics.getMyTasks = function (userId, options = {}) {
  const query = {
    deleted: false,
    $and: [{
      $or: [
        { owner: userId },
        { taggedUsers: userId },
        // An incomplete assigned subtask puts the parent task on this
        // person's list too - it drops off again once they finish their
        // piece (unless they're also the owner/tagged for another reason).
        { subtasks: { $elemMatch: { assignee: userId, done: false } } }
      ]
    }]
  }

  if (options.status) query.status = options.status
  if (options.priority) query.priority = options.priority
  if (options.tag) query.tags = options.tag
  if (options.search) {
    query.$and.push({
      $or: [
        { title: { $regex: options.search, $options: 'i' } },
        { formattedUid: { $regex: options.search, $options: 'i' } },
        { notes: { $regex: options.search, $options: 'i' } }
      ]
    })
  }

  return this.find(query)
    .populate('owner', 'fullname email image')
    .populate('createdBy', 'fullname email image')
    .populate('taggedUsers', 'fullname email image')
    .populate('linkedTicket', 'formattedUid title')
    .populate('subtasks.assignee', 'fullname email image')
    .sort({ priority: -1, dueDate: 1, createdAt: -1 })
    .limit(options.limit || 500)
}

/**
 * Tasks this user created but handed off - still worth tracking even
 * though they're no longer on the creator's own list.
 */
taskSchema.statics.getAssignedByMe = function (userId, options = {}) {
  const query = { deleted: false, createdBy: userId, owner: { $ne: userId } }
  if (options.status) query.status = options.status

  return this.find(query)
    .populate('owner', 'fullname email image')
    .populate('createdBy', 'fullname email image')
    .populate('taggedUsers', 'fullname email image')
    .populate('linkedTicket', 'formattedUid title')
    .populate('subtasks.assignee', 'fullname email image')
    .sort({ createdAt: -1 })
    .limit(options.limit || 500)
}

taskSchema.statics.assignTask = async function (taskId, newOwnerId, performedByUser) {
  const task = await this.findById(taskId)
  if (!task) throw new Error('Task not found')

  const LilyPadAccount = mongoose.model('lilypad_accounts')
  const newOwner = await LilyPadAccount.findById(newOwnerId)
  if (!newOwner) throw new Error('User not found')

  task.owner = newOwnerId
  task.history.push({
    action: 'assigned',
    by: performedByUser ? performedByUser._id : null,
    byName: performedByUser ? performedByUser.fullname : 'System',
    description: `Shared with ${newOwner.fullname}`
  })

  return task.save()
}

taskSchema.statics.tagUser = async function (taskId, userId, performedByUser) {
  const task = await this.findById(taskId)
  if (!task) throw new Error('Task not found')

  const LilyPadAccount = mongoose.model('lilypad_accounts')
  const user = await LilyPadAccount.findById(userId)
  if (!user) throw new Error('User not found')

  if (!task.taggedUsers.some((id) => id.equals(userId))) {
    task.taggedUsers.push(userId)
    task.history.push({
      action: 'tagged',
      by: performedByUser ? performedByUser._id : null,
      byName: performedByUser ? performedByUser.fullname : 'System',
      description: `Tagged ${user.fullname}`
    })
  }

  return task.save()
}

taskSchema.statics.untagUser = async function (taskId, userId, performedByUser) {
  const task = await this.findById(taskId)
  if (!task) throw new Error('Task not found')

  task.taggedUsers = task.taggedUsers.filter((id) => !id.equals(userId))
  return task.save()
}

/**
 * True once every subtask is done - vacuously true for a task with no
 * subtasks, so tasks that never used the feature aren't blocked by it.
 */
taskSchema.methods.allSubtasksComplete = function () {
  return this.subtasks.every((st) => st.done)
}

taskSchema.statics.updateStatus = async function (taskId, newStatus, performedByUser) {
  const task = await this.findById(taskId)
  if (!task) throw new Error('Task not found')

  if (newStatus === 'Done' && !task.allSubtasksComplete()) {
    const err = new Error('All subtasks must be completed before this task can be marked Done.')
    err.statusCode = 400
    throw err
  }

  const prevStatus = task.status
  task.status = newStatus
  task.history.push({
    action: 'status_changed',
    by: performedByUser ? performedByUser._id : null,
    byName: performedByUser ? performedByUser.fullname : 'System',
    description: `Status changed from "${prevStatus}" to "${newStatus}"`
  })

  return task.save()
}

/**
 * Marks one subtask done/not-done. Completing the last remaining
 * subtask auto-completes the parent task; reopening a subtask on an
 * already-Done parent reopens the parent too, so "all subtasks done" is
 * kept true in both directions rather than just checked once at
 * completion time.
 */
taskSchema.statics.toggleSubtask = async function (taskId, subtaskId, done, performedByUser) {
  const task = await this.findById(taskId)
  if (!task) throw new Error('Task not found')

  const subtask = task.subtasks.id(subtaskId)
  if (!subtask) throw new Error('Subtask not found')

  subtask.done = Boolean(done)
  subtask.completedAt = subtask.done ? new Date() : null
  subtask.completedBy = subtask.done ? (performedByUser ? performedByUser._id : null) : null
  subtask.completedByName = subtask.done ? (performedByUser ? performedByUser.fullname : 'System') : ''

  task.history.push({
    action: subtask.done ? 'subtask_completed' : 'subtask_reopened',
    by: performedByUser ? performedByUser._id : null,
    byName: performedByUser ? performedByUser.fullname : 'System',
    description: `${subtask.done ? 'Completed' : 'Reopened'} subtask: ${subtask.text}`
  })

  if (task.allSubtasksComplete() && task.subtasks.length && task.status !== 'Done') {
    task.status = 'Done'
    task.history.push({
      action: 'status_changed',
      by: performedByUser ? performedByUser._id : null,
      byName: performedByUser ? performedByUser.fullname : 'System',
      description: 'Status changed to "Done" automatically - all subtasks complete'
    })
  } else if (!task.allSubtasksComplete() && task.status === 'Done') {
    task.status = 'In Progress'
    task.history.push({
      action: 'status_changed',
      by: performedByUser ? performedByUser._id : null,
      byName: performedByUser ? performedByUser.fullname : 'System',
      description: 'Status reverted to "In Progress" automatically - a subtask was reopened'
    })
  }

  return task.save()
}

module.exports = mongoose.model(COLLECTION, taskSchema)
