/**
 * LilyPad ERP - Personal Task Manager Controller
 * Deliberately lighter than lilypadTickets.js in some ways (no worklogs,
 * no formData) but does support attachments and per-person subtasks -
 * see lilypadTask.js for the completion-gating logic.
 */

const fs = require('fs')
const path = require('path')
const multer = require('multer')
const { LilyPadTask, LilyPadTicket, LilyPadAccount } = require('../models')
const xss = require('xss')

// Same disk-storage pattern as lilypadTickets.js's attachment uploads -
// stored under <UPLOAD_ROOT>/tasks/<taskId>/ and served by the /uploads
// static route lilypadMachines.js mounts at the shared /api/v1/lilypad
// prefix, so no new static route is needed here.
const UPLOAD_ROOT = process.env.UPLOAD_DIR || '/var/data/uploads'
const TASKS_DIR = path.join(UPLOAD_ROOT, 'tasks')

const attachmentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(TASKS_DIR, req.params.id)
    fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, unique + path.extname(file.originalname))
  }
})

const attachmentUpload = multer({
  storage: attachmentStorage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB, matching the ticket attachment limit
})

const lilypadTasksController = {}
lilypadTasksController.uploadMiddleware = attachmentUpload.single('file')

function actorName (user) {
  return user ? (user.fullname || user.username) : 'System'
}

/**
 * A task is only visible/editable to its owner, its creator, or anyone
 * tagged on it - never "everyone." getMyTasks/getAssignedByMe already
 * enforce this for the list views; every by-ID endpoint below has to
 * enforce it too, since fetching one task by ID bypasses those queries
 * entirely.
 */
function canAccessTask (task, userId) {
  const uid = String(userId)
  if (String(task.owner) === uid) return true
  if (String(task.createdBy) === uid) return true
  if (task.taggedUsers.some((id) => String(id) === uid)) return true
  // Being assigned a subtask makes you a collaborator on the whole task,
  // not just that one checklist line - matches "tagged on or created."
  return task.subtasks.some((st) => st.assignee && String(st.assignee) === uid)
}

/**
 * GET /api/v1/lilypad/tasks
 * Defaults to "my list" (owner = current user). ?view=assignedByMe shows
 * tasks this user created but handed off to someone else instead.
 */
