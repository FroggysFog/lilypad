/**
 * LilyPad ERP - Unified Discovery Interface
 * Combines the Tier 1 static-directory adapter and the Tier 2
 * form-driven adapter behind one lookup, so the worker and controller
 * don't need to know which mechanism a given vertical actually uses.
 */

const directoryAdapter = require('./directoryAdapter')
const formSearchAdapter = require('./formSearchAdapter')

function listAvailableVerticals () {
  return [...directoryAdapter.listAvailableVerticals(), ...formSearchAdapter.listAvailableVerticals()]
}

async function discoverCandidateUrls (vertical) {
  if (directoryAdapter.getDirectorySource(vertical)) {
    return directoryAdapter.discoverCandidateUrls(vertical)
  }
  if (formSearchAdapter.getFormSource(vertical)) {
    return formSearchAdapter.discoverCandidateUrls(vertical)
  }
  throw new Error(`No discovery source configured for vertical "${vertical}". Available: ${listAvailableVerticals().join(', ')}`)
}

module.exports = {
  listAvailableVerticals,
  discoverCandidateUrls
}
