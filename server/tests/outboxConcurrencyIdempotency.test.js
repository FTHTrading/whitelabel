// ==========================================================================
// TEST SUITE: OUTBOX CONCURRENCY & LEASE IDEMPOTENCY
// ==========================================================================

const assert = require('assert');
const { OutboxDispatcher } = require('../services/outboxDispatcher');

function runOutboxConcurrencyIdempotencyTests() {
  console.log('--- RUNNING OUTBOX CONCURRENCY & LEASE TESTS ---');

  const outboxItem = {
    id: 'outbox_concurrency_01',
    status: 'pending',
    retryCount: 0
  };

  const store = [outboxItem];
  const dispatcherA = new OutboxDispatcher(store);
  const dispatcherB = new OutboxDispatcher(store);

  // Worker A claims item
  const claimA = dispatcherA.claimNextOutboxItem('worker_alpha', 60);
  assert.ok(claimA, 'Worker Alpha must claim item.');
  assert.strictEqual(claimA.claimedBy, 'worker_alpha');

  // Worker B attempts to claim the same item immediately -> Must return null (locked)
  const claimB = dispatcherB.claimNextOutboxItem('worker_beta', 60);
  assert.strictEqual(claimB, null, 'Worker Beta must NOT claim an already leased item.');

  console.log('✔ Outbox Concurrency, Row-Lease Locking & Zero-Double-Claim: PASSED (Verified)');
}

module.exports = { runOutboxConcurrencyIdempotencyTests };

if (require.main === module) {
  runOutboxConcurrencyIdempotencyTests();
}