lilypadTasksController.getTasks = async function (req, res) {
  try {
    const { status, priority, tag, search, view } = req.query

    const tasks = view === 'assignedByMe'
      ? await LilyPadTask.getAssignedByMe(req.user._id, { status })
      : await LilyPadTask.getMyTasks(req.user._id, { status, priority, tag, search })

    const countsBase = { deleted: false, owner: req.user._id }
    const counts = {
      todo: await LilyPadTask.countDocuments({ ...countsBase, status: 'To-Do' }),
      inProgress: await LilyPadTask.countDocuments({ ...countsBase, status: 'In Progress' }),
      done: await LilyPadTask.countDocuments({ ...countsBase, status: 'Done' }),
      overdue: await LilyPadTask.countDocuments({ ...countsBase, status: { $ne: 'Done' }, dueDate: { $lt: new Date(), $ne: null } }),
      total: await LilyPadTask.countDocuments(countsBase)
    }

    return res.status(200).json({ success: true, counts, data: tasks })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/tasks
 * ownerId lets you create a task directly on someone else's list (the
 * same "share" action as assign, just done at creation time instead of
 * after the fact).
 */
lilypadTasksController.createTask = async function (req, res) {
  try {
    const { title, notes, priority, dueDate, tags, ownerId, linkedTicketId, taggedUserIds } = req.body

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Task title is required.' })
    }

    let owner = req.user._id
    let ownerName = req.user.fullname || req.user.username
    if (ownerId && String(ownerId) !== String(req.user._id)) {
      const ownerAccount = await LilyPadAccount.findById(ownerId)
      if (!ownerAccount) return res.status(400).json({ success: false, error: 'Assigned user not found.' })
      owner = ownerAccount._id
      ownerName = ownerAccount.fullname
    }

    let linkedTicket = null
    if (linkedTicketId) {
      linkedTicket = await LilyPadTicket.findById(linkedTicketId)
      if (!linkedTicket) return res.status(400).json({ success: false, error: 'Linked ticket not found.' })
    }

    let taggedUsers = []
    if (Array.isArray(taggedUserIds) && taggedUserIds.length) {
      const foundUsers = await LilyPadAccount.find({ _id: { $in: taggedUserIds } })
      taggedUsers = foundUsers.map((u) => u._id)
    }

    const task = new LilyPadTask({
      title: xss(title.trim()),
      notes: notes ? xss(notes.trim()) : '',
      priority: ['Low', 'Normal', 'High', 'Urgent'].includes(priority) ? priority : 'Normal',
      dueDate: dueDate ? new Date(dueDate) : null,
      tags: Array.isArray(tags) ? tags.map((t) => xss(String(t).trim())).filter(Boolean) : [],
      owner,
      createdBy: req.user._id,
      taggedUsers,
      linkedTicket: linkedTicket ? linkedTicket._id : null,
      history: [{
        action: 'created',
        by: req.user._id,
        byName: actorName(req.user),
        description: owner.equals(req.user._id) ? 'Task created' : `Task created and shared with ${ownerName}`
      }]
    })

    const saved = await task.save()
    return res.status(201).json({ success: true, message: 'Task created.', data: saved })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * GET /api/v1/lilypad/tasks/:id
 */
lilypadTasksController.getTaskById = async function (req, res) {
  try {
    const raw = await LilyPadTask.findOne({ _id: req.params.id, deleted: false })
    if (!raw || !canAccessTask(raw, req.user._id)) {
      return res.status(404).json({ success: false, error: 'Task not found' })
    }

    const task = await LilyPadTask.findById(raw._id)
      .populate('owner', 'fullname email image')
      .populate('createdBy', 'fullname email image')
      .populate('taggedUsers', 'fullname email image')
      .populate('linkedTicket', 'formattedUid title')
      .populate('subtasks.assignee', 'fullname email image')

    return res.status(200).json({ success: true, data: task })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * PUT /api/v1/lilypad/tasks/:id
 */
lilypadTasksController.updateTask = async function (req, res) {
  try {
    const task = await LilyPadTask.findOne({ _id: req.params.id, deleted: false })
    if (!task || !canAccessTask(task, req.user._id)) {
      return res.status(404).json({ success: false, error: 'Task not found' })
    }

    const { title, notes, priority, dueDate, tags, linkedTicketId } = req.body

    if (title !== undefined) {
      if (!title.trim()) return res.status(400).json({ success: false, error: 'Task title cannot be empty.' })
      task.title = xss(title.trim())
    }
    if (notes !== undefined) task.notes = xss(String(notes).trim())
    if (priority !== undefined && ['Low', 'Normal', 'High', 'Urgent'].includes(priority)) task.priority = priority
    if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null
    if (Array.isArray(tags)) task.tags = tags.map((t) => xss(String(t).trim())).filter(Boolean)
    if (linkedTicketId !== undefined) {
      if (!linkedTicketId) {
        task.linkedTicket = null
      } else {
        const linkedTicket = await LilyPadTicket.findById(linkedTicketId)
        if (!linkedTicket) return res.status(400).json({ success: false, error: 'Linked ticket not found.' })
        task.linkedTicket = linkedTicket._id
      }
    }

    const saved = await task.save()
    return res.status(200).json({ success: true, data: saved })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * PUT /api/v1/lilypad/tasks/:id/status
 */
lilypadTasksController.updateStatus = async function (req, res) {
  try {
    const { status } = req.body
    const validStatuses = ['To-Do', 'In Progress', 'Done']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` })
    }

    const existing = await LilyPadTask.findOne({ _id: req.params.id, deleted: false })
    if (!existing || !canAccessTask(existing, req.user._id)) {
      return res.status(404).json({ success: false, error: 'Task not found' })
    }

    const updated = await LilyPadTask.updateStatus(req.params.id, status, req.user)
    return res.status(200).json({ success: true, message: `Task status updated to ${status}`, data: updated })
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, error: err.message })
  }
}

/**
 * PUT /api/v1/lilypad/tasks/:id/assign
 * The "share" action - moves the task onto someone else's list.
 */
lilypadTasksController.assignTask = async function (req, res) {
  try {
    const { userId } = req.body
    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required.' })
    }

    const existing = await LilyPadTask.findOne({ _id: req.params.id, deleted: false })
    if (!existing || !canAccessTask(existing, req.user._id)) {
      return res.status(404).json({ success: false, error: 'Task not found' })
    }

    const updated = await LilyPadTask.assignTask(req.params.id, userId, req.user)
    return res.status(200).json({ success: true, message: 'Task shared.', data: updated })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/tasks/:id/people
 * Tags an additional person on the task - unlike assign/share, this
 * doesn't move the task off the owner's list, it just adds the tagged
 * user's view of "My Tasks" to include it too.
 */
lilypadTasksController.tagUser = async function (req, res) {
  try {
    const { userId } = req.body
    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required.' })
    }

    const existing = await LilyPadTask.findOne({ _id: req.params.id, deleted: false })
    if (!existing || !canAccessTask(existing, req.user._id)) {
      return res.status(404).json({ success: false, error: 'Task not found' })
    }

    const updated = await LilyPadTask.tagUser(req.params.id, userId, req.user)
    return res.status(200).json({ success: true, data: updated })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * DELETE /api/v1/lilypad/tasks/:id/people/:userId
 */
lilypadTasksController.untagUser = async function (req, res) {
  try {
    const existing = await LilyPadTask.findOne({ _id: req.params.id, deleted: false })
    if (!existing || !canAccessTask(existing, req.user._id)) {
      return res.status(404).json({ success: false, error: 'Task not found' })
    }

    const updated = await LilyPadTask.untagUser(req.params.id, req.params.userId, req.user)
    return res.status(200).json({ success: true, data: updated })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * DELETE /api/v1/lilypad/tasks/:id
 */
lilypadTasksController.deleteTask = async function (req, res) {
  try {
    const task = await LilyPadTask.findOne({ _id: req.params.id, deleted: false })
    if (!task || !canAccessTask(task, req.user._id)) {
      return res.status(404).json({ success: false, error: 'Task not found' })
    }

    task.deleted = true
    await task.save()
    return res.status(200).json({ success: true, message: 'Task deleted.' })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/tasks/:id/comments
 */
lilypadTasksController.addComment = async function (req, res) {
  try {
    const { body } = req.body
    if (!body || !body.trim()) {
      return res.status(400).json({ success: false, error: 'Comment body cannot be empty' })
    }

    const task = await LilyPadTask.findOne({ _id: req.params.id, deleted: false })
    if (!task || !canAccessTask(task, req.user._id)) {
      return res.status(404).json({ success: false, error: 'Task not found' })
    }

    task.comments.push({
      author: req.user._id,
      authorName: actorName(req.user),
      body: xss(body.trim())
    })

    const saved = await task.save()
    return res.status(200).json({ success: true, data: saved })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/tasks/:id/subtasks
 * assigneeId is optional - an unassigned subtask behaves like a plain
 * checklist item the task owner is responsible for.
 */
lilypadTasksController.addSubtask = async function (req, res) {
  try {
    const text = String((req.body && req.body.text) || '').trim()
    if (!text) {
      return res.status(400).json({ success: false, error: 'text is required.' })
    }

    const task = await LilyPadTask.findOne({ _id: req.params.id, deleted: false })
    if (!task || !canAccessTask(task, req.user._id)) {
      return res.status(404).json({ success: false, error: 'Task not found' })
    }

    const assigneeId = req.body && req.body.assigneeId
    if (assigneeId) {
      const assignee = await LilyPadAccount.findById(assigneeId)
      if (!assignee) return res.status(400).json({ success: false, error: 'Assignee not found.' })
    }

    task.subtasks.push({ text: xss(text), assignee: assigneeId || null })
    task.history.push({
      action: 'subtask_added',
      by: req.user._id,
      byName: actorName(req.user),
      description: `Added subtask: ${text}`
    })

    const saved = await task.save()
    return res.status(200).json({ success: true, data: saved })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * PUT /api/v1/lilypad/tasks/:id/subtasks/:subtaskId
 * Completing/reopening a subtask - open to the task's regular
 * collaborators (owner/creator/tagged) OR specifically the subtask's
 * own assignee, even if they'd otherwise have no access to this task.
 */
lilypadTasksController.toggleSubtask = async function (req, res) {
  try {
    const task = await LilyPadTask.findOne({ _id: req.params.id, deleted: false })
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' })
    }

    const subtask = task.subtasks.id(req.params.subtaskId)
    if (!subtask) {
      return res.status(404).json({ success: false, error: 'Subtask not found' })
    }

    const isSubtaskOwner = subtask.assignee && String(subtask.assignee) === String(req.user._id)
    if (!canAccessTask(task, req.user._id) && !isSubtaskOwner) {
      return res.status(404).json({ success: false, error: 'Task not found' })
    }

    const done = req.body && req.body.done !== undefined ? Boolean(req.body.done) : !subtask.done
    const updated = await LilyPadTask.toggleSubtask(req.params.id, req.params.subtaskId, done, req.user)
    return res.status(200).json({ success: true, data: updated })
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, error: err.message })
  }
}

/**
 * DELETE /api/v1/lilypad/tasks/:id/subtasks/:subtaskId
 * Removing a subtask entirely (not the same as completing it) stays
 * restricted to the task's regular collaborators - a subtask assignee
 * can finish their piece but shouldn't be able to delete the checklist
 * line itself.
 */
lilypadTasksController.deleteSubtask = async function (req, res) {
  try {
    const task = await LilyPadTask.findOne({ _id: req.params.id, deleted: false })
    if (!task || !canAccessTask(task, req.user._id)) {
      return res.status(404).json({ success: false, error: 'Task not found' })
    }

    const subtask = task.subtasks.id(req.params.subtaskId)
    if (!subtask) {
      return res.status(404).json({ success: false, error: 'Subtask not found' })
    }

    subtask.deleteOne()
    const saved = await task.save()
    return res.status(200).json({ success: true, data: saved })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/tasks/:id/attachments
 * uploadMiddleware (attachmentUpload.single('file')) runs first and
 * populates req.file.
 */
lilypadTasksController.uploadAttachment = async function (req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded.' })
    }

    const task = await LilyPadTask.findOne({ _id: req.params.id, deleted: false })
    if (!task || !canAccessTask(task, req.user._id)) {
      return res.status(404).json({ success: false, error: 'Task not found' })
    }

    task.attachments.push({
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: `tasks/${req.params.id}/${req.file.filename}`,
      size: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: req.user._id,
      uploadedByName: actorName(req.user)
    })
    task.history.push({
      action: 'attachment_added',
      by: req.user._id,
      byName: actorName(req.user),
      description: `Attached file: ${req.file.originalname}`
    })

    const saved = await task.save()
    return res.status(200).json({ success: true, data: saved })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * DELETE /api/v1/lilypad/tasks/:id/attachments/:attachmentId
 */
lilypadTasksController.deleteAttachment = async function (req, res) {
  try {
    const task = await LilyPadTask.findOne({ _id: req.params.id, deleted: false })
    if (!task || !canAccessTask(task, req.user._id)) {
      return res.status(404).json({ success: false, error: 'Task not found' })
    }

    const attachment = task.attachments.id(req.params.attachmentId)
    if (!attachment) {
      return res.status(404).json({ success: false, error: 'Attachment not found' })
    }

    const filePath = path.join(UPLOAD_ROOT, attachment.path)
    fs.unlink(filePath, () => {}) // best-effort - a missing file on disk shouldn't block removing the DB record

    const removedName = attachment.originalName
    attachment.deleteOne()
    task.history.push({
      action: 'attachment_removed',
      by: req.user._id,
      byName: actorName(req.user),
      description: `Removed attachment: ${removedName}`
    })

    const saved = await task.save()
    return res.status(200).json({ success: true, data: saved })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

module.exports = lilypadTasksController
