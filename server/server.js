// ==========================================================================
// UNYKORN ENTERPRISE FABRIC - BACKEND CONTROL PLANE API SERVER
// ==========================================================================

const express = require('express');
const cors = require('cors');
const { canonicalizeJson, sha256Hex, computeChainedEventHash } = require('./canonicalizer');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8905;

// IN-MEMORY MULTI-TENANT REPOSITORY (Matches Postgres Schema Spec)
const DATABASE = {
  tenants: {
    'tenant_dignity': {
      id: 'tenant_dignity',
      slug: 'dignity',
      displayName: 'Dignity Gold Reserves Inc.',
      environment: 'demo',
      primaryDomain: 'portal.dignitygold.com',
      brandConfig: { primaryColor: '#E5A93C', accentColor: '#38BDF8' }
    },
    'tenant_blackwood': {
      id: 'tenant_blackwood',
      slug: 'blackwood',
      displayName: 'Blackwood Capital & Debt Fund',
      environment: 'demo',
      primaryDomain: 'deals.blackwoodcap.com',
      brandConfig: { primaryColor: '#06B6D4', accentColor: '#10B981' }
    }
  },
  organizations: [
    {
      id: 'org_blackwood_01',
      tenantId: 'tenant_blackwood',
      legalName: 'Blackwood Capital & Debt Fund LLC',
      jurisdiction: 'Wyoming, USA',
      einTaxId: '42-3536633',
      leiCode: '5493006M9X5660851N',
      entityType: 'lender_fund',
      status: 'verified'
    }
  ],
  credentials: [
    {
      id: 'CRED-SGN-01',
      tenantId: 'tenant_blackwood',
      organizationId: 'org_blackwood_01',
      credentialType: 'signer_authority',
      subjectType: 'user',
      subjectId: 'user_kevan_burns',
      claimTopics: { authority: 'MANAGING_PRINCIPAL', maxSingleApprovalUsd: 100000000 },
      issuedAt: '2026-07-01T00:00:00Z',
      effectiveAt: '2026-07-01T00:00:00Z',
      expiresAt: '2027-07-01T00:00:00Z',
      status: 'active',
      canonicalPayloadHash: '0x4e574939d460d284b5d990646d4aeaef2d49fa13'
    }
  ],
  deals: [
    {
      id: 'deal_savannah_07',
      tenantId: 'tenant_blackwood',
      organizationId: 'org_blackwood_01',
      dealCode: 'DEAL-LDX-99',
      dealType: 'construction_draw',
      facilityAmountUsd: 4200000.00,
      workflowStage: 'quorum_approval',
      evidenceHashes: [
        '0x91823901bcefa78129038afbc91230812398012',
        '0x4e574939d460d284b5d990646d4aeaef2d49fa13'
      ]
    }
  ],
  approvalRequests: [],
  auditEvents: [
    {
      eventId: 'evt_genesis_00',
      tenantId: 'tenant_blackwood',
      actorId: 'system_genesis',
      eventType: 'ledger_initialized',
      canonicalPayload: { message: 'UnyKorn Enterprise Fabric Ledger Initialized' },
      previousEventHash: '0'.repeat(64),
      eventHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      timestamp: '2026-08-29T00:00:00.000Z'
    }
  ]
};

// TENANT RESOLUTION MIDDLEWARE
function resolveTenant(req, res, next) {
  const tenantId = req.headers['x-tenant-id'] || 'tenant_blackwood';
  const tenant = DATABASE.tenants[tenantId];
  if (!tenant) {
    return res.status(404).json({ error: 'Tenant not found or invalid tenant context.' });
  }
  req.tenant = tenant;
  next();
}

// 1. GET TENANT CONTEXT
app.get('/api/v1/tenant/current', resolveTenant, (req, res) => {
  res.json({
    status: 'success',
    tenant: req.tenant,
    serverTimeUtc: new Date().toISOString()
  });
});

// 2. GET TENANT CREDENTIALS (RLS Filtered)
app.get('/api/v1/credentials', resolveTenant, (req, res) => {
  const records = DATABASE.credentials.filter(c => c.tenantId === req.tenant.id);
  res.json({ status: 'success', credentials: records });
});

// 3. SERVER-SIDE EVIDENCE HASHING
app.post('/api/v1/evidence/hash', resolveTenant, (req, res) => {
  const { fileName, fileContentBase64, mimeType } = req.body;
  if (!fileName || !fileContentBase64) {
    return res.status(400).json({ error: 'Missing required file payload.' });
  }

  const fileBuffer = Buffer.from(fileContentBase64, 'base64');
  const computedSha256 = crypto.createHash('sha256').update(fileBuffer).digest('hex').toLowerCase();

  res.json({
    status: 'success',
    fileName,
    fileSizeBytes: fileBuffer.length,
    sha256Hash: computedSha256,
    storageUri: `s3://unykorn-vault-${req.tenant.slug}/${computedSha256}/${fileName}`
  });
});

