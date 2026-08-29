// ==========================================================================
// UNYKORN ENTERPRISE FABRIC - MASTER TEST RUNNER (13 TEST SUITES)
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
const { runOidcAuthenticationTests } = require('./oidcAuthentication.test');
const { runMembershipResolutionTests } = require('./membershipResolution.test');
const { runCredentialScopeAuthorizationTests } = require('./credentialScopeAuthorization.test');
const { runForcedRlsFailClosedTests } = require('./forcedRlsFailClosed.test');

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
    runOidcAuthenticationTests();
    runMembershipResolutionTests();
    runCredentialScopeAuthorizationTests();
    runForcedRlsFailClosedTests();
    console.log('===============================================================');
    console.log('ALL 13 SECURITY, IDENTITY, RLS & HASH CHAIN TESTS PASSED (13/13)');
    console.log('===============================================================');
    process.exit(0);
  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
    process.exit(1);
  }
}

runAll();
