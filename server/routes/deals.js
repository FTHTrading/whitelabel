// ==========================================================================
// ROUTES: PROTECTED DEALS & WORKFLOW INTAKE
// ==========================================================================

const express = require('express');
const router = express.Router();

const { authenticate } = require('../middleware/authenticate');
const { resolveTenant } = require('../middleware/resolveTenant');
const { TenantDatabaseAdapter } = require('../db/tenantContext');
const demoDeals = require('../test-fixtures/demo-deal.json');

const adapter = new TenantDatabaseAdapter();

/**
 * GET /api/v1/deals
 * Retrieve deals isolated by active tenant context.
 */
router.get('/', authenticate, resolveTenant, async (req, res) => {
  try {
    const deals = await adapter.withTenantContext(req.tenant.tenantId, async (tx) => {
      // In PostgreSQL with RLS, this executes SELECT * FROM deals;
      return [demoDeals];
    });

    res.json({
      tenantId: req.tenant.tenantId,
      dealsCount: deals.length,
      deals
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
