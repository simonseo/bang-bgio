# Agent 1 - Flaky Tests Fix

## Branch: agent-1/fix/flaky-tests

**Status:** ✅ COMPLETE - Ready for review

## Problem

**TODO Item:** "2 flaky unit tests - 90/92 pass consistently"

Tests in `distance-abilities.test.ts` were intermittently failing:
- Failed 1/5 to 1/10 test runs
- Specifically: "should add 1 to distance when targeting Paul Regret"

## Root Cause Analysis

**Systematic Debugging Applied:**

1. **Identified flaky test:** Ran tests 10 times, found `distance-abilities.test.ts` failed intermittently
2. **Reproduced failure:** Confirmed 1/20 failure rate
3. **Root cause:**
   - `setup()` randomly assigns characters to players
   - Could assign **Rose Doolan** (distance -1) to player 0
   - This counteracted **Paul Regret** (distance +1) on player 1
   - Result: Expected distance 2, got 1

## Solution

**Fixed all tests in distance-abilities.test.ts:**

- Explicitly set player 0 to neutral character (Bart Cassidy)
- Explicitly set all target players to neutral characters
- Prevents random character assignment from affecting distance calculations

**Example fix:**
```typescript
// BEFORE (flaky):
it('should add 1 to distance when targeting Paul Regret', () => {
  const paulRegret = CHARACTERS.find(c => c.id === 'paul-regret')!;
  G.players['1'].character = paulRegret;  // Player 0 could be Rose Doolan!

  const distance = calculateDistance(G, '0', '1');
  expect(distance).toBe(2);  // FLAKY - sometimes 1, sometimes 2
});

// AFTER (stable):
it('should add 1 to distance when targeting Paul Regret', () => {
  // Set player 0 to known neutral character
  const neutralChar = CHARACTERS.find(c => c.id === 'bart-cassidy')!;
  G.players['0'].character = neutralChar;

  const paulRegret = CHARACTERS.find(c => c.id === 'paul-regret')!;
  G.players['1'].character = paulRegret;

  const distance = calculateDistance(G, '0', '1');
  expect(distance).toBe(2);  // ALWAYS 2 now
});
```

## Verification

**Before fix:** 90-95% pass rate (1-2 failures per 20 runs)
**After fix:** 100% pass rate (20/20 consecutive runs) ✅

```bash
for i in {1..20}; do
  npx vitest run src/test/unit/distance-abilities.test.ts 2>&1 | grep "Test Files"
done | sort | uniq -c
```

Result: `20  Test Files  1 passed (1)`

## Files Modified

- `src/test/unit/distance-abilities.test.ts` - Fixed 6 tests to use neutral characters

## Commits

1. `858f499` - fix: Eliminate flakiness in distance-abilities tests
2. `52c7a73` - [DONE] Release lock - flaky tests fixed

## Next Steps

- Ready for code review
- Can be merged to main
- Resolves Known Issue: "2 flaky unit tests"
