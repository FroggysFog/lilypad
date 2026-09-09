/**
 * LilyPad ERP - Core Ticketing Controller
 * Handles dynamic intake forms, flexible ticket submissions, and uniform To-Do management.
 */

const fs = require('fs')
const path = require('path')
const multer = require('multer')
const { LilyPadTicket, IntakeForm, LilyPadAccount, LilyPadNotification } = require('../models')
const xss = require('xss')

const MENTION_REGEX = /@([a-zA-Z0-9_.]+)/g

// Same disk-storage pattern as lilypadMachines.js's media uploads - stored
// under <UPLOAD_ROOT>/tickets/<ticketId>/ and served by the /uploads
// static route that machines.js already mounts at the shared
// /api/v1/lilypad prefix, so no new static route is needed here.
const UPLOAD_ROOT = process.env.UPLOAD_DIR || '/var/data/uploads'
const TICKETS_DIR = path.join(UPLOAD_ROOT, 'tickets')

const attachmentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(TICKETS_DIR, req.params.id)
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
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB - ticket attachments, not the machine-manual video uploads
})

const lilypadTicketsController = {}
lilypadTicketsController.uploadMiddleware = attachmentUpload.single('file')

function actorName (user) {
  return user ? (user.fullname || user.username) : 'System'
}

function pushHistory (ticket, action, user, description) {
  ticket.history.push({
    action,
    by: user ? user._id : null,
    byName: actorName(user),
    description
  })
}

/**
 * Seed default dynamic intake forms if empty
 */
