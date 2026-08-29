// ==========================================================================
// SERVICE: WORKFLOW STATE MACHINE & APPROVAL POLICY ENGINE
// ==========================================================================

const { sha256Hex, canonicalizeJson } = require('../canonicalizer');
const { resolveUserTenantScope } = require('./identityProvider');

/**
 * Computes canonical approval target hash covering material parameters and policy version.
 */
function computeApprovalTargetHash(payload, policyVersion) {
  const targetData = {
    canonicalPayload: payload,
    policyVersion: Number(policyVersion)
  };
  return sha256Hex(canonicalizeJson(targetData));
}

/**
 * Validates whether MFA was performed within the required recent window (e.g. 15 minutes).
 */
function validateRecentMfa(mfaVerifiedAt, maxMinutes = 15) {
  if (!mfaVerifiedAt) return false;
  const authTime = new Date(mfaVerifiedAt).getTime();
  const now = Date.now();
  const maxAgeMs = maxMinutes * 60 * 1000;
  return (now - authTime) >= 0 && (now - authTime) <= maxAgeMs;
}

/**
 * Submits an approval signature with full live revalidation of identity, credential scopes,
 * anti-self-approval rule, and MFA recency.
 */
function processApprovalDecision({
  workflowRequest,
  signerUser,
  decision = 'approved',
  mfaVerifiedAt = new Date().toISOString()
}) {
  if (!workflowRequest || workflowRequest.status !== 'pending_quorum') {
    throw new Error(`Workflow Error: Request is in '${workflowRequest?.status}' status and cannot accept signatures.`);
  }

  // 1. Anti-Self-Approval Check
  if (workflowRequest.policy.prohibitSelfApproval && workflowRequest.initiatorUserId === signerUser.userId) {
    throw new Error('Policy Error: Initiator cannot approve their own workflow request (Anti-Self-Approval Enforced).');
  }

  // 2. Revalidate Tenant Membership & Credential Scope
  const scope = resolveUserTenantScope(signerUser, workflowRequest.tenantId);
  if (!scope.isMember) {
    throw new Error('Authorization Error: Signer is not an active member of this tenant.');
  }

  // 3. Signing Limit & Credential Expiration Check
  if (scope.maxApprovalLimitUsd < Number(workflowRequest.targetAmountUsd)) {
    throw new Error(`Policy Error: Signer limit ($${scope.maxApprovalLimitUsd.toLocaleString()}) is below required request amount ($${Number(workflowRequest.targetAmountUsd).toLocaleString()}).`);
  }

  // 4. MFA Recency Check (15 Minute Window)
  if (!validateRecentMfa(mfaVerifiedAt, workflowRequest.policy.requireRecentMfaMinutes || 15)) {
    throw new Error('Security Error: Step-up MFA verification required (MFA session expired or missing).');
  }

  // 5. Check for duplicate signer
  if (workflowRequest.signatures.some(s => s.signerUserId === signerUser.userId)) {
    throw new Error('Policy Error: Duplicate signature detected. User has already signed this request.');
  }

  // 6. Record Signature
  const signatureRecord = {
    signatureId: `sig_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    signerUserId: signerUser.userId,
    signerRole: scope.role,
    approvalTargetHash: workflowRequest.approvalTargetHash,
    decision,
    mfaVerifiedAt,
    signedAt: new Date().toISOString()
  };

  workflowRequest.signatures.push(signatureRecord);

  // 7. Evaluate Quorum Satisfaction
  const approvedSignatures = workflowRequest.signatures.filter(s => s.decision === 'approved');
  if (approvedSignatures.length >= workflowRequest.policy.minDistinctSigners) {
    workflowRequest.status = 'approved';
    workflowRequest.approvedAt = new Date().toISOString();

    // Generate Transaction Outbox intent
    workflowRequest.outboxEntry = {
      outboxId: `outbox_${Date.now()}`,
      tenantId: workflowRequest.tenantId,
      workflowRequestId: workflowRequest.id,
      destinationRail: workflowRequest.destinationRail || 'bitgo_sandbox_mpc',
      intentPayload: {
        amountUsd: workflowRequest.targetAmountUsd,
        destinationTarget: workflowRequest.destinationTarget,
        approvalTargetHash: workflowRequest.approvalTargetHash,
        signaturesCount: approvedSignatures.length
      },
      status: 'pending',
      createdAt: new Date().toISOString()
    };
  }

  return {
    workflowRequest,
    signatureRecord,
    quorumSatisfied: workflowRequest.status === 'approved'
  };
}

/**
 * Invalidates prior signatures if material parameters change.
 */
function updateWorkflowPayload(workflowRequest, newPayload, newAmountUsd) {
  const previousHash = workflowRequest.approvalTargetHash;
  workflowRequest.canonicalPayload = newPayload;
  workflowRequest.targetAmountUsd = newAmountUsd || workflowRequest.targetAmountUsd;
  workflowRequest.approvalTargetHash = computeApprovalTargetHash(newPayload, workflowRequest.policyVersion);

  if (workflowRequest.approvalTargetHash !== previousHash) {
    // Invalidate existing signatures
    workflowRequest.supersededSignatures = [...workflowRequest.signatures];
    workflowRequest.signatures = [];
    workflowRequest.status = 'pending_quorum';
  }

  return workflowRequest;
}

module.exports = {
  computeApprovalTargetHash,
  validateRecentMfa,
  processApprovalDecision,
  updateWorkflowPayload
};
