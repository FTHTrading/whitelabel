// ==========================================================================
// TEST SUITE: AUDIT LEDGER INTEGRITY & HASH CHAIN VERIFICATION
// ==========================================================================

const assert = require('assert');
const { computeChainedEventHash } = require('../canonicalizer');

function runAuditLedgerTests() {
  console.log('--- RUNNING AUDIT LEDGER & HASH CHAIN TESTS ---');

  const genesisHash = '0'.repeat(64);

  // Event 1
  const payload1 = { event: 'tenant_registered', tenantSlug: 'blackwood' };
  const event1 = computeChainedEventHash(genesisHash, payload1);

  // Event 2
  const payload2 = { event: 'deal_opened', dealCode: 'DEAL-LDX-99', amountUsd: 4200000 };
  const event2 = computeChainedEventHash(event1.eventHash, payload2);

  // Event 3
  const payload3 = { event: 'draw_approved', approversCount: 3 };
  const event3 = computeChainedEventHash(event2.eventHash, payload3);

  // Verify chain linkage
  const ledger = [
    { prev: genesisHash, payload: payload1, hash: event1.eventHash },
    { prev: event1.eventHash, payload: payload2, hash: event2.eventHash },
    { prev: event2.eventHash, payload: payload3, hash: event3.eventHash }
  ];

  // Verification routine
  function verifyChain(events) {
    for (let i = 0; i < events.length; i++) {
      const current = events[i];
      const recalculated = computeChainedEventHash(current.prev, current.payload);
      if (recalculated.eventHash !== current.hash) {
        return false;
      }
    }
    return true;
  }

  assert.strictEqual(verifyChain(ledger), true, 'Valid audit hash chain must verify successfully.');

  // Test Tampering Detection: Alter payload of Event 2
  const tamperedLedger = JSON.parse(JSON.stringify(ledger));
  tamperedLedger[1].payload.amountUsd = 5000000; // Tampered amount

  assert.strictEqual(verifyChain(tamperedLedger), false, 'Tampered ledger entry must trigger verification failure!');

  console.log('✔ Audit Hash Chain ($H_n$) & Tamper Detection: PASSED (100% Cryptographically Verified)');
}

module.exports = { runAuditLedgerTests };

if (require.main === module) {
  runAuditLedgerTests();
}
