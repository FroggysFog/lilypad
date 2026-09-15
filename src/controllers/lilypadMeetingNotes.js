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

/**
 * GET /api/v1/lilypad/meeting-notes
 * Admin-only, temporary - lets recent notes (including unowned ones,
 * e.g. a test payload whose email matches no real account) be checked
 * directly while confirming the pipeline works, without needing a
 * matched calendar event to look one up via getForEvent. Safe to
 * remove once this integration is trusted.
 */
lilypadMeetingNotesController.listRecent = async function (req, res) {
  try {
    const notes = await LilyPadMeetingNote.find({}).sort({ createdAt: -1 }).limit(20)
    return res.status(200).json({ success: true, data: notes })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

module.exports = lilypadMeetingNotesController
