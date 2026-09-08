/**
 * LilyPad ERP - Crawl Result Normalizer
 * Converts pageExtractionService's {organization, people} output into the
 * same common intermediate shape apolloNormalizer.js produces, so
 * leadProspectorService's buildStagedLeadDoc never needs to know whether
 * a record came from Apollo or the in-house crawler.
 */

function normalizeDomain (value) {
  if (!value) return ''
  return String(value).trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
}

/**
 * `person` is one entry from pageExtractionService's `people` array;
 * `organization` is the extraction's shared org-level result;
 * `context` carries what the crawler/adapter already knew (the site URL,
 * the batch's target vertical) that the extraction step doesn't repeat.
 */
function normalizeCrawledRecord (person, organization, context) {
  const org = organization || {}
  const ctx = context || {}
  const domain = normalizeDomain(ctx.sourceUrl)

  return {
    // No stable external id from a crawl the way Apollo has a person id -
    // derived from the source URL + name so the same person found again
    // on a re-run of the same business still dedupes against themselves.
    externalId: `crawl:${domain}:${(person.firstName || '').toLowerCase()}:${(person.lastName || '').toLowerCase()}`,
    firstName: person.firstName || '',
    lastName: person.lastName || '',
    jobTitle: person.jobTitle || '',
    department: person.department || '',
    email: String(person.email || '').trim().toLowerCase(),
    emailStatusHint: person.email ? 'unverified' : '',
    phoneNumber: person.phone || org.generalPhone || '',
    phoneType: person.phone ? 'direct' : (org.generalPhone ? 'hq' : ''),
    companyName: org.name || '',
    companyWebsite: ctx.sourceUrl || '',
    companyIndustry: ctx.vertical || '',
    companyDescription: org.description || '',
    companyKeywords: [],
    personBio: '',
    linkedinUrl: '',
    city: org.city || '',
    state: org.state || '',
    country: org.country || '',
    postalCode: '',
    sourceProvider: 'in_house_crawler',
    sourceUrl: ctx.sourceUrl || '',
    vertical: ctx.vertical || '',
    rawPayload: { person, organization: org, sourceUrl: ctx.sourceUrl }
  }
}

module.exports = { normalizeCrawledRecord }
