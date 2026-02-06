# Agent 1 - Volcanic Flaky Tests Fix

**Branch:** `agent-1/fix/flaky-volcanic-test`
**Status:** ✅ COMPLETE - Ready for PM review
**Commit:** f38aa15

## Problem

**Flaky Tests:** 40% failure rate (2/5 runs)

**Tests Affected:**
1. `src/test/unit/moves.test.ts` - "should allow unlimited BANGs with Volcanic"
2. `src/test/e2e/bang-response.test.ts` - "should allow unlimited BANGs with Volcanic weapon"

**Symptom:**
```
[playBang] INVALID_MOVE - validation failed
expect(G.players['0'].bangsPlayedThisTurn).toBe(1);
Expected: 1
Received: 0
```

## Root Cause Analysis

### Systematic Debugging Applied

**Phase 1: Reproduction**
- Reproduced flakiness: Unit test failed 1/20 runs, E2E test failed 3/20 runs
- Combined failure rate: ~10-15% (matches PM's 40% observation when testing both)

**Phase 2: Root Cause**
1. `playBang` validation failed on target check: `isInRange(G, playerId, targetId)`
2. Range check uses: `calculateDistance(G, playerId, targetId) <= getAttackRange(G, playerId)`
3. **Random character assignment** in `setup()` function:
   - `setup()` randomly assigns characters from shuffled deck
   - Could assign **Paul Regret** (distance +1) to target
   - Could assign **Rose Doolan** (distance -1) to attacker
   - These modifiers randomly affect whether target is in range

**Phase 3: Pattern Recognition**
- **Exact same root cause as distance-abilities flaky tests** (fixed on `agent-1/fix/flaky-tests`)
- Same solution pattern applies: Set explicit neutral characters

## Solution

**Fix Applied:**
1. Import `CHARACTERS` in both test files
2. Set explicit neutral characters (Bart Cassidy) for both player 0 and player 1
3. This eliminates distance modifier randomness

**Code Changes:**

```typescript
// BEFORE (flaky):
it('should allow unlimited BANGs with Volcanic', () => {
  G.cardMap['volcanic-1'] = { ... };
  G.players['0'].weapon = G.cardMap['volcanic-1'];

  playBang({ G, ctx }, 'bang-1', '1');  // Sometimes fails!
  expect(G.players['0'].bangsPlayedThisTurn).toBe(1);
});

// AFTER (stable):
it('should allow unlimited BANGs with Volcanic', () => {
  // Set neutral characters to avoid distance modifiers
  const neutralChar = CHARACTERS.find(c => c.id === 'bart-cassidy')!;
  G.players['0'].character = neutralChar;
  G.players['1'].character = neutralChar;

  G.cardMap['volcanic-1'] = { ... };
  G.players['0'].weapon = G.cardMap['volcanic-1'];
  G.players['0'].inPlay.push('volcanic-1'); // Required!

  playBang({ G, ctx }, 'bang-1', '1');  // Always works!
  expect(G.players['0'].bangsPlayedThisTurn).toBe(1);
});
```

**Additional Fix:**
- Added `G.players['0'].inPlay.push('volcanic-1')` - weapons must be in inPlay array (discovered during debugging)
- E2E test: Added `bang-1` to `G.cardMap` (was missing, causing intermittent failures)

## Verification

**Before Fix:**
- Unit test: 1/20 failures (5%)
- E2E test: 3/20 failures (15%)
- Combined: ~10-15% failure rate

**After Fix:**
- Unit test: 20/20 consecutive runs PASS ✅
- E2E test: 20/20 consecutive runs PASS ✅
- Combined: 0% failure rate (100% stable)

```bash
# Unit test verification
for i in {1..20}; do
  npm test -- src/test/unit/moves.test.ts -t "should allow unlimited BANGs with Volcanic" --run
done
# Result: 20/20 PASS

# E2E test verification
for i in {1..20}; do
  npm test -- src/test/e2e/bang-response.test.ts -t "should allow unlimited BANGs with Volcanic weapon" --run
done
# Result: 20/20 PASS
```

## Files Modified

1. `src/test/unit/moves.test.ts`
   - Added `CHARACTERS` import
   - Set neutral characters in Volcanic test
   - Added weapon to inPlay array
2. `src/test/e2e/bang-response.test.ts`
   - Added `CHARACTERS` import
   - Set neutral characters in Volcanic test
   - Added bang-1 to cardMap
   - Added weapon to inPlay array

## Lessons Learned

### Pattern: Random Character Assignment Causes Test Flakiness

**Symptoms:**
- Intermittent test failures (5-40%)
- Target validation failures
- Distance-related failures

**Root Cause:**
- `setup()` function randomly assigns characters
- Characters with distance modifiers (Paul Regret, Rose Doolan) affect range calculations
- Tests fail when random assignment causes target to be out of range

**Solution Pattern:**
- Set explicit neutral characters (e.g., Bart Cassidy)
- Apply to BOTH attacker and target players
- Eliminates randomness in distance calculations

**Files Where This Pattern Applies:**
1. ✅ `src/test/unit/distance-abilities.test.ts` - Fixed on agent-1/fix/flaky-tests
2. ✅ `src/test/unit/moves.test.ts` - Fixed on agent-1/fix/flaky-volcanic-test
3. ✅ `src/test/e2e/bang-response.test.ts` - Fixed on agent-1/fix/flaky-volcanic-test
4. ⚠️ **Potential:** Any other tests that rely on distance/range calculations

### Debugging Insights

1. **Flaky Tests Are Always Reproducible**
   - "Can't reproduce" usually means "didn't try enough times"
   - Run 20+ times to catch 5-15% failure rates
   - Capture failure output immediately when it occurs

2. **Same Root Cause, Same Solution**
   - Distance-abilities fix (agent-1/fix/flaky-tests) used same pattern
   - Recognizing patterns saves debugging time
   - Document patterns for future reference

3. **Test Setup Matters**
   - Different `describe` blocks can have different `beforeEach` setups
   - Check which beforeEach applies to your test
   - Don't assume test setup is same across file

## Next Steps

1. ✅ Branch pushed to GitHub
2. ✅ File locks released
3. ⏳ PM review
4. ⏳ Merge to main
5. ⏳ After merge: death-rewards branch can be merged (was blocked by this)

## Success Criteria Met

- ✅ Both tests pass 20/20 consecutive runs
- ✅ Root cause documented
- ✅ Pattern documented for future reference
- ✅ Same fix pattern as distance-abilities (proven approach)
- ✅ No other tests broken
- ✅ Branch pushed and ready for review
