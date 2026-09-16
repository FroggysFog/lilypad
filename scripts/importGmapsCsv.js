#!/usr/bin/env node
/**
 * LilyPad ERP - Google Maps Import Runner
 * Run: node scripts/importGmapsCsv.js /path/to/gmaps-export.csv [division]
 * division defaults to froggys_fog if omitted.
 */

const path = require('path')
const database = require('../src/database')
const gmapsImporter = require('../src/services/gmapsImporter')

const filePath = process.argv[2]
const division = process.argv[3] || 'froggys_fog'

if (!filePath) {
  console.error('Usage: node scripts/importGmapsCsv.js /path/to/gmaps-export.csv [froggys_fog|training_smoke]')
  process.exit(1)
}

if (!['froggys_fog', 'training_smoke'].includes(division)) {
  console.error('division must be froggys_fog or training_smoke')
  process.exit(1)
}

async function run () {
  await new Promise((resolve, reject) => {
    database.init((err) => (err ? reject(err) : resolve()))
  })
  console.log('Connected to MongoDB. Importing ' + path.resolve(filePath) + ' as ' + division + ' ...')

  const summary = await gmapsImporter.importFromCsv(path.resolve(filePath), division)
  console.log(`Import finished - inserted: ${summary.inserted}, skipped (duplicate/invalid): ${summary.skipped}, errors: ${summary.errors}`)
  process.exit(0)
}

run().catch((err) => {
  console.error('Import failed:', err.message)
  process.exit(1)
})
