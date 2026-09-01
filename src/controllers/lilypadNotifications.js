/**
 * LilyPad ERP - Notifications Controller
 * Serves the logged-in user's own notifications (e.g. @mentions in ticket comments).
 */

const { LilyPadNotification } = require('../models')

const lilypadNotificationsController = {}

/**
 * GET /api/v1/lilypad/notifications
 */
lilypadNotificationsController.getMyNotifications = async function (req, res) {
  try {
    const notifications = await LilyPadNotification.find({ recipient: req.user._id })
      .sort('-createdAt')
      .limit(50)

    const unreadCount = await LilyPadNotification.countDocuments({ recipient: req.user._id, read: false })

    return res.status(200).json({
      success: true,
      data: notifications,
      unreadCount
    })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * PUT /api/v1/lilypad/notifications/:id/read
 */
lilypadNotificationsController.markAsRead = async function (req, res) {
  try {
    const notification = await LilyPadNotification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true },
      { new: true }
    )

    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' })
    }

    return res.status(200).json({ success: true, data: notification })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * PUT /api/v1/lilypad/notifications/read-all
 */
lilypadNotificationsController.markAllAsRead = async function (req, res) {
  try {
    await LilyPadNotification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true }
    )

    return res.status(200).json({ success: true, message: 'All notifications marked as read' })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * DELETE /api/v1/lilypad/notifications/:id
 */
lilypadNotificationsController.deleteNotification = async function (req, res) {
  try {
    const notification = await LilyPadNotification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id
    })

    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' })
    }

    return res.status(200).json({ success: true, message: 'Notification removed' })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

module.exports = lilypadNotificationsController
