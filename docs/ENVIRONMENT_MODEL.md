# Environment Governance & Operational Model

The platform strictly separates environments across four distinct operational tiers:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                             ENVIRONMENT GOVERNANCE MATRIX                              │
├──────────────┬────────────────────────┬────────────────────────┬───────────────────────┤
│ Layer        │ Demo                   │ Sandbox                │ Production            │
├──────────────┼────────────────────────┼────────────────────────┼───────────────────────┤
│ Database     │ Static/Mock Fixtures   │ Test PostgreSQL with RLS│ Isolated Production DB│
│ Credentials  │ Illustrative Samples   │ Test KYC/KYB Claims    │ Verified Legal Records│
│ Custody      │ Simulated Mock Handoff │ BitGo Sandbox API      │ BitGo Production MPC  │
│ Blockchain   │ Simulated Receipts     │ Testnets (Amoy, Sepolia)│ Mainnet (Audited Only)│
│ PII / Docs   │ Synthetic Only         │ Synthetic Only         │ Encrypted / KMS Guard │
└──────────────┴────────────────────────┴────────────────────────┴───────────────────────┘
```

> **Crucial Rule**: The active environment state is resolved server-side from deployment infrastructure, not from client-side UI toggles.
