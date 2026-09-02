/**
 * LilyPad ERP - Past Due Payments Controller
 * Accounts-receivable collections reminder pipeline, ported from
 * lilypad-hub.
 */

const LilyPadPastDueAccount = require('../models/lilypadPastDueAccount')
const LilyPadEmailTemplate = require('../models/lilypadEmailTemplate')
const LilyPadReminderDelivery = require('../models/lilypadReminderDelivery')
const { syncPastDueAccountsFromSalesforce } = require('../services/pastDueSyncService')
const { syncOrdersFromSalesforce } = require('../services/orderSyncService')
const {
  getDaysLate,
  getPastDueStage,
  seedDefaultTemplates,
  getReminderAutomationEnabled,
  setReminderAutomationEnabled,
  sendReminderForAccount,
  RESOLVED_STATUSES
} = require('../services/reminderEmailService')
const xss = require('xss')

const lilypadPastDueController = {}

function toRow (account) {
  const daysLate = getDaysLate(account)
  const stage = getPastDueStage(daysLate)
  const status = account.status || stage.status

  return {
    id: account._id,
    accountName: account.accountName,
    amountDue: account.amountDue,
    originalDueDate: account.originalDueDate,
    finalDueDate: account.finalDueDate,
    daysLate,
    status,
    stage: stage.emailStage,
    nextAction: stage.nextAction,
    isPending: !RESOLVED_STATUSES.includes(status),
    salesRep: account.salesRep,
    payerName: account.payerName,
    payerEmail: account.payerEmail,
    payerPhone: account.payerPhone,
    payerNotes: account.payerNotes,
    paymentMethod: account.paymentMethod,
    orderNumber: account.orderNumber,
    poNumber: account.poNumber,
    poDate: account.poDate,
    lastSyncAt: account.lastSyncAt
  }
}

/**
 * GET /api/v1/lilypad/past-due
 */
lilypadPastDueController.getPastDueAccounts = async function (req, res) {
  try {
    const accounts = await LilyPadPastDueAccount.find({})
    const allRows = accounts.map(toRow)

    // Summary reflects every past due account regardless of the list's
    // search/filter/pagination below.
    const totalLate = allRows.filter((r) => r.daysLate > 0).reduce((sum, r) => sum + Number(r.amountDue || 0), 0)
    const pendingAmount = allRows.filter((r) => r.isPending).reduce((sum, r) => sum + Number(r.amountDue || 0), 0)
    const avgDaysLate = allRows.length ? allRows.reduce((sum, r) => sum + r.daysLate, 0) / allRows.length : 0

    const search = String(req.query.search || '').trim().toLowerCase()
    const stageFilter = String(req.query.status || '').trim()

    let rows = allRows
    if (search) {
      rows = rows.filter((r) => `${r.accountName} ${r.payerName}`.toLowerCase().includes(search))
    }
    if (stageFilter) {
      rows = rows.filter((r) => r.status === stageFilter)
    }
    rows = rows.slice().sort((a, b) => b.daysLate - a.daysLate)

    const page = Math.max(1, Number(req.query.page) || 1)
    const pageSize = Math.min(200, Math.max(1, Number(req.query.pageSize) || 50))
    const total = rows.length
    const pageRows = rows.slice((page - 1) * pageSize, page * pageSize)

    return res.status(200).json({
      success: true,
      summary: {
        averageLateDays: Number(avgDaysLate.toFixed(1)),
        totalAmountLate: Number(totalLate.toFixed(2)),
        pendingAmount: Number(pendingAmount.toFixed(2)),
        count: allRows.length
      },
      data: pageRows,
      pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) }
    })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * GET /api/v1/lilypad/past-due/:id
 */
