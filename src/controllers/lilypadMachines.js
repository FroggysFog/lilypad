/**
 * LilyPad ERP - Machine Master Page Controller
 * Per-machine documents, images, videos, and common issues / troubleshooting.
 */

const fs = require('fs')
const path = require('path')
const multer = require('multer')
const xss = require('xss')
const LilyPadMachine = require('../models/lilypadMachine')

const UPLOAD_ROOT = process.env.UPLOAD_DIR || '/var/data/uploads'
const MACHINES_DIR = path.join(UPLOAD_ROOT, 'machines')

const DEFAULT_MACHINES = [
  { name: 'Antari 2000 Elite', category: 'FX Machine Support' },
  { name: 'Antari DarkFX Spot 510', category: 'FX Machine Support' },
  { name: 'Antari Z-350 Fazer', category: 'FX Machine Support' },
  { name: 'LilyPad Solar Telemetry Gateway', category: 'IT & Hardware' },
  { name: 'Industrial LFP Battery Array 480V', category: 'IT & Hardware' },
  { name: 'Enterprise ERP Server Node X1', category: 'IT & Hardware' }
]

const MEDIA_MIME_TYPES = {
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
  image: ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml'],
  video: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
}

const YOUTUBE_ID_PATTERN = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/

function extractYouTubeId(url) {
  const match = String(url || '').match(YOUTUBE_ID_PATTERN)
  return match ? match[1] : null
}

function mediaTypeFor(mimeType) {
  for (const [type, mimes] of Object.entries(MEDIA_MIME_TYPES)) {
    if (mimes.includes(mimeType)) return type
  }
  return null
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(MACHINES_DIR, req.params.slug)
    fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, unique + path.extname(file.originalname))
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB (video-friendly)
})

const lilypadMachinesController = {}
lilypadMachinesController.uploadMiddleware = upload.single('file')

/**
 * Seed default machines if the collection is empty
 */
lilypadMachinesController.seedDefaultMachines = async function () {
  const count = await LilyPadMachine.countDocuments()
  if (count > 0) return

  await LilyPadMachine.create(
    DEFAULT_MACHINES.map((m) => ({
      name: m.name,
      slug: LilyPadMachine.slugify(m.name),
      category: m.category
    }))
  )
}

/**
 * GET /api/v1/lilypad/machines
 */
