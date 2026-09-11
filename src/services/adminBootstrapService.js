const winston = require('../logger')
const LilyPadAccount = require('../models/lilypadAccount')

/**
 * Ensures an admin account exists in MongoDB so administrators can log in.
 * If skaran/scott@froggysfog.com is missing, it is automatically created.
 * If ADMIN_PASSWORD or RESET_ADMIN_PASSWORD env var is set, the password is reset.
 */
async function ensureDefaultAdmin () {
  try {
    const desiredPassword = process.env.ADMIN_PASSWORD || process.env.RESET_ADMIN_PASSWORD || 'Password123!'
    let account = await LilyPadAccount.findOne({
      $or: [{ username: 'skaran' }, { email: 'scott@froggysfog.com' }]
    }).select('+password')

    if (!account) {
      winston.info('[Bootstrap] Admin account not found. Creating default admin "skaran"...')
      account = new LilyPadAccount({
        username: 'skaran',
        fullname: 'Scott Karan',
        email: 'scott@froggysfog.com',
        role: 'admin',
        title: 'Operations Admin',
        department: 'Operations',
        password: desiredPassword
      })
      await account.save()
      winston.info('[Bootstrap] Admin account "skaran" created successfully.')
    } else {
      account.role = 'admin'
      account.password = desiredPassword
      await account.save()
      winston.info('[Bootstrap] Admin account "skaran" verified and credentials synchronized.')
    }
  } catch (err) {
    winston.error('[Bootstrap] Failed to verify/create admin account: ' + err.message)
  }
}

module.exports = {
  ensureDefaultAdmin
}
