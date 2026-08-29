-- ==========================================================================
-- MIGRATION 005: OUTBOX DISPATCHER, EXTENDED STATES & LEASE LOCKING
-- ==========================================================================

-- 1. UPDATE WORKFLOW REQUEST STATUS CHECK CONSTRAINT
ALTER TABLE workflow_requests DROP CONSTRAINT IF EXISTS chk_workflow_status;
ALTER TABLE workflow_requests ADD CONSTRAINT chk_workflow_status CHECK (
    status IN (
        'draft',
        'submitted',
        'pending_quorum',
        'rejected',
        'approved',
        'execution_queued',
        'executing',
        'executed',
        'execution_failed',
        'cancelled',
        'expired',
        'superseded',
        'reconciliation_required'
    )
);

-- 2. EXTEND TRANSACTION OUTBOX WITH IDEMPOTENCY, LEASING & RECONCILIATION
ALTER TABLE transaction_outbox ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(128) UNIQUE;
ALTER TABLE transaction_outbox ADD COLUMN IF NOT EXISTS approval_target_hash CHAR(64);
ALTER TABLE transaction_outbox ADD COLUMN IF NOT EXISTS claimed_by VARCHAR(128);
ALTER TABLE transaction_outbox ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ;
ALTER TABLE transaction_outbox ADD COLUMN IF NOT EXISTS lease_expires_at TIMESTAMPTZ;
ALTER TABLE transaction_outbox ADD COLUMN IF NOT EXISTS available_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE transaction_outbox ADD COLUMN IF NOT EXISTS max_attempts INT NOT NULL DEFAULT 3;
ALTER TABLE transaction_outbox ADD COLUMN IF NOT EXISTS last_error TEXT;
ALTER TABLE transaction_outbox ADD COLUMN IF NOT EXISTS reconciliation_reason TEXT;

-- 3. UNIQUE INDEX: PREVENT MULTIPLE DISPATCH INTENTS FOR SAME REVISION
CREATE UNIQUE INDEX IF NOT EXISTS uq_outbox_workflow_revision
    ON transaction_outbox (tenant_id, workflow_request_id, approval_target_hash)
    WHERE status IN ('pending', 'processing', 'completed');

-- 4. CONCURRENCY INDEX ON APPROVAL ATTESTATIONS (PREVENT DUPLICATE APPROVER SUBMISSIONS)
CREATE UNIQUE INDEX IF NOT EXISTS uq_approval_attestation_actor_target
    ON approval_signatures (tenant_id, workflow_request_id, approval_target_hash, signer_user_id)
    WHERE decision = 'approved';
