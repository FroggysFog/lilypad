const microsoftTeams = require('../services/microsoftTeams')

const controller = {}

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

module.exports = controller