lilypadTicketsController.seedDefaultCategories = async function () {
  const count = await IntakeForm.countDocuments()
  if (count > 0) return

  const defaultCategories = [
    {
      name: 'IT & Hardware Request',
      slug: 'it-hardware',
      description: 'Request new workstation hardware, peripherals, or equipment upgrades.',
      icon: 'ti-device-laptop',
      target: 'internal',
      defaultPriority: 'Normal',
      order: 1,
      fields: [
        {
          name: 'hardwareType',
          label: 'Hardware Item',
          type: 'select',
          required: true,
          options: [
            { label: 'MacBook Pro 16" (M3 Pro)', value: 'macbook_pro_16' },
            { label: 'Dell XPS 15', value: 'dell_xps_15' },
            { label: '4K UltraWide Monitor 34"', value: 'ultrawide_monitor' },
            { label: 'Ergonomic Keyboard & Mouse', value: 'peripherals_bundle' },
            { label: 'Other Equipment', value: 'other' }
          ]
        },
        {
          name: 'department',
          label: 'Department',
          type: 'select',
          required: true,
          options: [
            { label: 'Engineering', value: 'engineering' },
            { label: 'Operations & Logistics', value: 'operations' },
            { label: 'Sales & Marketing', value: 'sales' },
            { label: 'Finance & HR', value: 'finance' }
          ]
        },
        {
          name: 'assetTag',
          label: 'Current Asset Tag (if replacement)',
          type: 'text',
          placeholder: 'e.g. LP-ASSET-4821',
          required: false
        },
        {
          name: 'businessJustification',
          label: 'Business Justification',
          type: 'textarea',
          placeholder: 'Explain the business need for this hardware request...',
          required: true
        }
      ]
    },
    {
      name: 'Client ERP Setup & Onboarding',
      slug: 'client-onboarding',
      description: 'External client provisioning, company database setup, and license allocation.',
      icon: 'ti-building-skyscraper',
      target: 'both',
      defaultPriority: 'High',
      order: 2,
      fields: [
        {
          name: 'clientCompanyName',
          label: 'Client Company Name',
          type: 'text',
          placeholder: 'Acme Global Logistics Inc.',
          required: true
        },
        {
          name: 'industry',
          label: 'Industry Vertical',
          type: 'select',
          required: true,
          options: [
            { label: 'Manufacturing & Warehousing', value: 'manufacturing' },
            { label: 'Retail & E-commerce', value: 'retail' },
            { label: 'Financial Services', value: 'finance' },
            { label: 'Healthcare & Biotech', value: 'healthcare' },
            { label: 'Professional Services', value: 'services' }
          ]
        },
        {
          name: 'userSeats',
          label: 'Initial User Seats Required',
          type: 'number',
          placeholder: '25',
          required: true,
          defaultValue: 10
        },
        {
          name: 'targetGoLiveDate',
          label: 'Target Go-Live Date',
          type: 'date',
          required: true
        },
        {
          name: 'dataMigrationRequired',
          label: 'Legacy Data Migration Needed?',
          type: 'checkbox',
          defaultValue: true
        }
      ]
    },
    {
      name: 'Software Bug & Issue Report',
      slug: 'bug-report',
      description: 'Report ERP defects, calculation discrepancies, or system exceptions.',
      icon: 'ti-bug',
      target: 'both',
      defaultPriority: 'High',
      order: 3,
      fields: [
        {
          name: 'affectedModule',
          label: 'Affected ERP Module',
          type: 'select',
          required: true,
          options: [
            { label: 'Inventory & Stock Management', value: 'inventory' },
            { label: 'Order Processing & Invoicing', value: 'invoicing' },
            { label: 'Accounts & General Ledger', value: 'accounting' },
            { label: 'User Roles & Permissions', value: 'auth' },
            { label: 'API & Webhooks', value: 'api' }
          ]
        },
        {
          name: 'browserOs',
          label: 'Browser / Operating System',
          type: 'text',
          placeholder: 'Chrome 128 on macOS Sonoma / Windows 11',
          required: false
        },
        {
          name: 'stepsToReproduce',
          label: 'Steps to Reproduce',
          type: 'textarea',
          placeholder: '1. Navigate to Invoices\n2. Click Export to CSV\n3. Observed 500 error...',
          required: true
        },
        {
          name: 'expectedBehavior',
          label: 'Expected vs Actual Result',
          type: 'textarea',
          placeholder: 'Expected clean CSV download; received timeout.',
          required: true
        }
      ]
    },
    {
      name: 'General Operational Request',
      slug: 'general-request',
      description: 'General support, account changes, or miscellaneous operational tasks.',
      icon: 'ti-help',
      target: 'both',
      defaultPriority: 'Normal',
      order: 4,
      fields: [
        {
          name: 'urgencyReason',
          label: 'Urgency & Deadline Notes',
          type: 'text',
          placeholder: 'Optional deadline or scheduling note',
          required: false
        },
        {
          name: 'additionalDetails',
          label: 'Additional Context',
          type: 'textarea',
          placeholder: 'Provide any additional context or reference numbers...',
          required: false
        }
      ]
    }
  ]

  await IntakeForm.insertMany(defaultCategories)
  console.log('[LilyPad ERP] Seeded default dynamic intake forms successfully.')
}

/**
 * GET /api/v1/lilypad/intake-forms
 * Returns all active category forms and their field definitions.
 */
