// ==========================================================================
// SERVICE: CANONICAL PROOF PACKAGE BUILDER
// ==========================================================================

const { verifyLedgerEvents } = require('./ledgerVerifier');
const { recordExportAccess, EXPORT_EVENT_TYPES } = require('./exportAuditService');

function generateProofPackage({ tenant, user, resourceType, resourceId, events, evidenceMetadata }) {
  const packageId = `UEF-PRF-${new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14)}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

  // 1. Verify ledger integrity before exporting
  const verification = verifyLedgerEvents(events);

  // 2. Record export access event
  const exportLog = recordExportAccess({
    tenantId: tenant.tenantId,
    actorUserId: user.userId,
    resourceType,
    resourceId,
    exportEventType: verification.verified ? EXPORT_EVENT_TYPES.GENERATED : EXPORT_EVENT_TYPES.FAILED_VERIFICATION,
    packageId,
    decision: verification.verified ? 'allowed' : 'failed_verification',
    reasonCode: verification.verified ? 'AUTHORIZED_VERIFIED' : 'LEDGER_INTEGRITY_MISMATCH'
  });

  return {
    packageVersion: '1.0',
    packageId,
    environment: tenant.environment || 'sandbox',
    status: verification.verified ? 'generated_and_verified' : 'verification_failed',
    exportEventId: exportLog.exportEventId,
    tenantContext: {
      tenantId: tenant.tenantId,
      displayName: tenant.displayName,
      primaryDomain: tenant.primaryDomain
    },
    resource: {
      resourceType,
      resourceId,
      evidenceMetadata: evidenceMetadata || []
    },
    generatedAtUtc: new Date().toISOString(),
    verification: {
      hashAlgorithm: 'SHA-256',
      canonicalizationVersion: '1.0',
      ledgerVerification: verification.verified ? 'passed' : 'failed',
      verifiedEventsCount: verification.verifiedEventsCount || 0,
      scope: 'tamper-evident operational event record'
    },
    disclaimer: 'This package is a sandbox-generated tamper-evident operational record. It does not independently establish legal validity, asset ownership, reserve sufficiency, payment finality, custody, regulatory compliance, or accuracy of submitted information.',
    genesisHash: events[0]?.previousEventHash || '0'.repeat(64),
    latestEventHash: events[events.length - 1]?.eventHash || null,
    eventChain: events
  };
}

module.exports = { generateProofPackage };
