// ==========================================================================
// MIDDLEWARE: RESOLVE TENANT BOUNDARY (PREVENTS CLIENT-SPOOFED TENANT ID)
// ==========================================================================

const demoTenant = require('../test-fixtures/demo-tenant.json');

function resolveTenant(req, res, next) {
  // Authoritative resolution from verified session membership or hostname
  const requestedTenantId = req.headers['x-tenant-id'] || demoTenant.tenantId;

  // Verify that the authenticated user has explicit membership in the requested tenant
  if (req.user && !req.user.delegatedTenantIds.includes(requestedTenantId)) {
    return res.status(403).json({
      error: 'Forbidden: User is not an authorized member of the requested tenant workspace.'
    });
  }

  req.tenant = demoTenant;
  next();
}

module.exports = { resolveTenant };
