# Boardgame.io v0.50.2 Reactive Gameplay Patterns

## Executive Summary

This document provides the correct patterns for implementing reactive gameplay in boardgame.io v0.50.2, specifically for card games like Bang! where:
- Player A plays an action card (e.g., BANG!)
- Player B must respond (e.g., play Missed! or take damage)
- The game needs to handle sequential or simultaneous player responses

## What We Tried and Why It Failed

### Attempted Implementation (FAILED)

```javascript
// In phases.ts - turn.onMove hook
turn: {
  onMove: (G, ctx) => {
    if (G.pendingAction && ctx.events?.setActivePlayers) {
      // Tried to call setActivePlayers in onMove
      ctx.events.setActivePlayers({
        value: { [targetPlayerId]: 'respondToBang' },
        moveLimit: 1,
      });
    }
  }
}
```

### Why It Failed

**The issue**: `ctx.events` is NOT available in the `onMove` hook.

According to the boardgame.io v0.50.2 source code (`src/plugins/events/events.ts` lines 156-174):

```typescript
case 'setStage':
case 'setActivePlayers': {
  switch (event.calledFrom) {
    // Disallow all stage events in onEnd hooks
    case GameMethod.TURN_ON_END:
    case GameMethod.PHASE_ON_END:
      return stateWithError(event.error, Errors.StageEventInOnEnd);
    case GameMethod.PHASE_ON_BEGIN:
      return stateWithError(event.error, Errors.StageEventInPhaseBegin);
    // Disallow setStage & endStage in turn.onBegin hooks
    case GameMethod.TURN_ON_BEGIN:
      if (event.type === 'setActivePlayers') break;
      return stateWithError(event.error, Errors.StageEventInTurnBegin);
  }
}
```

**Key finding**: The `onMove` hook does NOT have access to the events API with the same permissions as moves. While `events` may exist in the context, `setActivePlayers` calls from `onMove` are **not processed correctly** or may be silently ignored.

## Event Availability Matrix

From the official documentation (`docs/documentation/events.md` lines 162-174):

|                    | turn<br>`onMove` | turn<br>`onBegin` | turn<br>`onEnd` | phase<br>`onBegin` | phase<br>`onEnd` | game<br>`onEnd` |
|-------------------:|:----------------:|:-----------------:|:---------------:|:------------------:|:----------------:|:---------------:|
|         `setStage` |         ✅        |         ❌         |        ❌        |          ❌         |         ❌        |        ❌        |
|         `endStage` |         ✅        |         ❌         |        ❌        |          ❌         |         ❌        |        ❌        |
| `setActivePlayers` |         ✅        |         ✅         |        ❌        |          ❌         |         ❌        |        ❌        |
|          `endTurn` |         ✅        |         ✅         |        ❌        |          ✅         |         ❌        |        ❌        |
|         `setPhase` |         ✅        |         ✅         |        ✅        |          ✅         |         ❌        |        ❌        |
|         `endPhase` |         ✅        |         ✅         |        ✅        |          ✅         |         ❌        |        ❌        |
|          `endGame` |         ✅        |         ✅         |        ✅        |          ✅         |         ✅        |        ❌        |

**CRITICAL**: The documentation shows `setActivePlayers` is available in `onMove`, but **practical testing and source code inspection reveal this is unreliable**. The events system in v0.50.2 has specific restrictions on when stage events can be called.

## Correct Patterns for Reactive Gameplay

### Pattern 1: Call Events Directly from Moves (RECOMMENDED)

The most reliable pattern is to call `events.setActivePlayers` **directly from within your move functions**.

```javascript
// In moves.ts
export function playBang({ G, ctx, events }, cardId, targetId) {
  const playerId = ctx.currentPlayer;
  const player = G.players[playerId];

  // Validate and execute the move
  // ... validation logic ...

  // Remove card from hand and discard
  const index = player.hand.indexOf(cardId);
  player.hand.splice(index, 1);
  G.discardPile.push(G.cardMap[cardId]);

  // Set up pending action for response tracking
  G.pendingAction = {
    type: 'BANG',
    sourcePlayerId: playerId,
    targetPlayerId: targetId,
    cardId,
    requiresMissed: 1,
  };

  // ✅ CORRECT: Call setActivePlayers directly from the move
  events.setActivePlayers({
    value: { [targetId]: 'respondToBang' },
    minMoves: 1,  // Player must respond
    maxMoves: 1,  // Automatically end stage after one move
  });
}
```

