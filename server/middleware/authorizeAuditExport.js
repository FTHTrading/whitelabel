// ==========================================================================
// MIDDLEWARE: AUTHORIZE AUDIT EXPORT REQUESTS
// ==========================================================================

function authorizeAuditExport(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  // 1. Verify that user account is active
  if (!req.user.isActive) {
    return res.status(403).json({
      error: 'Forbidden: User account is inactive or suspended.'
    });
  }

  // 2. Validate resource parameters
  const { resourceType, resourceId } = req.body;
  if (!resourceType || !resourceId) {
    return res.status(400).json({
      error: 'Bad Request: Missing required resourceType or resourceId.'
    });
  }

  if (resourceType !== 'deal' && resourceType !== 'asset' && resourceType !== 'workflow') {
    return res.status(400).json({
      error: 'Bad Request: Unsupported resourceType for audit export.'
    });
  }

  next();
}

module.exports = { authorizeAuditExport };
