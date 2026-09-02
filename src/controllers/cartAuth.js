/**
 * LilyPad ERP - Cart.com OAuth Controller
 * Same shape as controllers/salesforceAuth.js's connect/callback.
 */

const cartService = require('../services/cartService')

const controller = {}

const DEFAULT_RETURN_TO = '/api-credentials.html'

// Only allow same-site, path-only redirect targets (blocks open-redirect via returnTo=//evil.com or returnTo=https://evil.com).
function sanitizeReturnTo (value) {
  if (typeof value === 'string' && /^\/[^/\\]/.test(value)) return value
  return DEFAULT_RETURN_TO
}

controller.status = async (req, res) => {
  try {
    return res.json({ success: true, data: await cartService.getCartOAuthStatus() })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

controller.connect = (req, res) => {
  try {
    req.session.cartReturnTo = sanitizeReturnTo(req.query.returnTo)
    return res.redirect(cartService.getCartAuthUrl())
  } catch (err) {
    return res.status(503).json({ success: false, error: err.message })
  }
}

controller.callback = async (req, res) => {
  const returnTo = req.session.cartReturnTo || DEFAULT_RETURN_TO
  try {
    const authId = req.query.auth_id
    const code = req.query.code
    if (!authId || !code) {
      return res.status(400).send('Cart.com authorization failed: missing auth_id or code from store.')
    }

    await cartService.exchangeCartCode(authId, code)
    delete req.session.cartReturnTo
    return res.redirect(`${returnTo}?cart=connected`)
  } catch (err) {
    return res.status(400).send(`Cart.com connection failed: ${err.message}`)
  }
}

/**
 * GET /api/cart/test?path=/api/v1/orders.json
 * Admin-only raw request tester - lets an admin find the real working
 * Cart.com endpoint by trying paths directly instead of guessing.
 */
controller.testEndpoint = async (req, res) => {
  try {
    const result = await cartService.cartRequest(req.query.path)
    return res.json({ success: true, data: result })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
}

module.exports = controller
