/**
 * LilyPad ERP - User Management & Notification Controller
 * Handles user creation, role & department assignments, and notification events.
 */

const { User } = require('../models')
const xss = require('xss')

const lilypadUsersController = {}

/**
 * GET /api/v1/lilypad/users
 * Returns list of team members
 */
lilypadUsersController.getUsers = async function (req, res) {
  try {
    const users = await User.find({ deleted: { $ne: true } })
      .select('username fullname email role title department image hasL2Auth isAgent isSupport lead')
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
      role = 'Agent',
      department = 'Engineering',
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
    const existing = await User.findOne({
      $or: [{ username: cleanUsername }, { email: cleanEmail }]
    })

    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'A user with that username or email already exists.'
      })
    }

    const newUser = new User({
      username: cleanUsername,
      fullname: xss(fullname.trim()),
      email: cleanEmail,
      password: password,
      title: xss(title.trim()) || role,
      role: role,
      department: xss(department.trim())
    })

    const saved = await newUser.save()

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
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' })
    }

    if (fullname) user.fullname = xss(fullname.trim())
    if (email) user.email = xss(email.trim().toLowerCase())
    if (role) user.role = role
    if (department) user.department = xss(department.trim())
    if (title) user.title = xss(title.trim())

    const saved = await user.save()
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
 * DELETE /api/v1/lilypad/users/:id
 * Soft deletes / deactivates a user
 */
lilypadUsersController.deleteUser = async function (req, res) {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' })
    }

    user.deleted = true
    await user.save()

    return res.status(200).json({
      success: true,
      message: 'User removed successfully'
    })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

module.exports = lilypadUsersController

