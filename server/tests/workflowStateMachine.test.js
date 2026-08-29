// ==========================================================================
// TEST SUITE: WORKFLOW STATE MACHINE PROGRESSION & OUTBOX CREATION
// ==========================================================================

const assert = require('assert');
const { computeApprovalTargetHash, processApprovalDecision } = require('../services/workflowStateMachine');
const { verifyOidcSession } = require('../services/identityProvider');

function runWorkflowStateMachineTests() {
  console.log('--- RUNNING WORKFLOW STATE MACHINE TESTS ---');

  const initiatorUser = { userId: 'user_deal_originator_99' };
  const architectUser = verifyOidcSession('user_architect_smith');
  const officerUser = verifyOidcSession('user_kevan_burns');

  const payload = { dealCode: 'DEAL-LDX-99', drawAmountUsd: '4200000.00' };
  const targetHash = computeApprovalTargetHash(payload, 1);

  const workflow = {
    id: 'wf_test_01',
    tenantId: 'tenant_blackwood_01',
    status: 'pending_quorum',
    initiatorUserId: initiatorUser.userId,
    targetAmountUsd: '4200000.00',
    destinationTarget: '0x8aced25dc8530fdaf0f86d53a0a1e02aafa7ac7a',
    approvalTargetHash: targetHash,
    canonicalPayload: payload,
    policyVersion: 1,
    policy: {
      minDistinctSigners: 2,
      prohibitSelfApproval: true,
      requireRecentMfaMinutes: 15
    },
    signatures: []
  };

  // Step 1: Signer 1 (Architect) approves
  const res1 = processApprovalDecision({
    workflowRequest: workflow,
    signerUser: architectUser,
    mfaVerifiedAt: new Date().toISOString()
  });
  assert.strictEqual(res1.quorumSatisfied, false);
  assert.strictEqual(workflow.status, 'pending_quorum');
  assert.strictEqual(workflow.signatures.length, 1);

  // Step 2: Signer 2 (Lender Officer) approves -> Quorum Met -> Status: approved + Outbox generated
  const res2 = processApprovalDecision({
    workflowRequest: workflow,
    signerUser: officerUser,
    mfaVerifiedAt: new Date().toISOString()
  });
  assert.strictEqual(res2.quorumSatisfied, true);
  assert.strictEqual(workflow.status, 'approved');
  assert.strictEqual(workflow.signatures.length, 2);
  assert.ok(workflow.outboxEntry, 'Must generate transaction outbox entry.');
  assert.strictEqual(workflow.outboxEntry.status, 'pending');

  console.log('✔ Workflow State Machine & Outbox Intent Queue: PASSED (Verified)');
}

module.exports = { runWorkflowStateMachineTests };

if (require.main === module) {
  runWorkflowStateMachineTests();
}
