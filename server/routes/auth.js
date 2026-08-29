// ==========================================================================
// ROUTES: AUTHENTICATION & SESSION INTROSPECTION
// ==========================================================================

const express = require('express');
const router = express.Router();

const { authenticate } = require('../middleware/authenticate');

/**
 * GET /api/v1/auth/me
 * Returns authenticated user profile, active memberships, and credential status.
 */
router.get('/me', authenticate, (req, res) => {
  res.json({
    userId: req.user.userId,
    email: req.user.email,
    fullName: req.user.fullName,
    mfaVerified: req.user.mfaVerified,
    membershipsCount: req.user.memberships.length,
    memberships: req.user.memberships.map(m => ({
      tenantId: m.tenantId,
      role: m.role,
      isActive: m.isActive,
      credentialsCount: (m.credentials || []).length
    }))
  });
});

module.exports = router;
