#!/usr/bin/env node
/**
 * LilyPad ERP - Department Contact Research Pilot Runner
 * Seeds a handful of real Tennessee fire departments (if not already
 * present) and runs deptContactResearchService against them, printing
 * each real result so the accuracy/hit-rate can be judged before
 * deciding whether to scale up to a full state.
 *
 * Run: node scripts/researchDeptContacts.js
 */

const database = require('../src/database')
const LilyPadSalesLead = require('../src/models/lilypadSalesLead')
const deptContactResearchService = require('../src/services/deptContactResearchService')

const PILOT_DEPARTMENTS = [
  { companyName: 'Nashville Fire Department', city: 'Nashville', state: 'TN' },
  { companyName: 'Memphis Fire Department', city: 'Memphis', state: 'TN' },
  { companyName: 'Knoxville Fire Department', city: 'Knoxville', state: 'TN' },
  { companyName: 'Chattanooga Fire Department', city: 'Chattanooga', state: 'TN' },
  { companyName: 'Murfreesboro Fire Rescue Department', city: 'Murfreesboro', state: 'TN' }
]

async function ensureSeeded () {
  for (const dept of PILOT_DEPARTMENTS) {
    const exists = await LilyPadSalesLead.findOne({ companyName: dept.companyName, 'address.state': dept.state })
    if (exists) continue
    await LilyPadSalesLead.create({
      division: 'training_smoke',
      companyName: dept.companyName,
      address: { city: dept.city, state: dept.state },
      source: 'manual_import',
      status: 'unprocessed'
    })
    console.log(`Seeded: ${dept.companyName}`)
  }
}

async function run () {
  await new Promise((resolve, reject) => {
    database.init((err) => (err ? reject(err) : resolve()))
  })
  console.log('Connected to MongoDB.')

  await ensureSeeded()

  console.log(`Researching contacts for up to ${PILOT_DEPARTMENTS.length} Tennessee departments...`)
  const summary = await deptContactResearchService.researchContactBatch('training_smoke', PILOT_DEPARTMENTS.length)

  if (summary.skipped) {
    console.error('Skipped:', summary.skipped)
    process.exit(1)
  }

  console.log(`\nResearched ${summary.researched}, found a contact for ${summary.found}.\n`)
  summary.results.forEach((r) => {
    if (r.found) {
      console.log(`✔ ${r.companyName} -> ${r.contactName} (${r.roleMatched}, confidence: ${r.confidence})`)
    } else {
      console.log(`✘ ${r.companyName} -> no contact found${r.skipped ? ' (' + r.skipped + ')' : ''}${r.error ? ' - ERROR: ' + r.error : ''}`)
    }
  })

  process.exit(0)
}

run().catch((err) => {
  console.error('Pilot run failed:', err.message)
  process.exit(1)
})
