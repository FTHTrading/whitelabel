// ==========================================================================
// TEST SUITE: CREDENTIAL SCOPE AUTHORIZATION & LIMIT GATING
// ==========================================================================

const assert = require('assert');
const { verifyOidcSession, resolveUserTenantScope } = require('../services/identityProvider');

function runCredentialScopeAuthorizationTests() {
  console.log('--- RUNNING CREDENTIAL SCOPE AUTHORIZATION TESTS ---');

  // Test 1: Managing Officer with $100M limit can approve $4.2M draw
  const officerUser = verifyOidcSession('user_kevan_burns');
  const officerScope = resolveUserTenantScope(officerUser, 'tenant_blackwood_01');
  const drawAmount = 4200000.00;

  assert.ok(officerScope.maxApprovalLimitUsd >= drawAmount, 'Officer limit must cover $4.2M draw.');

  // Test 2: Junior Analyst with $100k limit CANNOT approve $4.2M draw
  const analystUser = verifyOidcSession('user_junior_analyst');
  const analystScope = resolveUserTenantScope(analystUser, 'tenant_blackwood_01');

  assert.strictEqual(analystScope.maxApprovalLimitUsd, 100000.00);
  assert.ok(analystScope.maxApprovalLimitUsd < drawAmount, 'Junior analyst must NOT satisfy $4.2M approval threshold.');

  console.log('✔ Credential Scope & Signing Limit Gating: PASSED (Verified)');
}

module.exports = { runCredentialScopeAuthorizationTests };

if (require.main === module) {
  runCredentialScopeAuthorizationTests();
}
