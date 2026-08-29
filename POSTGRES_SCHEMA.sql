-- ==========================================================================
-- UNYKORN ENTERPRISE FABRIC - HARDENED POSTGRESQL MULTI-TENANT SCHEMA SPEC
-- ==========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================================================
-- 1. TENANTS & SYSTEM DOMAIN CONFIGURATION
-- ==========================================================================
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(64) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    plan_tier VARCHAR(64) NOT NULL DEFAULT 'evidence_controls', -- evidence_controls, private_credit_desk, issuer_os, sovereign_fabric
    environment VARCHAR(32) NOT NULL DEFAULT 'demo',           -- demo, sandbox, pilot, production
    primary_domain VARCHAR(255) UNIQUE,
    custom_domains JSONB DEFAULT '[]'::jsonb,
    brand_config JSONB DEFAULT '{
        "primary_color": "#E5A93C",
        "accent_color": "#38BDF8",
        "theme": "dark-institutional",
        "disclaimer": "Technology and software infrastructure powered by UnyKorn LLC. All custody, reserve administration, and redemption services performed by authorized partners."
    }'::jsonb,
    module_entitlements JSONB DEFAULT '{
        "credential_hub": true,
        "lending_desk": true,
        "custody_console": true,
        "contract_studio": true,
        "provenance_vault": true
    }'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================================
-- 2. ORGANIZATIONS (Entity Graph)
-- ==========================================================================
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    legal_name VARCHAR(255) NOT NULL,
    jurisdiction VARCHAR(128) NOT NULL,
    ein_tax_id VARCHAR(64),
    lei_code VARCHAR(32),
    entity_type VARCHAR(64) NOT NULL, -- issuer_spv, fund_manager, broker_dealer, custodian, lender, title_escrow
    external_reference VARCHAR(128),
    status VARCHAR(32) DEFAULT 'pending_verification', -- pending_verification, verified, suspended, revoked
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_org_tenant_external_ref_unique 
    ON organizations (tenant_id, external_reference) 
    WHERE external_reference IS NOT NULL;

-- ==========================================================================
-- 3. USERS & MEMBERSHIPS (Multi-Tenant RBAC / ABAC)
-- ==========================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    mfa_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(64) NOT NULL, -- tenant_owner, org_admin, compliance_officer, deal_manager, treasury_operator, architect_reviewer, auditor
    signing_limit_usd NUMERIC(18, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, organization_id, user_id)
);

-- ==========================================================================
-- 4. EVIDENCE VAULT (Immutable Object Metadata)
-- ==========================================================================
CREATE TABLE evidence_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    uploader_user_id UUID NOT NULL REFERENCES users(id),
    file_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(128) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    storage_uri VARCHAR(512) NOT NULL, -- S3/Encrypted Object Storage URI
    sha256_hash VARCHAR(64) NOT NULL,  -- Lowercase 64-character hexadecimal SHA-256
    retention_policy VARCHAR(64) DEFAULT '7_year_statutory',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================================
-- 5. ORGANIZATION CREDENTIAL GRAPH (Time-Bound Verifiable Claims)
-- ==========================================================================
CREATE TABLE credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    credential_type VARCHAR(64) NOT NULL, -- org_kyb, signer_authority, investor_kyc, asset_evidence, custody_wallet, partner_status
    subject_type VARCHAR(64) NOT NULL,    -- organization, user, wallet, asset, partner
    subject_id VARCHAR(255) NOT NULL,     -- UUID or wallet address
    issuer_organization_id UUID REFERENCES organizations(id),
    verifier_organization_id UUID REFERENCES organizations(id),
    claim_topics JSONB NOT NULL,          -- Normalized scope and attribute assertions
    evidence_record_id UUID REFERENCES evidence_records(id),
    canonical_payload_hash VARCHAR(64) NOT NULL,
    status VARCHAR(32) DEFAULT 'active',  -- draft, submitted, active, suspended, expired, revoked
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    effective_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,      -- Mandatory time-bound expiration
    revoked_at TIMESTAMPTZ,
    revocation_reason TEXT,
    version INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================================
