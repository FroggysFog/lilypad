/**
 * LilyPad ERP - Inventory Controller
 * Quick Inventory Search now searches real synced Cart.com catalog data
 * (LilyPadCartProduct) first, overlaying any LilyPadInventoryItem that
 * shares the same SKU for the fields Cart.com doesn't track (onTheWay/
 * estimatedArrivalDate/notes - see lilypadInventoryItem.js). Manual-only
 * items with no Cart.com match still show up standalone, so nothing
 * already tracked disappears. Same case-insensitive regex $or search
 * style as globalSearchService.js, not a Mongo text index.
 */

const LilyPadInventoryItem = require('../models/lilypadInventoryItem')
const LilyPadCartProduct = require('../models/lilypadCartProduct')
const { syncCartProducts } = require('../services/cartProductSyncService')

const controller = {}

function rx (term) {
  return { $regex: String(term).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' }
}

function exactRx (term) {
  return new RegExp(`^${String(term).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
}

/**
 * GET /api/v1/lilypad/inventory?q=...
 * Searches machine type, name, manufacturer, and SKU - the four fields
 * the Sales Command Center's quick inventory box searches by.
 */
controller.list = async function (req, res) {
  try {
    const q = String(req.query.q || '').trim()

    const cartQuery = q ? { $or: [{ itemNumber: rx(q) }, { itemName: rx(q) }] } : {}
    const cartProducts = await LilyPadCartProduct.find(cartQuery).sort({ itemName: 1 }).limit(50).lean()

    const matchedSkus = cartProducts.map((p) => p.itemNumber).filter(Boolean)
    const overlaysBySku = new Map()
    if (matchedSkus.length) {
      const overlays = await LilyPadInventoryItem.find({ sku: { $in: matchedSkus.map(exactRx) } }).lean()
      overlays.forEach((o) => overlaysBySku.set(o.sku.toLowerCase(), o))
    }

    const cartResults = cartProducts.map((p) => {
      const overlay = p.itemNumber ? overlaysBySku.get(p.itemNumber.toLowerCase()) : null
      return {
        source: overlay ? 'merged' : 'cart',
        _id: overlay ? overlay._id : undefined,
        name: p.itemName,
        sku: p.itemNumber,
        onHand: p.quantityOnHand,
        onTheWay: overlay ? overlay.onTheWay : p.quantityOnOrder,
        availableToSell: overlay ? overlay.availableToSell : p.quantityOnHand,
        estimatedArrivalDate: overlay ? overlay.estimatedArrivalDate : null,
        notes: overlay ? overlay.notes : '',
        price: p.price,
        isDiscontinued: p.isDiscontinued
      }
    })

    const matchedOverlayIds = new Set(Array.from(overlaysBySku.values()).map((o) => String(o._id)))
    const manualQuery = q
      ? { $or: [{ name: rx(q) }, { machineType: rx(q) }, { manufacturer: rx(q) }, { sku: rx(q) }] }
      : {}
    const manualOnly = (await LilyPadInventoryItem.find(manualQuery).sort({ name: 1 }).limit(50).lean())
      .filter((item) => !matchedOverlayIds.has(String(item._id)))
      .map((item) => ({ ...item, source: 'manual' }))

    return res.status(200).json({ success: true, data: [...cartResults, ...manualOnly] })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/inventory/sync
 * Manual trigger for the Cart.com Catalog sync, for testing without
 * waiting on the scheduler - same pattern as lilypadOrders.js's
 * triggerOrderSync.
 */
controller.syncCatalog = async function (req, res) {
  try {
    const result = await syncCartProducts()
    if (result.skipped) {
      return res.status(200).json({ success: true, message: result.reason, ...result })
    }
    return res.status(200).json({ success: true, message: `Synced ${result.synced} of ${result.total} products from Cart.com.`, ...result })
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
