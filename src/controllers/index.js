const Controllers = {
  main: require('./main'),
  lilypadTickets: require('./lilypadTickets'),
  lilypadUsers: require('./lilypadUsers'),
  lilypadMachines: require('./lilypadMachines'),
  lilypadNotifications: require('./lilypadNotifications'),
  lilypadPastDue: require('./lilypadPastDue'),
  microsoftTeams: require('./microsoftTeams'),
  salesforceAuth: require('./salesforceAuth')
}

module.exports = Controllers
