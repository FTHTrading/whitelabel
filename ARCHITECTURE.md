# UnyKorn Enterprise Fabric: Technical Architecture & Security Model

## 1. Multi-Tenant Isolation Model

Every table in UnyKorn Enterprise Fabric enforces multi-tenancy at the relational schema layer via PostgreSQL Row-Level Security (RLS).

```
   [ Client Request with Session JWT / Custom Domain Hostname ]
                                 │
                                 ▼
               [ Fastify / Express Edge Middleware ]
          - Resolve Tenant from Hostname & User Membership
          - Bind Transaction Session: set_config('app.tenant_id', UUID)
                                 │
                                 ▼
                 [ PostgreSQL Row-Level Security ]
          - Policy: USING (tenant_id = current_setting('app.tenant_id')::uuid)
          - Policy: WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid)
                                 │
                                 ▼
                     [ Tenant Isolated Rows ]
```

### RLS Invariants
1. `tenant_id` is mandatory (`NOT NULL`) on all 10 core tables.
2. Composite unique constraints prevent cross-tenant enumeration (e.g. `UNIQUE(tenant_id, external_ref)`).
3. The runtime database role is strictly separated from migration/superuser roles.

---

## 2. Organization Credential Graph Schema

Credentials represent time-bound cryptographic attestations. Each credential record contains:
* **Subject**: The UUID or address of the entity, user, wallet, or asset.
* **Claim Topics**: Structured JSON containing regulatory scope, accredited status, or signing thresholds.
* **Evidence Record**: Foreign key linking to the SHA-256 encrypted object reference.
* **Lifecycle**: `issued_at`, `effective_at`, `expires_at`, `revoked_at`, and `revocation_reason`.

---

## 3. Anti-Self-Approval & Quorum Policy Engine

To prevent insider compromise and satisfy SOX/SOC2 audit controls:
1. **Approval Target Hash Binding**:
   $$\text{approval\_target\_hash} = \text{SHA256}(\text{canonical\_json}(\text{deal}, \text{action}, \text{amount}, \text{destination}, \text{policy\_ver}))$$
2. **Distinct Signer Constraint**:
   `UNIQUE(approval_request_id, signer_user_id)` ensures a single individual cannot provide multiple signatures for the same intent.
3. **Automatic Invalidation**:
   Any material parameter change (e.g. amount increase, new destination address) updates the canonical hash and invalidates prior signatures.

---

## 4. Tamper-Evident Hash Chain ($H_n$)

The audit vault enforces an immutable append-only ledger through a database trigger:
```sql
CREATE TRIGGER audit_ledger_immutable_trigger
    BEFORE UPDATE OR DELETE ON audit_events
    FOR EACH ROW EXECUTE FUNCTION protect_audit_ledger();
```

Each event is linked to its predecessor using canonical JSON serialization:
$$H_n = \text{SHA256}(H_{n-1} \parallel \text{canonical\_payload}_n)$$
