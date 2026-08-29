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
const { runPostgresRlsIntegrationTests } = require('./postgresRlsIntegration.test');
const { runConnectionPoolTenantLeakageTests } = require('./connectionPoolTenantLeakage.test');

console.log('===============================================================');
console.log('UNYKORN ENTERPRISE FABRIC - MASTER INTEGRATION & RLS TEST SUITE');
console.log('===============================================================');

async function runAll() {
  try {
    runTenantIsolationTests();
    runApprovalIntegrityTests();
    runAuditLedgerTests();
    runAuditExportAuthorizationTests();
    runAuditExportTenantIsolationTests();
    runLedgerVerificationIntegrationTests();
    runOfflineFallbackTests();
    await runPostgresRlsIntegrationTests();
    await runConnectionPoolTenantLeakageTests();
    console.log('===============================================================');
    console.log('ALL 9 SECURITY, ISOLATION, RLS & HASH CHAIN TESTS PASSED (9/9)');
    console.log('===============================================================');
    process.exit(0);
  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
    process.exit(1);
  }
}

runAll();
