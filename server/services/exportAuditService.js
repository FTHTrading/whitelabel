// ==========================================================================
// SERVICE: ENHANCED AUDIT EXPORT RECORDER
// ==========================================================================

const exportLogs = [];

const EXPORT_EVENT_TYPES = {
  REQUESTED: 'audit_export_requested',
  AUTHORIZED: 'audit_export_authorized',
  GENERATED: 'audit_export_generated',
  DOWNLOADED: 'audit_export_downloaded',
  DENIED: 'audit_export_denied',
  RATE_LIMITED: 'audit_export_rate_limited',
  FAILED_VERIFICATION: 'audit_export_ledger_verification_failed',
  EXPIRED: 'audit_export_expired'
};

function recordExportAccess({
  tenantId,
  actorUserId,
  resourceType,
  resourceId,
  exportEventType,
  packageId = null,
  decision,
  reasonCode
}) {
  const exportEvent = {
    exportEventId: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    tenantId,
    actorUserId,
    resourceType,
    resourceId,
    packageId,
    exportEventType,
    decision, // 'allowed', 'denied', 'rate_limited', 'failed_verification'
    reasonCode,
    timestamp: new Date().toISOString()
  };

  exportLogs.push(exportEvent);
  return exportEvent;
}

function getExportLogs(tenantId) {
  if (tenantId) {
    return exportLogs.filter(log => log.tenantId === tenantId);
  }
  return exportLogs;
}

module.exports = {
  EXPORT_EVENT_TYPES,
  recordExportAccess,
  getExportLogs
};
