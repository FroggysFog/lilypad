const multer = require('multer')
const xss = require('xss')
const microsoftEmailService = require('../services/microsoftEmailService')
const microsoftEmailSyncService = require('../services/microsoftEmailSyncService')
const emailInteractionScoringService = require('../services/emailInteractionScoringService')
const emailTriageExtractionService = require('../services/emailTriageExtractionService')
const emailSenderRollupService = require('../services/emailSenderRollupService')
const emailErpEntityLinkService = require('../services/emailErpEntityLinkService')
const emailWaitingOnService = require('../services/emailWaitingOnService')
const { LilyPadSuggestedTask, LilyPadTask, LilyPadAwaitingResponse, LilyPadTicket, LilyPadErpEntityLink, LilyPadEmailCache } = require('../models')

const URGENCY_TO_PRIORITY = { urgent: 'Urgent', high: 'High', normal: 'Normal', low: 'Low' }

// Attachments only ever need to live in memory long enough to
// base64-encode and hand to Graph - there's no reason to write them to
// our own disk first (Graph/Outlook is the permanent store here, unlike
// ticket attachments which LilyPad itself hosts).
const attachmentUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

const controller = {}
const VALID_FOLDERS = ['inbox', 'sent', 'archive', 'drafts', 'deleted', 'junk']

function cleanHtml (html) {
  return xss(String(html || ''))
}

/**
 * GET /api/v1/lilypad/email/messages?folder=inbox|sent|archive|drafts&skip=0
 */
controller.getMessages = async function (req, res) {
  try {
    const folder = VALID_FOLDERS.includes(req.query.folder) ? req.query.folder : 'inbox'
    const skip = parseInt(req.query.skip, 10) || 0
    const data = await microsoftEmailService.getMessages(req.user._id, folder, { top: 25, skip })
    return res.status(200).json({ success: true, data })
  } catch (err) {
    return res.status(502).json({ success: false, error: err.message })
  }
}

/**
 * GET /api/v1/lilypad/email/messages/:id
 * Marks the message read as a side effect of opening it, same as any
 * mail client - best-effort, doesn't fail the read if the PATCH does.
 */
controller.getMessageById = async function (req, res) {
  try {
    const data = await microsoftEmailService.getMessageById(req.user._id, req.params.id)
    microsoftEmailService.markAsRead(req.user._id, req.params.id).catch(() => {})
    return res.status(200).json({ success: true, data })
  } catch (err) {
    return res.status(502).json({ success: false, error: err.message })
  }
}

/**
 * GET /api/v1/lilypad/email/messages/:id/thread
 */
