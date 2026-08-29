// ==========================================================================
// SERVICE: LEDGER INTEGRITY VERIFIER
// ==========================================================================

const { computeChainedEventHash } = require('../canonicalizer');

function verifyLedgerEvents(events) {
  if (!Array.isArray(events) || events.length === 0) {
    return { verified: false, reason: 'Empty or invalid event list.' };
  }

  for (let i = 0; i < events.length; i++) {
    const current = events[i];
    
    // Check previous event hash link
    if (i > 0) {
      const prev = events[i - 1];
      if (current.previousEventHash !== prev.eventHash) {
        return {
          verified: false,
          brokenIndex: i,
          reason: `Broken chain link at index ${i}: previousEventHash mismatch.`
        };
      }
    }

    // Verify canonical payload hash match
    const recalculated = computeChainedEventHash(current.previousEventHash, current.canonicalPayload);
    if (recalculated.eventHash !== current.eventHash) {
      return {
        verified: false,
        brokenIndex: i,
        reason: `Hash calculation mismatch at index ${i}: payload tampered or non-canonical.`
      };
    }
  }

  return { verified: true, verifiedEventsCount: events.length };
}

module.exports = { verifyLedgerEvents };
