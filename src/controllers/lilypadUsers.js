/**
 * LilyPad ERP - User Management & Notification Controller
 * Handles user creation, role & department assignments, and notification events.
 */

const crypto = require('crypto')
const LilyPadAccount = require('../models/lilypadAccount')
const pagePermissionService = require('../services/pagePermissionService')
const xss = require('xss')

// Avoids visually-ambiguous characters (0/O, 1/l/I) since a generated
// password gets hand-typed by whoever it's handed to, not pasted.
const PASSWORD_CHARSET = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
const PASSWORD_SYMBOLS = '!@#$%'

function generateTempPassword () {
  const bytes = crypto.randomBytes(11)
  let password = ''
  for (let i = 0; i < bytes.length; i++) password += PASSWORD_CHARSET[bytes[i] % PASSWORD_CHARSET.length]
  password += PASSWORD_SYMBOLS[crypto.randomBytes(1)[0] % PASSWORD_SYMBOLS.length]
  return password
}

const lilypadUsersController = {}

/**
 * GET /api/v1/lilypad/users
 * Returns list of team members
 */
lilypadUsersController.getUsers = async function (req, res) {
  try {
    const users = await LilyPadAccount.find({ deleted: { $ne: true } })
      .select('username fullname email role title department salesforceUserId')
      .sort('fullname')

    return res.status(200).json({
      success: true,
      data: users
    })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/users
 * Creates a new team member or admin
 */
lilypadUsersController.createUser = async function (req, res) {
  try {
    const {
      fullname,
      username,
      email,
      password,
      role = 'agent',
      department = '',
      title = ''
    } = req.body

    if (!fullname || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Full name, username, email, and password are required.'
      })
    }

    const cleanUsername = xss(username.trim().toLowerCase())
    const cleanEmail = xss(email.trim().toLowerCase())

    // Check existing
    const existing = await LilyPadAccount.findOne({
      $or: [{ username: cleanUsername }, { email: cleanEmail }]
    })

    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'A user with that username or email already exists.'
      })
    }

    const newAccount = new LilyPadAccount({
      username: cleanUsername,
      fullname: xss(fullname.trim()),
      email: cleanEmail,
      password: password,
      title: xss(title.trim()),
      role: role,
      department: xss(department.trim())
    })

    const saved = await newAccount.save()

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        _id: saved._id,
        username: saved.username,
        fullname: saved.fullname,
        email: saved.email,
        role: saved.role,
        department: saved.department
      }
    })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/users/bulk
 * body: { users: [{ fullname, email, username?, role?, department?, title? }, ...] }
 *
 * Generates a random temporary password per account server-side (never
 * accepted from the client, unlike single createUser) and returns it
 * exactly once in this response - there is no way to retrieve it again
 * afterward (the schema only ever stores the bcrypt hash), so whoever
 * calls this must capture the results immediately. One bad row doesn't
 * fail the whole batch - each row succeeds or fails independently, so
 * 19 good rows still go through if the 20th has a typo'd email.
 */
