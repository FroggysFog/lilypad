#!/usr/bin/env node
/**
 * LilyPad ERP - Sales OS Dev Seed Script
 * Populates a handful of realistic leads across both divisions so
 * sales-battle-plan.html can be exercised immediately, without waiting
 * on a full USFA CSV import. Reuses this app's own DB connection module
 * (src/database) rather than a raw mongoose.connect/MONGODB_URI/dotenv -
 * this app has none of those; connection config comes from TD_MONGODB_*
 * env vars via nconf (see src/database/index.js).
 *
 * Run: node scripts/seedSalesLeads.js
 */

const database = require('../src/database')
const LilyPadSalesLead = require('../src/models/lilypadSalesLead')

const sampleLeads = [
  // Training Smoke targets
  {
    division: 'training_smoke',
    companyName: 'Metro Fire & Rescue Training Academy',
    phone: '555-019-2831',
    address: { street: '104 Engine Way', city: 'Columbus', state: 'OH', zip: '43215' },
    source: 'manual_import',
    metadata: { stationCount: 14 },
    contact: { name: 'Capt. Dave Miller', title: 'Chief of Training', email: 'dmiller@metrofire.gov' },
    status: 'unprocessed'
  },
  {
    division: 'training_smoke',
    companyName: 'Tri-County Volunteer Fire Dept',
    phone: '555-014-9922',
    address: { street: '42 Rural Route 9', city: 'Cookeville', state: 'TN', zip: '38501' },
    source: 'usfa_registry',
    metadata: { stationCount: 3 },
    contact: { name: 'Chief Thomas Vance', title: 'Fire Chief', email: 'chief@tricountyvfd.org' },
    status: 'unprocessed'
  },
  // Froggy's Fog targets
  {
    division: 'froggys_fog',
    companyName: 'Netherworld Haunted Attraction',
    phone: '555-018-4491',
    address: { street: '2076 West Park Place Blvd', city: 'Stone Mountain', state: 'GA', zip: '30087' },
    source: 'manual_import',
    metadata: { reviewCount: 1420, googleRating: 4.8 },
    contact: { name: 'Sarah Jenkins', title: 'Technical Director', email: 'sarah@netherworldhaunt.com' },
    status: 'unprocessed'
  },
  {
    division: 'froggys_fog',
    companyName: 'Lakeside Family Fun Center & Laser Tag',
    phone: '555-012-7711',
    address: { street: '880 Boardwalk Ave', city: 'Orlando', state: 'FL', zip: '32801' },
    source: 'gmaps_csv',
    metadata: { reviewCount: 310, googleRating: 4.5 },
    contact: { name: 'Marcus Brody', title: 'General Manager', email: 'mbrody@lakesidefun.com' },
    status: 'unprocessed'
  }
]

async function connect () {
  return new Promise((resolve, reject) => {
    database.init((err) => (err ? reject(err) : resolve()))
  })
}

async function seed () {
  await connect()
  console.log('Connected to MongoDB for seeding.')

  for (const data of sampleLeads) {
    const exists = await LilyPadSalesLead.findOne({ companyName: data.companyName })
    if (exists) {
      console.log(`Lead already exists: ${data.companyName}`)
      continue
    }
    await LilyPadSalesLead.create(data)
    console.log(`Created lead: ${data.companyName} (${data.division})`)
  }

  console.log('Seeding finished successfully.')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seeding error:', err.message)
  process.exit(1)
})
