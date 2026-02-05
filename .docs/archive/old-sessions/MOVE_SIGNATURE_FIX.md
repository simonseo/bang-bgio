# Move Function Signature Fix

## Problem
**Error:** `Cannot read properties of undefined (reading 'undefined')`
**Location:** `validation.ts:15` and `moves.ts:414`

## Root Cause Analysis (Following Systematic Debugging)

### Phase 1: Investigation

**Error Message Analysis:**
- "reading 'undefined'" means accessing a property on `undefined`
- Stack trace showed: `G.players[playerId]` was `undefined`
- This meant `playerId` was `undefined` or didn't exist in `G.players`

**Data Flow Tracing:**
- `playerId = ctx.currentPlayer`
- But `ctx.currentPlayer` was `undefined`
- Why? Because `ctx` parameter wasn't actually the context object!

### Phase 2: Pattern Analysis

**Checked boardgame.io documentation:**
```bash
grep -A5 "clickCell" .docs/boardgame.io/docs/documentation/tutorial.md
```

**Found:**
```typescript
clickCell: ({ G, playerID }, id) => {
  G.cells[id] = playerID;
},
```

**Compared with our code:**
```typescript
export function playBang(G: BangGameState, ctx: GameCtx, cardId: string, targetId: string)
```

**Difference identified:** Move functions receive an OBJECT as first parameter, not separate G and ctx!

### Phase 3: Hypothesis and Testing

**Hypothesis:** Our move functions have wrong signature. BoardGame.io passes `{ G, ctx, playerID }` as single object, but we're treating them as separate parameters.

**Test:** Created failing test in `src/test/unit/moves.test.ts`

**Result:** ✅ Test reproduced the exact error

### Phase 4: Implementation

**Fixed ALL move function signatures from:**
```typescript
export function playBang(G: BangGameState, ctx: GameCtx, cardId: string, targetId: string)
```

**To:**
```typescript
export function playBang({ G, ctx }: { G: BangGameState; ctx: GameCtx }, cardId: string, targetId: string)
```

## Functions Fixed

1. ✅ playBang
2. ✅ playMissed
3. ✅ useBarrel
4. ✅ takeDamage
5. ✅ playBeer
6. ✅ playSaloon
7. ✅ playStagecoach
8. ✅ playWellsFargo
9. ✅ playPanic
10. ✅ playCatBalou
11. ✅ equipCard
12. ✅ passTurn
13. ✅ discardCards

(standardDraw already had correct signature)

## Test Results

**Unit Test:**
```
✓ src/test/unit/moves.test.ts  (2 tests) 2ms
  ✓ playBang should receive { G, ctx } object
  ✓ equipCard should receive { G, ctx } object
```

**Integration Test:**
```
✓ src/test/integration/gameInitialization.test.tsx  (2 tests) 195ms
  ✓ should initialize game and pass correct props
  ✓ should have game state with players and turnOrder
```

## Updated Documentation

Updated `BOARDGAME_IO_PATTERNS.md` to emphasize correct move signature:

```typescript
// ✅ CORRECT - Receives object with { G, ctx }
export function myMove({ G, ctx }: { G: GameState; ctx: Ctx }, arg1: string) {
  const playerId = ctx.currentPlayer;
  G.someValue = arg1;
}

// ❌ WRONG - Separate parameters
export function myMove(G: GameState, ctx: Ctx, arg1: string)
```

## Verification

1. ✅ Unit tests pass
2. ✅ Integration tests pass
3. ✅ No regressions
4. ✅ Documentation updated

## Next Step

Refresh browser and test actual gameplay - equipCard and playBang should now work!
