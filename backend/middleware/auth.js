const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET || process.env.JWT_KEY || 'dev-secret';
/**
 * Bearer-token authentication middleware (mobile/app style).
 *
 * How it fits:
 * - Used by routes that expect `Authorization: Bearer <jwt>`
 * - Decodes JWT and attaches `req.uid` + `req.user` for downstream handlers
 */
  function authMiddleware(req, res, next) {
    try {
      const auth = req.headers.authorization

      if (!auth) {
        return res.status(401).json({ message: 'lost Authorization' })
      }

      const [type, token] = auth.split(' ')

      if (type !== 'Bearer' || !token) {
        return res.status(401).json({ message: 'token fails' })
      }

      const decoded = jwt.verify(token, JWT_SECRET)

      req.uid = decoded.user_id ?? decoded.uid
      req.user = decoded

      next()
    } catch  {
      return res.status(401).json({ message: 'token expired' })
    }
  }

  module.exports = authMiddleware
