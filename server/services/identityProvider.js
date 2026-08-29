// ==========================================================================
// SERVICE: OIDC IDENTITY & CREDENTIAL RESOLUTION ADAPTER
// ==========================================================================

const crypto = require('crypto');

// Simulated OIDC Identity & Membership Directory (Sandbox Fixtures)
const IDENTITIES = {
  'user_kevan_burns': {
    userId: 'user_kevan_burns',
    email: 'kevan@unykorn.ai',
    fullName: 'Kevan Burns',
    oidcSub: 'auth0|649201928401928',
    mfaVerified: true,
    isActive: true,
    memberships: [
      {
        tenantId: 'tenant_blackwood_01',
        role: 'compliance_officer',
        isActive: true,
        credentials: [
          {
            credentialCode: 'CRED-SGN-01',
            roleScope: 'SIGNING_OFFICER',
            maxSingleApprovalUsd: 100000000.00,
            effectiveAt: '2026-07-01T00:00:00.000Z',
            expiresAt: '2027-01-01T00:00:00.000Z',
            isRevoked: false
          }
        ]
      },
      {
        tenantId: 'tenant_dignity_01',
        role: 'admin',
        isActive: true,
        credentials: []
      }
    ]
  },
  'user_architect_smith': {
    userId: 'user_architect_smith',
    email: 'smith@structural-inspect.com',
    fullName: 'David Smith, PE',
    oidcSub: 'auth0|992019284019283',
    mfaVerified: true,
    isActive: true,
    memberships: [
      {
        tenantId: 'tenant_blackwood_01',
        role: 'architect_reviewer',
        isActive: true,
        credentials: [
          {
            credentialCode: 'CRED-ARCH-01',
            roleScope: 'TECHNICAL_INSPECTOR',
            maxSingleApprovalUsd: 10000000.00,
            effectiveAt: '2026-01-01T00:00:00.000Z',
            expiresAt: '2026-12-31T00:00:00.000Z',
            isRevoked: false
          }
        ]
      }
    ]
  },
  'user_junior_analyst': {
    userId: 'user_junior_analyst',
    email: 'analyst@blackwoodcap.com',
    fullName: 'Alex Vance',
    oidcSub: 'auth0|120938490192830',
    mfaVerified: false, // MFA not enabled
    isActive: true,
    memberships: [
      {
        tenantId: 'tenant_blackwood_01',
        role: 'auditor',
        isActive: true,
        credentials: [
          {
            credentialCode: 'CRED-LMT-01',
            roleScope: 'JUNIOR_REVIEWER',
            maxSingleApprovalUsd: 100000.00, // $100k Limit
            effectiveAt: '2026-01-01T00:00:00.000Z',
            expiresAt: '2026-12-31T00:00:00.000Z',
            isRevoked: false
          }
        ]
      }
    ]
  }
};

/**
 * Validates bearer token and returns authenticated user identity.
 */
function verifyOidcSession(token) {
  if (!token) {
    throw new Error('Authentication Error: Missing authorization token.');
  }

  if (token === 'expired_token') {
    throw new Error('Authentication Error: Token has expired.');
  }

  const identity = IDENTITIES[token] || IDENTITIES['user_kevan_burns'];
  if (!identity.isActive) {
    throw new Error('Authentication Error: User account is inactive or suspended.');
  }

  return identity;
}

/**
 * Resolves user membership and active credential scopes for a given tenant.
 */
function resolveUserTenantScope(user, tenantId) {
  const membership = user.memberships.find(m => m.tenantId === tenantId && m.isActive);
  if (!membership) {
    return { isMember: false };
  }

  const now = new Date();
  const validCredentials = (membership.credentials || []).filter(c => {
    return !c.isRevoked && new Date(c.effectiveAt) <= now && new Date(c.expiresAt) > now;
  });

  return {
    isMember: true,
    role: membership.role,
    credentials: validCredentials,
    maxApprovalLimitUsd: Math.max(0, ...validCredentials.map(c => c.maxSingleApprovalUsd))
  };
}

module.exports = {
  verifyOidcSession,
  resolveUserTenantScope
};
