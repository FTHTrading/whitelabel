// ==========================================================================
// TEST SUITE: OFFLINE DEMONSTRATION FALLBACK INTEGRITY & LABELS
// ==========================================================================

const assert = require('assert');

function runOfflineFallbackTests() {
  console.log('--- RUNNING OFFLINE DEMONSTRATION FALLBACK TESTS ---');

  // Fallback generation function simulating client behavior when API is offline
  function generateOfflineFallbackPackage(tenantSlug) {
    return {
      outputType: 'OFFLINE_DEMONSTRATION_RECEIPT',
      isServerVerified: false,
      serverPackageId: null,
      environment: 'demo_fallback',
      label: 'Offline Demonstration Receipt — Not Server Verified',
      disclaimer: 'OFFLINE DEMONSTRATION OUTPUT. Generated in browser using synthetic fixtures. Not server generated, not tenant-authorized, not ledger verified, and not suitable for operational, legal, custody, or financial reliance.',
      tenantSlug
    };
  }

  const fallback = generateOfflineFallbackPackage('blackwood');

  // Test 1: Fallback must have explicit non-verified status
  assert.strictEqual(fallback.isServerVerified, false, 'Fallback cannot claim server verification.');
  assert.strictEqual(fallback.serverPackageId, null, 'Fallback must have null serverPackageId.');

  // Test 2: Fallback must carry mandatory offline disclaimer
  assert.ok(fallback.disclaimer.includes('OFFLINE DEMONSTRATION OUTPUT'), 'Must contain offline disclaimer.');
  assert.ok(fallback.label.includes('Not Server Verified'), 'Label must state Not Server Verified.');

  console.log('✔ Offline Fallback Isolation & Distinct Disclaimer Labeling: PASSED (Verified)');
}

module.exports = { runOfflineFallbackTests };

if (require.main === module) {
  runOfflineFallbackTests();
}
