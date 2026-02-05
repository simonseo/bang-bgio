# Proper Fix: Removed Double-Nested Props Workaround

## Previous Issue

The game was using a **hacky workaround** for double-nested props:

```typescript
// BAD - Old workaround
const actualG = (props as any).G?.G || (props as any).G || props;
const G = actualG;
const ctx = (props as any).ctx;
const moves = (props as any).moves;
const playerID = (props as any).playerID;
```

This was causing:
- ❌ playerView filtering being bypassed
- ❌ Role visibility bug (all roles visible)
- ❌ Confusing code that's hard to maintain
- ❌ Unclear data flow

## Root Cause

The double-nesting was caused by **wrapping functions** in `Game.ts`:

```typescript
// BAD - Wrapping creates extra nesting
playerView: (G, ctx, playerID) => bangPlayerView(G, ctx, playerID),
endIf: (G, ctx) => endGameCheck(G, ctx),
```

BoardGame.io expects direct function references, not wrapped functions!

## Proper Fix

### 1. Fixed Game.ts (Removed Function Wrapping)

```typescript
// GOOD - Direct function references
playerView: bangPlayerView,
endIf: endGameCheck,
```

### 2. Fixed GameBoard.tsx (Standard Props Destructuring)

```typescript
// GOOD - Standard React props destructuring
export const GameBoard: React.FC<GameBoardProps> = ({ G, ctx, moves, playerID }) => {
  // Use G directly - it's already filtered by playerView!
  const player = G.players[playerID];
  // ...
}
```

## Benefits

✅ **Clean code** - Standard boardgame.io patterns
✅ **playerView works correctly** - Filtering applied properly
✅ **Role visibility fixed** - HIDDEN roles stay hidden
✅ **Maintainable** - Clear data flow
✅ **No type casting** - Proper TypeScript types

## Verification

After this fix, role visibility should work correctly:

1. **Your role:** Visible to you
2. **Sheriff role:** Visible to everyone (⭐ badge)
3. **Other living players:** Show "?" badge (role HIDDEN)
4. **Dead players:** Role revealed to everyone

## Files Changed

1. **src/Game.ts** (lines 31-33)
   - Changed: `playerView: bangPlayerView,`
   - Changed: `endIf: endGameCheck,`

2. **src/components/GameBoard.tsx** (lines 19-42)
   - Changed: `({ G, ctx, moves, playerID }) =>` (proper destructuring)
   - Removed: All double-nesting extraction logic

3. **src/game/playerView.ts**
   - Removed: Debug console.logs (no longer needed)

## Testing

```bash
# Start the game
npm start

# Open http://localhost:3001/
# Start local game
# Check console - should see ONE log per player:
# [GameBoard Player 0] Received props: { myRole: "deputy", player1Role: "HIDDEN", ... }

# Verify in UI:
# - Sheriff shows ⭐
# - Your role visible
# - Others show "?"
```

## Lessons Learned

1. **Don't wrap boardgame.io functions** - Pass them directly
2. **Trust the framework** - PlayerView filtering works if you don't bypass it
3. **Use proper TypeScript** - Destructure props, don't cast to `any`
4. **Debug at the source** - Fix root causes, not symptoms

## Previous "Fix" Was Wrong

The `GAME_INITIALIZATION_FIX.md` described a workaround, not a fix. The real issue was:
- We wrapped `playerView` function → BoardGame.io couldn't apply it correctly
- We extracted `props.G.G` → Bypassed the filtered state from playerView
- Result: Unfiltered state leaked through

**Proper fix:** Remove the wrapping, use standard patterns. ✅

---

**Date:** 2026-02-04
**Status:** ✅ Fixed properly (no more workarounds!)
