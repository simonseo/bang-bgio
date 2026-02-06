# Agent 1 - AI Character Selection Fix

**Branch:** `agent-1/fix/ai-character-selection`
**Status:** ✅ COMPLETE - Ready for testing
**Date:** 2026-02-06

## Problem

**User Experience:**
- Human player selects character (e.g., Rose Doolan)
- Gets confirmation: "Character Selected! You chose: Rose Doolan"
- Sees: "Waiting for other players to select their characters..."
- **Game stuck forever** - AI players never select characters

**Root Cause:**
- AI logic in `AIPlayer.ts` only handles `play` phase
- No code path for `characterSelection` phase
- When AI player's turn in characterSelection phase → AI does nothing → infinite wait

## Root Cause Investigation

Following systematic debugging process:

### Evidence Gathered

1. **AIManager.tsx (line 113)**: Calls `playAITurn(G, ctx, moves, currentPlayer)` for ALL AI turns
2. **AIPlayer.ts playAITurn function**: Only has logic for `play` phase
   - Line 18-22: Draw cards (play phase only)
   - Line 24+: Action phase (play phase only)
   - **No `if (ctx.phase === 'characterSelection')` branch**

3. **phases.ts characterSelection**: Exists and works correctly
   - Has `selectCharacter` move
   - Transitions to `play` phase when all players select
   - Turn order cycles correctly

4. **Test Pattern**: `gameFlow.test.ts` shows correct pattern:
   ```typescript
   if (currentState.ctx.phase === 'characterSelection') {
     const choice = currentState.G.players[currentPlayer].characterChoices[0];
     client.moves.selectCharacter(choice.id);
   }
   ```

### Pattern Analysis

**Working Examples:**
- Human player: UI calls `moves.selectCharacter(characterId)`
- Tests: Manual loop checks phase and calls `selectCharacter`

**Broken:**
- AI player: `playAITurn` has no phase check → never calls `selectCharacter`

### Hypothesis

**Hypothesis:** Adding character selection logic to `playAITurn` will fix the issue.

AI needs to:
1. Check if `ctx.phase === 'characterSelection'`
2. Get player's `characterChoices[0]` (first choice)
3. Call `moves.selectCharacter(choice.id)`

## Solution Implemented (TDD)

### RED - Failing Test

Created `src/test/unit/ai-character-selection.test.ts`:

```typescript
it('should select first character choice during characterSelection phase', () => {
  // Setup: Game state in characterSelection phase
  const mockG = {
    players: {
      '1': {
        hasSelectedCharacter: false,
        characterChoices: [
          { id: 'bart-cassidy', name: 'Bart Cassidy', ... },
          { id: 'willy-the-kid', name: 'Willy the Kid', ... },
        ],
        // ... other properties
      }
    }
  };

  const mockCtx = { currentPlayer: '1', phase: 'characterSelection' };
  let selectedCharacterId = null;

  const mockMoves = {
    selectCharacter: (id) => { selectedCharacterId = id; }
  };

  // Execute
  playAITurn(mockG, mockCtx, mockMoves, '1');

  // Assert: AI should select first character
  expect(selectedCharacterId).toBe('bart-cassidy');
});
```

**Verified RED:**
```
FAIL: expected null to be 'bart-cassidy'
```

✅ Test fails because AI doesn't select a character (exactly what we expected)

### GREEN - Minimal Fix

Added phase check to `AIPlayer.ts`:

```typescript
export function playAITurn(G: BangGameState, ctx: any, moves: any, playerID: string): void {
  const player = G.players[playerID];

  // Skip if dead
  if (player.isDead) {
    moves.passTurn();
    return;
  }

  // Character Selection Phase - select first character
  if (ctx.phase === 'characterSelection') {
    if (!player.hasSelectedCharacter && player.characterChoices && player.characterChoices.length > 0) {
      moves.selectCharacter(player.characterChoices[0].id);
    }
    return;
  }

  // Phase 1: Draw cards if haven't yet
  // ... rest of play phase logic
}
```

**Key Points:**
- Check phase BEFORE attempting play phase actions
- Only select if not already selected
- Select first character choice (simple AI strategy)
- Early return to prevent play phase logic from executing

**Verified GREEN:**
```
✓ src/test/unit/ai-character-selection.test.ts (2 tests) 1ms
  Test Files  1 passed (1)
  Tests  2 passed (2)
```

✅ Both tests pass!

### Verification

**All Project Tests:**
```
Test Files  23 passed (23)
Tests  257 passed | 3 skipped (260)
```

✅ No regressions!

## Files Modified

1. **src/ai/AIPlayer.ts**
   - Added character selection phase check (lines 18-24)
   - Checks `ctx.phase === 'characterSelection'`
   - Selects first character if not already selected
   - Early return prevents play phase logic

2. **src/test/unit/ai-character-selection.test.ts** (NEW)
   - Test: AI selects first character during characterSelection phase
   - Test: AI doesn't re-select if already selected
   - Both tests passing ✅

3. **.docs/AGENT_1_AI_CHARACTER_SELECTION_FIX.md** (NEW)
   - This documentation

## Testing Checklist

**Automated Tests:**
- [x] AI selects character during characterSelection phase
- [x] AI doesn't re-select if already selected
- [x] All 257 project tests pass
- [x] No regressions

**Browser Testing:**
- [ ] Start local game with 4 players
- [ ] Human player selects character
- [ ] AI players automatically select characters (1 second delay each)
- [ ] Game transitions to play phase after all select
- [ ] Normal gameplay proceeds

## Expected Behavior After Fix

1. **Character Selection Phase:**
   - Human player sees 2 character choices
   - Human selects one → confirmation screen
   - Shows "Waiting for other players..."
   - **NEW:** AI players automatically select first character (1 sec delay each)
   - After all 4 selections → phase transitions to `play`

2. **Play Phase:**
   - Normal Bang! gameplay proceeds
   - AI plays turns automatically
   - Human player can play cards, respond to attacks, etc.

## Implementation Notes

**Why select first character?**
- Simple AI strategy (no complex evaluation needed)
- Guarantees fast selection (no decision paralysis)
- Can be enhanced later with character quality scoring

**Why check hasSelectedCharacter?**
- Prevents double-selection if function called multiple times
- Safety guard for edge cases

**Why early return?**
- Prevents play phase logic from executing
- Clean separation of phase-specific logic
- Easy to understand and maintain

## Next Steps

1. ✅ Tests pass
2. ✅ Branch created: `agent-1/fix/ai-character-selection`
3. ⏳ Browser testing (user verification)
4. ⏳ Commit and push to GitHub
5. ⏳ Merge to main if approved

## Related Issues

- Fixes: Game stuck after character selection (reported 2026-02-06)
- Related: `agent-1/feature/character-selection-fix` - Added character selection UI
- This fix: Makes AI players actually select characters

Together, these two branches create a complete character selection experience:
- UI for human players ✅
- Automatic selection for AI players ✅

## Code Quality

**Follows TDD Process:**
- ✅ RED: Wrote failing test first
- ✅ Verified test failed correctly
- ✅ GREEN: Wrote minimal code to pass
- ✅ Verified test passed
- ✅ Verified no regressions (all tests pass)

**Follows Systematic Debugging:**
- ✅ Phase 1: Root cause investigation (identified missing phase check)
- ✅ Phase 2: Pattern analysis (found working examples in tests)
- ✅ Phase 3: Hypothesis and testing (single minimal change)
- ✅ Phase 4: Implementation (TDD with failing test first)
