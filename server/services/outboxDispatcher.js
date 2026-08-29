// ==========================================================================
// SERVICE: IDEMPOTENT TRANSACTION OUTBOX DISPATCHER & REVALIDATION
// ==========================================================================

const { resolveUserTenantScope } = require('./identityProvider');
const { computeApprovalTargetHash } = require('./workflowStateMachine');

class OutboxDispatcher {
  constructor(outboxStore = []) {
    this.outboxStore = outboxStore;
  }

  /**
   * Safe queue claim using lease locking (simulates SELECT ... FOR UPDATE SKIP LOCKED).
   */
  claimNextOutboxItem(workerId, leaseDurationSeconds = 60) {
    const now = Date.now();
    const item = this.outboxStore.find(i => {
      const isAvailable = (i.status === 'pending' || (i.status === 'processing' && i.leaseExpiresAt && new Date(i.leaseExpiresAt).getTime() < now));
      return isAvailable && (!i.availableAt || new Date(i.availableAt).getTime() <= now);
    });

    if (!item) return null;

    item.status = 'processing';
    item.claimedBy = workerId;
    item.claimedAt = new Date().toISOString();
    item.leaseExpiresAt = new Date(now + leaseDurationSeconds * 1000).toISOString();
    item.retryCount = (item.retryCount || 0) + 1;

    return item;
  }

  /**
   * Immediate Pre-Execution Revalidation before dispatching external intent.
   * Ensures that no credentials expired, no roles were revoked, and no material changes occurred
   * during the window between quorum consensus and outbox worker pickup.
   */
  revalidatePreExecutionState(workflowRequest, approversList = []) {
    if (!workflowRequest) {
      return { valid: false, reason: 'WORKFLOW_NOT_FOUND' };
    }

    // 1. Workflow must be in 'approved' or 'execution_queued' state
    if (workflowRequest.status !== 'approved' && workflowRequest.status !== 'execution_queued') {
      return { valid: false, reason: `INVALID_WORKFLOW_STATE_${workflowRequest.status.toUpperCase()}` };
    }

    // 2. Re-verify that canonical approval target hash matches current payload
    const currentHash = computeApprovalTargetHash(workflowRequest.canonicalPayload, workflowRequest.policyVersion);
    if (currentHash !== workflowRequest.approvalTargetHash) {
      return { valid: false, reason: 'APPROVAL_TARGET_HASH_MISMATCH' };
    }

    // 3. Revalidate that all required approvers still hold active, unrevoked credentials
    for (const approver of approversList) {
      const scope = resolveUserTenantScope(approver.user, workflowRequest.tenantId);
      if (!scope.isMember || scope.maxApprovalLimitUsd < Number(workflowRequest.targetAmountUsd)) {
        return {
          valid: false,
          reason: `APPROVER_CREDENTIAL_INVALIDATED_${approver.user.userId.toUpperCase()}`
        };
      }
    }

    return { valid: true };
  }

  /**
   * Executes bounded sandbox intent handoff to simulated custody/settlement boundary.
   */
  async processOutboxItem(outboxItem, workflowRequest, approversList = [], workerId = 'worker_node_01') {
    // 1. Pre-execution revalidation
    const validation = this.revalidatePreExecutionState(workflowRequest, approversList);
    if (!validation.valid) {
      outboxItem.status = 'reconciliation_required';
      outboxItem.reconciliationReason = validation.reason;
      workflowRequest.status = 'reconciliation_required';
      return {
        success: false,
        status: 'reconciliation_required',
        reason: validation.reason
      };
    }

    // 2. Dispatch to Sandbox Adapter (BitGo / FlashRouter Simulator)
    try {
      workflowRequest.status = 'executing';

      const executionReceipt = {
        adapterRequestId: `bitgo_sandbox_req_${Date.now()}`,
        destinationRail: outboxItem.destinationRail || 'bitgo_sandbox_mpc',
        status: 'confirmed_sandbox',
        amountUsd: outboxItem.intentPayload.amountUsd,
        targetHash: outboxItem.approvalTargetHash,
        executedAt: new Date().toISOString()
      };

      outboxItem.status = 'completed';
      outboxItem.processedAt = new Date().toISOString();
      outboxItem.executionReceipt = executionReceipt;

      workflowRequest.status = 'executed';
      workflowRequest.executedAt = new Date().toISOString();

      return {
        success: true,
        status: 'executed',
        receipt: executionReceipt
      };
    } catch (err) {
      if (outboxItem.retryCount >= (outboxItem.maxAttempts || 3)) {
        outboxItem.status = 'reconciliation_required';
        outboxItem.reconciliationReason = `MAX_RETRY_EXCEEDED: ${err.message}`;
        workflowRequest.status = 'reconciliation_required';
      } else {
        outboxItem.status = 'pending'; // retry
        outboxItem.availableAt = new Date(Date.now() + 5000).toISOString(); // 5s backoff
        outboxItem.lastError = err.message;
        workflowRequest.status = 'execution_queued';
      }

      return {
        success: false,
        status: outboxItem.status,
        error: err.message
      };
    }
  }
}

module.exports = { OutboxDispatcher };
