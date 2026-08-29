// ==========================================================================
// ROUTES: AUDIT & PROOF PACKAGE ENDPOINTS
// ==========================================================================

const express = require('express');
const router = express.Router();

const { authenticate } = require('../middleware/authenticate');
const { resolveTenant } = require('../middleware/resolveTenant');
const { authorizeAuditExport } = require('../middleware/authorizeAuditExport');
const { rateLimit } = require('../middleware/rateLimit');
const { generateProofPackage } = require('../services/proofPackageService');

const demoAuditEvents = require('../test-fixtures/demo-audit-events.json');
const demoEvidence = require('../test-fixtures/demo-evidence.json');

/**
 * POST /api/v1/audit/export-proof-package
 * Authenticated, tenant-scoped, policy-authorized proof package export.
 */
router.post(
  '/export-proof-package',
  rateLimit,
  authenticate,
  resolveTenant,
  authorizeAuditExport,
  (req, res) => {
    const { resourceType, resourceId } = req.body;

    const proofPackage = generateProofPackage({
      tenant: req.tenant,
      user: req.user,
      resourceType,
      resourceId,
      events: demoAuditEvents,
      evidenceMetadata: demoEvidence
    });

    res.setHeader('Content-Type', 'application/json');
    res.json(proofPackage);
  }
);

module.exports = router;
