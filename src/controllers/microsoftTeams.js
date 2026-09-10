const microsoftTeams = require('../services/microsoftTeams')

const controller = {}

controller.status = (req, res) => {
  return res.json({ success: true, data: microsoftTeams.getStatus() })
}

controller.connect = (req, res) => {
  try {
    return res.redirect(microsoftTeams.getAuthorizationUrl())
  } catch (err) {
    return res.status(503).json({ success: false, error: err.message })
  }
}

controller.callback = async (req, res) => {
  try {
    await microsoftTeams.exchangeCode(req.query.code, req.query.state)
    // Teams chat is now a global panel (see lilypad-teams-chat.js), not
    // something tied to tickets.html specifically - dashboard.html is a
    // safer landing page regardless of which page the user connected
    // from. This was previously missing the .html extension entirely,
    // which 404'd on Express's static file serving.
    return res.redirect('/dashboard.html?teams=connected')
  } catch (err) {
    return res.status(400).send(`Microsoft Teams connection failed: ${err.message}`)
  }
}

controller.disconnect = (req, res) => {
  microsoftTeams.disconnect()
  return res.json({ success: true })
}

controller.chats = async (req, res) => {
  try {
    return res.json({ success: true, data: await microsoftTeams.getChats() })
  } catch (err) {
    return res.status(502).json({ success: false, error: err.message })
  }
}

controller.messages = async (req, res) => {
  try {
    const nextLink = req.query.nextLink ? decodeURIComponent(req.query.nextLink) : null
    return res.json({ success: true, data: await microsoftTeams.getMessages(req.params.chatId, { nextLink }) })
  } catch (err) {
    return res.status(502).json({ success: false, error: err.message })
  }
}

controller.send = async (req, res) => {
  try {
    return res.json({ success: true, data: await microsoftTeams.sendMessage(req.params.chatId, req.body.content) })
  } catch (err) {
    return res.status(502).json({ success: false, error: err.message })
  }
}

module.exports = controller
