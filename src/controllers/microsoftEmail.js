const microsoftEmailService = require('../services/microsoftEmailService')
const microsoftEmailSyncService = require('../services/microsoftEmailSyncService')

const controller = {}

/**
 * GET /api/v1/lilypad/email/messages?folder=inbox|sent&skip=0
 */
controller.getMessages = async function (req, res) {
  try {
    const folder = req.query.folder === 'sent' ? 'sent' : 'inbox'
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
