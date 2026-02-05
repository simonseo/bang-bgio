# BoardGame.io Correct Usage Patterns

**Reference:** Local docs at `.docs/boardgame.io/docs/documentation/`

## ✅ Correct Patterns

### 1. Game Definition

```typescript
// src/Game.ts
export const MyGame = {
  name: 'my-game',
  setup: setupFunction,           // ✅ Direct function reference
  moves: movesObject,              // ✅ Object of moves
  phases: phasesObject,            // ✅ Object of phases
  playerView: playerViewFunction,  // ✅ Direct function reference
  endIf: endIfFunction,            // ✅ Direct function reference
  minPlayers: 2,
  maxPlayers: 4,
};
```

**❌ DON'T wrap functions:**
```typescript
// WRONG - Don't do this!
playerView: (G, ctx, playerID) => playerViewFunction(G, ctx, playerID),
endIf: (G, ctx) => endIfFunction(G, ctx),
```

### 2. PlayerView Function Signature

```typescript
// ✅ CORRECT - Receives object with { G, ctx, playerID }
export function playerView({ G, ctx, playerID }: {
  G: GameState;
  ctx: Ctx;
  playerID: string | null;
}): GameState {
  // Filter and return modified G
  return filteredG;
}
```

**Reference:** `.docs/boardgame.io/docs/documentation/secret-state.md:21`

**❌ WRONG:**
```typescript
// Don't use separate parameters!
export function playerView(G: GameState, ctx: Ctx, playerID: string | null)
```

### 3. Board Component Props

```typescript
// ✅ CORRECT - Destructure props
export const GameBoard: React.FC<BoardProps> = ({ G, ctx, moves, playerID }) => {
  // Use G directly - it's already filtered by playerView
  const player = G.players[playerID];
  // ...
}
```

**❌ WRONG:**
```typescript
// Don't extract from nested structure!
const G = (props as any).G?.G || props.G;
```

### 4. Setup Function

```typescript
// ✅ CORRECT - Receives context object
export function setup({ ctx }: { ctx: Ctx }): GameState {
  const numPlayers = ctx.numPlayers;
  // ... initialize state
  return initialState;
}
```

**Or with just ctx parameter:**
```typescript
export function setup(ctx: Ctx): GameState {
  const numPlayers = ctx.numPlayers;
  return initialState;
}
```

### 5. Move Functions

```typescript
// ✅ CORRECT - Receives object with G, ctx, ...
export function myMove({ G, ctx, playerID }: {
  G: GameState;
  ctx: Ctx;
  playerID: string;
}, arg1: string, arg2: number) {
  // Modify G
  G.someValue = arg1;
}
```

**Or:**
```typescript
export const moves = {
  myMove: ({ G, ctx }, arg) => {
    G.someValue = arg;
  },
};
```

### 6. Client Creation

```typescript
// ✅ CORRECT - Pass board component directly
const MyClient = Client({
  game: MyGame,
  board: MyGameBoard,      // ✅ Direct reference
  numPlayers: 4,
  debug: false,
});

// Then render:
<MyClient playerID="0" />
```

**❌ WRONG:**
```typescript
// Don't pass as any or wrap unnecessarily
game: MyGame as any,  // Avoid 'as any' if possible
```

## 🔍 Key Insights from Docs

### Secret State (playerView)

**From:** `.docs/boardgame.io/docs/documentation/secret-state.md`

- `playerView` receives `{ G, ctx, playerID }`
- Returns a **new** G object with secrets removed
- Don't mutate the original G - clone it first
- `playerID` can be `null` for spectators

**Example:**
```typescript
playerView: ({ G, ctx, playerID }) => {
  const filteredG = JSON.parse(JSON.stringify(G));

  // Hide other players' hands
  Object.keys(filteredG.players).forEach(id => {
    if (id !== playerID) {
      filteredG.players[id].hand = [];
    }
  });

  return filteredG;
}
```

### Move Validation

Moves can return `INVALID_MOVE` constant to reject:

```typescript
import { INVALID_MOVE } from 'boardgame.io/core';

myMove: ({ G, ctx }, arg) => {
  if (!isValid(arg)) {
    return INVALID_MOVE;
  }
  G.value = arg;
}
```

### Server-Only Moves

For moves that manipulate secret state:

```typescript
moves: {
  dealCards: {
    move: ({ G }) => {
      // Deal cards from secret deck
    },
    client: false,  // Don't run on client
  }
}
```

## 🚫 Common Mistakes

### 1. Function Wrapping
```typescript
// ❌ WRONG
playerView: (G, ctx, playerID) => myPlayerView(G, ctx, playerID)

// ✅ CORRECT
playerView: myPlayerView
```

### 2. Wrong Parameter Structure
```typescript
// ❌ WRONG
function playerView(G, ctx, playerID) { }

// ✅ CORRECT
function playerView({ G, ctx, playerID }) { }
```

### 3. Accessing Raw State
```typescript
// ❌ WRONG - Bypasses playerView filtering
const G = props.G.G;

// ✅ CORRECT - Use filtered state
const G = props.G;
```

### 4. Mutating Original G in playerView
```typescript
// ❌ WRONG - Mutates original!
playerView: ({ G, ctx, playerID }) => {
  delete G.secret;  // This mutates the actual game state!
  return G;
}

// ✅ CORRECT - Clone first
playerView: ({ G, ctx, playerID }) => {
  const filteredG = JSON.parse(JSON.stringify(G));
  delete filteredG.secret;
  return filteredG;
}
```

## 📚 Reference Docs

Local copies at:
- `.docs/boardgame.io/docs/documentation/secret-state.md`
- `.docs/boardgame.io/docs/documentation/tutorial.md`
- `.docs/boardgame.io/docs/documentation/concepts.md`
- `.docs/boardgame.io/docs/documentation/phases.md`
- `.docs/boardgame.io/docs/documentation/events.md`

## ✅ Our Current Implementation Status

- [x] PlayerView: Correct signature with object destructuring
- [x] Game definition: Direct function references
- [x] Board component: Proper props destructuring
- [x] Setup: Correct ctx usage
- [x] Moves: Correct structure
- [x] Role visibility: Working correctly (HIDDEN roles stay hidden)

---

**Last Updated:** 2026-02-04 (After fixing playerView signature)
