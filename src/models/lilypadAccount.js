/**
 * LilyPad ERP - Account Schema
 * Standalone user/auth model, independent of Trudesk's User/Role system.
 */

const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const Schema = mongoose.Schema

const COLLECTION = 'lilypad_accounts'
const SALT_FACTOR = 10

const accountSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    fullname: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    role: {
      type: String,
      enum: ['admin', 'agent', 'user'],
      default: 'user'
    },
    title: {
      type: String,
      trim: true,
      default: ''
    },
    department: {
      type: String,
      trim: true,
      default: ''
    },
    deleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

accountSchema.pre('save', function (next) {
  const account = this

  if (!account.isModified('password')) {
    return next()
  }

  bcrypt.genSalt(SALT_FACTOR, function (err, salt) {
    if (err) return next(err)

    bcrypt.hash(account.password, salt, function (err, hash) {
      if (err) return next(err)

      account.password = hash
      return next()
    })
  })
})

accountSchema.statics.comparePassword = function (password, hash) {
  return bcrypt.compareSync(password, hash)
}

accountSchema.statics.getByUsername = function (username, callback) {
  return this.findOne({ username: new RegExp('^' + username + '$', 'i'), deleted: { $ne: true } })
    .select('+password')
    .exec(callback)
}

module.exports = mongoose.model(COLLECTION, accountSchema)
