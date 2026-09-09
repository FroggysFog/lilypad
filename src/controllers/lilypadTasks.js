/**
 * LilyPad ERP - Personal Task Manager Controller
 * Deliberately lighter than lilypadTickets.js: a task lives on exactly
 * one person's list (owner) until reassigned, no attachments/worklogs/
 * subtasks - see lilypadTask.js for the reasoning.
 */

const { LilyPadTask, LilyPadTicket, LilyPadAccount } = require('../models')
const xss = require('xss')

const lilypadTasksController = {}

function actorName (user) {
  return user ? (user.fullname || user.username) : 'System'
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
    const task = await LilyPadTask.findOne({ _id: req.params.id, deleted: false })
      .populate('owner', 'fullname email image')
      .populate('createdBy', 'fullname email image')
      .populate('taggedUsers', 'fullname email image')
      .populate('linkedTicket', 'formattedUid title')

    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' })
    }

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
    if (!task) {
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

    const updated = await LilyPadTask.updateStatus(req.params.id, status, req.user)
    return res.status(200).json({ success: true, message: `Task status updated to ${status}`, data: updated })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
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
    if (!task) {
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
    if (!task) {
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

module.exports = lilypadTasksController
