/**
 * LilyPad ERP - Google Maps Lead Importer
 * Ingests a Google Maps business export (e.g. an Apify "Google Maps
 * Scraper" run) into LilyPadSalesLead for the Froggy's Fog division -
 * haunts/FECs/theaters are found by rating/review volume, not a
 * registry like USFA's. Same streaming + dedup shape as usfaParser.js.
 */

const fs = require('fs')
const { parse } = require('csv-parse')
const winston = require('../logger')
const LilyPadSalesLead = require('../models/lilypadSalesLead')

// Column names vary by export tool - Apify's Google Maps Scraper uses
// `title`/`reviewsCount`/`totalScore`/`postalCode`; a manual export or a
// different tool might use plainer names. Checked in this order.
function firstOf (row, keys) {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== '') return row[key]
  }
  return ''
}

function rowToLeadFields (row) {
  const companyName = firstOf(row, ['title', 'name', 'Name', 'Business Name']).trim()
  const phone = firstOf(row, ['phone', 'phoneUnformatted', 'Phone']).trim()
  const state = firstOf(row, ['state', 'State']).trim()
  const reviewCount = Number(firstOf(row, ['reviewsCount', 'review_count', 'Reviews']))
  const rating = Number(firstOf(row, ['totalScore', 'rating', 'Rating']))

  return {
    companyName,
    phone,
    address: {
      street: firstOf(row, ['street', 'address', 'Address']).trim(),
      city: firstOf(row, ['city', 'City']).trim(),
      state,
      zip: firstOf(row, ['postalCode', 'zip', 'Zip']).trim()
    },
    metadata: {
      reviewCount: Number.isFinite(reviewCount) && reviewCount >= 0 ? reviewCount : 0,
      googleRating: Number.isFinite(rating) ? rating : 0
    }
  }
}

/**
 * Same deterministic, zero-token dedup rule as usfaParser.js - a
 * duplicate is an exact phone match or the same company name in the
 * same state, scoped to this division only.
 */
async function findDuplicateLead (division, fields) {
  const or = []
  if (fields.phone) or.push({ phone: fields.phone })
  if (fields.companyName && fields.address.state) {
    or.push({ companyName: fields.companyName, 'address.state': fields.address.state })
  }
  if (!or.length) return null
  return LilyPadSalesLead.findOne({ division, $or: or })
}

/**
 * Streams `filePath` (a Google Maps CSV export) into lilypad_sales_leads
 * for `division` (defaults to Froggy's Fog, the only division Google
 * Maps sourcing currently applies to). Returns a summary rather than
 * throwing on one bad row.
 */
async function importFromCsv (filePath, division = 'froggys_fog') {
  const summary = { inserted: 0, skipped: 0, errors: 0 }

  const parser = fs.createReadStream(filePath).pipe(parse({ columns: true, skip_empty_lines: true, trim: true }))

  for await (const row of parser) {
    try {
      const fields = rowToLeadFields(row)
      if (!fields.companyName) {
        summary.skipped++
        continue
      }

      const duplicate = await findDuplicateLead(division, fields)
      if (duplicate) {
        summary.skipped++
        continue
      }

      await LilyPadSalesLead.create({
        ...fields,
        division,
        source: 'gmaps_csv',
        status: 'unprocessed'
      })
      summary.inserted++
    } catch (err) {
      summary.errors++
      winston.error(`Google Maps import failed for a row: ${err.message}`)
    }
  }

  return summary
}

module.exports = { importFromCsv }
