/**
 * LilyPad ERP - Collections Reminder Email Logic
 * Ported from lilypad-hub's server.js (~4093-4248): stage bucketing,
 * template resolution + token rendering, send-and-log, and the scheduled
 * sweep that reminds every past-due account that hasn't been reminded
 * yet at its current stage.
 */

const LilyPadPastDueAccount = require('../models/lilypadPastDueAccount')
const LilyPadEmailTemplate = require('../models/lilypadEmailTemplate')
const LilyPadReminderDelivery = require('../models/lilypadReminderDelivery')
const LilyPadSetting = require('../models/lilypadSetting')
const { sendReminderEmail } = require('./emailSenderService')
const { computeDaysLateFromDate } = require('./pastDueSyncService')

const RESOLVED_STATUSES = ['Pending Payment', 'Paid in Full', 'Resolved', 'Complete']

function getDaysLate (account) {
  const dueDate = account.finalDueDate || account.originalDueDate
  return computeDaysLateFromDate(dueDate, new Date())
}

function getPastDueStage (daysLate) {
  const days = Number(daysLate || 0)

  if (days < 7) {
    return { status: 'Late', emailStage: 'No email sent', nextAction: 'First reminder due in 7 days', stageOrder: 0 }
  }
  if (days < 15) {
    return { status: 'Email 1 Sent', emailStage: 'Email 1', nextAction: 'Follow up with Email 1 if unopened', stageOrder: 1 }
  }
  if (days < 30) {
    return { status: 'Email 2 Sent', emailStage: 'Email 2', nextAction: 'Escalate to Email 2 and monitor open rate', stageOrder: 2 }
  }
  if (days < 90) {
    return { status: 'Call Required', emailStage: 'Email 3 Sent', nextAction: 'Call required; customer outreach and payment confirmation needed', stageOrder: 3 }
  }
  return { status: 'Collections', emailStage: 'Collections queue', nextAction: 'Escalate to collections and legal review', stageOrder: 4 }
}

function determineReminderTemplateKey (status, daysLate) {
  if (Number(daysLate || 0) >= 90 || status === 'Collections') return 'collections'
  if (status === 'Call Required') return 'email3'
  if (status === 'Email 2 Sent') return 'email2'
  if (status === 'Email 1 Sent') return 'email1'
  return 'late'
}

const DEFAULT_TEMPLATES = {
  late: {
    templateName: 'Late Notice',
    subject: 'Payment Reminder: Invoice {{days_late}} days past due',
    body: 'Hello {{payer_name}},\n\nThis is a reminder that payment for your outstanding balance is now {{days_late}} days past due. The total amount due is {{amount_due}} with the original due date of {{original_due_date}}.\n\nPlease review the payment options below and let us know if you need updated billing details or a revised payment schedule.\n\nAvailable payment options:\n- ACH Transfer\n- Credit Card\n- Wire Transfer\n- Pay Portal\n\nThank you,\nAccounts Receivable Team.'
  },
  email1: {
    templateName: 'Email 1 - First Reminder',
    subject: 'Action Needed: Payment balance is past due',
    body: 'Hello {{payer_name}},\n\nThis is our first reminder that your payment of {{amount_due}} is past due. The original due date was {{original_due_date}}.\n\nWe accept ACH Transfer, Credit Card, Wire Transfer, or Pay Portal.\n\nThank you,\nAccounts Receivable Team.'
  },
  email2: {
    templateName: 'Email 2 - Follow Up',
    subject: 'Second Notice: Past Due Payment',
    body: 'Hello {{payer_name}},\n\nThis is our second notice that your invoice remains unpaid. The current balance is {{amount_due}} and is {{days_late}} days late.\n\nPlease choose one of the following payment options to resolve the balance: ACH Transfer, Credit Card, Wire Transfer, Pay Portal.\n\nRegards,\nAccounts Receivable Team.'
  },
  email3: {
    templateName: 'Email 3 - Final Reminder',
    subject: 'Urgent: Final Payment Reminder',
    body: 'Hello {{payer_name}},\n\nThis is a final reminder that your payment of {{amount_due}} is overdue and requires immediate attention.\n\nThe original due date was {{original_due_date}} and the account is {{days_late}} days past due.\n\nSincerely,\nAccounts Receivable Team.'
  },
  collections: {
    templateName: 'Collections Review',
    subject: 'Collections Review Requested for Overdue Balance',
    body: 'Hello {{payer_name}},\n\nOur records show an outstanding balance of {{amount_due}} that remains unpaid and is {{days_late}} days past due.\n\nIf the account is not resolved promptly, it may be escalated for collections review.\n\nThank you,\nAccounts Receivable Team.'
  }
}

async function seedDefaultTemplates () {
  const count = await LilyPadEmailTemplate.countDocuments()
  if (count > 0) return

  const docs = Object.entries(DEFAULT_TEMPLATES).map(([templateKey, tpl]) => ({
    templateKey,
    templateName: tpl.templateName,
    subject: tpl.subject,
    body: tpl.body,
    active: true
  }))
  await LilyPadEmailTemplate.insertMany(docs)
}

