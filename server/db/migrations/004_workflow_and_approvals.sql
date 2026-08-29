-- ==========================================================================
-- MIGRATION 004: WORKFLOW STATE MACHINE, APPROVALS & OUTBOX (FORCE RLS)
-- ==========================================================================

-- 1. WORKFLOW POLICIES TABLE
CREATE TABLE IF NOT EXISTS workflow_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    policy_code VARCHAR(64) NOT NULL,
    version INT NOT NULL DEFAULT 1,
    min_distinct_signers INT NOT NULL DEFAULT 2,
    required_roles JSONB NOT NULL, -- e.g. ["architect_reviewer", "title_agent", "lender_officer"]
    prohibit_self_approval BOOLEAN NOT NULL DEFAULT true,
    require_recent_mfa_minutes INT NOT NULL DEFAULT 15,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_policy_ver UNIQUE (tenant_id, policy_code, version)
);

ALTER TABLE workflow_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_policies FORCE ROW LEVEL SECURITY;

CREATE POLICY workflow_policies_select ON workflow_policies
    FOR SELECT USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

CREATE POLICY workflow_policies_insert ON workflow_policies
    FOR INSERT WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

-- 2. WORKFLOW REQUESTS TABLE
CREATE TABLE IF NOT EXISTS workflow_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    organization_id UUID NOT NULL,
    workflow_code VARCHAR(64) NOT NULL,
    workflow_type VARCHAR(64) NOT NULL, -- construction_draw, token_mint, treasury_transfer
    status VARCHAR(32) NOT NULL DEFAULT 'pending_quorum', -- draft, pending_quorum, approved, executed, superseded, rejected
    initiator_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    target_amount_usd NUMERIC(18, 2) NOT NULL,
    destination_target VARCHAR(255) NOT NULL,
    approval_target_hash CHAR(64) NOT NULL,
    canonical_payload JSONB NOT NULL,
    policy_id UUID NOT NULL REFERENCES workflow_policies(id) ON DELETE RESTRICT,
    policy_version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE workflow_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_requests FORCE ROW LEVEL SECURITY;

CREATE POLICY workflow_requests_select ON workflow_requests
    FOR SELECT USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

CREATE POLICY workflow_requests_insert ON workflow_requests
    FOR INSERT WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

CREATE POLICY workflow_requests_update ON workflow_requests
    FOR UPDATE USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
    WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

-- 3. APPROVAL SIGNATURES TABLE
CREATE TABLE IF NOT EXISTS approval_signatures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    workflow_request_id UUID NOT NULL REFERENCES workflow_requests(id) ON DELETE RESTRICT,
    signer_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    signer_role VARCHAR(64) NOT NULL,
    approval_target_hash CHAR(64) NOT NULL,
    decision VARCHAR(32) NOT NULL, -- approved, rejected
    mfa_verified_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_workflow_signer UNIQUE (workflow_request_id, signer_user_id)
);

ALTER TABLE approval_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_signatures FORCE ROW LEVEL SECURITY;

CREATE POLICY approval_signatures_select ON approval_signatures
    FOR SELECT USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

CREATE POLICY approval_signatures_insert ON approval_signatures
    FOR INSERT WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

-- 4. TRANSACTION OUTBOX TABLE (TRANSACTION-SAFE INTENT HANDOFF)
CREATE TABLE IF NOT EXISTS transaction_outbox (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    workflow_request_id UUID NOT NULL REFERENCES workflow_requests(id) ON DELETE RESTRICT,
    destination_rail VARCHAR(64) NOT NULL, -- bitgo_sandbox_mpc, flashrouter_polygon, flashrouter_xrpl
    intent_payload JSONB NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
    retry_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

ALTER TABLE transaction_outbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_outbox FORCE ROW LEVEL SECURITY;

CREATE POLICY transaction_outbox_select ON transaction_outbox
    FOR SELECT USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

CREATE POLICY transaction_outbox_insert ON transaction_outbox
    FOR INSERT WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);
