// ==========================================================================
// TEST SUITE: LIVE CREDENTIAL & MFA REVALIDATION AT SIGNING TIME
// ==========================================================================

const assert = require('assert');
const { computeApprovalTargetHash, processApprovalDecision } = require('../services/workflowStateMachine');
const { verifyOidcSession } = require('../services/identityProvider');

function runCredentialRevalidationAtSigningTests() {
  console.log('--- RUNNING LIVE CREDENTIAL & MFA REVALIDATION TESTS ---');

  const payload = { dealCode: 'DEAL-LDX-99', drawAmountUsd: '4200000.00' };

  const workflow = {
    id: 'wf_revalidation_test',
    tenantId: 'tenant_blackwood_01',
    status: 'pending_quorum',
    initiatorUserId: 'user_originator',
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

  const officerUser = verifyOidcSession('user_kevan_burns');

  // Test 1: MFA older than 15 minutes is rejected
  const expiredMfaTimestamp = new Date(Date.now() - 20 * 60 * 1000).toISOString(); // 20 mins ago
  assert.throws(() => {
    processApprovalDecision({
      workflowRequest: workflow,
      signerUser: officerUser,
      mfaVerifiedAt: expiredMfaTimestamp
    });
  }, /Step-up MFA verification required/);

  // Test 2: Valid recent MFA timestamp (<15 mins) succeeds
  const recentMfaTimestamp = new Date(Date.now() - 2 * 60 * 1000).toISOString(); // 2 mins ago
  const res = processApprovalDecision({
    workflowRequest: workflow,
    signerUser: officerUser,
    mfaVerifiedAt: recentMfaTimestamp
  });
  assert.strictEqual(res.signatureRecord.signerUserId, 'user_kevan_burns');

  console.log('✔ Live Credential & Step-Up MFA Recency Revalidation: PASSED (Verified)');
}

module.exports = { runCredentialRevalidationAtSigningTests };

if (require.main === module) {
  runCredentialRevalidationAtSigningTests();
}
