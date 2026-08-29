// ==========================================================================
// TEST SUITE: PRE-EXECUTION REVALIDATION FAILURE (REVOKED CREDENTIAL CATCH)
// ==========================================================================

const assert = require('assert');
const { OutboxDispatcher } = require('../services/outboxDispatcher');
const { computeApprovalTargetHash } = require('../services/workflowStateMachine');
const { verifyOidcSession } = require('../services/identityProvider');

async function runOutboxRevalidationFailureTests() {
  console.log('--- RUNNING PRE-EXECUTION REVALIDATION FAILURE TESTS ---');

  const officerUser = verifyOidcSession('user_kevan_burns');

  // Simulate that an approver had their credential revoked after approval occurred
  const revokedApprover = {
    user: {
      ...officerUser,
      memberships: [
        {
          tenantId: 'tenant_blackwood_01',
          role: 'compliance_officer',
          isActive: true,
          credentials: [
            {
              credentialCode: 'CRED-SGN-01',
              isRevoked: true // REVOKED POST-APPROVAL
            }
          ]
        }
      ]
    }
  };

  const payload = { dealCode: 'DEAL-LDX-99', drawAmountUsd: '4200000.00' };
  const targetHash = computeApprovalTargetHash(payload, 1);

  const workflow = {
    id: 'wf_revocation_test',
    tenantId: 'tenant_blackwood_01',
    status: 'approved',
    targetAmountUsd: '4200000.00',
    approvalTargetHash: targetHash,
    canonicalPayload: payload,
    policyVersion: 1
  };

  const outboxItem = {
    id: 'outbox_revocation_01',
    tenantId: 'tenant_blackwood_01',
    workflowRequestId: 'wf_revocation_test',
    approvalTargetHash: targetHash,
    intentPayload: { amountUsd: '4200000.00' },
    status: 'processing',
    retryCount: 1
  };

  const dispatcher = new OutboxDispatcher([outboxItem]);

  // Attempting to dispatch must fail pre-execution check and transition to reconciliation_required
  const res = await dispatcher.processOutboxItem(
    outboxItem,
    workflow,
    [revokedApprover],
    'worker_01'
  );

  assert.strictEqual(res.success, false);
  assert.strictEqual(res.status, 'reconciliation_required');
  assert.strictEqual(workflow.status, 'reconciliation_required');
  assert.strictEqual(outboxItem.status, 'reconciliation_required');
  assert.ok(outboxItem.reconciliationReason.includes('APPROVER_CREDENTIAL_INVALIDATED'));

  console.log('✔ Pre-Dispatch Revocation Interception & Reconciliation Gating: PASSED (Verified)');
}

module.exports = { runOutboxRevalidationFailureTests };

if (require.main === module) {
  runOutboxRevalidationFailureTests();
}
