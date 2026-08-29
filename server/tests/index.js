// ==========================================================================
// UNYKORN ENTERPRISE FABRIC - MASTER TEST RUNNER (21 TEST SUITES)
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
const { runWorkflowStateMachineTests } = require('./workflowStateMachine.test');
const { runAntiSelfApprovalTests } = require('./antiSelfApproval.test');
const { runApprovalTargetHashInvalidationTests } = require('./approvalTargetHashInvalidation.test');
const { runCredentialRevalidationAtSigningTests } = require('./credentialRevalidationAtSigning.test');
const { runOutboxDispatcherTests } = require('./outboxDispatcher.test');
const { runOutboxConcurrencyIdempotencyTests } = require('./outboxConcurrencyIdempotency.test');
const { runOutboxRevalidationFailureTests } = require('./outboxRevalidationFailure.test');
const { runOutboxReconciliationStateTests } = require('./outboxReconciliationState.test');

console.log('===============================================================');
console.log('UNYKORN ENTERPRISE FABRIC - MASTER OUTBOX & WORKFLOW TEST SUITE');
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
    runWorkflowStateMachineTests();
    runAntiSelfApprovalTests();
    runApprovalTargetHashInvalidationTests();
    runCredentialRevalidationAtSigningTests();
    await runOutboxDispatcherTests();
    runOutboxConcurrencyIdempotencyTests();
    await runOutboxRevalidationFailureTests();
    runOutboxReconciliationStateTests();
    console.log('===============================================================');
    console.log('ALL 21 SECURITY, OUTBOX, RLS & DISPATCHER TESTS PASSED (21/21)');
    console.log('===============================================================');
    process.exit(0);
  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
    process.exit(1);
  }
}

runAll();
