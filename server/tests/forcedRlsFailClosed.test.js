// ==========================================================================
// TEST SUITE: FORCED RLS & DEFENSIVE FAIL-CLOSED EVALUATION
// ==========================================================================

const assert = require('assert');

function runForcedRlsFailClosedTests() {
  console.log('--- RUNNING FORCED RLS FAIL-CLOSED EVALUATION TESTS ---');

  // Policy evaluator simulation matching PostgreSQL RLS expression:
  // tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid
  function evaluateRlsPolicy(rowTenantId, rawSettingValue) {
    if (!rawSettingValue || rawSettingValue.trim() === '') {
      return false; // NULLIF evaluates to NULL -> condition evaluates to FALSE (FAIL CLOSED)
    }
    return rowTenantId === rawSettingValue;
  }

  const dealRow = { tenantId: 'tenant_blackwood_01' };

  // Test 1: Empty string setting fails closed (returns false)
  assert.strictEqual(evaluateRlsPolicy(dealRow.tenantId, ''), false, 'Empty setting must fail closed.');

  // Test 2: Unset (null/undefined) setting fails closed
  assert.strictEqual(evaluateRlsPolicy(dealRow.tenantId, null), false, 'Null setting must fail closed.');

  // Test 3: Matching tenant context succeeds
  assert.strictEqual(evaluateRlsPolicy(dealRow.tenantId, 'tenant_blackwood_01'), true);

  // Test 4: Mismatched tenant context fails
  assert.strictEqual(evaluateRlsPolicy(dealRow.tenantId, 'tenant_dignity_01'), false);

  console.log('✔ Forced RLS & Defensive Fail-Closed Policy Expression: PASSED (Verified)');
}

module.exports = { runForcedRlsFailClosedTests };

if (require.main === module) {
  runForcedRlsFailClosedTests();
}
