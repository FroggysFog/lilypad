/**
 * LilyPad ERP - USFA Fire Department Registry Importer
 * Streams a USFA National Fire Department CSV (27,000+ rows) into
 * LilyPadSalesLead docs for the Training Smoke division, using the
 * `csv-parse` streaming API (already installed as a dependency of the
 * `csv` package - no new dependency needed) so memory never holds more
 * than one row at a time.
 */

const fs = require('fs')
const { parse } = require('csv-parse')
const winston = require('../logger')
const LilyPadSalesLead = require('../models/lilypadSalesLead')

const COLUMN_MAP = {
  companyName: 'Fire Dept Name',
  phone: 'HQ Phone',
  city: 'HQ City',
  state: 'HQ State',
  zip: 'HQ Zip',
  stationCount: 'Number of Stations'
}

function rowToLeadFields (row) {
  const companyName = (row[COLUMN_MAP.companyName] || '').trim()
  const phone = (row[COLUMN_MAP.phone] || '').trim()
  const state = (row[COLUMN_MAP.state] || '').trim()
  const stationCount = Number(row[COLUMN_MAP.stationCount])

  return {
    companyName,
    phone,
    address: {
      city: (row[COLUMN_MAP.city] || '').trim(),
      state,
      zip: (row[COLUMN_MAP.zip] || '').trim()
    },
    metadata: {
      stationCount: Number.isFinite(stationCount) && stationCount > 0 ? stationCount : 1
    }
  }
}

/**
 * Deterministic, zero-token dedup - a lead is a duplicate if the exact
 * phone number already exists, or the same company name is already on
 * file in the same state (two different fire departments sharing a name
 * across states are not the same lead; the same name in the same state
 * almost always is).
 */
async function findDuplicateLead (fields) {
  const or = []
  if (fields.phone) or.push({ phone: fields.phone })
  if (fields.companyName && fields.address.state) {
    or.push({ companyName: fields.companyName, 'address.state': fields.address.state })
  }
  if (!or.length) return null
  return LilyPadSalesLead.findOne({ division: 'training_smoke', $or: or })
}

/**
 * Streams `filePath` (a USFA registry CSV) into lilypad_sales_leads.
 * Rows missing a company name are skipped outright (not a real lead).
 * Returns a summary rather than throwing on a single bad row - a 27k-row
 * import shouldn't abort over one malformed line.
 */
async function importFromCsv (filePath) {
  const summary = { inserted: 0, skipped: 0, errors: 0 }

  const parser = fs.createReadStream(filePath).pipe(parse({ columns: true, skip_empty_lines: true, trim: true }))

  for await (const row of parser) {
    try {
      const fields = rowToLeadFields(row)
      if (!fields.companyName) {
        summary.skipped++
        continue
      }

      const duplicate = await findDuplicateLead(fields)
      if (duplicate) {
        summary.skipped++
        continue
      }

      await LilyPadSalesLead.create({
        ...fields,
        division: 'training_smoke',
        source: 'usfa_registry',
        status: 'unprocessed'
      })
      summary.inserted++
    } catch (err) {
      summary.errors++
      winston.error(`USFA import failed for a row: ${err.message}`)
    }
  }

  return summary
}

module.exports = { importFromCsv }
