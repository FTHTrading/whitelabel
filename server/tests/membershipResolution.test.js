// ==========================================================================
// TEST SUITE: TENANT MEMBERSHIP RESOLUTION & ACTIVE SCOPE
// ==========================================================================

const assert = require('assert');
const { verifyOidcSession, resolveUserTenantScope } = require('../services/identityProvider');

function runMembershipResolutionTests() {
  console.log('--- RUNNING MEMBERSHIP RESOLUTION TESTS ---');

  const user = verifyOidcSession('user_kevan_burns');

  // Test 1: User with valid membership in Tenant Blackwood
  const scopeBlackwood = resolveUserTenantScope(user, 'tenant_blackwood_01');
  assert.strictEqual(scopeBlackwood.isMember, true);
  assert.strictEqual(scopeBlackwood.role, 'compliance_officer');

  // Test 2: User attempting to access non-member tenant is rejected
  const scopeNonMember = resolveUserTenantScope(user, 'tenant_georgia_spv_99');
  assert.strictEqual(scopeNonMember.isMember, false, 'Non-member tenant scope must return isMember: false.');

  console.log('✔ Tenant Membership Resolution & Scope Gating: PASSED (Verified)');
}

module.exports = { runMembershipResolutionTests };

if (require.main === module) {
  runMembershipResolutionTests();
}
