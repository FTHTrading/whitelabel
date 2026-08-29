// ==========================================================================
// TEST SUITE: AUDIT EXPORT TENANT ISOLATION (CROSS-TENANT ACCESS PREVENTION)
// ==========================================================================

const assert = require('assert');
const { resolveTenant } = require('../middleware/resolveTenant');
const { verifyOidcSession } = require('../services/identityProvider');

function runAuditExportTenantIsolationTests() {
  console.log('--- RUNNING AUDIT EXPORT TENANT ISOLATION TESTS ---');

  let responseCode = null;
  const mockRes = {
    status: (code) => { responseCode = code; return { json: () => {} }; }
  };

  const user = verifyOidcSession('user_architect_smith'); // Member of Blackwood only

  // Test 1: User from Tenant Blackwood attempts to export Tenant Dignity package -> 403 Forbidden
  const mockReqCrossTenant = {
    headers: { 'x-tenant-id': 'tenant_dignity_01' },
    user
  };

  resolveTenant(mockReqCrossTenant, mockRes, () => {});
  assert.strictEqual(responseCode, 403, 'Cross-tenant export request must be rejected with 403 Forbidden.');

  // Test 2: User with valid tenant membership succeeds
  const mockReqValidTenant = {
    headers: { 'x-tenant-id': 'tenant_blackwood_01' },
    user
  };
  let tenantResolved = false;

  resolveTenant(mockReqValidTenant, mockRes, () => { tenantResolved = true; });
  assert.strictEqual(tenantResolved, true, 'Authorized tenant member must resolve context.');

  console.log('✔ Cross-Tenant Export Isolation & Membership Boundaries: PASSED (Verified)');
}

module.exports = { runAuditExportTenantIsolationTests };

if (require.main === module) {
  runAuditExportTenantIsolationTests();
}