-- 6. ASSETS & DEAL ROOMS (Private Credit, RWA & Reserves)
-- ==========================================================================
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    asset_name VARCHAR(255) NOT NULL,
    asset_class VARCHAR(64) NOT NULL, -- commodity_gold, real_estate, private_credit, fine_art
    valuation_usd NUMERIC(18, 2) NOT NULL,
    primary_evidence_id UUID REFERENCES evidence_records(id),
    canonical_asset_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    deal_code VARCHAR(64) NOT NULL,
    deal_type VARCHAR(64) NOT NULL, -- senior_secured_debt, construction_draw, reserve_tranche, digital_security
    facility_amount_usd NUMERIC(18, 2) NOT NULL,
    interest_rate_pricing VARCHAR(64),
    tenor_term VARCHAR(64),
    workflow_stage VARCHAR(64) DEFAULT 'intake', -- intake, underwriting, evidence_review, quorum_approval, escrow_execution, completed
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, deal_code)
);

-- ==========================================================================
-- 7. POLICY & APPROVAL QUORUM (Anti-Self-Approval & Hash Binding)
-- ==========================================================================
CREATE TABLE policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    policy_code VARCHAR(64) NOT NULL,
    event_type VARCHAR(64) NOT NULL,
    conditions JSONB NOT NULL,
    requirements JSONB NOT NULL,
    version INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, policy_code, version)
);

CREATE TABLE approval_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    initiator_user_id UUID NOT NULL REFERENCES users(id),
    policy_id UUID NOT NULL REFERENCES policies(id),
    deal_id UUID REFERENCES deals(id),
    intent_type VARCHAR(64) NOT NULL, -- token_mint, construction_draw, treasury_transfer, contract_deploy
    amount_usd NUMERIC(18, 2) NOT NULL,
    destination_target VARCHAR(255) NOT NULL,
    approval_target_hash VARCHAR(64) NOT NULL, -- SHA256(canonical JSON of deal, action, amount, destination, policy_ver)
    required_quorum INT NOT NULL DEFAULT 2,
    status VARCHAR(32) DEFAULT 'pending',      -- pending, approved, rejected, superseded, executed
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE approval_signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    approval_request_id UUID NOT NULL REFERENCES approval_requests(id) ON DELETE CASCADE,
    signer_user_id UUID NOT NULL REFERENCES users(id),
    signer_organization_id UUID NOT NULL REFERENCES organizations(id),
    signer_role VARCHAR(64) NOT NULL,
    signed_target_hash VARCHAR(64) NOT NULL,  -- Must match approval_requests.approval_target_hash exactly
    signature_timestamp TIMESTAMPTZ DEFAULT NOW(),
    -- Constraint: A single user cannot sign multiple times for the same request
    UNIQUE(approval_request_id, signer_user_id)
);

-- ==========================================================================
-- 8. AUDIT & PROOF VAULT (Append-Only SHA-256 Hash Chain H_n)
-- ==========================================================================
CREATE TABLE audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id),
    actor_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(64) NOT NULL,
    workflow_id VARCHAR(255),
    canonical_payload JSONB NOT NULL,
    previous_event_hash VARCHAR(64) NOT NULL,
    event_hash VARCHAR(64) NOT NULL, -- H_n = SHA256(H_{n-1} || canonical_payload_n)
    merkle_leaf_index BIGSERIAL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- APPEND-ONLY AUDIT TRIGGER
CREATE OR REPLACE FUNCTION protect_audit_ledger()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit events table is strictly append-only. Modification or deletion is prohibited.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_ledger_immutable_trigger
    BEFORE UPDATE OR DELETE ON audit_events
    FOR EACH ROW EXECUTE FUNCTION protect_audit_ledger();

-- ==========================================================================
-- 9. ROW-LEVEL SECURITY (RLS) ENFORCEMENT ON ALL TENANT TABLES
-- ==========================================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY organizations_isolation ON organizations
    FOR ALL USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY memberships_isolation ON memberships
    FOR ALL USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY evidence_isolation ON evidence_records
    FOR ALL USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY credentials_isolation ON credentials
    FOR ALL USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY assets_isolation ON assets
    FOR ALL USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY deals_isolation ON deals
    FOR ALL USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY policies_isolation ON policies
    FOR ALL USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY approval_requests_isolation ON approval_requests
    FOR ALL USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY approval_signatures_isolation ON approval_signatures
    FOR ALL USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY audit_events_isolation ON audit_events
    FOR ALL USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);
