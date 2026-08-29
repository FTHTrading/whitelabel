// ==========================================================================
// UNYKORN ENTERPRISE FABRIC - MASTER TEST RUNNER
// ==========================================================================

const { runTenantIsolationTests } = require('./tenantIsolation.test');
const { runApprovalIntegrityTests } = require('./approvalIntegrity.test');
const { runAuditLedgerTests } = require('./auditLedger.test');

console.log('===============================================================');
console.log('UNYKORN ENTERPRISE FABRIC - AUTOMATED SECURITY TEST SUITE');
console.log('===============================================================');

try {
  runTenantIsolationTests();
  runApprovalIntegrityTests();
  runAuditLedgerTests();
  console.log('===============================================================');
  console.log('ALL SECURITY, ISOLATION & HASH CHAIN TESTS PASSED (3/3)');
  console.log('===============================================================');
  process.exit(0);
} catch (error) {
  console.error('❌ TEST FAILED:', error.message);
  process.exit(1);
}
