/**
 * LilyPad ERP - Receipts Controller
 */

const LilyPadReceipt = require('../models/lilypadReceipt')

const lilypadReceiptsController = {}

/**
 * GET /api/v1/lilypad/receipts?search=&status=
 * Owner-scoped list for the Receipts page. Defaults to hiding dismissed
 * false positives; pass status=dismissed (or =all) to see them.
 */
lilypadReceiptsController.listMine = async function (req, res) {
  try {
    const query = { owner: req.user._id }
    const status = req.query.status || 'captured'
    if (status !== 'all') query.status = status

    const search = (req.query.search || '').trim()
    if (search) {
      query.$or = [
        { vendor: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } }
      ]
    }

    const receipts = await LilyPadReceipt.find(query).sort({ receiptDate: -1, receivedAt: -1, createdAt: -1 }).limit(200)
    return res.status(200).json({ success: true, data: receipts })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * GET /api/v1/lilypad/receipts/:id
 */
lilypadReceiptsController.getById = async function (req, res) {
  try {
    const receipt = await LilyPadReceipt.findOne({ _id: req.params.id, owner: req.user._id })
    if (!receipt) {
      return res.status(404).json({ success: false, error: 'Receipt not found.' })
    }
    return res.status(200).json({ success: true, data: receipt })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/receipts/:id/dismiss
 * Hides a false positive without deleting the underlying record.
 */
lilypadReceiptsController.dismiss = async function (req, res) {
  try {
    const result = await LilyPadReceipt.updateOne({ _id: req.params.id, owner: req.user._id }, { $set: { status: 'dismissed' } })
    if (!result.matchedCount) {
      return res.status(404).json({ success: false, error: 'Receipt not found.' })
    }
    return res.status(200).json({ success: true })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

module.exports = lilypadReceiptsController
