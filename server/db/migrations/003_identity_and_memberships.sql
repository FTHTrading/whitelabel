-- ==========================================================================
-- MIGRATION 003: IDENTITY, TENANT MEMBERSHIPS & CREDENTIAL SCHEMAS (FORCE RLS)
-- ==========================================================================

-- 1. USERS TABLE (PLATFORM WIDE IDENTITIES)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    oidc_sub VARCHAR(255) UNIQUE NOT NULL,
    mfa_enforced BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. TENANT MEMBERSHIPS TABLE (RLS ENFORCED & FORCED)
CREATE TABLE IF NOT EXISTS tenant_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    role VARCHAR(64) NOT NULL, -- admin, compliance_officer, loan_officer, architect_reviewer, title_agent, auditor
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_user UNIQUE (tenant_id, user_id)
);

ALTER TABLE tenant_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_memberships FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_memberships_select ON tenant_memberships
    FOR SELECT USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

CREATE POLICY tenant_memberships_insert ON tenant_memberships
    FOR INSERT WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

CREATE POLICY tenant_memberships_update ON tenant_memberships
    FOR UPDATE USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
    WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

CREATE POLICY tenant_memberships_delete ON tenant_memberships
    FOR DELETE USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

-- 3. ORGANIZATION CREDENTIALS TABLE (TIME-BOUND SCOPES & RLS FORCED)
CREATE TABLE IF NOT EXISTS organization_credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    credential_code VARCHAR(64) NOT NULL,
    role_scope VARCHAR(64) NOT NULL,
    max_single_approval_usd NUMERIC(18, 2) NOT NULL,
    effective_at TIMESTAMPTZ NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    is_revoked BOOLEAN NOT NULL DEFAULT false,
    proof_document_hash CHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_cred UNIQUE (tenant_id, credential_code)
);

ALTER TABLE organization_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_credentials FORCE ROW LEVEL SECURITY;

CREATE POLICY org_credentials_select ON organization_credentials
    FOR SELECT USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

CREATE POLICY org_credentials_insert ON organization_credentials
    FOR INSERT WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

-- 4. ENSURE FORCE RLS ON ALL EXISTING TENANT-OWNED TABLES
ALTER TABLE deals FORCE ROW LEVEL SECURITY;
ALTER TABLE audit_events FORCE ROW LEVEL SECURITY;
ALTER TABLE audit_export_events FORCE ROW LEVEL SECURITY;
