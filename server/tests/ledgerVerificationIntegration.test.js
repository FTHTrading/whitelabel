// ==========================================================================
// TEST SUITE: LEDGER VERIFICATION INTEGRATION & TAMPER DETECTION
// ==========================================================================

const assert = require('assert');
const { verifyLedgerEvents } = require('../services/ledgerVerifier');
const demoAuditEvents = require('../test-fixtures/demo-audit-events.json');

function runLedgerVerificationIntegrationTests() {
  console.log('--- RUNNING LEDGER VERIFICATION INTEGRATION TESTS ---');

  // Test 1: Valid event sequence passes verification
  const resultValid = verifyLedgerEvents(demoAuditEvents);
  assert.strictEqual(resultValid.verified, true, 'Valid demo audit event ledger must verify.');
  assert.strictEqual(resultValid.verifiedEventsCount, 3);

  // Test 2: Single-byte modification in Event 1 payload triggers tamper failure
  const tamperedEvents = JSON.parse(JSON.stringify(demoAuditEvents));
  tamperedEvents[0].canonicalPayload.facilityAmountUsd = '4300000.00'; // Altered amount

  const resultTampered = verifyLedgerEvents(tamperedEvents);
  assert.strictEqual(resultTampered.verified, false, 'Altered payload must fail verification.');
  assert.strictEqual(resultTampered.brokenIndex, 0);

  // Test 3: Broken previous hash link triggers chain failure
  const brokenLinkEvents = JSON.parse(JSON.stringify(demoAuditEvents));
  brokenLinkEvents[1].previousEventHash = '0'.repeat(64); // Broken link

  const resultBroken = verifyLedgerEvents(brokenLinkEvents);
  assert.strictEqual(resultBroken.verified, false, 'Broken previousEventHash must fail verification.');
  assert.strictEqual(resultBroken.brokenIndex, 1);

  console.log('✔ Ledger Hash Chain Integrity & Single-Byte Tamper Detection: PASSED (Verified)');
}

module.exports = { runLedgerVerificationIntegrationTests };

if (require.main === module) {
  runLedgerVerificationIntegrationTests();
}
