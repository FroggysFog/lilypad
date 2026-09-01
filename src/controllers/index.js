const Controllers = {
  main: require('./main'),
  lilypadTickets: require('./lilypadTickets'),
  lilypadUsers: require('./lilypadUsers'),
  lilypadMachines: require('./lilypadMachines'),
  lilypadNotifications: require('./lilypadNotifications'),
  lilypadPastDue: require('./lilypadPastDue'),
  lilypadCredentials: require('./lilypadCredentials'),
  lilypadCustomers: require('./lilypadCustomers'),
  lilypadOrders: require('./lilypadOrders'),
  lilypadSalesforceAccounts: require('./lilypadSalesforceAccounts'),
  lilypadOpportunities: require('./lilypadOpportunities'),
  microsoftTeams: require('./microsoftTeams'),
  salesforceAuth: require('./salesforceAuth'),
  salesforceExplorer: require('./salesforceExplorer')
}

module.exports = Controllers
