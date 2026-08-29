// ==========================================================================
// MIDDLEWARE: AUTHENTICATE USER SESSION VIA OIDC ADAPTER
// ==========================================================================

const { verifyOidcSession } = require('../services/identityProvider');

function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized: Missing or malformed Authorization header.'
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const user = verifyOidcSession(token);
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      error: `Unauthorized: ${err.message}`
    });
  }
}

module.exports = { authenticate };
