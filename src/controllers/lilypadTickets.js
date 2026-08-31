/**
 * LilyPad ERP - Core Ticketing Controller
 * Handles dynamic intake forms, flexible ticket submissions, and uniform To-Do management.
 */

const { LilyPadTicket, IntakeForm, User } = require('../models')
const xss = require('xss')

const lilypadTicketsController = {}

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

    // Compute status counts for quick KPI cards
    const counts = {
      todo: await LilyPadTicket.countDocuments({ status: 'To-Do', deleted: false }),
      inProgress: await LilyPadTicket.countDocuments({ status: 'In Progress', deleted: false }),
      complete: await LilyPadTicket.countDocuments({ status: 'Complete', deleted: false }),
      blocked: await LilyPadTicket.countDocuments({ status: 'Blocked', deleted: false }),
      urgent: await LilyPadTicket.countDocuments({ priority: 'Urgent', status: { $ne: 'Complete' }, deleted: false }),
      total: await LilyPadTicket.countDocuments({ deleted: false })
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
    return res.status(200).json({
      success: true,
      message: 'Comment added successfully',
      data: saved
    })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

module.exports = lilypadTicketsController

