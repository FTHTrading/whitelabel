-- ==========================================================================
-- MIGRATION 002: AUDIT EXPORT ACCESS & VERIFICATION EVENT LOG
-- ==========================================================================

CREATE TABLE IF NOT EXISTS audit_export_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    export_event_type VARCHAR(64) NOT NULL, -- audit_export_requested, audit_export_authorized, audit_export_generated, audit_export_downloaded, audit_export_denied, audit_export_rate_limited, audit_export_ledger_verification_failed
    actor_user_id VARCHAR(128) NOT NULL,
    resource_type VARCHAR(64) NOT NULL,
    resource_id VARCHAR(128) NOT NULL,
    package_id VARCHAR(128),
    decision VARCHAR(32) NOT NULL, -- allowed, denied, rate_limited, failed_verification
    reason_code VARCHAR(64) NOT NULL,
    client_ip_hash CHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE audit_export_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_export_events_select ON audit_export_events
    FOR SELECT USING (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation_export_events_insert ON audit_export_events
    FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);
