const Controllers = {
  main: require('./main'),
  lilypadTickets: require('./lilypadTickets'),
  lilypadTasks: require('./lilypadTasks'),
  lilypadUsers: require('./lilypadUsers'),
  lilypadRolePermissions: require('./lilypadRolePermissions'),
  lilypadMachines: require('./lilypadMachines'),
  lilypadNotifications: require('./lilypadNotifications'),
  lilypadPastDue: require('./lilypadPastDue'),
  lilypadCredentials: require('./lilypadCredentials'),
  lilypadCustomers: require('./lilypadCustomers'),
  lilypadOrders: require('./lilypadOrders'),
  lilypadSalesforceAccounts: require('./lilypadSalesforceAccounts'),
  lilypadOpportunities: require('./lilypadOpportunities'),
  lilypadProspector: require('./lilypadProspector'),
  lilypadCustomerIntelligence: require('./lilypadCustomerIntelligence'),
  microsoftTeams: require('./microsoftTeams'),
  microsoftCalendarAuth: require('./microsoftCalendarAuth'),
  lilypadCalendar: require('./lilypadCalendar'),
  microsoftEmail: require('./microsoftEmail'),
  salesforceAuth: require('./salesforceAuth'),
  salesforceExplorer: require('./salesforceExplorer'),
  cartAuth: require('./cartAuth')
}

module.exports = Controllers
