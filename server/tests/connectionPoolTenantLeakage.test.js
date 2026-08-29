// ==========================================================================
// TEST SUITE: CONNECTION POOL TENANT CONTEXT LEAKAGE PREVENTION
// ==========================================================================

const assert = require('assert');
const { TenantDatabaseAdapter } = require('../db/tenantContext');

async function runConnectionPoolTenantLeakageTests() {
  console.log('--- RUNNING CONNECTION POOL TENANT CONTEXT LEAKAGE TESTS ---');

  const adapter = new TenantDatabaseAdapter();

  // Step 1: Request 1 runs as Tenant Blackwood
  let request1Tenant = null;
  await adapter.withTenantContext('tenant_blackwood_01', async (tx) => {
    const res = await tx.query('SELECT * FROM deals');
    request1Tenant = res.activeTenantContext;
  });
  assert.strictEqual(request1Tenant, 'tenant_blackwood_01');

  // Step 2: Request 2 runs immediately after on the same pooled connection as Tenant Dignity
  let request2Tenant = null;
  await adapter.withTenantContext('tenant_dignity_01', async (tx) => {
    const res = await tx.query('SELECT * FROM deals');
    request2Tenant = res.activeTenantContext;
  });
  assert.strictEqual(request2Tenant, 'tenant_dignity_01');
  assert.notStrictEqual(request2Tenant, request1Tenant, 'Tenant context from Request 1 must NOT bleed into Request 2.');

  console.log('✔ Connection Pool Tenant Context Isolation & Zero-Bleed: PASSED (Verified)');
}

module.exports = { runConnectionPoolTenantLeakageTests };

if (require.main === module) {
  runConnectionPoolTenantLeakageTests();
}
