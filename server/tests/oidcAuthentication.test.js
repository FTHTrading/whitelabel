// ==========================================================================
// TEST SUITE: OIDC AUTHENTICATION & MFA ENFORCEMENT
// ==========================================================================

const assert = require('assert');
const { verifyOidcSession } = require('../services/identityProvider');

function runOidcAuthenticationTests() {
  console.log('--- RUNNING OIDC AUTHENTICATION TESTS ---');

  // Test 1: Valid user token resolves correctly
  const user = verifyOidcSession('user_kevan_burns');
  assert.strictEqual(user.userId, 'user_kevan_burns');
  assert.strictEqual(user.mfaVerified, true, 'Officer user must have MFA verified.');

  // Test 2: Expired token throws authentication error
  assert.throws(() => {
    verifyOidcSession('expired_token');
  }, /Token has expired/);

  // Test 3: Missing token throws error
  assert.throws(() => {
    verifyOidcSession(null);
  }, /Missing authorization token/);

  console.log('✔ OIDC Authentication & MFA Enforcement: PASSED (Verified)');
}

module.exports = { runOidcAuthenticationTests };

if (require.main === module) {
  runOidcAuthenticationTests();
}