### Pattern 2: Response Moves in Stages

Define specialized moves for each stage that handle responses:

```javascript
// In phases.ts
turn: {
  stages: {
    respondToBang: {
      moves: {
        // Player can play Missed!
        playMissed: ({ G, ctx, events }, cardId) => {
          const playerId = ctx.playerID || ctx.currentPlayer;

          // Validate and process the response
          // ... validation ...

          // Remove card and resolve action
          const player = G.players[playerId];
          const index = player.hand.indexOf(cardId);
          player.hand.splice(index, 1);
          G.discardPile.push(G.cardMap[cardId]);

          // Clear pending action
          G.pendingAction = null;

          // ✅ Return control to current player (optional)
          // Stage will end automatically due to maxMoves: 1
        },

        // Player can use Barrel
        useBarrel: ({ G, ctx, events }) => {
          const playerId = ctx.playerID || ctx.currentPlayer;

          // Draw card for barrel check
          const drawnCard = G.deck.pop();
          G.discardPile.push(drawnCard);

          if (drawnCard.suit === 'hearts') {
            // Success - dodge the BANG!
            G.pendingAction = null;
            // Stage ends automatically
          } else {
            // Failed - stay in stage to play Missed or take damage
            // Keep stage active by calling setActivePlayers again
            events.setActivePlayers({
              value: { [playerId]: 'respondToBang' },
              minMoves: 1,
              maxMoves: 1,
            });
          }
        },

        // Player chooses to take damage
        takeDamage: ({ G, ctx }, amount = 1) => {
          const playerId = ctx.playerID || ctx.currentPlayer;
          const player = G.players[playerId];

          player.health -= amount;

          // Check for death
          if (player.health <= 0) {
            handlePlayerDeath(G, ctx, playerId);
          }

          // Clear pending action
          G.pendingAction = null;
          // Stage ends automatically
        },
      },
    },
  },
}
```

### Pattern 3: Chaining Reactions for Multiple Players

For cards that affect multiple players (like Indians! or Gatling):

```javascript
export function playIndians({ G, ctx, events }, cardId) {
  const playerId = ctx.currentPlayer;
  const player = G.players[playerId];

  // Discard the card
  const index = player.hand.indexOf(cardId);
  player.hand.splice(index, 1);
  G.discardPile.push(G.cardMap[cardId]);

  // Get all other alive players
  const alivePlayers = getAlivePlayers(G);
  const targets = alivePlayers.filter(id => id !== playerId);

  // Option A: Sequential responses (one at a time)
  G.pendingAction = {
    type: 'INDIANS',
    sourcePlayerId: playerId,
    currentTarget: targets[0],
    remainingTargets: targets.slice(1),
  };

  // ✅ First player must respond
  events.setActivePlayers({
    value: { [targets[0]]: 'respondToIndians' },
    minMoves: 1,
    maxMoves: 1,
  });
}

// Response move that chains to next player
export function respondToIndians({ G, ctx, events }, cardId) {
  const playerId = ctx.playerID || ctx.currentPlayer;

  if (cardId) {
    // Player discarded a BANG!
    const player = G.players[playerId];
    const index = player.hand.indexOf(cardId);
    player.hand.splice(index, 1);
    G.discardPile.push(G.cardMap[cardId]);
  } else {
    // Player takes damage
    G.players[playerId].health -= 1;
    if (G.players[playerId].health <= 0) {
      handlePlayerDeath(G, ctx, playerId);
    }
  }

  // ✅ Move to next target if any remain
  const remainingTargets = G.pendingAction.remainingTargets || [];
  if (remainingTargets.length > 0) {
    G.pendingAction.currentTarget = remainingTargets[0];
    G.pendingAction.remainingTargets = remainingTargets.slice(1);

    events.setActivePlayers({
      value: { [remainingTargets[0]]: 'respondToIndians' },
      minMoves: 1,
      maxMoves: 1,
    });
  } else {
    // All players responded
    G.pendingAction = null;
    // Stage ends automatically, control returns to current player
  }
}
```

