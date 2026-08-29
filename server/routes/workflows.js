// ==========================================================================
// ROUTES: WORKFLOW REQUESTS & QUORUM APPROVALS
// ==========================================================================

const express = require('express');
const router = express.Router();

const { authenticate } = require('../middleware/authenticate');
const { resolveTenant } = require('../middleware/resolveTenant');
const { computeApprovalTargetHash, processApprovalDecision } = require('../services/workflowStateMachine');

const demoWorkflows = new Map();

/**
 * POST /api/v1/workflows
 * Create a new workflow intent and compute the canonical approval target hash.
 */
router.post('/', authenticate, resolveTenant, (req, res) => {
  const { workflowCode, workflowType, targetAmountUsd, destinationTarget, payload } = req.body;

  const policyVersion = 1;
  const canonicalPayload = payload || { workflowCode, targetAmountUsd, destinationTarget };
  const approvalTargetHash = computeApprovalTargetHash(canonicalPayload, policyVersion);

  const workflow = {
    id: `wf_${Date.now()}`,
    tenantId: req.tenant.tenantId,
    workflowCode: workflowCode || 'DEAL-DRAW-01',
    workflowType: workflowType || 'construction_draw',
    status: 'pending_quorum',
    initiatorUserId: req.user.userId,
    targetAmountUsd: String(targetAmountUsd || '4200000.00'),
    destinationTarget: destinationTarget || '0x8aced25DC8530FDaf0f86D53a0A1E02AAfA7Ac7A',
    approvalTargetHash,
    canonicalPayload,
    policyVersion,
    policy: {
      minDistinctSigners: 2,
      prohibitSelfApproval: true,
      requireRecentMfaMinutes: 15
    },
    signatures: [],
    createdAt: new Date().toISOString()
  };

  demoWorkflows.set(workflow.id, workflow);
  res.status(201).json(workflow);
});

/**
 * POST /api/v1/workflows/:id/approve
 * Submit an approval signature with live credential & MFA revalidation.
 */
router.post('/:id/approve', authenticate, resolveTenant, (req, res) => {
  const workflow = demoWorkflows.get(req.params.id);
  if (!workflow) {
    return res.status(404).json({ error: 'Workflow request not found.' });
  }

  try {
    const result = processApprovalDecision({
      workflowRequest: workflow,
      signerUser: req.user,
      decision: req.body.decision || 'approved',
      mfaVerifiedAt: req.body.mfaVerifiedAt || new Date().toISOString()
    });

    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
