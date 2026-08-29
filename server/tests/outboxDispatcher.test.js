// ==========================================================================
// TEST SUITE: TRANSACTION OUTBOX DISPATCHER & SANDBOX EXECUTION
// ==========================================================================

const assert = require('assert');
const { OutboxDispatcher } = require('../services/outboxDispatcher');
const { computeApprovalTargetHash } = require('../services/workflowStateMachine');
const { verifyOidcSession } = require('../services/identityProvider');

async function runOutboxDispatcherTests() {
  console.log('--- RUNNING OUTBOX DISPATCHER TESTS ---');

  const architectUser = verifyOidcSession('user_architect_smith');
  const officerUser = verifyOidcSession('user_kevan_burns');

  const payload = { dealCode: 'DEAL-LDX-99', drawAmountUsd: '4200000.00' };
  const targetHash = computeApprovalTargetHash(payload, 1);

  const workflow = {
    id: 'wf_outbox_01',
    tenantId: 'tenant_blackwood_01',
    status: 'approved',
    targetAmountUsd: '4200000.00',
    approvalTargetHash: targetHash,
    canonicalPayload: payload,
    policyVersion: 1
  };

  const outboxItem = {
    id: 'outbox_item_01',
    tenantId: 'tenant_blackwood_01',
    workflowRequestId: 'wf_outbox_01',
    approvalTargetHash: targetHash,
    destinationRail: 'bitgo_sandbox_mpc',
    intentPayload: { amountUsd: '4200000.00' },
    status: 'pending',
    retryCount: 0,
    maxAttempts: 3
  };

  const store = [outboxItem];
  const dispatcher = new OutboxDispatcher(store);

  // 1. Claim item with lease
  const claimed = dispatcher.claimNextOutboxItem('worker_01', 60);
  assert.ok(claimed, 'Must successfully claim pending outbox item.');
  assert.strictEqual(claimed.status, 'processing');
  assert.strictEqual(claimed.claimedBy, 'worker_01');

  // 2. Process item with live approver list
  const res = await dispatcher.processOutboxItem(
    claimed,
    workflow,
    [{ user: architectUser }, { user: officerUser }],
    'worker_01'
  );

  assert.strictEqual(res.success, true);
  assert.strictEqual(res.status, 'executed');
  assert.strictEqual(workflow.status, 'executed');
  assert.strictEqual(claimed.status, 'completed');
  assert.ok(claimed.executionReceipt.adapterRequestId.startsWith('bitgo_sandbox_req_'));

  console.log('✔ Outbox Claim, Revalidation & Sandbox Intent Dispatch: PASSED (Verified)');
}

module.exports = { runOutboxDispatcherTests };

if (require.main === module) {
  runOutboxDispatcherTests();
}
