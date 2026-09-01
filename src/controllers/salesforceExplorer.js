/**
 * LilyPad ERP - Salesforce Schema Explorer
 * Lets an admin browse the connected org's actual objects/fields and
 * preview sample rows, so building a sync query is a lookup instead of a
 * guess (the Invoice__c default in pastDueSyncService.js was a guess that
 * turned out wrong for this org).
 */

const salesforceService = require('../services/salesforceService')

const controller = {}

/**
 * GET /api/v1/lilypad/salesforce/objects
 */
controller.listObjects = async function (req, res) {
  try {
    const objects = await salesforceService.describeGlobalSalesforce()
    return res.status(200).json({ success: true, data: objects })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * GET /api/v1/lilypad/salesforce/objects/:name
 */
controller.describeObject = async function (req, res) {
  try {
    const described = await salesforceService.describeSalesforceObject(req.params.name)
    return res.status(200).json({ success: true, data: described })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * GET /api/v1/lilypad/salesforce/objects/:name/preview
 */
controller.previewObject = async function (req, res) {
  try {
    const preview = await salesforceService.previewSalesforceObject(req.params.name, { limit: req.query.limit })
    return res.status(200).json({ success: true, data: preview })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

module.exports = controller