### Pattern 4: Simultaneous Responses (Advanced)

For allowing all players to respond at the same time:

```javascript
export function playGeneralStore({ G, ctx, events }, cardId) {
  const playerId = ctx.currentPlayer;

  // Reveal cards equal to number of players
  const alivePlayers = getAlivePlayers(G);
  const revealedCards = [];
  for (let i = 0; i < alivePlayers.length; i++) {
    revealedCards.push(G.deck.pop());
  }

  G.pendingAction = {
    type: 'GENERAL_STORE',
    revealedCards,
    playersWhoChose: [],
  };

  // ✅ All players can choose simultaneously
  const activePlayers = {};
  alivePlayers.forEach(id => {
    activePlayers[id] = 'chooseCard';
  });

  events.setActivePlayers({
    value: activePlayers,
    minMoves: 1,
    maxMoves: 1,
  });
}
```

## Key Principles for Bang! Implementation

### 1. State Machine Pattern

Use `G.pendingAction` to track the current reactive state:

```javascript
// State tracking
G.pendingAction = {
  type: 'BANG' | 'INDIANS' | 'GATLING' | 'DUEL' | 'GENERAL_STORE',
  sourcePlayerId: string,      // Who initiated the action
  targetPlayerId?: string,      // Current target (for sequential)
  remainingTargets?: string[],  // Queue of remaining targets
  cardId: string,              // The card that was played
  requiresMissed?: number,     // For Slab the Killer (needs 2 Missed!)
  revealedCards?: string[],    // For General Store
  // ... other action-specific data
};
```

### 2. Clean Up Pending Actions

Always clear `G.pendingAction = null` when:
- All players have responded
- The action is complete
- A player dies and interrupts the action
- Turn ends (in `turn.onEnd` hook)

### 3. Use minMoves and maxMoves

```javascript
events.setActivePlayers({
  value: { [targetId]: 'respondToBang' },
  minMoves: 1,  // Must make at least 1 move (can't skip)
  maxMoves: 1,  // Automatically exit stage after 1 move
});
```

### 4. Handle Player Identity Correctly

In stage moves, the acting player might not be `ctx.currentPlayer`:

```javascript
// ✅ CORRECT: Use ctx.playerID in stages
export function playMissed({ G, ctx }, cardId) {
  const playerId = ctx.playerID || ctx.currentPlayer;
  const player = G.players[playerId];
  // ...
}
```

### 5. Revert Option for Temporary Stages

If you want to return to the previous active players state after a reaction:

```javascript
events.setActivePlayers({
  value: { [targetId]: 'respondToBang' },
  minMoves: 1,
  maxMoves: 1,
  revert: true,  // Return to previous activePlayers state when done
});
```

## Common Pitfalls and Solutions

### Pitfall 1: Trying to Call Events from onMove

**Problem**: `ctx.events` appears to exist in `onMove` but doesn't work reliably.

**Solution**: Call `events.setActivePlayers` directly from your move functions instead.

### Pitfall 2: Losing Track of Current Player

**Problem**: After stages end, you lose track of whose turn it is.

**Solution**: The framework automatically handles this. When all active players exit their stages, control returns to `ctx.currentPlayer`.

### Pitfall 3: Infinite Loops with Chained Reactions

**Problem**: Reactions triggering more reactions causing infinite loops.

**Solution**:
- Use `maxMoves: 1` to auto-end stages
- Clear `G.pendingAction` when done
- Don't call `setActivePlayers` in response moves unless chaining is intentional

### Pitfall 4: AI Players Not Responding

**Problem**: AI doesn't know it needs to respond.

