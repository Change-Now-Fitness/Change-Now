const jwt = require('jsonwebtoken')
/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns userid and username(it is not required)
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

      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      req.uid = decoded.uid
      req.user = decoded

      next()
    } catch (err) {
      return res.status(401).json({ message: 'token expired' })
    }
  }

  module.exports = authMiddleware