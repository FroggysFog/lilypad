/**
 * LilyPad ERP - Apollo Response Normalizer
 * Converts Apollo's raw mixed_people/search + bulk_match response shapes
 * into the same common intermediate shape crawlNormalizer.js produces
 * from the in-house crawl pipeline, so leadProspectorService's
 * buildStagedLeadDoc never needs to know which provider a record came
 * from.
 */

function mapApolloEmailStatus (rawStatus) {
  const status = String(rawStatus || '').toLowerCase()
  if (status === 'verified') return 'verified'
  if (status === 'guessed' || status === 'extrapolated') return 'extrapolated'
  if (status === 'catch-all' || status === 'catch_all') return 'catch_all'
  if (status === 'unavailable' || status === 'invalid') return 'invalid'
  return 'unverified'
}

/**
 * `person` is one entry from Apollo's search results; `enrichedMatch` is
 * its corresponding bulk_match entry (or null if enrichment failed/was
 * skipped for this record).
 */
function normalizeApolloRecord (person, enrichedMatch) {
  const org = person.organization || {}
  const enriched = enrichedMatch || {}

  const email = String(enriched.email || person.email || '').trim().toLowerCase()
  const phoneEntry = (enriched.phone_numbers && enriched.phone_numbers[0]) || null
  const phoneNumber = (phoneEntry && phoneEntry.sanitized_number) || person.sanitized_phone || ''

  return {
    externalId: String(person.id || ''),
    firstName: person.first_name || '',
    lastName: person.last_name || '',
    jobTitle: person.title || '',
    department: '',
    email,
    emailStatusHint: mapApolloEmailStatus(enriched.email_status || person.email_status),
    phoneNumber,
    phoneType: !phoneNumber ? '' : (person.sanitized_phone ? 'direct' : 'hq'),
    companyName: org.name || '',
    companyWebsite: org.website_url || org.primary_domain || '',
    companyIndustry: org.industry || '',
    companyDescription: org.short_description || '',
    companyKeywords: Array.isArray(org.keywords) ? org.keywords : [],
    personBio: person.headline || person.bio || '',
    linkedinUrl: person.linkedin_url || '',
    city: person.city || org.city || '',
    state: person.state || org.state || '',
    country: person.country || org.country || '',
    postalCode: org.postal_code || '',
    sourceProvider: 'apollo',
    sourceUrl: '',
    vertical: '',
    rawPayload: { person, enriched }
  }
}

module.exports = { normalizeApolloRecord }
