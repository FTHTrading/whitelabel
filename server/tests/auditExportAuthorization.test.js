// ==========================================================================
// TEST SUITE: AUDIT EXPORT AUTHENTICATION & AUTHORIZATION
// ==========================================================================

const assert = require('assert');
const { authenticate } = require('../middleware/authenticate');
const { authorizeAuditExport } = require('../middleware/authorizeAuditExport');

function runAuditExportAuthorizationTests() {
  console.log('--- RUNNING AUDIT EXPORT AUTHORIZATION TESTS ---');

  // Test 1: Unauthenticated request receives 401
  const mockReqUnauth = { headers: {}, body: {} };
  let responseCode = null;
  const mockRes = {
    status: (code) => { responseCode = code; return { json: () => {} }; }
  };

  authenticate(mockReqUnauth, mockRes, () => {});
  assert.strictEqual(responseCode, 401, 'Unauthenticated request must return 401 Unauthorized.');

  // Test 2: Expired token receives 401
  const mockReqExpired = {
    headers: { authorization: 'Bearer expired_token' },
    body: { resourceType: 'deal', resourceId: 'deal_savannah_07' }
  };

  authenticate(mockReqExpired, mockRes, () => {});
  assert.strictEqual(responseCode, 401, 'Expired token must return 401 Unauthorized.');

  // Test 3: Valid authenticated signer proceeds successfully
  const mockReqValid = {
    headers: { authorization: 'Bearer user_kevan_burns' },
    body: { resourceType: 'deal', resourceId: 'deal_savannah_07' }
  };
  let authorized = false;

  authenticate(mockReqValid, mockRes, () => {
    authorizeAuditExport(mockReqValid, mockRes, () => { authorized = true; });
  });
  assert.strictEqual(authorized, true, 'Valid signer request must be authorized.');

  console.log('✔ Audit Export Authentication & Expiration Gating: PASSED (Verified)');
}

module.exports = { runAuditExportAuthorizationTests };

if (require.main === module) {
  runAuditExportAuthorizationTests();
}
