// ==========================================================================
// TEST SUITE: POSTGRESQL ROW-LEVEL SECURITY & TRANSACTION CONTEXT
// ==========================================================================

const assert = require('assert');
const { TenantDatabaseAdapter } = require('../db/tenantContext');

async function runPostgresRlsIntegrationTests() {
  console.log('--- RUNNING POSTGRESQL RLS INTEGRATION TESTS ---');

  const adapter = new TenantDatabaseAdapter();

  // Test 1: Query with tenant_blackwood_01 context executes successfully
  let executedTenantContext = null;
  await adapter.withTenantContext('tenant_blackwood_01', async (tx) => {
    const res = await tx.query('SELECT * FROM deals WHERE deal_code = $1', ['DEAL-LDX-99']);
    executedTenantContext = res.activeTenantContext;
  });
  assert.strictEqual(executedTenantContext, 'tenant_blackwood_01', 'Transaction must set app.tenant_id.');

  // Test 2: Missing tenant ID must fail closed
  await assert.rejects(async () => {
    await adapter.withTenantContext(null, async () => {});
  }, /Tenant ID is required/);

  console.log('✔ PostgreSQL Transaction-Scoped RLS Setting: PASSED (Verified)');
}

module.exports = { runPostgresRlsIntegrationTests };

if (require.main === module) {
  runPostgresRlsIntegrationTests();
}
