// ==========================================================================
// UNYKORN ENTERPRISE FABRIC - CANONICAL PAYLOAD SERIALIZER & HASH ENGINE
// ==========================================================================

const crypto = require('crypto');

/**
 * Deterministically sorts object keys recursively to produce a standard canonical JSON string.
 */
function canonicalizeJson(obj) {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    return '[' + obj.map(canonicalizeJson).join(',') + ']';
  }

  const sortedKeys = Object.keys(obj).sort();
  const pairs = sortedKeys.map(key => {
    return JSON.stringify(key) + ':' + canonicalizeJson(obj[key]);
  });

  return '{' + pairs.join(',') + '}';
}

/**
 * Calculates SHA-256 hash formatted as a lowercase 64-character hexadecimal string.
 */
function sha256Hex(data) {
  return crypto.createHash('sha256').update(data, 'utf8').digest('hex').toLowerCase();
}

/**
 * Computes chained event hash H_n = SHA256(H_{n-1} || canonical_payload_n)
 */
function computeChainedEventHash(previousEventHash, canonicalPayload) {
  const serialized = canonicalizeJson(canonicalPayload);
  const combined = (previousEventHash || '0'.repeat(64)) + serialized;
  return {
    payloadHash: sha256Hex(serialized),
    eventHash: sha256Hex(combined)
  };
}

module.exports = {
  canonicalizeJson,
  sha256Hex,
  computeChainedEventHash
};