lilypadTicketsController.getIntakeForms = async function (req, res) {
  try {
    const target = req.query.target || 'both'
    let forms = await IntakeForm.getActiveForms(target)

    if (forms.length === 0) {
      await lilypadTicketsController.seedDefaultCategories()
      forms = await IntakeForm.getActiveForms(target)
    }

    return res.status(200).json({
      success: true,
      data: forms
    })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * GET /api/v1/lilypad/intake-forms/:slug
 * Returns a specific category intake form by slug.
 */
lilypadTicketsController.getIntakeFormBySlug = async function (req, res) {
  try {
    const form = await IntakeForm.getBySlug(req.params.slug)
    if (!form) {
      return res.status(404).json({ success: false, error: 'Intake form category not found' })
    }
    return res.status(200).json({ success: true, data: form })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/tickets
 * Submits a new ticket with uniform core fields and dynamic formData metadata.
 */
lilypadTicketsController.submitTicket = async function (req, res) {
  try {
    const {
      title,
      description,
      priority,
      categorySlug,
      categoryId,
      source,
      reporterName,
      reporterEmail,
      reporterPhone,
      reporterCompany,
      dueDate,
      tags,
      formData = {}
    } = req.body

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        error: 'Ticket title and description are required.'
      })
    }

    // Resolve Category Intake Form
    let category = null
    if (categoryId) {
      category = await IntakeForm.findById(categoryId)
    } else if (categorySlug) {
      category = await IntakeForm.getBySlug(categorySlug)
    }

    // Sanitize dynamic formData attributes
    const cleanFormData = {}
    if (formData && typeof formData === 'object') {
      for (const [key, val] of Object.entries(formData)) {
        if (typeof val === 'string') {
          cleanFormData[key] = xss(val.trim())
        } else {
          cleanFormData[key] = val
        }
      }
    }

    // Determine reporter (Authenticated Internal User vs External Guest)
    const isAuth = req.user && req.user._id
    const reporterId = isAuth ? req.user._id : null
    const ticketSource = source || (isAuth ? 'internal' : 'external')

    const externalReporter = {
      name: isAuth ? (req.user.fullname || req.user.username) : (reporterName || 'Guest'),
      email: isAuth ? req.user.email : (reporterEmail || ''),
      phone: reporterPhone || '',
      company: reporterCompany || ''
    }

    const newTicket = new LilyPadTicket({
      title: xss(title.trim()),
      description: xss(description.trim()),
      priority: priority || (category ? category.defaultPriority : 'Normal'),
      status: 'To-Do', // All new tickets enter the uniform To-Do state
      category: category ? category._id : null,
      categoryName: category ? category.name : 'General',
      source: ticketSource,
      reporter: reporterId,
      assignee: (category && category.defaultAssignee) ? category.defaultAssignee : null,
      externalReporter,
      dueDate: dueDate ? new Date(dueDate) : null,
      tags: Array.isArray(tags) ? tags.map(t => xss(t.trim())) : [],
      formData: cleanFormData,
      history: [{
        action: 'created',
        by: reporterId,
        byName: externalReporter.name,
        description: `Ticket created via ${ticketSource} intake form`
      }]
    })

    const savedTicket = await newTicket.save()

    return res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      data: savedTicket
    })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * GET /api/v1/lilypad/tickets/todo
 * Retrieves tickets in the uniform 'To-Do' workflow list (with optional filtering).
 */
lilypadTicketsController.getTodoList = async function (req, res) {
  try {
    const { status, category, priority, assignee, search, limit } = req.query

    const tickets = await LilyPadTicket.getTodoList({
      status,
      category,
      priority,
      assignee,
      search,
      limit: parseInt(limit, 10) || 100
    })

    // Compute status counts for quick KPI cards, scoped to the same assignee filter as the list
    const countsBase = { deleted: false }
    if (assignee) countsBase.assignee = assignee

    const counts = {
      todo: await LilyPadTicket.countDocuments({ ...countsBase, status: 'To-Do' }),
      inProgress: await LilyPadTicket.countDocuments({ ...countsBase, status: 'In Progress' }),
      complete: await LilyPadTicket.countDocuments({ ...countsBase, status: 'Complete' }),
      blocked: await LilyPadTicket.countDocuments({ ...countsBase, status: 'Blocked' }),
      urgent: await LilyPadTicket.countDocuments({ ...countsBase, priority: { $in: ['Urgent', 'High'] }, status: { $ne: 'Complete' } }),
      total: await LilyPadTicket.countDocuments(countsBase)
    }

    return res.status(200).json({
      success: true,
      counts,
      data: tickets
    })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * GET /api/v1/lilypad/tickets/:id
 * Detailed ticket retrieval with populated metadata.
 */
lilypadTicketsController.getTicketById = async function (req, res) {
  try {
    const ticket = await LilyPadTicket.findById(req.params.id)
      .populate('assignee', 'fullname email image title')
      .populate('reporter', 'fullname email image')
      .populate('category', 'name icon slug fields')
      .populate('watchers', 'fullname username email')

    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' })
    }

    return res.status(200).json({ success: true, data: ticket })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * PUT /api/v1/lilypad/tickets/:id/status
 * Updates ticket workflow status (To-Do -> In Progress -> Complete -> Blocked).
 */
lilypadTicketsController.updateStatus = async function (req, res) {
  try {
    const { status } = req.body
    const validStatuses = ['To-Do', 'In Progress', 'Complete', 'Blocked']

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      })
    }

    const updated = await LilyPadTicket.updateStatus(req.params.id, status, req.user)
    return res.status(200).json({
      success: true,
      message: `Ticket status updated to ${status}`,
      data: updated
    })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * PUT /api/v1/lilypad/tickets/:id/assign
 * Assigns or reassigns ticket to a team member.
 */
lilypadTicketsController.assignTicket = async function (req, res) {
  try {
    const { assigneeId } = req.body
    const updated = await LilyPadTicket.assignTicket(req.params.id, assigneeId, req.user)
    return res.status(200).json({
      success: true,
      message: 'Ticket assignment updated successfully',
      data: updated
    })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/tickets/:id/comments
 * Adds comment or internal note to a ticket.
 */
lilypadTicketsController.addComment = async function (req, res) {
  try {
    const { body, isInternal = false } = req.body
    if (!body || !body.trim()) {
      return res.status(400).json({ success: false, error: 'Comment body cannot be empty' })
    }

    const ticket = await LilyPadTicket.findById(req.params.id)
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' })
    }

    const authorName = req.user ? (req.user.fullname || req.user.username) : 'Support Agent'

    ticket.comments.push({
      author: req.user ? req.user._id : null,
      authorName,
      isInternal: Boolean(isInternal),
      body: xss(body.trim())
    })

    ticket.history.push({
      action: 'comment_added',
      by: req.user ? req.user._id : null,
      byName: authorName,
      description: isInternal ? 'Added an internal note' : 'Replied to ticket'
    })

    const saved = await ticket.save()

    await notifyMentionedUsers(body, saved, req.user)

    return res.status(200).json({
      success: true,
      message: 'Comment added successfully',
      data: saved
    })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * Scans a comment body for @username mentions and creates a notification
 * for each real, active account mentioned (excluding the comment's author).
 */
async function notifyMentionedUsers (body, ticket, author) {
  const usernames = [...body.matchAll(MENTION_REGEX)].map(m => m[1].toLowerCase())
  if (!usernames.length) return

  const accounts = await LilyPadAccount.find({ deleted: { $ne: true } })
  const byUsername = new Map(accounts.map(a => [a.username.toLowerCase(), a]))

  const notified = new Set()
  const notifications = []

  for (const username of usernames) {
    const account = byUsername.get(username)
    if (!account) continue
    if (author && account._id.equals(author._id)) continue
    if (notified.has(String(account._id))) continue
    notified.add(String(account._id))

    notifications.push({
      recipient: account._id,
      type: 'mention',
      title: `${author ? author.fullname : 'Someone'} mentioned you`,
      message: `${ticket.formattedUid}: "${body.trim().slice(0, 100)}"`,
      ticketId: ticket._id,
      ticketUid: ticket.formattedUid,
      triggeredBy: author ? author._id : null,
      triggeredByName: author ? author.fullname : ''
    })
  }

  if (notifications.length) {
    await LilyPadNotification.insertMany(notifications)
  }
}

/**
 * PUT /api/v1/lilypad/tickets/:id
 * Generic edit for fields that aren't already their own dedicated endpoint
 * (status has its own workflow endpoint, assignee has its own too) -
 * title, description, priority, dueDate, tags, category.
 */
lilypadTicketsController.updateTicket = async function (req, res) {
  try {
    const ticket = await LilyPadTicket.findById(req.params.id)
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' })
    }

    const { title, description, priority, dueDate, tags, categoryId } = req.body
    const changes = []

    if (title !== undefined && title.trim() && title.trim() !== ticket.title) {
      changes.push('title')
      ticket.title = xss(title.trim())
    }
    if (description !== undefined && description.trim() && description.trim() !== ticket.description) {
      changes.push('description')
      ticket.description = xss(description.trim())
    }
    if (priority !== undefined && ['Low', 'Normal', 'High', 'Urgent'].includes(priority) && priority !== ticket.priority) {
      changes.push('priority')
      ticket.priority = priority
    }
    if (dueDate !== undefined) {
      const nextDue = dueDate ? new Date(dueDate) : null
      changes.push('due date')
      ticket.dueDate = nextDue
    }
    if (Array.isArray(tags)) {
      changes.push('tags')
      ticket.tags = tags.map((t) => xss(String(t).trim())).filter(Boolean)
    }
    if (categoryId !== undefined) {
      const category = categoryId ? await IntakeForm.findById(categoryId) : null
      changes.push('category')
      ticket.category = category ? category._id : null
      ticket.categoryName = category ? category.name : ticket.categoryName
    }

    if (changes.length) {
      pushHistory(ticket, 'updated', req.user, `Updated ${changes.join(', ')}`)
    }

    const saved = await ticket.save()
    return res.status(200).json({ success: true, data: saved })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * DELETE /api/v1/lilypad/tickets/:id
 * Soft delete (the schema's `deleted` flag already exists and is already
 * respected by getTodoList) - keeps history/comments/attachments intact
 * for audit purposes instead of destroying them.
 */
lilypadTicketsController.deleteTicket = async function (req, res) {
  try {
    const ticket = await LilyPadTicket.findById(req.params.id)
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' })
    }

    ticket.deleted = true
    pushHistory(ticket, 'deleted', req.user, 'Ticket deleted')
    await ticket.save()

    return res.status(200).json({ success: true, message: 'Ticket deleted.' })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * PUT /api/v1/lilypad/tickets/bulk/status
 * Loops LilyPadTicket.updateStatus() per id (rather than an updateMany)
 * so each ticket still gets its own history entry and the pre-save
 * hook's completedAt handling still fires - both would be skipped by a
 * raw bulk update.
 */
lilypadTicketsController.bulkUpdateStatus = async function (req, res) {
  try {
    const { ids, status } = req.body || {}
    const validStatuses = ['To-Do', 'In Progress', 'Complete', 'Blocked']
    const idList = Array.isArray(ids) ? ids.filter(Boolean) : []

    if (!idList.length) {
      return res.status(400).json({ success: false, error: 'ids must be a non-empty array.' })
    }
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` })
    }

    const results = await Promise.allSettled(idList.map((id) => LilyPadTicket.updateStatus(id, status, req.user)))
    const succeeded = results.filter((r) => r.status === 'fulfilled').length

    return res.status(200).json({
      success: true,
      message: `Updated ${succeeded} of ${idList.length} ticket(s) to ${status}.`,
      succeeded,
      failed: idList.length - succeeded
    })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * DELETE /api/v1/lilypad/tickets/bulk
 */
lilypadTicketsController.bulkDeleteTickets = async function (req, res) {
  try {
    const idList = Array.isArray(req.body && req.body.ids) ? req.body.ids.filter(Boolean) : []
    if (!idList.length) {
      return res.status(400).json({ success: false, error: 'ids must be a non-empty array.' })
    }

    const tickets = await LilyPadTicket.find({ _id: { $in: idList } })
    for (const ticket of tickets) {
      ticket.deleted = true
      pushHistory(ticket, 'deleted', req.user, 'Ticket deleted (bulk action)')
      await ticket.save()
    }

    return res.status(200).json({ success: true, message: `Deleted ${tickets.length} ticket(s).` })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/tickets/:id/attachments
 * multer's uploadMiddleware (attachmentUpload.single('file')) runs first
 * and populates req.file.
 */
lilypadTicketsController.uploadAttachment = async function (req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded.' })
    }

    const ticket = await LilyPadTicket.findById(req.params.id)
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' })
    }

    ticket.attachments.push({
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: `tickets/${req.params.id}/${req.file.filename}`,
      size: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: req.user ? req.user._id : null,
      uploadedByName: actorName(req.user)
    })
    pushHistory(ticket, 'attachment_added', req.user, `Attached file: ${req.file.originalname}`)

    const saved = await ticket.save()
    return res.status(200).json({ success: true, data: saved })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * DELETE /api/v1/lilypad/tickets/:id/attachments/:attachmentId
 */
lilypadTicketsController.deleteAttachment = async function (req, res) {
  try {
    const ticket = await LilyPadTicket.findById(req.params.id)
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' })
    }

    const attachment = ticket.attachments.id(req.params.attachmentId)
    if (!attachment) {
      return res.status(404).json({ success: false, error: 'Attachment not found' })
    }

    const filePath = path.join(UPLOAD_ROOT, attachment.path)
    fs.unlink(filePath, () => {}) // best-effort - a missing file on disk shouldn't block removing the DB record

    const removedName = attachment.originalName
    attachment.deleteOne()
    pushHistory(ticket, 'attachment_removed', req.user, `Removed attachment: ${removedName}`)

    const saved = await ticket.save()
    return res.status(200).json({ success: true, data: saved })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/tickets/:id/worklogs
 */
lilypadTicketsController.addWorkLog = async function (req, res) {
  try {
    const { hours, note } = req.body || {}
    const parsedHours = Number(hours)
    if (!Number.isFinite(parsedHours) || parsedHours <= 0) {
      return res.status(400).json({ success: false, error: 'hours must be a positive number.' })
    }

    const ticket = await LilyPadTicket.findById(req.params.id)
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' })
    }

    ticket.workLogs.push({
      user: req.user ? req.user._id : null,
      userName: actorName(req.user),
      hours: parsedHours,
      note: xss(String(note || '').trim())
    })
    pushHistory(ticket, 'work_logged', req.user, `Logged ${parsedHours} hour(s)`)

    const saved = await ticket.save()
    return res.status(200).json({ success: true, data: saved })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * DELETE /api/v1/lilypad/tickets/:id/worklogs/:workLogId
 */
lilypadTicketsController.deleteWorkLog = async function (req, res) {
  try {
    const ticket = await LilyPadTicket.findById(req.params.id)
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' })
    }

    const workLog = ticket.workLogs.id(req.params.workLogId)
    if (!workLog) {
      return res.status(404).json({ success: false, error: 'Work log entry not found' })
    }

    workLog.deleteOne()
    pushHistory(ticket, 'work_log_removed', req.user, 'Removed a work log entry')

    const saved = await ticket.save()
    return res.status(200).json({ success: true, data: saved })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/tickets/:id/subtasks
 */
lilypadTicketsController.addSubtask = async function (req, res) {
  try {
    const text = String((req.body && req.body.text) || '').trim()
    if (!text) {
      return res.status(400).json({ success: false, error: 'text is required.' })
    }

    const ticket = await LilyPadTicket.findById(req.params.id)
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' })
    }

    ticket.subtasks.push({ text: xss(text) })
    const saved = await ticket.save()
    return res.status(200).json({ success: true, data: saved })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * PUT /api/v1/lilypad/tickets/:id/subtasks/:subtaskId
 */
lilypadTicketsController.toggleSubtask = async function (req, res) {
  try {
    const ticket = await LilyPadTicket.findById(req.params.id)
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' })
    }

    const subtask = ticket.subtasks.id(req.params.subtaskId)
    if (!subtask) {
      return res.status(404).json({ success: false, error: 'Subtask not found' })
    }

    subtask.done = req.body && req.body.done !== undefined ? Boolean(req.body.done) : !subtask.done
    const saved = await ticket.save()
    return res.status(200).json({ success: true, data: saved })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * DELETE /api/v1/lilypad/tickets/:id/subtasks/:subtaskId
 */
lilypadTicketsController.deleteSubtask = async function (req, res) {
  try {
    const ticket = await LilyPadTicket.findById(req.params.id)
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' })
    }

    const subtask = ticket.subtasks.id(req.params.subtaskId)
    if (!subtask) {
      return res.status(404).json({ success: false, error: 'Subtask not found' })
    }

    subtask.deleteOne()
    const saved = await ticket.save()
    return res.status(200).json({ success: true, data: saved })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/tickets/:id/watchers
 * Defaults to the logged-in user watching the ticket themselves (the
 * common case - a "follow this ticket" button) but accepts an explicit
 * userId so an assignee/admin can add someone else as a watcher too.
 */
lilypadTicketsController.addWatcher = async function (req, res) {
  try {
    const userId = (req.body && req.body.userId) || (req.user && req.user._id)
    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required.' })
    }

    const ticket = await LilyPadTicket.findById(req.params.id)
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' })
    }

    if (!ticket.watchers.some((w) => String(w) === String(userId))) {
      ticket.watchers.push(userId)
    }

    const saved = await ticket.save()
    return res.status(200).json({ success: true, data: saved })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * DELETE /api/v1/lilypad/tickets/:id/watchers/:userId
 */
lilypadTicketsController.removeWatcher = async function (req, res) {
  try {
    const ticket = await LilyPadTicket.findById(req.params.id)
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' })
    }

    ticket.watchers = ticket.watchers.filter((w) => String(w) !== String(req.params.userId))
    const saved = await ticket.save()
    return res.status(200).json({ success: true, data: saved })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/tickets/:id/expenses
 */
lilypadTicketsController.addExpense = async function (req, res) {
  try {
    const description = String((req.body && req.body.description) || '').trim()
    const amount = Number(req.body && req.body.amount)
    const po = String((req.body && req.body.po) || '').trim()
    const vendor = String((req.body && req.body.vendor) || '').trim()
    if (!description) {
      return res.status(400).json({ success: false, error: 'description is required.' })
    }
    if (!Number.isFinite(amount) || amount < 0) {
      return res.status(400).json({ success: false, error: 'amount must be a non-negative number.' })
    }

    const ticket = await LilyPadTicket.findById(req.params.id)
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' })
    }

    ticket.expenses.push({
      description: xss(description),
      amount,
      po: xss(po),
      vendor: xss(vendor),
      loggedBy: req.user ? req.user._id : null,
      loggedByName: actorName(req.user)
    })
    pushHistory(ticket, 'expense_logged', req.user, `Logged expense: ${description} ($${amount.toFixed(2)})`)

    const saved = await ticket.save()
    return res.status(200).json({ success: true, data: saved })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * DELETE /api/v1/lilypad/tickets/:id/expenses/:expenseId
 */
lilypadTicketsController.deleteExpense = async function (req, res) {
  try {
    const ticket = await LilyPadTicket.findById(req.params.id)
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' })
    }

    const expense = ticket.expenses.id(req.params.expenseId)
    if (!expense) {
      return res.status(404).json({ success: false, error: 'Expense not found' })
    }

    const removedDescription = expense.description
    expense.deleteOne()
    pushHistory(ticket, 'expense_removed', req.user, `Removed expense: ${removedDescription}`)

    const saved = await ticket.save()
    return res.status(200).json({ success: true, data: saved })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

module.exports = lilypadTicketsController

