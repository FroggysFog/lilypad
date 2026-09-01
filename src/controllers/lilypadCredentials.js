/**
 * LilyPad ERP - Credentials Vault Controller
 * Admin-only. All routes are gated by requireAdminApi at the route level;
 * this controller additionally never returns a full raw value from the
 * list endpoint - only revealCredential does, on an explicit per-item
 * request.
 */

const LilyPadCredential = require('../models/lilypadCredential')
const xss = require('xss')

const lilypadCredentialsController = {}

function maskValue (value) {
  const str = String(value || '')
  if (str.length <= 4) return '••••'
  return '••••' + str.slice(-4)
}

function toMaskedRow (cred) {
  return {
    id: cred._id,
    label: cred.label,
    key: cred.key,
    maskedValue: maskValue(cred.value),
    category: cred.category,
    notes: cred.notes,
    updatedAt: cred.updatedAt
  }
}

/**
 * GET /api/v1/lilypad/credentials
 */
lilypadCredentialsController.getCredentials = async function (req, res) {
  try {
    const credentials = await LilyPadCredential.find({}).sort('category label')
    return res.status(200).json({ success: true, data: credentials.map(toMaskedRow) })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * GET /api/v1/lilypad/credentials/:id/reveal
 */
lilypadCredentialsController.revealCredential = async function (req, res) {
  try {
    const credential = await LilyPadCredential.findById(req.params.id)
    if (!credential) {
      return res.status(404).json({ success: false, error: 'Credential not found' })
    }
    return res.status(200).json({ success: true, data: { id: credential._id, value: credential.value } })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/credentials
 */
lilypadCredentialsController.createCredential = async function (req, res) {
  try {
    const { label, key, value, category, notes } = req.body || {}
    if (!label || !key || !value) {
      return res.status(400).json({ success: false, error: 'Label, key, and value are required.' })
    }

    const credential = await LilyPadCredential.create({
      label: xss(String(label).trim()),
      key: xss(String(key).trim()),
      value: String(value),
      category: xss(String(category || 'Other').trim()),
      notes: xss(String(notes || '').trim())
    })

    return res.status(201).json({ success: true, data: toMaskedRow(credential) })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * PUT /api/v1/lilypad/credentials/:id
 */
lilypadCredentialsController.updateCredential = async function (req, res) {
  try {
    const { label, key, value, category, notes } = req.body || {}
    const credential = await LilyPadCredential.findById(req.params.id)
    if (!credential) {
      return res.status(404).json({ success: false, error: 'Credential not found' })
    }

    if (label !== undefined) credential.label = xss(String(label).trim())
    if (key !== undefined) credential.key = xss(String(key).trim())
    if (value !== undefined && value !== '') credential.value = String(value)
    if (category !== undefined) credential.category = xss(String(category).trim())
    if (notes !== undefined) credential.notes = xss(String(notes).trim())

    await credential.save()
    return res.status(200).json({ success: true, data: toMaskedRow(credential) })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * DELETE /api/v1/lilypad/credentials/:id
 */
lilypadCredentialsController.deleteCredential = async function (req, res) {
  try {
    const credential = await LilyPadCredential.findByIdAndDelete(req.params.id)
    if (!credential) {
      return res.status(404).json({ success: false, error: 'Credential not found' })
    }
    return res.status(200).json({ success: true, message: 'Credential removed' })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

module.exports = lilypadCredentialsController
