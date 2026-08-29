// ==========================================================================
// TEST SUITE: APPROVAL TARGET HASH INVALIDATION ON MATERIAL CHANGE
// ==========================================================================

const assert = require('assert');
const { computeApprovalTargetHash, processApprovalDecision, updateWorkflowPayload } = require('../services/workflowStateMachine');
const { verifyOidcSession } = require('../services/identityProvider');

function runApprovalTargetHashInvalidationTests() {
  console.log('--- RUNNING APPROVAL TARGET HASH INVALIDATION TESTS ---');

  const architectUser = verifyOidcSession('user_architect_smith');
  const payloadV1 = { dealCode: 'DEAL-LDX-99', drawAmountUsd: '4200000.00' };

  const workflow = {
    id: 'wf_invalidation_test',
    tenantId: 'tenant_blackwood_01',
    status: 'pending_quorum',
    initiatorUserId: 'user_originator',
    targetAmountUsd: '4200000.00',
    destinationTarget: '0x8aced25dc8530fdaf0f86d53a0a1e02aafa7ac7a',
    approvalTargetHash: computeApprovalTargetHash(payloadV1, 1),
    canonicalPayload: payloadV1,
    policyVersion: 1,
    policy: {
      minDistinctSigners: 2,
      prohibitSelfApproval: true,
      requireRecentMfaMinutes: 15
    },
    signatures: []
  };

  // Signer 1 approves V1
  processApprovalDecision({
    workflowRequest: workflow,
    signerUser: architectUser,
    mfaVerifiedAt: new Date().toISOString()
  });
  assert.strictEqual(workflow.signatures.length, 1);

  // Material change: Deal amount modified to $4.5M
  const payloadV2 = { dealCode: 'DEAL-LDX-99', drawAmountUsd: '4500000.00' };
  updateWorkflowPayload(workflow, payloadV2, '4500000.00');

  // Must invalidate prior signatures
  assert.strictEqual(workflow.signatures.length, 0, 'Prior signatures must be cleared upon material change.');
  assert.strictEqual(workflow.supersededSignatures.length, 1, 'Superseded signatures must be archived.');

  console.log('✔ Approval Target Hash Invalidation & Signature Reset: PASSED (Verified)');
}

module.exports = { runApprovalTargetHashInvalidationTests };

if (require.main === module) {
  runApprovalTargetHashInvalidationTests();
}