lilypadMachinesController.getMachines = async function (req, res) {
  try {
    await lilypadMachinesController.seedDefaultMachines()

    const machines = await LilyPadMachine.find({ deleted: false })
      .select('name slug category imageUrl media issues createdAt updatedAt')
      .sort('-updatedAt')

    return res.status(200).json({ success: true, data: machines })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * GET /api/v1/lilypad/machines/search?q=
 */
lilypadMachinesController.searchMachines = async function (req, res) {
  try {
    const q = (req.query.q || '').trim()
    if (!q) return lilypadMachinesController.getMachines(req, res)

    const machines = await LilyPadMachine.find({
      deleted: false,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
        { 'issues.symptom': { $regex: q, $options: 'i' } },
        { 'issues.resolution': { $regex: q, $options: 'i' } }
      ]
    })
      .select('name slug category imageUrl media issues createdAt updatedAt')
      .sort('-updatedAt')

    return res.status(200).json({ success: true, data: machines })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * GET /api/v1/lilypad/machines/:slug
 */
lilypadMachinesController.getMachineBySlug = async function (req, res) {
  try {
    const machine = await LilyPadMachine.findOne({ slug: req.params.slug, deleted: false }).populate(
      'media.uploadedBy issues.createdBy',
      'fullname email'
    )

    if (!machine) {
      return res.status(404).json({ success: false, error: 'Machine not found' })
    }

    return res.status(200).json({ success: true, data: machine })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/machines
 */
lilypadMachinesController.createMachine = async function (req, res) {
  try {
    const { name, category } = req.body
    if (!name) {
      return res.status(400).json({ success: false, error: 'Machine name is required.' })
    }

    const slug = LilyPadMachine.slugify(name)
    const existing = await LilyPadMachine.findOne({ slug })
    if (existing) {
      return res.status(409).json({ success: false, error: 'A machine with that name already exists.' })
    }

    const machine = await LilyPadMachine.create({
      name: xss(name.trim()),
      slug,
      category: category ? xss(category.trim()) : 'General'
    })

    return res.status(201).json({ success: true, data: machine })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/machines/:slug/media
 */
lilypadMachinesController.uploadMedia = async function (req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded.' })
    }

    const machine = await LilyPadMachine.findOne({ slug: req.params.slug, deleted: false })
    if (!machine) {
      return res.status(404).json({ success: false, error: 'Machine not found' })
    }

    const mediaType = mediaTypeFor(req.file.mimetype)
    if (!mediaType) {
      fs.unlink(req.file.path, function () {})
      return res.status(400).json({ success: false, error: 'Unsupported file type: ' + req.file.mimetype })
    }

    machine.media.push({
      type: mediaType,
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimeType: req.file.mimetype,
      title: req.body.title ? xss(req.body.title.trim()) : req.file.originalname,
      uploadedBy: req.user._id
    })

    await machine.save()

    return res.status(201).json({ success: true, data: machine })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/machines/:slug/media/link
 * Adds a linked media entry: a YouTube video, or a OneDrive (or any external) document link.
 */
lilypadMachinesController.addMediaLink = async function (req, res) {
  try {
    const { type, url, title } = req.body

    if (!type || !['document', 'video'].includes(type)) {
      return res.status(400).json({ success: false, error: 'Type must be "document" or "video".' })
    }
    if (!url || !/^https?:\/\//i.test(url.trim())) {
      return res.status(400).json({ success: false, error: 'A valid http(s) URL is required.' })
    }

    const machine = await LilyPadMachine.findOne({ slug: req.params.slug, deleted: false })
    if (!machine) {
      return res.status(404).json({ success: false, error: 'Machine not found' })
    }

    let linkUrl = url.trim()
    if (type === 'video') {
      const videoId = extractYouTubeId(linkUrl)
      if (!videoId) {
        return res.status(400).json({ success: false, error: 'That doesn\'t look like a YouTube link.' })
      }
      linkUrl = 'https://www.youtube.com/embed/' + videoId
    }

    machine.media.push({
      type,
      linkUrl,
      title: title ? xss(title.trim()) : linkUrl,
      uploadedBy: req.user._id
    })

    await machine.save()

    return res.status(201).json({ success: true, data: machine })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * DELETE /api/v1/lilypad/machines/:slug/media/:mediaId
 */
lilypadMachinesController.deleteMedia = async function (req, res) {
  try {
    const machine = await LilyPadMachine.findOne({ slug: req.params.slug, deleted: false })
    if (!machine) {
      return res.status(404).json({ success: false, error: 'Machine not found' })
    }

    const item = machine.media.id(req.params.mediaId)
    if (!item) {
      return res.status(404).json({ success: false, error: 'Media not found' })
    }

    fs.unlink(item.path, function () {})
    machine.media.pull(req.params.mediaId)
    await machine.save()

    return res.status(200).json({ success: true, message: 'Media removed' })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/v1/lilypad/machines/:slug/issues
 */
lilypadMachinesController.addIssue = async function (req, res) {
  try {
    const { symptom, steps, resolution } = req.body
    if (!symptom) {
      return res.status(400).json({ success: false, error: 'A symptom/issue description is required.' })
    }

    const machine = await LilyPadMachine.findOne({ slug: req.params.slug, deleted: false })
    if (!machine) {
      return res.status(404).json({ success: false, error: 'Machine not found' })
    }

    machine.issues.unshift({
      symptom: xss(symptom.trim()),
      steps: Array.isArray(steps) ? steps.map((s) => xss(String(s).trim())) : [],
      resolution: resolution ? xss(resolution.trim()) : '',
      createdBy: req.user._id
    })

    await machine.save()

    return res.status(201).json({ success: true, data: machine })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * DELETE /api/v1/lilypad/machines/:slug/issues/:issueId
 */
lilypadMachinesController.deleteIssue = async function (req, res) {
  try {
    const machine = await LilyPadMachine.findOne({ slug: req.params.slug, deleted: false })
    if (!machine) {
      return res.status(404).json({ success: false, error: 'Machine not found' })
    }

    machine.issues.pull(req.params.issueId)
    await machine.save()

    return res.status(200).json({ success: true, message: 'Issue removed' })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

module.exports = lilypadMachinesController
