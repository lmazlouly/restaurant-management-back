
/** Generating Tokens Via JWT */
const jwt = require('jsonwebtoken');
const tokenSecret = process.env.SECRET;

const authenticated = (req, res, next) => {
  const token = req.headers.auth
  if (!token) return res.status(403).json({error: "please provide a token"})
  else {
    jwt.verify(token, tokenSecret, (err, value) => {
      if (err) return res.status(403).json({error: 'failed to authenticate token'})
      req.user = value?.data
      next()
    })
  }
}

const hasPermission = (permission) => {
  return ( req, res, next ) => {
    const userRole = req.user?.role;
    if ( userRole && userRole.permissions?.find(perm => perm.name == permission) ) {
      next();
    } else {
      return res.status(419).json("No access")
    }
  }
}

module.exports = { authenticated, hasPermission }