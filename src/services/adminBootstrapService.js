const winston = require('../logger')
const LilyPadAccount = require('../models/lilypadAccount')

/**
 * Ensures an admin account exists in MongoDB so administrators can log in.
 * If skaran/scott@froggysfog.com is missing, it is automatically created.
 *
 * Once the account exists, its password is left alone on every ordinary
 * restart - it's only reset when ADMIN_PASSWORD, RESET_ADMIN_PASSWORD, or
 * FORCE_RESET_ADMIN=true is explicitly set, which is also the escape
 * hatch for a forgotten password. Earlier this unconditionally reset the
 * password to a hardcoded default on every single startup whenever none
 * of those env vars were set, silently overwriting whatever password was
 * actually in use.
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
    } else if (process.env.ADMIN_PASSWORD || process.env.RESET_ADMIN_PASSWORD || process.env.FORCE_RESET_ADMIN === 'true') {
      account.role = 'admin'
      account.password = desiredPassword
      await account.save()
      winston.info('[Bootstrap] Admin "skaran" password reset successfully.')
    } else {
      winston.info('[Bootstrap] Admin account "skaran" verified.')
    }
  } catch (err) {
    winston.error('[Bootstrap] Failed to verify/create admin account: ' + err.message)
  }
}

module.exports = {
  ensureDefaultAdmin
}
