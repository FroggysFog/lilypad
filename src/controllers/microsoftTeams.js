const multer = require('multer')
const microsoftTeams = require('../services/microsoftTeams')

const controller = {}

// Memory storage, not disk - the file is only ever relayed straight
// through to the sender's OneDrive (see microsoftTeams.js's
// sendAttachment); LilyPad never needs to persist a copy itself.
const attachmentUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } })
controller.uploadMiddleware = attachmentUpload.single('file')

controller.status = async (req, res) => {
  try {
    return res.json({ success: true, data: await microsoftTeams.getStatus(req.user._id) })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

controller.chats = async (req, res) => {
  try {
    return res.json({ success: true, data: await microsoftTeams.getChats(req.user._id) })
  } catch (err) {
    return res.status(502).json({ success: false, error: err.message })
  }
}

controller.messages = async (req, res) => {
  try {
    const nextLink = req.query.nextLink ? decodeURIComponent(req.query.nextLink) : null
    return res.json({ success: true, data: await microsoftTeams.getMessages(req.user._id, req.params.chatId, { nextLink }) })
  } catch (err) {
    return res.status(502).json({ success: false, error: err.message })
  }
}

controller.send = async (req, res) => {
  try {
    return res.json({ success: true, data: await microsoftTeams.sendMessage(req.user._id, req.params.chatId, req.body.content) })
  } catch (err) {
    return res.status(502).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/microsoft-teams/chats/:chatId/attachments (multipart, field "file")
 * Optional "caption" text field alongside the file.
 */
controller.sendAttachment = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'A file is required.' })
    const data = await microsoftTeams.sendAttachment(
      req.user._id, req.params.chatId, req.file.buffer, req.file.originalname, req.file.mimetype, req.body.caption
    )
    return res.json({ success: true, data })
  } catch (err) {
    return res.status(502).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/microsoft-teams/presences   body: { ids: [userId, ...] }
 */
controller.presences = async (req, res) => {
  try {
    const ids = Array.isArray(req.body.ids) ? req.body.ids : []
    return res.json({ success: true, data: await microsoftTeams.getPresences(req.user._id, ids) })
  } catch (err) {
    return res.status(502).json({ success: false, error: err.message })
  }
}

module.exports = controller
