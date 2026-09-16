#!/usr/bin/env node
/**
 * LilyPad ERP - USFA National Registry One-Time Ingest
 * Thin wrapper over the already-built usfaParser.importFromCsv() - no
 * logic duplicated, just a default file location so this can be run
 * with no arguments once the real national export is dropped at
 * data/usfa-national-registry.csv (gitignored - a 27,000+ row file has
 * no business being committed to source control).
 *
 * Run: node scripts/seedAllUSFA.js [optional custom path]
 */

const path = require('path')
const fs = require('fs')
const database = require('../src/database')
const usfaParser = require('../src/services/usfaParser')

const DEFAULT_PATH = path.join(__dirname, '..', 'data', 'usfa-national-registry.csv')
const filePath = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_PATH

if (!fs.existsSync(filePath)) {
  console.error(`No file found at ${filePath}`)
  console.error('Drop the USFA national registry CSV there, or pass a path: node scripts/seedAllUSFA.js /path/to/file.csv')
  process.exit(1)
}

async function run () {
  await new Promise((resolve, reject) => {
    database.init((err) => (err ? reject(err) : resolve()))
  })
  console.log('Connected to MongoDB. Importing ' + filePath + ' (this covers every state in the file - it is not filtered) ...')

  const summary = await usfaParser.importFromCsv(filePath)
  console.log(`National ingest finished - inserted: ${summary.inserted}, skipped (duplicate/invalid): ${summary.skipped}, errors: ${summary.errors}`)
  process.exit(0)
}

run().catch((err) => {
  console.error('National ingest failed:', err.message)
  process.exit(1)
})
