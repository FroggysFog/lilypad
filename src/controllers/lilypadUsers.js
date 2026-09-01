/**
 * LilyPad ERP - User Management & Notification Controller
 * Handles user creation, role & department assignments, and notification events.
 */

const LilyPadAccount = require('../models/lilypadAccount')
const xss = require('xss')

const lilypadUsersController = {}

/**
 * GET /api/v1/lilypad/users
 * Returns list of team members
 */
lilypadUsersController.getUsers = async function (req, res) {
  try {
    const users = await LilyPadAccount.find({ deleted: { $ne: true } })
      .select('username fullname email role title department')
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
 * PUT /api/v1/lilypad/users/:id
 * Updates an existing user's role, department, or details
 */
lilypadUsersController.updateUser = async function (req, res) {
  try {
    const { fullname, email, role, department, title } = req.body
    const account = await LilyPadAccount.findById(req.params.id)

    if (!account) {
      return res.status(404).json({ success: false, error: 'User not found' })
    }

    if (fullname) account.fullname = xss(fullname.trim())
    if (email) account.email = xss(email.trim().toLowerCase())
    if (role) account.role = role
    if (department) account.department = xss(department.trim())
    if (title) account.title = xss(title.trim())

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
  return res.status(200).json({
    success: true,
    data: {
      id: req.user._id,
      username: req.user.username,
      fullname: req.user.fullname,
      email: req.user.email,
      role: req.user.role,
      title: req.user.title,
      department: req.user.department
    }
  })
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