controller.getThread = async function (req, res) {
  try {
    const message = await microsoftEmailService.getMessageById(req.user._id, req.params.id)
    const data = await microsoftEmailService.getThread(req.user._id, message.conversationId)
    return res.status(200).json({ success: true, data })
  } catch (err) {
    return res.status(502).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/email/drafts
 */
controller.createDraft = async function (req, res) {
  try {
    const { subject, bodyHtml, toRecipients, ccRecipients } = req.body
    const id = await microsoftEmailService.createDraft(req.user._id, {
      subject: subject ? String(subject).trim() : '',
      bodyHtml: cleanHtml(bodyHtml),
      toRecipients,
      ccRecipients
    })
    return res.status(201).json({ success: true, data: { id } })
  } catch (err) {
    return res.status(502).json({ success: false, error: err.message })
  }
}

/**
 * PATCH /api/v1/lilypad/email/drafts/:id
 * Auto-save target - the composer debounces keystrokes into this.
 */
controller.updateDraft = async function (req, res) {
  try {
    const { subject, bodyHtml, toRecipients, ccRecipients } = req.body
    await microsoftEmailService.updateDraft(req.user._id, req.params.id, {
      subject: subject !== undefined ? String(subject).trim() : undefined,
      bodyHtml: bodyHtml !== undefined ? cleanHtml(bodyHtml) : undefined,
      toRecipients,
      ccRecipients
    })
    return res.status(200).json({ success: true })
  } catch (err) {
    return res.status(502).json({ success: false, error: err.message })
  }
}

/**
 * DELETE /api/v1/lilypad/email/drafts/:id
 */
controller.discardDraft = async function (req, res) {
  try {
    await microsoftEmailService.discardDraft(req.user._id, req.params.id)
    return res.status(200).json({ success: true })
  } catch (err) {
    return res.status(502).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/email/drafts/:id/attachments
 * attachmentUploadMiddleware (attachmentUpload.single('file')) runs
 * first and populates req.file.
 */
controller.attachmentUploadMiddleware = attachmentUpload.single('file')

controller.addAttachment = async function (req, res) {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded.' })
    await microsoftEmailService.addAttachmentToDraft(req.user._id, req.params.id, req.file)
    return res.status(200).json({ success: true })
  } catch (err) {
    return res.status(err.statusCode || 502).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/email/drafts/:id/send
 */
controller.sendDraft = async function (req, res) {
  try {
    await microsoftEmailService.sendDraft(req.user._id, req.params.id)
    return res.status(200).json({ success: true })
  } catch (err) {
    return res.status(502).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/email/messages/:id/reply    { comment, replyAll? }
 */
controller.reply = async function (req, res) {
  try {
    await microsoftEmailService.replyToMessage(req.user._id, req.params.id, {
      comment: cleanHtml(req.body.comment),
      replyAll: Boolean(req.body.replyAll)
    })
    return res.status(200).json({ success: true })
  } catch (err) {
    return res.status(502).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/email/messages/:id/forward   { comment, toRecipients }
 */
controller.forward = async function (req, res) {
  try {
    if (!Array.isArray(req.body.toRecipients) || !req.body.toRecipients.length) {
      return res.status(400).json({ success: false, error: 'At least one recipient is required.' })
    }
    await microsoftEmailService.forwardMessage(req.user._id, req.params.id, {
      comment: cleanHtml(req.body.comment),
      toRecipients: req.body.toRecipients
    })
    return res.status(200).json({ success: true })
  } catch (err) {
    return res.status(502).json({ success: false, error: err.message })
  }
}

/**
 * DELETE /api/v1/lilypad/email/messages/:id
 */
controller.deleteMessage = async function (req, res) {
  try {
    await microsoftEmailService.deleteMessage(req.user._id, req.params.id)
    return res.status(200).json({ success: true })
  } catch (err) {
    return res.status(502).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/email/messages/:id/move   { destination: 'archive'|'inbox'|'deleted'|'junk' }
 */
controller.moveMessage = async function (req, res) {
  try {
    await microsoftEmailService.moveMessage(req.user._id, req.params.id, req.body.destination)
    return res.status(200).json({ success: true })
  } catch (err) {
    return res.status(502).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/email/sync-webhook
 * Called by Microsoft Graph, not a logged-in browser - no session, no
 * requireLoginApi. Two distinct request shapes hit this one endpoint:
 * the subscription-creation validation handshake (a validationToken
 * query param that must be echoed back as plain text), and the actual
 * change notifications (a JSON body). Per-notification clientState
 * verification happens downstream in handleWebhookNotification, not
 * here - this layer's only job is to ack Graph fast.
 */
controller.syncWebhook = async function (req, res) {
  if (req.query.validationToken) {
    return res.status(200).type('text/plain').send(req.query.validationToken)
  }

  // Graph expects a fast ack (it will back off/disable the subscription
  // if this endpoint looks slow or unhealthy) - the actual delta pull
  // runs after the response is already sent.
  res.status(202).end()

  const notifications = (req.body && req.body.value) || []
  microsoftEmailSyncService.handleWebhookNotification(notifications).catch(() => {})
}

/**
 * GET /api/v1/lilypad/email/graymail-digest
 */
controller.getGraymailDigest = async function (req, res) {
  try {
    const data = await microsoftEmailService.getGraymailDigest(req.user._id, { top: 200 })
    return res.status(200).json({ success: true, data })
  } catch (err) {
    return res.status(502).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/email/score-now
 * Manual trigger for the current user's interaction scoring pass - lets
 * you verify priority/graymail flags update immediately after a sync
 * instead of waiting on the 30-minute scheduler.
 */
controller.triggerScoring = async function (req, res) {
  try {
    const result = await emailInteractionScoringService.recomputeScoresForOwner(req.user._id)
    return res.status(200).json({ success: true, data: result })
  } catch (err) {
    return res.status(502).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/email/extract-now
 * Manual trigger for the current user's LLM triage extraction pass -
 * lets you verify Suggested Tasks show up immediately instead of
 * waiting on the 20-minute scheduler.
 */
controller.triggerExtraction = async function (req, res) {
  try {
    const result = await emailTriageExtractionService.runExtractionForOwner(req.user._id)
    return res.status(200).json({ success: true, data: result })
  } catch (err) {
    return res.status(502).json({ success: false, error: err.message })
  }
}

/**
 * GET /api/v1/lilypad/email/suggested-tasks
 */
controller.getSuggestedTasks = async function (req, res) {
  try {
    const data = await LilyPadSuggestedTask.find({ owner: req.user._id, status: 'pending' })
      .populate('sourceEmail', 'subject from receivedDateTime')
      .sort({ createdAt: -1 })
      .limit(100)
    return res.status(200).json({ success: true, data })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/email/suggested-tasks/:id/approve
 * Creates a real lilypad_tasks record the same way any other task is
 * created (owner = the approving user, so it lands on their own Task
 * Manager list) rather than adding a second, parallel task-creation
 * path - this is the one place a suggestion graduates into a real task.
 */
controller.approveSuggestedTask = async function (req, res) {
  try {
    const suggestion = await LilyPadSuggestedTask.findOne({ _id: req.params.id, owner: req.user._id, status: 'pending' })
    if (!suggestion) return res.status(404).json({ success: false, error: 'Suggested task not found' })

    const task = await LilyPadTask.create({
      title: suggestion.title,
      notes: suggestion.context ? `From email: ${suggestion.context}` : 'Suggested from email triage.',
      dueDate: suggestion.suggestedDueDate,
      priority: URGENCY_TO_PRIORITY[suggestion.urgency] || 'Normal',
      owner: req.user._id,
      createdBy: req.user._id,
      history: [{
        action: 'created',
        by: req.user._id,
        byName: req.user.fullname,
        description: 'Created from an Email Triage suggestion'
      }]
    })

    suggestion.status = 'approved'
    suggestion.createdTaskId = task._id
    await suggestion.save()

    return res.status(200).json({ success: true, data: { taskId: task._id } })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/email/suggested-tasks/:id/dismiss
 */
controller.dismissSuggestedTask = async function (req, res) {
  try {
    const suggestion = await LilyPadSuggestedTask.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id, status: 'pending' },
      { $set: { status: 'dismissed' } }
    )
    if (!suggestion) return res.status(404).json({ success: false, error: 'Suggested task not found' })
    return res.status(200).json({ success: true })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * GET /api/v1/lilypad/email/sender-cards
 */
controller.getSenderCards = async function (req, res) {
  try {
    const data = await emailSenderRollupService.getRollupCards(req.user._id)
    return res.status(200).json({ success: true, data })
  } catch (err) {
    return res.status(502).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/email/sender-cards/:address/rollup-now
 * Manual regenerate for one sender - for testing without waiting on
 * staleness rules or the 30-minute scheduler.
 */
controller.regenerateSenderCard = async function (req, res) {
  try {
    const rollup = await emailSenderRollupService.generateRollupForSender(req.user._id, decodeURIComponent(req.params.address))
    return res.status(200).json({ success: true, data: rollup })
  } catch (err) {
    return res.status(502).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/email/sender-cards/:address/blockers/add-task   { blockerText }
 * Matched by exact blocker text rather than an array index - the
 * frontend only ever sees the already-declined-filtered list, so
 * positions there don't line up with the stored array once anything's
 * been declined.
 */
controller.addTaskFromBlocker = async function (req, res) {
  try {
    const task = await emailSenderRollupService.addTaskFromBlocker(req.user._id, decodeURIComponent(req.params.address), req.body.blockerText)
    return res.status(201).json({ success: true, data: task })
  } catch (err) {
    return res.status(502).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/email/sender-cards/:address/blockers/decline   { blockerText }
 */
controller.declineBlocker = async function (req, res) {
  try {
    await emailSenderRollupService.declineBlocker(req.user._id, decodeURIComponent(req.params.address), req.body.blockerText)
    return res.status(200).json({ success: true })
  } catch (err) {
    return res.status(502).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/email/sender-cards/:address/dismiss
 */
controller.dismissSenderCard = async function (req, res) {
  try {
    await emailSenderRollupService.dismissCard(req.user._id, decodeURIComponent(req.params.address))
    return res.status(200).json({ success: true })
  } catch (err) {
    return res.status(502).json({ success: false, error: err.message })
  }
}

/**
 * GET /api/v1/lilypad/email/priority-rules
 */
controller.getPriorityRules = async function (req, res) {
  try {
    const data = await emailSenderRollupService.listPriorityRules(req.user._id)
    return res.status(200).json({ success: true, data })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/email/priority-rules   { type: 'address'|'keyword', value }
 */
controller.addPriorityRule = async function (req, res) {
  try {
    const rule = await emailSenderRollupService.addPriorityRule(req.user._id, req.body.type, req.body.value)
    return res.status(201).json({ success: true, data: rule })
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message })
  }
}

/**
 * DELETE /api/v1/lilypad/email/priority-rules/:id
 */
controller.removePriorityRule = async function (req, res) {
  try {
    await emailSenderRollupService.removePriorityRule(req.user._id, req.params.id)
    return res.status(200).json({ success: true })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/email/messages/:id/create-ticket
 * { title, description, priority, assigneeId }
 * A lighter path than the full customer-facing intake flow - internal
 * staff creating a ticket straight from an email don't need a category/
 * dynamic form, just something that lands in the To-Do queue assignable
 * to whoever should handle it (e.g. routing a billing question to
 * Accounting). Auto-links the new ticket back onto the source email so
 * its badge shows up immediately instead of waiting for the next
 * entity-linking pass.
 */
controller.createTicketFromEmail = async function (req, res) {
  try {
    const { title, description, priority, assigneeId } = req.body
    if (!title || !description) {
      return res.status(400).json({ success: false, error: 'Title and description are required.' })
    }

    const ticket = await LilyPadTicket.create({
      title: xss(String(title).trim()),
      description: xss(String(description).trim()),
      priority: ['Low', 'Normal', 'High', 'Urgent'].includes(priority) ? priority : 'Normal',
      status: 'To-Do',
      categoryName: 'General',
      source: 'email',
      reporter: req.user._id,
      assignee: assigneeId || null,
      externalReporter: {
        name: req.user.fullname || req.user.username,
        email: req.user.email || '',
        phone: '',
        company: ''
      },
      history: [{
        action: 'created',
        by: req.user._id,
        byName: req.user.fullname,
        description: 'Created from an email in the Email module'
      }]
    })

    const sourceEmail = await LilyPadEmailCache.findOne({ owner: req.user._id, graphMessageId: req.params.id })
    if (sourceEmail) {
      await LilyPadErpEntityLink.create({
        sourceEmail: sourceEmail._id,
        entityType: 'ticket',
        entityId: ticket._id,
        matchedText: ticket.formattedUid,
        snapshotLabel: `${ticket.formattedUid}: ${ticket.title}`,
        snapshotStatus: ticket.status,
        snapshotValue: null
      })
    }

    return res.status(201).json({ success: true, data: ticket })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * GET /api/v1/lilypad/email/messages/:id/entity-links
 */
controller.getEntityLinks = async function (req, res) {
  try {
    const data = await emailErpEntityLinkService.getLinksForEmail(req.user._id, req.params.id)
    return res.status(200).json({ success: true, data })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/email/link-entities-now
 */
controller.triggerEntityLinking = async function (req, res) {
  try {
    const result = await emailErpEntityLinkService.runEntityLinkingForOwner(req.user._id)
    return res.status(200).json({ success: true, data: result })
  } catch (err) {
    return res.status(502).json({ success: false, error: err.message })
  }
}

/**
 * GET /api/v1/lilypad/email/waiting-on
 * Overdue first, then longest-waiting - the ones that need attention
 * most should never be scrolled past.
 */
controller.getWaitingOn = async function (req, res) {
  try {
    const data = await LilyPadAwaitingResponse.find({ owner: req.user._id, status: { $in: ['waiting', 'overdue'] } })
      .sort({ status: 1, followUpAfter: 1 })
      .limit(100)
    return res.status(200).json({ success: true, data })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/email/waiting-on/:id/dismiss
 */
controller.dismissWaitingOn = async function (req, res) {
  try {
    const watcher = await LilyPadAwaitingResponse.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { $set: { status: 'dismissed' } }
    )
    if (!watcher) return res.status(404).json({ success: false, error: 'Watcher not found' })
    return res.status(200).json({ success: true })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/email/scan-waiting-on-now
 */
controller.triggerWaitingOnScan = async function (req, res) {
  try {
    const result = await emailWaitingOnService.runWaitingOnPassForOwner(req.user._id)
    return res.status(200).json({ success: true, data: result })
  } catch (err) {
    return res.status(502).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/email/sync-now
 * Manual trigger for the current user's own inbox+sent sync - lets you
 * verify the sync engine works right now instead of waiting on the
 * 15-minute fallback scheduler or webhook delivery.
 */
controller.triggerSync = async function (req, res) {
  try {
    const inbox = await microsoftEmailSyncService.runDeltaSync(req.user._id, 'inbox')
    const sentitems = await microsoftEmailSyncService.runDeltaSync(req.user._id, 'sentitems')
    return res.status(200).json({ success: true, data: { inbox, sentitems } })
  } catch (err) {
    return res.status(502).json({ success: false, error: err.message })
  }
}

module.exports = controller
