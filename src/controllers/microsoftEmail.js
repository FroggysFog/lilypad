const microsoftEmailService = require('../services/microsoftEmailService')

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

module.exports = controller
