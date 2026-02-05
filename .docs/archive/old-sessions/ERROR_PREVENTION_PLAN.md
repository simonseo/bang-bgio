# Error Prevention and Detection Plan

## Problem Analysis

We've encountered several runtime errors that weren't caught during development:
1. `numPlayers undefined` in setup
2. `turnOrder undefined` in victory check
3. `turnOrder undefined` in phases
4. All were "Cannot read properties of undefined" errors

## Root Causes

1. **No integration testing** - Unit tests don't catch initialization order issues
2. **Weak type safety** - TypeScript `any` types bypass compile-time checks
3. **No state validation** - Game state assumptions not verified
4. **No error boundaries** - React errors crash entire app
5. **Silent failures** - Missing defensive programming

## Prevention Strategy

### 1. State Validation Layer
Create runtime validators for game state at critical points

### 2. Integration Tests
Test actual game flow from setup through multiple turns

### 3. Error Boundaries
Catch and display React errors gracefully

### 4. Type Guards
Replace `any` with proper types and type guards

### 5. Defensive Programming
Add null checks at all state access points

## Implementation Plan

### Phase 1: State Validators (HIGH PRIORITY)
- [ ] Create `src/game/utils/stateValidation.ts`
- [ ] Add validators for:
  - Game setup state
  - Player state
  - Turn state
  - Card state
- [ ] Call validators at start of each move/phase
- [ ] Throw descriptive errors on validation failure

### Phase 2: Integration Tests (HIGH PRIORITY)
- [ ] Create `src/test/integration/` directory
- [ ] Test: Complete 4-player game flow
- [ ] Test: Game setup initialization
- [ ] Test: Turn progression
- [ ] Test: Card play sequences
- [ ] Test: Death and elimination
- [ ] Test: Victory conditions
- [ ] Run in CI before deployment

### Phase 3: Error Boundaries (MEDIUM PRIORITY)
- [ ] Create `src/components/ErrorBoundary.tsx`
- [ ] Wrap GameBoard in error boundary
- [ ] Display user-friendly error messages
- [ ] Add error reporting/logging
- [ ] Show "Restart Game" button on crash

### Phase 4: Type Safety (MEDIUM PRIORITY)
- [ ] Replace `any` types with proper types
- [ ] Add type guards for dynamic access
- [ ] Enable strict TypeScript checks
- [ ] Fix all type errors

### Phase 5: Logging and Monitoring (LOW PRIORITY)
- [ ] Add structured logging
- [ ] Log state transitions
- [ ] Log move validation failures
- [ ] Add performance monitoring
- [ ] Track error frequency

## Quick Wins (Implement Now)

### 1. State Validator
```typescript
// src/game/utils/stateValidation.ts
export function validateGameState(G: BangGameState, context: string): void {
  if (!G) throw new Error(`[${context}] Game state is null/undefined`);
  if (!G.players) throw new Error(`[${context}] Players not initialized`);
  if (!G.turnOrder) throw new Error(`[${context}] Turn order not initialized`);
  if (!G.deck) throw new Error(`[${context}] Deck not initialized`);
  if (!G.sheriffId) throw new Error(`[${context}] Sheriff ID not set`);

  // Validate player count
  const playerCount = Object.keys(G.players).length;
  if (playerCount < 4 || playerCount > 7) {
    throw new Error(`[${context}] Invalid player count: ${playerCount}`);
  }

  // Validate sheriff exists
  if (!G.players[G.sheriffId]) {
    throw new Error(`[${context}] Sheriff player not found`);
  }
}
```

### 2. Integration Test
```typescript
// src/test/integration/gameFlow.test.ts
import { Client } from 'boardgame.io/client';
import { BangGame } from '../../Game';

describe('Game Flow Integration', () => {
  it('should complete full game initialization', () => {
    const client = Client({ game: BangGame, numPlayers: 4 });
    const state = client.getState();

    expect(state.G.players).toBeDefined();
    expect(state.G.turnOrder).toBeDefined();
    expect(state.G.deck).toBeDefined();
    expect(Object.keys(state.G.players)).toHaveLength(4);
  });

  it('should progress through multiple turns', () => {
    const client = Client({ game: BangGame, numPlayers: 4 });

    // Turn 1
    client.moves.drawCards();
    client.events.endTurn();

    // Turn 2
    expect(() => client.moves.drawCards()).not.toThrow();
    client.events.endTurn();

    // Turn 3
    expect(() => client.moves.drawCards()).not.toThrow();
  });
});
```

### 3. Error Boundary
```typescript
// src/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Game Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h1>Something went wrong</h1>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>
            Restart Game
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Success Metrics

After implementation:
- [ ] All integration tests pass
- [ ] No runtime errors in 10 complete games
- [ ] Error boundary catches and displays crashes
- [ ] Validation errors have descriptive messages
- [ ] TypeScript strict mode enabled with no errors

## Timeline

- **Immediate (Today)**: State validators + basic integration test
- **Short-term (This Week)**: Error boundaries + more integration tests
- **Medium-term (Next Week)**: Type safety improvements
- **Ongoing**: Logging and monitoring

## Priority Order

1. **CRITICAL**: State validators in all moves/phases
2. **CRITICAL**: Integration test for game initialization
3. **HIGH**: Error boundary component
4. **HIGH**: Integration tests for common flows
5. **MEDIUM**: Type safety improvements
6. **LOW**: Enhanced logging
