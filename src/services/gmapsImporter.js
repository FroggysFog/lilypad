/**
 * LilyPad ERP - Google Maps Lead Importer
 * Ingests Google Maps business data into LilyPadSalesLead for the
 * Froggy's Fog division - haunts/FECs/theaters are found by rating/
 * review volume, not a registry like USFA's. Two entry points sharing
 * one field-mapping/dedup core: a streamed CSV upload, and live results
 * from the Apify "Google Maps Scraper" actor (mapsHarvestBridge.js) -
 * confirmed live that actor's real dataset field names (title, phone,
 * city, state, postalCode, reviewsCount, totalScore, website, placeId,
 * categoryName) already match what rowToLeadFields expects below, so
 * both paths reuse it as-is.
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

/**
 * Strips protocol/`www.`/path/query down to a bare, lowercase domain -
 * "https://www.example.com/visit?ref=maps" -> "example.com" - so two
 * records pointing at the same real business dedupe correctly even if
 * one URL has a trailing path and the other doesn't.
 */
function cleanDomain (url) {
  if (!url) return ''
  return String(url)
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0]
    .split('?')[0]
}

function rowToLeadFields (row) {
  const companyName = firstOf(row, ['title', 'name', 'Name', 'Business Name']).trim()
  const phone = firstOf(row, ['phone', 'phoneUnformatted', 'Phone']).trim()
  const state = firstOf(row, ['state', 'State']).trim()
  const reviewCount = Number(firstOf(row, ['reviewsCount', 'review_count', 'Reviews']))
  const rating = Number(firstOf(row, ['totalScore', 'rating', 'Rating']))
  const category = firstOf(row, ['categoryName', 'category', 'Category'])

  return {
    companyName,
    phone,
    domain: cleanDomain(firstOf(row, ['website', 'Website', 'url'])),
    address: {
      street: firstOf(row, ['street', 'address', 'Address']).trim(),
      city: firstOf(row, ['city', 'City']).trim(),
      state,
      zip: firstOf(row, ['postalCode', 'zip', 'Zip']).trim()
    },
    metadata: {
      reviewCount: Number.isFinite(reviewCount) && reviewCount >= 0 ? reviewCount : 0,
      googleRating: Number.isFinite(rating) ? rating : 0,
      googlePlaceId: firstOf(row, ['placeId', 'place_id']),
      categories: category ? [category] : []
    }
  }
}

/**
 * A duplicate is an exact phone match, the same clean domain, or the
 * same company name in the same state, scoped to this division only.
 * Domain wasn't checked at all before this field existed.
 */
async function findDuplicateLead (division, fields) {
  const or = []
  if (fields.phone) or.push({ phone: fields.phone })
  if (fields.domain) or.push({ domain: fields.domain })
  if (fields.companyName && fields.address.state) {
    or.push({ companyName: fields.companyName, 'address.state': fields.address.state })
  }
  if (!or.length) return null
  return LilyPadSalesLead.findOne({ division, $or: or })
}

/**
 * Shared core: dedupes and creates leads from any async-iterable of raw
 * rows, tagging each with `source` and the sector/title-hierarchy the
 * whole batch was harvested under (constant per call, not per-row).
 * A duplicate gets its metadata refreshed (updated review count/rating/
 * categories) rather than silently skipped with no effect - but status/
 * contact/aiScore are never touched, so an already-worked lead never
 * gets reset by a re-run of the same search.
 */
async function importRows (rows, division, source, { sector = '', titleHierarchy = [] } = {}) {
  const summary = { inserted: 0, updated: 0, skipped: 0, errors: 0, insertedLeads: [] }

  for await (const row of rows) {
    try {
      const fields = rowToLeadFields(row)
      if (!fields.companyName) {
        summary.skipped++
        continue
      }

      const duplicate = await findDuplicateLead(division, fields)
      if (duplicate) {
        await LilyPadSalesLead.updateOne({ _id: duplicate._id }, {
          $set: {
            'metadata.reviewCount': fields.metadata.reviewCount,
            'metadata.googleRating': fields.metadata.googleRating,
            'metadata.googlePlaceId': fields.metadata.googlePlaceId,
            'metadata.categories': fields.metadata.categories,
            phone: fields.phone || duplicate.phone,
            domain: fields.domain || duplicate.domain
          }
        })
        summary.updated++
        continue
      }

      const lead = await LilyPadSalesLead.create({
        ...fields,
        metadata: { ...fields.metadata, sector, titleHierarchy },
        division,
        source,
        status: 'unprocessed'
      })
      summary.inserted++
      summary.insertedLeads.push(lead)
    } catch (err) {
      summary.errors++
      winston.error(`Google Maps import failed for a row: ${err.message}`)
    }
  }

  return summary
}

/**
 * Streams `filePath` (a Google Maps CSV export) into lilypad_sales_leads
 * for `division` (defaults to Froggy's Fog, the only division Google
 * Maps sourcing currently applies to). Returns a summary rather than
 * throwing on one bad row.
 */
async function importFromCsv (filePath, division = 'froggys_fog') {
  const parser = fs.createReadStream(filePath).pipe(parse({ columns: true, skip_empty_lines: true, trim: true }))
  return importRows(parser, division, 'gmaps_csv')
}

/**
 * Same dedup/create logic, over an in-memory array of Apify dataset
 * items instead of a streamed file - used by mapsHarvestBridge.js for
 * live results. `sector`/`titleHierarchy` come from the curated
 * targeting matrix entry the harvest was run under, if any.
 */
async function importFromApifyResults (items, division = 'froggys_fog', options = {}) {
  return importRows(items || [], division, 'apify_gmaps', options)
}

module.exports = { importFromCsv, importFromApifyResults, rowToLeadFields, cleanDomain }