lilypadUsersController.bulkCreateUsers = async function (req, res) {
  try {
    const rows = Array.isArray(req.body.users) ? req.body.users : []
    if (!rows.length) {
      return res.status(400).json({ success: false, error: 'users must be a non-empty array.' })
    }

    const results = []
    for (const row of rows) {
      const fullname = String(row.fullname || '').trim()
      const email = String(row.email || '').trim().toLowerCase()

      if (!fullname || !email) {
        results.push({ email: row.email || '', fullname: row.fullname || '', success: false, error: 'Full name and email are required.' })
        continue
      }

      const existingEmail = await LilyPadAccount.findOne({ email })
      if (existingEmail) {
        results.push({ email, fullname, success: false, error: 'A user with that email already exists.' })
        continue
      }

      const baseUsername = String(row.username || email.split('@')[0]).trim().toLowerCase().replace(/[^a-z0-9._-]/g, '') || 'user'
      let username = baseUsername
      let suffix = 1
      while (await LilyPadAccount.findOne({ username })) {
        username = baseUsername + suffix
        suffix++
      }

      try {
        const password = generateTempPassword()
        const account = new LilyPadAccount({
          username,
          fullname: xss(fullname),
          email,
          password,
          role: xss(String(row.role || 'user').trim().toLowerCase()),
          department: xss(String(row.department || '').trim()),
          title: xss(String(row.title || '').trim())
        })
        await account.save()
        results.push({ email, fullname, username, password, role: account.role, success: true })
      } catch (err) {
        results.push({ email, fullname, success: false, error: err.message })
      }
    }

    return res.status(200).json({ success: true, data: results })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * PUT /api/v1/lilypad/users/:id
 * Updates an existing user's role, department, or details
 */
lilypadUsersController.updateUser = async function (req, res) {
  try {
    const { fullname, email, role, department, title, salesforceUserId } = req.body
    const account = await LilyPadAccount.findById(req.params.id)

    if (!account) {
      return res.status(404).json({ success: false, error: 'User not found' })
    }

    if (fullname) account.fullname = xss(fullname.trim())
    if (email) account.email = xss(email.trim().toLowerCase())
    if (role) account.role = role
    if (department) account.department = xss(department.trim())
    if (title) account.title = xss(title.trim())
    // Explicitly allow clearing this one (empty string) - unlike the
    // fields above, "no Salesforce Id" is a meaningful, settable state.
    if (typeof salesforceUserId === 'string') account.salesforceUserId = xss(salesforceUserId.trim())

    const saved = await account.save()
    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: saved
    })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * GET /api/v1/lilypad/account/me
 * Returns the logged-in user's own identity
 */
lilypadUsersController.getMe = async function (req, res) {
  try {
    // Admins previewing another role (see /preview-role) get `role` set
    // to the PREVIEWED role here, not their real one - every existing
    // "role === 'admin'" check across the app (showing the admin nav
    // section, etc) then behaves correctly for the preview automatically,
    // without each page needing its own preview-aware logic. realRole is
    // what actually gates whether the preview switcher itself shows.
    const previewRole = req.user.role === 'admin' ? req.session.previewRole : null
    const effectiveRole = previewRole || req.user.role
    const allowedPages = await pagePermissionService.getAllowedPagesForRole(effectiveRole)

    return res.status(200).json({
      success: true,
      data: {
        id: req.user._id,
        username: req.user.username,
        fullname: req.user.fullname,
        email: req.user.email,
        role: effectiveRole,
        realRole: req.user.role,
        previewRole,
        allowedPages,
        title: req.user.title,
        department: req.user.department
      }
    })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * PUT /api/v1/lilypad/account/password
 * Lets the logged-in user change their own password
 */
lilypadUsersController.changeMyPassword = async function (req, res) {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required.'
      })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters.'
      })
    }

    const account = await LilyPadAccount.findById(req.user._id).select('+password')
    if (!account) {
      return res.status(404).json({ success: false, error: 'Account not found' })
    }

    if (!LilyPadAccount.comparePassword(currentPassword, account.password)) {
      return res.status(401).json({ success: false, error: 'Current password is incorrect.' })
    }

    account.password = newPassword
    await account.save()

    return res.status(200).json({ success: true, message: 'Password updated successfully' })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * DELETE /api/v1/lilypad/users/:id
 * Soft deletes / deactivates a user
 */
lilypadUsersController.deleteUser = async function (req, res) {
  try {
    const account = await LilyPadAccount.findById(req.params.id)
    if (!account) {
      return res.status(404).json({ success: false, error: 'User not found' })
    }

    account.deleted = true
    await account.save()

    return res.status(200).json({
      success: true,
      message: 'User removed successfully'
    })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

module.exports = lilypadUsersController
