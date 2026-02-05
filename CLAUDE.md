# CLAUDE.md - Golden Rules for AI Assistants

This document contains critical lessons learned during the development of this Bang! card game implementation. Future AI assistants (or human developers) should read this file to avoid repeating mistakes and understand architectural decisions.

## 🚨 Critical: BoardGame.io v0.50.2 API Patterns

### ❌ DON'T: Use Game() Constructor
```typescript
// ❌ WRONG - Game() constructor doesn't exist in v0.50.2
import { Game } from 'boardgame.io';
export const BangGame = Game({ ... });
```

Error: `The requested module does not provide an export named 'Game'`

### ✅ DO: Use Plain Object Definition
```typescript
// ✅ CORRECT - Plain object pattern for v0.50.2
export const BangGame = {
  name: 'bang',
  setup,
  moves,
  phases,
  // ...
};
```

### ❌ DON'T: Use ctx.events
```typescript
// ❌ WRONG - events is NOT on ctx object
export function playBang({ G, ctx }, cardId, targetId) {
  G.pendingAction = { ... };
  ctx.events.setActivePlayers({ ... }); // TypeError: Cannot read 'events'
}
```

Error: `Uncaught TypeError: Cannot read properties of undefined (reading 'events')`

### ✅ DO: Use events as Separate Parameter
```typescript
// ✅ CORRECT - events is a separate parameter!
export function playBang({ G, ctx, events }, cardId, targetId) {
  G.pendingAction = { ... };

  // Call events.setActivePlayers directly
  events.setActivePlayers({
    value: { [targetId]: 'respondToBang' },
    moveLimit: 1,
  });
}
```

**Critical Discovery**: `events` is passed as a **separate parameter** to moves, not as `ctx.events`. This is confirmed in boardgame.io test files (`turn-order.test.ts`).

---

## 🎮 Game Architecture Patterns

### Move Function Signatures

**✅ CORRECT Pattern:**
```typescript
export function playBang({ G, ctx, events }: { G: BangGameState; ctx: GameCtx; events: any }, cardId: string, targetId: string) {
  const playerId = ctx.currentPlayer;

  // Use events to set active players
  events.setActivePlayers({
    value: { [targetId]: 'respondToBang' },
    moveLimit: 1,
  });
}
```

**Key Points:**
- First parameter is object with `{ G, ctx, events }`
- `events` is separate parameter, NOT `ctx.events`
- Additional parameters come after
- BoardGame.io automatically injects G, ctx, and events
- UI calls `moves.playBang(cardId, targetId)` - framework adds { G, ctx, events }

### Reactive Card Pattern (UNDER REVIEW)

**Current Attempted Pattern:**
1. Move sets `G.pendingAction = { type: 'BANG', targetPlayerId, ... }`
2. Hook detects pending action and calls `ctx.events.setActivePlayers`
3. Target player enters reactive stage (`respondToBang`)
4. Stage-specific moves become available

**Problem**: Step 2 fails because ctx.events not available in onMove.

**Alternative Patterns to Research:**
- Use different hooks where ctx.events IS available
- Use automatic stage transitions based on game state
- Use plugins/middleware
- Return values from moves that trigger transitions
- Restructure game flow entirely

---

## 🧪 Testing Strategy

### ❌ DON'T: Ask for Manual Testing Before E2E Tests

**Golden Rule**: NEVER ask the user to manually test in the browser before creating comprehensive E2E tests that verify the complete scenario works.

**Wrong Workflow:**
1. Make code changes
2. Ask user "please test this in the browser"
3. User finds issues
4. Repeat

**Right Workflow:**
1. Write failing E2E test for the scenario
2. Make code changes
3. Run E2E tests until they pass
4. **Only then** is the feature ready for user review

### ✅ DO: Use Test-Driven Development (TDD)

**TDD Process:**
1. Write E2E test that describes the complete user scenario
2. Run test - should fail
3. Write minimal code to make test pass
4. Run test - should pass
5. Refactor if needed
6. Repeat

**Test Hierarchy:**
- **E2E Tests**: Complete user flows (draw cards → play BANG → AI responds → health updates)
- **Unit Tests**: Individual move functions and validation
- **Integration Tests**: Game state transitions and victory conditions

### ✅ DO: Work Autonomously with Tests

**User Expectation**: Finish everything on the TODO without needing manual testing in between.

**Process:**
1. Pick next TODO item
2. Write E2E test for the feature/fix
3. Implement until tests pass
4. Move to next TODO item
5. User tests the complete result at the end

### Testing vs Browser Reality

**Lesson Learned:**
- Unit tests passed for health reduction
- Unit tests passed for AI response handling
- Browser showed neither worked

**Why:**
- Tests import functions directly
- Browser uses moves through boardgame.io framework
- Framework behavior differs from direct function calls
- Export configuration matters (moves object)
- Context passing differs (events parameter, ctx.playerID)
- **E2E tests using Client catch these issues**

---

## 🐛 Debugging Strategies

### Add Comprehensive Logging Early

When debugging boardgame.io issues, add logging at EVERY step:

```typescript
export function playBang({ G, ctx }, cardId, targetId) {
  console.log('[playBang] Called', { cardId, targetId, playerId: ctx.currentPlayer });

  // Validation
  if (validation === INVALID_MOVE) {
    console.log('[playBang] INVALID_MOVE - validation failed');
    return INVALID_MOVE;
  }

  // Core logic
  G.pendingAction = { ... };
  console.log('[playBang] Pending action set', { pendingAction: G.pendingAction });

  // Success
  console.log('[playBang] Complete');
}
```

**Log Critical Context:**
- What's in ctx (currentPlayer, playerID, events, activePlayers)
- State before and after modifications
- Return values and early returns
- Hook invocations (onMove, onBegin, onEnd)

