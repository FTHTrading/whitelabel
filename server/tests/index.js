// ==========================================================================
// UNYKORN ENTERPRISE FABRIC - MASTER TEST RUNNER
// ==========================================================================

const { runTenantIsolationTests } = require('./tenantIsolation.test');
const { runApprovalIntegrityTests } = require('./approvalIntegrity.test');
const { runAuditLedgerTests } = require('./auditLedger.test');
const { runAuditExportAuthorizationTests } = require('./auditExportAuthorization.test');
const { runAuditExportTenantIsolationTests } = require('./auditExportTenantIsolation.test');
const { runLedgerVerificationIntegrationTests } = require('./ledgerVerificationIntegration.test');
const { runOfflineFallbackTests } = require('./offlineFallback.test');

console.log('===============================================================');
console.log('UNYKORN ENTERPRISE FABRIC - INTEGRATION & SECURITY TEST SUITE');
console.log('===============================================================');

try {
  runTenantIsolationTests();
  runApprovalIntegrityTests();
  runAuditLedgerTests();
  runAuditExportAuthorizationTests();
  runAuditExportTenantIsolationTests();
  runLedgerVerificationIntegrationTests();
  runOfflineFallbackTests();
  console.log('===============================================================');
  console.log('ALL 7 SECURITY, ISOLATION & VERIFICATION TEST SUITES PASSED');
  console.log('===============================================================');
  process.exit(0);
} catch (error) {
  console.error('❌ TEST FAILED:', error.message);
  process.exit(1);
}
