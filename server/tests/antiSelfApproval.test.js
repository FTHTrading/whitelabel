// ==========================================================================
// TEST SUITE: ANTI-SELF-APPROVAL ENFORCEMENT
// ==========================================================================

const assert = require('assert');
const { computeApprovalTargetHash, processApprovalDecision } = require('../services/workflowStateMachine');
const { verifyOidcSession } = require('../services/identityProvider');

function runAntiSelfApprovalTests() {
  console.log('--- RUNNING ANTI-SELF-APPROVAL ENFORCEMENT TESTS ---');

  const officerUser = verifyOidcSession('user_kevan_burns');
  const payload = { dealCode: 'DEAL-LDX-99', drawAmountUsd: '4200000.00' };

  const workflowInitiatedByOfficer = {
    id: 'wf_self_approve_test',
    tenantId: 'tenant_blackwood_01',
    status: 'pending_quorum',
    initiatorUserId: officerUser.userId, // Initiated by Kevan Burns
    targetAmountUsd: '4200000.00',
    destinationTarget: '0x8aced25dc8530fdaf0f86d53a0a1e02aafa7ac7a',
    approvalTargetHash: computeApprovalTargetHash(payload, 1),
    canonicalPayload: payload,
    policyVersion: 1,
    policy: {
      minDistinctSigners: 2,
      prohibitSelfApproval: true,
      requireRecentMfaMinutes: 15
    },
    signatures: []
  };

  // Attempting to self-approve must be rejected by policy engine
  assert.throws(() => {
    processApprovalDecision({
      workflowRequest: workflowInitiatedByOfficer,
      signerUser: officerUser,
      mfaVerifiedAt: new Date().toISOString()
    });
  }, /Anti-Self-Approval Enforced/);

  console.log('✔ Anti-Self-Approval Rejection Gating: PASSED (Verified)');
}

module.exports = { runAntiSelfApprovalTests };

if (require.main === module) {
  runAntiSelfApprovalTests();
}