lilypadPastDueController.getPastDueAccountDetail = async function (req, res) {
  try {
    const account = await LilyPadPastDueAccount.findById(req.params.id)
    if (!account) {
      return res.status(404).json({ success: false, error: 'Account not found' })
    }

    const deliveries = await LilyPadReminderDelivery.find({ accountName: account.accountName }).sort('-sentAt').limit(25)

    return res.status(200).json({
      success: true,
      data: toRow(account),
      deliveries
    })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/past-due/sync
 */
lilypadPastDueController.triggerSalesforceSync = async function (req, res) {
  try {
    // Past due accounts are derived from Orders, so refresh Orders first
    // to make sure this button always reflects current Salesforce data.
    await syncOrdersFromSalesforce()
    const result = await syncPastDueAccountsFromSalesforce()
    return res.status(200).json({ success: true, message: `Synced ${result.synced} of ${result.total} accounts from Salesforce.`, ...result })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * PUT /api/v1/lilypad/past-due/:id/payer-info
 */
lilypadPastDueController.updatePayerInfo = async function (req, res) {
  try {
    const { payerName, payerEmail, payerPhone, payerNotes, paymentMethod } = req.body
    const account = await LilyPadPastDueAccount.findById(req.params.id)
    if (!account) {
      return res.status(404).json({ success: false, error: 'Account not found' })
    }

    if (payerName !== undefined) account.payerName = xss(String(payerName).trim())
    if (payerEmail !== undefined) account.payerEmail = xss(String(payerEmail).trim().toLowerCase())
    if (payerPhone !== undefined) account.payerPhone = xss(String(payerPhone).trim())
    if (payerNotes !== undefined) account.payerNotes = xss(String(payerNotes).trim())
    if (paymentMethod !== undefined) account.paymentMethod = xss(String(paymentMethod).trim())

    await account.save()
    return res.status(200).json({ success: true, data: toRow(account) })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/past-due/:id/send-reminder
 */
lilypadPastDueController.sendManualReminder = async function (req, res) {
  try {
    const account = await LilyPadPastDueAccount.findById(req.params.id)
    if (!account) {
      return res.status(404).json({ success: false, error: 'Account not found' })
    }

    const { subject, body, templateKey } = req.body || {}
    const result = await sendReminderForAccount(account, { force: true, subject, body, templateKey })

    if (result.skipped) {
      return res.status(400).json({ success: false, error: result.reason })
    }
    if (!result.sent) {
      return res.status(500).json({ success: false, error: result.error || 'Failed to send reminder.' })
    }

    return res.status(200).json({ success: true, message: 'Reminder sent.', data: result })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * GET /api/v1/lilypad/past-due/delivery-log
 */
lilypadPastDueController.getDeliveryLog = async function (req, res) {
  try {
    const deliveries = await LilyPadReminderDelivery.find({}).sort('-sentAt').limit(50)
    const summary = {
      sent: deliveries.filter((d) => d.status === 'sent').length,
      failed: deliveries.filter((d) => d.status === 'failed').length,
      total: deliveries.length
    }
    return res.status(200).json({ success: true, summary, data: deliveries })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * GET /api/v1/lilypad/past-due/templates
 */
lilypadPastDueController.getReminderTemplates = async function (req, res) {
  try {
    await seedDefaultTemplates()
    const templates = await LilyPadEmailTemplate.find({}).sort('templateName')
    return res.status(200).json({ success: true, data: templates })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/past-due/templates
 */
lilypadPastDueController.saveReminderTemplate = async function (req, res) {
  try {
    const { templateKey, templateName, subject, body } = req.body || {}
    if (!templateKey || !templateName || !subject || !body) {
      return res.status(400).json({ success: false, error: 'Template key, name, subject, and body are required.' })
    }

    const template = await LilyPadEmailTemplate.findOneAndUpdate(
      { templateKey: xss(String(templateKey).trim()) },
      {
        templateName: xss(String(templateName).trim()),
        subject: xss(String(subject).trim()),
        body: xss(String(body).trim())
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    return res.status(200).json({ success: true, message: 'Template saved.', data: template })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/past-due/templates/:templateKey/toggle
 */
lilypadPastDueController.toggleReminderTemplate = async function (req, res) {
  try {
    const template = await LilyPadEmailTemplate.findOne({ templateKey: req.params.templateKey })
    if (!template) {
      return res.status(404).json({ success: false, error: 'Template not found' })
    }
    template.active = !template.active
    await template.save()
    return res.status(200).json({ success: true, data: template })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * GET /api/v1/lilypad/past-due/automation
 */
lilypadPastDueController.getReminderAutomationStatus = async function (req, res) {
  try {
    const enabled = await getReminderAutomationEnabled()
    return res.status(200).json({ success: true, enabled })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/past-due/automation/toggle
 */
lilypadPastDueController.toggleReminderAutomation = async function (req, res) {
  try {
    const current = await getReminderAutomationEnabled()
    const enabled = await setReminderAutomationEnabled(!current)
    return res.status(200).json({ success: true, enabled })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

module.exports = lilypadPastDueController
