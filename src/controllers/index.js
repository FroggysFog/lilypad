const Controllers = {
  install: require('./install'),
  main: require('./main'),
  tickets: require('./tickets'),
  lilypadTickets: require('./lilypadTickets'),
  lilypadUsers: require('./lilypadUsers'),
  messages: require('./messages'),
  servers: require('./servers'),
  accounts: require('./accounts'),
  groups: require('./groups'),
  teams: require('./teams'),
  departments: require('./departments'),
  reports: require('./reports'),
  notices: require('./notices'),
  plugins: require('./plugins'),
  settings: require('./settings'),
  editor: require('./editor'),
  backuprestore: require('./backuprestore'),
  api: require('./api'),
  debug: require('./debug')
}

module.exports = Controllers