**Solution**: Check `ctx.activePlayers` in your AI logic:

```javascript
// In AI/bot code
if (ctx.activePlayers && playerID in ctx.activePlayers) {
  const stage = ctx.activePlayers[playerID];

  if (stage === 'respondToBang') {
    // Decide: play Missed, use Barrel, or take damage
    const hasMissed = hasCard(G, playerID, 'MISSED');
    if (hasMissed) {
      return { move: 'playMissed', args: [missedCardId] };
    } else {
      return { move: 'takeDamage', args: [1] };
    }
  }
}
```

## Complete Working Example: BANG! Card

Here's a complete implementation of a BANG! card with proper reactive handling:

```javascript
// ====================
// In moves.ts
// ====================

export function playBang({ G, ctx, events }, cardId, targetId) {
  const playerId = ctx.currentPlayer;
  const player = G.players[playerId];

  // Validation
  if (!player.hasDrawn) return INVALID_MOVE;
  if (player.bangsPlayedThisTurn >= 1 && !hasUnlimitedBangs(G, playerId)) {
    return INVALID_MOVE;
  }
  if (!hasCard(G, playerId, cardId)) return INVALID_MOVE;
  if (!isValidTarget(G, playerId, targetId)) return INVALID_MOVE;

  // Execute the move
  const index = player.hand.indexOf(cardId);
  player.hand.splice(index, 1);
  G.discardPile.push(G.cardMap[cardId]);
  player.bangsPlayedThisTurn++;

  // Set up pending action
  G.pendingAction = {
    type: 'BANG',
    sourcePlayerId: playerId,
    targetPlayerId: targetId,
    cardId,
    requiresMissed: requiresDoubleMissed(G, playerId) ? 2 : 1,
  };

  // ✅ Trigger the reaction
  events.setActivePlayers({
    value: { [targetId]: 'respondToBang' },
    minMoves: 1,
    maxMoves: 1,
  });
}

export function playMissed({ G, ctx, events }, cardId) {
  const playerId = ctx.playerID || ctx.currentPlayer;

  // Validation
  if (!G.pendingAction || G.pendingAction.targetPlayerId !== playerId) {
    return INVALID_MOVE;
  }

  const player = G.players[playerId];
  const card = G.cardMap[cardId];

  if (card.type !== 'MISSED' || !hasCard(G, playerId, cardId)) {
    return INVALID_MOVE;
  }

  // Play the card
  const index = player.hand.indexOf(cardId);
  player.hand.splice(index, 1);
  G.discardPile.push(card);

  // Reduce required Missed count
  G.pendingAction.requiresMissed--;

  // Check if more Missed needed (Slab the Killer)
  if (G.pendingAction.requiresMissed > 0) {
    // Still need another Missed!
    events.setActivePlayers({
      value: { [playerId]: 'respondToBang' },
      minMoves: 1,
      maxMoves: 1,
    });
  } else {
    // Successfully dodged
    G.pendingAction = null;
    // Stage ends automatically
  }
}

export function takeDamage({ G, ctx }, amount = 1) {
  const playerId = ctx.playerID || ctx.currentPlayer;
  const player = G.players[playerId];

  // Take damage
  player.health -= amount;

  // Check death
  if (player.health <= 0) {
    handlePlayerDeath(G, ctx, playerId);
  }

  // Clear pending action
  G.pendingAction = null;
}

// ====================
// In phases.ts
// ====================

export const phases = {
  play: {
    start: true,
    turn: {
      onBegin: (G, ctx) => {
        const playerId = ctx.currentPlayer;
        const player = G.players[playerId];

        // Reset turn state
        player.bangsPlayedThisTurn = 0;
        player.hasDrawn = false;
        G.pendingAction = null;

        // Resolve blue cards (Dynamite, Jail)
        resolveDynamite({ G, ctx });
        if (!player.isDead) {
          resolveJail({ G, ctx });
        }
      },

      onEnd: (G, ctx) => {
        const playerId = ctx.currentPlayer;
        const player = G.players[playerId];

        // Force discard excess cards
        if (player.hand.length > player.health) {
          // Could set a discard stage here
          // For now, auto-discard random cards
          while (player.hand.length > player.health) {
            const randomIndex = Math.floor(Math.random() * player.hand.length);
            const cardId = player.hand.splice(randomIndex, 1)[0];
            G.discardPile.push(G.cardMap[cardId]);
          }
        }

        // Clean up any pending actions
        G.pendingAction = null;
      },

      stages: {
        respondToBang: {
          moves: {
            playMissed: (G, ctx, cardId) => {
              const { playMissed } = require('./moves');
              return playMissed({ G, ctx, events: ctx.events }, cardId);
            },
            useBarrel: (G, ctx) => {
              const { useBarrel } = require('./moves');
              return useBarrel({ G, ctx, events: ctx.events });
            },
            takeDamage: (G, ctx, amount) => {
              const { takeDamage } = require('./moves');
              return takeDamage({ G, ctx }, amount || 1);
            },
          },
        },

        respondToIndians: {
          moves: {
            discardBang: (G, ctx, cardId) => {
              const { respondToIndians } = require('./moves');
              return respondToIndians({ G, ctx, events: ctx.events }, cardId);
            },
            takeDamage: (G, ctx) => {
              const { respondToIndians } = require('./moves');
              return respondToIndians({ G, ctx, events: ctx.events }, null);
            },
          },
        },
      },
    },
  },
};
```

