/**
 * LilyPad ERP - Inventory Controller
 * Manually-maintained stock levels - see lilypadInventoryItem.js for why
 * this isn't wired to a live feed. Same case-insensitive regex $or
 * search style as globalSearchService.js, not a Mongo text index.
 */

const LilyPadInventoryItem = require('../models/lilypadInventoryItem')

const controller = {}

function rx (term) {
  return { $regex: String(term).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' }
}

/**
 * GET /api/v1/lilypad/inventory?q=...
 * Searches machine type, name, manufacturer, and SKU - the four fields
 * the Sales Command Center's quick inventory box searches by.
 */
controller.list = async function (req, res) {
  try {
    const q = String(req.query.q || '').trim()
    const query = q
      ? { $or: [{ name: rx(q) }, { machineType: rx(q) }, { manufacturer: rx(q) }, { sku: rx(q) }] }
      : {}

    const items = await LilyPadInventoryItem.find(query).sort({ name: 1 }).limit(50).lean()
    return res.status(200).json({ success: true, data: items })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

controller.create = async function (req, res) {
  try {
    const name = String(req.body.name || '').trim()
    if (!name) {
      return res.status(400).json({ success: false, error: 'Name is required.' })
    }

    const item = await LilyPadInventoryItem.create({
      name,
      machineType: String(req.body.machineType || '').trim(),
      manufacturer: String(req.body.manufacturer || '').trim(),
      sku: String(req.body.sku || '').trim(),
      onHand: Math.max(0, Number(req.body.onHand) || 0),
      onTheWay: Math.max(0, Number(req.body.onTheWay) || 0),
      availableToSell: Math.max(0, Number(req.body.availableToSell) || 0),
      estimatedArrivalDate: req.body.estimatedArrivalDate ? new Date(req.body.estimatedArrivalDate) : null,
      notes: String(req.body.notes || '').trim(),
      updatedByName: req.user.fullname
    })

    return res.status(200).json({ success: true, data: item })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

controller.update = async function (req, res) {
  try {
    const fields = {}
    ;['name', 'machineType', 'manufacturer', 'sku', 'notes'].forEach((key) => {
      if (req.body[key] !== undefined) fields[key] = String(req.body[key]).trim()
    })
    ;['onHand', 'onTheWay', 'availableToSell'].forEach((key) => {
      if (req.body[key] !== undefined) fields[key] = Math.max(0, Number(req.body[key]) || 0)
    })
    if (req.body.estimatedArrivalDate !== undefined) {
      fields.estimatedArrivalDate = req.body.estimatedArrivalDate ? new Date(req.body.estimatedArrivalDate) : null
    }
    fields.updatedByName = req.user.fullname

    const item = await LilyPadInventoryItem.findByIdAndUpdate(req.params.id, { $set: fields }, { new: true })
    if (!item) {
      return res.status(404).json({ success: false, error: 'Inventory item not found.' })
    }
    return res.status(200).json({ success: true, data: item })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

controller.remove = async function (req, res) {
  try {
    await LilyPadInventoryItem.deleteOne({ _id: req.params.id })
    return res.status(200).json({ success: true })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

module.exports = controller
