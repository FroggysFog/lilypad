/**
 * LilyPad ERP - Curated Sector Targeting Matrix
 * A hand-curated library of search terms/categories/title-hierarchies
 * per sub-vertical, used by mapsHarvestBridge.js instead of just
 * searching on whatever raw phrase the Goal Mode planner happened to
 * extract from a prompt - the same run-on-phrase issue that made the
 * earlier Apollo attempt fail is exactly what this avoids for the
 * Maps-based path.
 */

const TARGETING_MATRIX = {
  froggys_fog: {
    haunts: {
      searchTerms: ['haunted house', 'haunted attraction', 'haunted trail', 'screampark'],
      categoryFilters: ['Haunted house', 'Amusement center', 'Tourist attraction'],
      titleHierarchy: ['Technical Director', 'Special Effects Coordinator', 'Owner', 'General Manager']
    },
    theatres: {
      searchTerms: ['performing arts center', 'civic theatre', 'community playhouse', 'amphitheater'],
      categoryFilters: ['Performing arts theater', 'Amphitheater', 'Auditorium'],
      titleHierarchy: ['Technical Director', 'Head of Lighting', 'Master Electrician', 'Production Stage Manager']
    },
    fec_amusements: {
      searchTerms: ['laser tag arena', 'indoor trampoline park', 'family entertainment center', 'escape room'],
      categoryFilters: ['Amusement center', 'Laser tag center', 'Escape room center'],
      titleHierarchy: ['General Manager', 'Operations Director', 'Attractions Maintenance Manager']
    },
    worship: {
      searchTerms: ['church', 'worship center', 'ministries'],
      categoryFilters: ['Church', 'Place of worship'],
      // Filters out small chapels; targets production-scale sanctuaries.
      minReviews: 100,
      titleHierarchy: ['Production Director', 'Creative Arts Director', 'Lead Audio Visual Technician']
    }
  },
  training_smoke: {
    fire_academies: {
      searchTerms: ['fire academy', 'fire training center', 'fire rescue training facility'],
      categoryFilters: ['Fire station', 'Training center', 'Government office'],
      titleHierarchy: ['Training Chief', 'Battalion Chief of Training', 'Director of Training', 'Fire Chief']
    },
    industrial_safety: {
      searchTerms: ['safety training institute', 'hazmat training center', 'industrial emergency response'],
      categoryFilters: ['Corporate office', 'Training centre', 'Safety equipment supplier'],
      titleHierarchy: ['EHS Director', 'Emergency Response Coordinator', 'Safety Compliance Manager']
    }
  }
}

function getSectorConfig (division, sector) {
  return (TARGETING_MATRIX[division] && TARGETING_MATRIX[division][sector]) || null
}

function getSectorKeys (division) {
  return Object.keys(TARGETING_MATRIX[division] || {})
}

module.exports = { TARGETING_MATRIX, getSectorConfig, getSectorKeys }