function renderTemplate (template, account, daysLate) {
  const amount = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(account.amountDue || 0))
  const values = {
    payer_name: account.payerName || 'Accounts Payable',
    account_name: account.accountName || 'your account',
    amount_due: amount,
    days_late: daysLate,
    original_due_date: account.originalDueDate || 'not available',
    final_due_date: account.finalDueDate || account.originalDueDate || 'not available',
    order_number: account.orderNumber || 'not available',
    po_number: account.poNumber || 'not available',
    po_date: account.poDate || 'not available',
    payment_method: account.paymentMethod || 'check, ACH, or credit card',
    sales_rep: account.salesRep || 'Accounts Receivable Team'
  }

  const replace = (text) => String(text || '').replace(/{{\s*([a-z_]+)\s*}}/gi, (_, key) => values[key.toLowerCase()] ?? '')
  return { subject: replace(template.subject), body: replace(template.body) }
}

async function getConfiguredReminderTemplate (account, templateKey, daysLate) {
  const fallback = DEFAULT_TEMPLATES[templateKey] || DEFAULT_TEMPLATES.late
  const stored = await LilyPadEmailTemplate.findOne({ templateKey, active: true })
  const template = stored || fallback
  return renderTemplate(template, account, daysLate)
}

async function getReminderAutomationEnabled () {
  const setting = await LilyPadSetting.findOne({ key: 'reminderAutomationEnabled' })
  return Boolean(setting && setting.value === true)
}

async function setReminderAutomationEnabled (enabled) {
  await LilyPadSetting.findOneAndUpdate(
    { key: 'reminderAutomationEnabled' },
    { value: Boolean(enabled) },
    { upsert: true }
  )
  return Boolean(enabled)
}

async function getLastDelivery (accountName, templateKey) {
  return LilyPadReminderDelivery.findOne({ accountName, templateKey }).sort('-sentAt')
}

async function sendReminderForAccount (account, options = {}) {
  const daysLate = getDaysLate(account)
  const stage = getPastDueStage(daysLate)
  const status = account.status || stage.status

  if (!options.force) {
    if (RESOLVED_STATUSES.includes(status)) {
      return { skipped: true, reason: 'Account status excludes automated reminders.' }
    }

    const templateKey = determineReminderTemplateKey(status, daysLate)
    const lastDelivery = await getLastDelivery(account.accountName, templateKey)
    if (lastDelivery && lastDelivery.status === 'sent') {
      return { skipped: true, reason: 'Reminder already sent for this stage.' }
    }
  }

  const templateKey = options.templateKey || determineReminderTemplateKey(status, daysLate)
  const payerEmail = (account.payerEmail || '').trim()
  if (!payerEmail) {
    return { skipped: true, reason: 'No payer email on file for this account.' }
  }

  const rendered = options.subject || options.body
    ? { subject: options.subject || '', body: options.body || '' }
    : await getConfiguredReminderTemplate(account, templateKey, daysLate)

  try {
    const result = await sendReminderEmail({
      to: payerEmail,
      subject: rendered.subject,
      body: rendered.body,
      senderEmail: process.env.SMTP_FROM
    })

    await LilyPadReminderDelivery.create({
      accountName: account.accountName,
      recipientEmail: payerEmail,
      templateKey,
      status: 'sent',
      subject: rendered.subject,
      senderEmail: process.env.SMTP_FROM || '',
      messageId: result.messageId || ''
    })

    return { sent: true, templateKey, recipient: payerEmail }
  } catch (error) {
    await LilyPadReminderDelivery.create({
      accountName: account.accountName,
      recipientEmail: payerEmail,
      templateKey,
      status: 'failed',
      subject: rendered.subject,
      senderEmail: process.env.SMTP_FROM || '',
      failedReason: error.message || 'Failed to send reminder.'
    })

    return { sent: false, templateKey, recipient: payerEmail, error: error.message }
  }
}

async function runScheduledReminderCheck () {
  const enabled = await getReminderAutomationEnabled()
  if (!enabled) return { skipped: true, reason: 'Reminder automation is disabled.' }

  const accounts = await LilyPadPastDueAccount.find({ status: { $nin: RESOLVED_STATUSES } })
  const dueAccounts = accounts.filter((account) => getDaysLate(account) >= 7)

  const results = []
  for (const account of dueAccounts) {
    results.push(await sendReminderForAccount(account))
  }
  return { checked: dueAccounts.length, results }
}

function startReminderScheduler (winston) {
  const intervalMinutes = Number(process.env.REMINDER_CHECK_MINUTES || 5)
  const intervalMs = Math.max(60 * 1000, intervalMinutes * 60 * 1000)

  if (winston) winston.info(`Reminder scheduler started (${intervalMinutes} minute interval; sending controlled by the Automation toggle).`)

  setInterval(() => {
    runScheduledReminderCheck().catch((err) => {
      if (winston) winston.error('Scheduled reminder check failed: ' + err.message)
    })
  }, intervalMs)

  setTimeout(() => {
    runScheduledReminderCheck().catch((err) => {
      if (winston) winston.error('Initial reminder check failed: ' + err.message)
    })
  }, 15000)
}

module.exports = {
  getDaysLate,
  getPastDueStage,
  determineReminderTemplateKey,
  seedDefaultTemplates,
  renderTemplate,
  getConfiguredReminderTemplate,
  getReminderAutomationEnabled,
  setReminderAutomationEnabled,
  sendReminderForAccount,
  runScheduledReminderCheck,
  startReminderScheduler,
  DEFAULT_TEMPLATES,
  RESOLVED_STATUSES
}