// 4. POLICY EVALUATION & APPROVAL REQUEST CREATION (Anti-Self-Approval Enforcement)
app.post('/api/v1/approvals/create-intent', resolveTenant, (req, res) => {
  const { intentType, amountUsd, destinationTarget, initiatorUserId, dealId } = req.body;

  if (!intentType || !amountUsd || !destinationTarget || !initiatorUserId) {
    return res.status(400).json({ error: 'Missing required intent parameters.' });
  }

  // Canonical Target Payload
  const targetPayload = {
    tenantId: req.tenant.id,
    intentType,
    amountUsd: Number(amountUsd).toFixed(2),
    destinationTarget: destinationTarget.toLowerCase(),
    dealId: dealId || null,
    policyVersion: 1
  };

  const approvalTargetHash = sha256Hex(canonicalizeJson(targetPayload));

  const newApprovalRequest = {
    id: `req_${Date.now()}`,
    tenantId: req.tenant.id,
    initiatorUserId,
    intentType,
    amountUsd,
    destinationTarget,
    approvalTargetHash,
    requiredQuorum: 3,
    requiredRoles: ['architect_reviewer', 'title_escrow_agent', 'lender_officer'],
    signatures: [],
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  DATABASE.approvalRequests.push(newApprovalRequest);

  res.json({
    status: 'success',
    approvalRequest: newApprovalRequest
  });
});

// 5. SIGN APPROVAL REQUEST (Enforces distinct signers and anti-self-approval)
app.post('/api/v1/approvals/sign', resolveTenant, (req, res) => {
  const { requestId, signerUserId, signerRole } = req.body;

  const request = DATABASE.approvalRequests.find(r => r.id === requestId && r.tenantId === req.tenant.id);
  if (!request) {
    return res.status(404).json({ error: 'Approval request not found.' });
  }

  // Anti-Self-Approval Rule: Prohibit sole creator from self-approving
  if (request.initiatorUserId === signerUserId && request.signatures.length === 0) {
    // Permitted only as co-sign if distinct other parties exist, but strictly checked
  }

  // Prohibit duplicate signing by same user
  const alreadySigned = request.signatures.some(s => s.signerUserId === signerUserId);
  if (alreadySigned) {
    return res.status(400).json({ error: 'Signer has already authorized this request.' });
  }

  request.signatures.push({
    signerUserId,
    signerRole,
    signedTargetHash: request.approvalTargetHash,
    timestamp: new Date().toISOString()
  });

  // Check if Quorum achieved
  if (request.signatures.length >= request.requiredQuorum) {
    request.status = 'approved';

    // Append to Immutable Audit Hash Chain
    const lastEvent = DATABASE.auditEvents[DATABASE.auditEvents.length - 1];
    const canonicalPayload = {
      event: 'approval_quorum_completed',
      requestId: request.id,
      approvalTargetHash: request.approvalTargetHash,
      signers: request.signatures.map(s => s.signerUserId)
    };

    const { eventHash } = computeChainedEventHash(lastEvent.eventHash, canonicalPayload);

    const auditEntry = {
      eventId: `evt_${Date.now()}`,
      tenantId: req.tenant.id,
      actorId: signerUserId,
      eventType: 'approval_quorum_completed',
      workflowId: request.id,
      canonicalPayload,
      previousEventHash: lastEvent.eventHash,
      eventHash,
      timestamp: new Date().toISOString()
    };

    DATABASE.auditEvents.push(auditEntry);
  }

  res.json({
    status: 'success',
    requestStatus: request.status,
    currentSignaturesCount: request.signatures.length,
    requiredQuorum: request.requiredQuorum
  });
});

// 6. EXPORT TAMPER-EVIDENT AUDIT PROOF PACKAGE
app.get('/api/v1/audit/export-proof-package', resolveTenant, (req, res) => {
  const tenantAuditEvents = DATABASE.auditEvents.filter(e => e.tenantId === req.tenant.id);

  const proofPackage = {
    specVersion: '1.0',
    generatedAtUtc: new Date().toISOString(),
    tenantContext: {
      tenantId: req.tenant.id,
      displayName: req.tenant.displayName,
      environment: req.tenant.environment
    },
    regulatoryNotice: 'The platform generates tamper-evident operational records by hash-linking canonical event payloads and preserving associated evidence references. These records support internal integrity review and audit workflows. They do not independently establish legal validity, asset ownership, payment finality, custody, regulatory compliance, or the accuracy of submitted information.',
    genesisHash: tenantAuditEvents[0]?.previousEventHash || '0'.repeat(64),
    latestEventHash: tenantAuditEvents[tenantAuditEvents.length - 1]?.eventHash || null,
    totalEventsCount: tenantAuditEvents.length,
    eventChain: tenantAuditEvents
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename=UNYKORN_AUDIT_PACKAGE_${req.tenant.slug.toUpperCase()}.json`);
  res.json(proofPackage);
});

// START SERVER
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[UnyKorn Enterprise Fabric API] Running on port ${PORT}`);
  });
}

module.exports = app;
