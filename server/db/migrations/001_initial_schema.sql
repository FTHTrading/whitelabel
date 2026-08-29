-- ==========================================================================
-- MIGRATION 001: INITIAL MULTI-TENANT SCHEMA & ROW-LEVEL SECURITY
-- ==========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TENANTS TABLE
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(64) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    environment VARCHAR(32) NOT NULL DEFAULT 'sandbox', -- demo, sandbox, pilot, production
    primary_domain VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. DEALS TABLE (RLS ENFORCED)
CREATE TABLE IF NOT EXISTS deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    deal_code VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    deal_type VARCHAR(64) NOT NULL,
    facility_amount_usd NUMERIC(18, 2) NOT NULL,
    workflow_stage VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tenant_deal UNIQUE (tenant_id, deal_code)
);

ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_deals_select ON deals
    FOR SELECT USING (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation_deals_insert ON deals
    FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation_deals_update ON deals
    FOR UPDATE USING (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation_deals_delete ON deals
    FOR DELETE USING (tenant_id = current_setting('app.tenant_id', true)::uuid);

-- 3. AUDIT EVENTS TABLE (APPEND-ONLY & RLS ENFORCED)
CREATE TABLE IF NOT EXISTS audit_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    event_type VARCHAR(64) NOT NULL,
    workflow_id VARCHAR(128) NOT NULL,
    actor_id VARCHAR(128) NOT NULL,
    canonical_payload JSONB NOT NULL,
    previous_event_hash CHAR(64) NOT NULL,
    event_hash CHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_audit_select ON audit_events
    FOR SELECT USING (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation_audit_insert ON audit_events
    FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

-- Append-only enforcement trigger
CREATE OR REPLACE FUNCTION prevent_audit_tampering()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit events are strictly append-only. UPDATE and DELETE operations are prohibited.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_events_immutable ON audit_events;
CREATE TRIGGER trg_audit_events_immutable
    BEFORE UPDATE OR DELETE ON audit_events
    FOR EACH ROW EXECUTE FUNCTION prevent_audit_tampering();
