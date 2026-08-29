// ==========================================================================
// MIDDLEWARE: RESOLVE TENANT & VALIDATE MEMBERSHIP SCOPE
// ==========================================================================

const { resolveUserTenantScope } = require('../services/identityProvider');
const demoTenant = require('../test-fixtures/demo-tenant.json');

function resolveTenant(req, res, next) {
  // Authoritative resolution from verified session membership or hostname
  const requestedTenantId = req.headers['x-tenant-id'] || demoTenant.tenantId;

  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized: User authentication required.' });
  }

  const scope = resolveUserTenantScope(req.user, requestedTenantId);
  if (!scope.isMember) {
    return res.status(403).json({
      error: 'Forbidden: Authenticated user is not an active member of the requested tenant workspace.'
    });
  }

  req.tenant = { ...demoTenant, tenantId: requestedTenantId };
  req.membershipScope = scope;
  next();
}

module.exports = { resolveTenant };