### Check Framework Integration Points

**Common failure points:**
1. **Move exports** - Is the move in the `moves` object export?
2. **UI wiring** - Is the button calling the correct move?
3. **Context passing** - Is ctx.playerID set correctly in stages?
4. **Event availability** - Is ctx.events available where you're using it?
5. **Stage configuration** - Are stage moves properly wrapped?

---

## 🏗️ Architecture Anti-Patterns

### ❌ DON'T: Handle AI in React Components

**Current Pattern (May be problematic):**
```typescript
// AIManager.tsx - React component
export const AIManager = ({ G, ctx, moves }) => {
  useEffect(() => {
    if (aiNeedsToRespond) {
      moves.playMissed(cardId); // Called from human player's context?
    }
  }, [G, ctx]);
};
```

**Issues:**
- AIManager rendered as part of human player's UI
- moves object scoped to human player
- May not work correctly for AI player actions in local mode
- Unclear if boardgame.io supports this pattern

**Alternative to Research:**
- AI logic in game server/logic layer
- BoardGame.io bot API
- Automatic move resolution for AI players

### ❌ DON'T: Duplicate Turn Configuration

```typescript
// ❌ WRONG - Conflicting turn configs
export const BangGame = {
  turn: { onBegin: ... },  // Top level
  phases: {
    play: {
      turn: { onBegin: ... }  // Phase level - which one wins?
    }
  }
};
```

### ✅ DO: Define Turn Logic in One Place

```typescript
// ✅ CORRECT - Turn config in phase where needed
export const BangGame = {
  phases: {
    play: {
      turn: {
        order: { ... },
        onBegin: { ... },
        onMove: { ... },
        stages: { ... }
      }
    }
  }
};
```

---

## 📝 Documentation Patterns

### File Headers Should Explain Architecture

```typescript
/**
 * Move Functions - BoardGame.io v0.50.2 Pattern
 *
 * Move Signature: ({ G, ctx }: { G: BangGameState; ctx: GameCtx }, ...args)
 * - First param is OBJECT with { G, ctx }
 * - Framework injects G and ctx automatically
 * - UI calls: moves.moveName(...args) - framework adds { G, ctx }
 *
 * Reactive Cards Pattern:
 * - Moves set G.pendingAction flag
 * - [MECHANISM TBD] triggers stage transitions
 * - Stage-specific moves handle responses
 */
```

### Comment Critical Framework Interactions

```typescript
// Note: ctx.events.setActivePlayers NOT available in moves
// Must be called from [APPROPRIATE HOOK - TBD]
G.pendingAction = { type: 'BANG', targetPlayerId };
```

---

## 🔍 Common Mistakes Checklist

When adding new features, check:

- [ ] Move function has correct signature: `({ G, ctx }, ...args)`
- [ ] Move is exported in `moves` object
- [ ] Move has validation that returns INVALID_MOVE
- [ ] Move has logging for debugging
- [ ] UI button/handler calls the move correctly
- [ ] Unit test covers the move
- [ ] **Browser testing TODO added** (don't assume tests mean it works)
- [ ] Not trying to call ctx.events from move or onMove
- [ ] Stage moves properly wrapped if reactive
- [ ] AI handling considered (how will AI players respond?)

---

## 📚 Key Files Reference

### Game Logic
- `src/Game.ts` - Main game definition (plain object, no Game())
- `src/game/moves.ts` - All move functions (first param is { G, ctx })
- `src/game/phases.ts` - Phase/turn structure (stages, hooks)
- `src/game/setup.ts` - Initial game state

### Testing Reality Gap
- `src/test/unit/moves.test.ts` - Unit tests (direct function calls)
- Browser console - Where real issues appear (framework integration)

### Documentation
- `.docs/boardgame.io/` - BoardGame.io v0.50 documentation
- `.docs/REACTIVE_GAMEPLAY_PATTERNS.md` - Research findings (TBD)
- `TODO.md` - Current task list and known issues

---

## 🎯 Current Open Questions

**Needs Research:**
1. Where IS ctx.events available in boardgame.io v0.50.2?
2. What's the correct pattern for reactive cards with stage transitions?
3. How should AI players be handled in local mode?
4. Can moves return values that trigger stage transitions?
5. Are there plugins/middleware for reactive gameplay?

**Action Item:**
Complete architectural review and design document before major refactoring.

---

## 💡 Workflow Best Practices

### When Implementing New Features

1. **Read this CLAUDE.md first**
2. Check TODO.md for architectural review status
3. If touching reactive cards, wait for architecture decision
4. Add comprehensive logging from the start
5. Write unit tests
6. **Add browser testing TODO** immediately
7. Test in browser, don't assume tests mean it works

### When Debugging

1. Add logging at every step
2. Check browser console, not just tests
3. Verify ctx structure (log `Object.keys(ctx)`)
4. Check if move is in exports
5. Verify UI is calling the move
6. Don't assume framework behavior - verify it

### When Stuck

1. Check if trying to use ctx.events in wrong place
2. Read boardgame.io docs for the specific version (v0.50.2)
3. Look for examples in .docs/boardgame.io/ directory
4. Consider if architectural pattern is fundamentally wrong
5. **Don't keep trying fixes if 3+ attempts failed** - question the architecture

---

## 🚀 Path Forward

1. ✅ Document all learnings (this file)
2. 🔄 Research correct boardgame.io v0.50.2 patterns (in progress)
3. ⏳ Create architectural design document
4. ⏳ Refactor based on correct patterns
5. ⏳ Re-test everything in browser
6. ⏳ Update this document with final patterns

---

**Last Updated**: 2025-02-05

**Status**: Architecture under review - reactive card pattern needs redesign based on boardgame.io v0.50.2 API research.
