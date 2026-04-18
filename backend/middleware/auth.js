const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET || process.env.JWT_KEY || 'dev-secret';
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

      const decoded = jwt.verify(token, JWT_SECRET)

      req.uid = decoded.user_id ?? decoded.uid
      req.user = decoded

      next()
    } catch (err) {
      return res.status(401).json({ message: 'token expired' })
    }
  }
/**
 * checks cookie for a val, null otherwise
 * @param {*} cookieHeader 
 * @param {*} name of value prefix in cookie
 * @returns 
 */
function getCookieValue(cookieHeader, name) {
    if (!cookieHeader) {
        return null;
    }

    const valArray = cookieHeader.split(";")

    for (let value in valArray) {
        let val = valArray[value].trim().split("=", 2);
        if ( val[0] == name ) {
            if (val[1] == undefined) continue;
            return val[1];
        }
    } 
    return null;
}
  module.exports = authMiddleware
