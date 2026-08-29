# Contributing Guidelines

Thank you for your interest in UnyKorn Enterprise Fabric.

## Pull Request Guidelines
1. **Zero Secret Inclusion**: Never commit private keys, real tokens, production connection strings, or personal identity documents.
2. **Tenant Isolation Verification**: All new database queries or API routes must enforce `tenant_id` boundaries.
3. **Automated Test Coverage**: Any change to policy evaluation, approval quorum, or audit hashing must include corresponding automated tests in `server/tests/`.