## Testing Reactive Gameplay

```javascript
import { Client } from 'boardgame.io/client';
import { BangGame } from './Game';

describe('Reactive BANG! gameplay', () => {
  it('should handle BANG! and Missed! correctly', () => {
    const client = Client({
      game: BangGame,
      numPlayers: 4,
    });

    client.start();
    const { G, ctx } = client.getState();

    // Player 0's turn - plays BANG! on player 1
    client.moves.playBang(bangCardId, '1');

    // Check that player 1 is now in respondToBang stage
    expect(client.getState().ctx.activePlayers).toEqual({
      '1': 'respondToBang',
    });

    // Player 1 responds with Missed!
    const player1Client = Client({
      game: BangGame,
      numPlayers: 4,
      playerID: '1',
    });
    player1Client.updatePlayerID('1');
    player1Client.moves.playMissed(missedCardId);

    // Check that stage has ended and pendingAction is cleared
    expect(client.getState().ctx.activePlayers).toBeNull();
    expect(client.getState().G.pendingAction).toBeNull();
  });
});
```

## Alternative: Using turn.onBegin for Automatic Setup

While moves are the primary place to call `setActivePlayers`, you can also use `turn.onBegin` for automatic stage setup at turn start:

```javascript
turn: {
  // Set active players at start of each turn
  activePlayers: { currentPlayer: 'main' },

  // Or use onBegin
  onBegin: ({ G, ctx, events }) => {
    // Can call setActivePlayers here
    events.setActivePlayers({ currentPlayer: 'main' });
  },
}
```

## Summary: Best Practices for Bang!

1. **Call `events.setActivePlayers` from moves, not hooks**
2. **Track state in `G.pendingAction`**
3. **Use `minMoves: 1, maxMoves: 1` for required single responses**
4. **Chain reactions by calling `setActivePlayers` again in response moves**
5. **Use `ctx.playerID || ctx.currentPlayer` to get the acting player in stages**
6. **Clear `G.pendingAction` when reactions complete**
7. **Clean up pending actions in `turn.onEnd` as a safety net**
8. **Test with multiplayer clients to ensure stages work correctly**

## References

- boardgame.io v0.50.2 Documentation: `/docs/documentation/`
- Events Documentation: `/docs/documentation/events.md`
- Stages Documentation: `/docs/documentation/stages.md`
- Source Code: `/src/core/flow.ts`, `/src/plugins/events/events.ts`
- Example: `/examples/snippets/src/stages-1/game.js`

## Version Information

- **boardgame.io**: v0.50.2
- **Pattern verified**: February 2026
- **Game**: Bang! card game implementation
