/**
 * LilyPad ERP - Meeting Notes Controller
 */

const LilyPadMeetingNote = require('../models/lilypadMeetingNote')

const lilypadMeetingNotesController = {}

/**
 * GET /api/v1/lilypad/meeting-notes/for-event?msEventId=...&erpEventId=...
 * Looks up whichever meeting note (if any) matched to this calendar
 * event - see meetingNoteService.js for how that match happens at
 * webhook-ingestion time. Scoped to the logged-in user's own notes,
 * same as every other personal-data lookup in this app.
 */
lilypadMeetingNotesController.getForEvent = async function (req, res) {
  try {
    const { msEventId, erpEventId } = req.query
    if (!msEventId && !erpEventId) {
      return res.status(400).json({ success: false, error: 'msEventId or erpEventId is required.' })
    }

    const query = { owner: req.user._id }
    if (msEventId) query.msEventId = msEventId
    else query.erpEventId = erpEventId

    const note = await LilyPadMeetingNote.findOne(query).sort({ createdAt: -1 })
    return res.status(200).json({ success: true, data: note })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

module.exports = lilypadMeetingNotesController
