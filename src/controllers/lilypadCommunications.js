const communicationsFeedService = require('../services/communicationsFeedService')

const controller = {}

/**
 * GET /api/v1/lilypad/communications/feed
 */
controller.getFeed = async (req, res) => {
  try {
    return res.json({ success: true, data: await communicationsFeedService.getFeed(req.user._id) })
  } catch (err) {
    return res.status(502).json({ success: false, error: err.message })
  }
}

module.exports = controller
