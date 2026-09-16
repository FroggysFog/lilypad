#!/usr/bin/env node
/**
 * LilyPad ERP - USFA Registry Import Runner
 * usfaParser.js was built as a service function with nothing to call
 * it - this is that missing runner. Reuses this app's own DB connection
 * module, same as scripts/seedSalesLeads.js.
 *
 * Run: node scripts/importUsfaCsv.js /path/to/usfa-export.csv
 */

const path = require('path')
const database = require('../src/database')
const usfaParser = require('../src/services/usfaParser')

const filePath = process.argv[2]
if (!filePath) {
  console.error('Usage: node scripts/importUsfaCsv.js /path/to/usfa-export.csv')
  process.exit(1)
}

async function run () {
  await new Promise((resolve, reject) => {
    database.init((err) => (err ? reject(err) : resolve()))
  })
  console.log('Connected to MongoDB. Importing ' + path.resolve(filePath) + ' ...')

  const summary = await usfaParser.importFromCsv(path.resolve(filePath))
  console.log(`Import finished - inserted: ${summary.inserted}, skipped (duplicate/invalid): ${summary.skipped}, errors: ${summary.errors}`)
  process.exit(0)
}

run().catch((err) => {
  console.error('Import failed:', err.message)
  process.exit(1)
})
