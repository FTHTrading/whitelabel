# STRIDE Threat Model & Security Architecture

## 1. STRIDE Analysis Matrix

| Threat Category | Potential Attack Vector | Fabric Mitigation Control |
| :--- | :--- | :--- |
| **Spoofing Identity** | Attacker attempts to impersonate an authorized corporate officer or tenant. | Time-bound cryptographic claims, MFA enforcement, and hostname-verified tenant context. |
| **Tampering with Data** | Modification of historical draw records or valuation evidence. | Append-only database triggers and SHA-256 Merkle hash chaining ($H_n = \text{SHA256}(H_{n-1} \parallel \text{payload}_n)$). |
| **Repudiation** | An approver claims they never signed a $10M draw request. | Canonical payload hashing with immutable signer binding in `approval_signatures`. |
| **Information Disclosure** | Tenant A attempts to view Tenant B's deals or investor allowlists. | PostgreSQL Row-Level Security (RLS) enforced at the database query engine layer. |
| **Denial of Service** | Flooding transaction intent queues. | Role-based limits, API rate limiting, and multi-party quorum gates. |
| **Elevation of Privilege** | An deal creator attempts to self-approve a construction draw. | Anti-self-approval rule engine rejecting single-creator approval and enforcing distinct roles. |
