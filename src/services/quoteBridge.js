/**
 * LilyPad ERP - Sales OS Quote Bridge
 * Converts an active Sales OS lead into a trial/sample quote - saved to
 * LilyPadSalesQuote (its own collection, not the Salesforce-synced
 * LilyPadOrder - see lilypadSalesQuote.js's header comment for why).
 */

const LilyPadSalesLead = require('../models/lilypadSalesLead')
const LilyPadSalesQuote = require('../models/lilypadSalesQuote')

// Division-specific fallback so an unscored lead still gets a sensible
// starter SKU instead of a generic placeholder.
const FALLBACK_SKU = {
  training_smoke: 'Training Smoke XD (4-Gal Case)',
  froggys_fog: 'Bog Fog Extreme (4-Gal Case)'
}

async function createTrialQuote (leadId) {
  const lead = await LilyPadSalesLead.findById(leadId)
  if (!lead) throw new Error(`Lead not found with ID: ${leadId}`)

  const sku = (lead.aiScore && lead.aiScore.recommendedSku) || FALLBACK_SKU[lead.division] || 'TRIAL-SAMPLE-1GAL'

  const quote = await LilyPadSalesQuote.create({
    sourceLeadId: lead._id,
    division: lead.division,
    customerName: lead.companyName,
    contactName: (lead.contact && lead.contact.name) || '',
    contactEmail: (lead.contact && lead.contact.email) || '',
    contactPhone: lead.phone || '',
    shippingAddress: lead.address,
    items: [{
      sku,
      quantity: 1,
      unitPrice: 0,
      description: 'Sample Evaluation Jug - Free Trial'
    }],
    orderType: 'SAMPLE_EVALUATION',
    status: 'draft_quote',
    notes: 'Auto-generated from Sales Battle Plan via 1-Click Action'
  })

  // Atomic update, not a load-mutate-save of the whole lead document -
  // a full lead.save() would re-validate every field on the lead, not
  // just status/notes, the same lesson learned earlier this session
  // with the Priority Conversations blockers ($push/$set only touch
  // what this operation actually changes).
  await LilyPadSalesLead.updateOne(
    { _id: lead._id },
    {
      $set: { status: 'quoted' },
      $push: { notes: { body: `Converted to evaluation quote with SKU: ${sku}`, createdAt: new Date() } }
    }
  )

  return quote
}

module.exports = { createTrialQuote }
