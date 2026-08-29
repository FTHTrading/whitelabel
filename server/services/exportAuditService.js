// ==========================================================================
// SERVICE: EXPORT AUDIT RECORDER (RECORDS EXPORT ACCESS AS AUDIT EVENT)
// ==========================================================================

const exportLogs = [];

function recordExportAccess(tenantId, actorId, resourceId, status) {
  const exportEvent = {
    exportEventId: `exp_${Date.now()}`,
    tenantId,
    actorId,
    resourceId,
    timestamp: new Date().toISOString(),
    status
  };
  exportLogs.push(exportEvent);
  return exportEvent;
}

function getExportLogs() {
  return exportLogs;
}

module.exports = {
  recordExportAccess,
  getExportLogs
};
