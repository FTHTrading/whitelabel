// ==========================================================================
// MIDDLEWARE: AUTHENTICATE USER SESSION / TOKEN
// ==========================================================================

function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized: Missing or malformed Authorization header.'
    });
  }

  const token = authHeader.split(' ')[1];
  if (token === 'invalid_token' || token === 'expired_token') {
    return res.status(401).json({
      error: 'Unauthorized: Session token has expired or is invalid.'
    });
  }

  // Simulated authenticated user identity
  req.user = {
    userId: token.startsWith('user_') ? token : 'user_kevan_burns',
    email: 'kevan@blackwoodcap.com',
    delegatedTenantIds: ['tenant_blackwood_01'],
    role: token.includes('auditor') ? 'auditor' : 'compliance_officer',
    isCredentialActive: !token.includes('expired_cred')
  };

  next();
}

module.exports = { authenticate };
