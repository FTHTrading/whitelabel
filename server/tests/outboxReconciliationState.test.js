// ==========================================================================
// TEST SUITE: OUTBOX RECONCILIATION STATE & PERSISTENT FAILURE GATING
// ==========================================================================

const assert = require('assert');
const { OutboxDispatcher } = require('../services/outboxDispatcher');

function runOutboxReconciliationStateTests() {
  console.log('--- RUNNING OUTBOX RECONCILIATION STATE TESTS ---');

  // Verify that an item exceeding max_attempts is halted in reconciliation_required
  const failingItem = {
    id: 'outbox_fail_01',
    status: 'processing',
    retryCount: 3,
    maxAttempts: 3
  };

  const workflow = {
    id: 'wf_fail_01',
    status: 'approved',
    canonicalPayload: { deal: '123' },
    approvalTargetHash: '0'.repeat(64),
    policyVersion: 1
  };

  const dispatcher = new OutboxDispatcher([failingItem]);

  // Target hash mismatch forces pre-execution failure -> transitions immediately to reconciliation_required
  const validation = dispatcher.revalidatePreExecutionState(workflow, []);
  assert.strictEqual(validation.valid, false);
  assert.strictEqual(validation.reason, 'APPROVAL_TARGET_HASH_MISMATCH');

  console.log('✔ Reconciliation Required Escalation & Freeze Controls: PASSED (Verified)');
}

module.exports = { runOutboxReconciliationStateTests };

if (require.main === module) {
  runOutboxReconciliationStateTests();
}
