# How to Add New Cards to Bang!

This guide explains how to add a new card type to the game.

## Overview

Adding a new card involves 4 main steps:
1. Define the card type
2. Add card data
3. Implement the move function
4. Wire up the UI
5. Add tests

## Step 1: Define the Card Type

Edit `src/data/cards.ts`:

```typescript
export type CardType =
  | 'BANG'
  | 'MISSED'
  // ... existing types
  | 'YOUR_NEW_CARD';  // Add your new type
```

## Step 2: Add Card Data

Add the card definition to `src/data/cards.ts`:

```typescript
export const CARD_DEFINITIONS: Record<CardType, Omit<Card, 'id' | 'suit' | 'rank'>> = {
  // ... existing cards
  YOUR_NEW_CARD: {
    name: 'Your New Card',
    type: 'YOUR_NEW_CARD',
    category: 'brown',  // 'brown' for instant, 'blue' for equipment
    description: 'What your card does',
    requiresTarget: false,  // true if needs to select a player
    isEquipment: false,     // true if stays in play
    isWeapon: false,        // true if it's a weapon
    range: undefined,       // for weapons only
  },
};
```

Then add actual card instances to the deck in `src/data/deck.ts`:

```typescript
export function createDeck(): Card[] {
  const deck: Card[] = [
    // ... existing cards

    // Your new card (specify suit and rank for each copy)
    { ...CARD_DEFINITIONS.YOUR_NEW_CARD, id: 'your-card-1', suit: 'hearts', rank: 'A' },
    { ...CARD_DEFINITIONS.YOUR_NEW_CARD, id: 'your-card-2', suit: 'diamonds', rank: 'K' },
  ];

  return deck;
}
```

## Step 3: Implement the Move Function

Create a new move function in `src/game/moves.ts`:

### For Instant Cards (Brown Border)

```typescript
/**
 * Play Your New Card
 */
export function playYourNewCard(
  { G, ctx }: { G: BangGameState; ctx: GameCtx },
  cardId: string,
  targetId?: string  // Optional if requiresTarget: true
) {
  const playerId = ctx.currentPlayer;
  const player = G.players[playerId];
  const card = G.cardMap[cardId];

  // Validation
  if (!hasCard(G, playerId, cardId)) return INVALID_MOVE;
  if (!player.hasDrawn) return INVALID_MOVE;

  // If requires target, validate
  if (targetId) {
    if (!isValidTarget(G, playerId, targetId, card.type)) return INVALID_MOVE;
  }

  // Remove card and discard
  const index = player.hand.indexOf(cardId);
  player.hand.splice(index, 1);
  G.discardPile.push(card);

  // Implement card effect
  // ... your card logic here ...
}
```

### For Reactive Cards (Requires Response)

If your card creates a situation where other players must respond:

```typescript
export function playYourNewCard({ G, ctx }: { G: BangGameState; ctx: GameCtx }, cardId: string) {
  // ... validation and discard as above ...

  // Set up pending action
  G.pendingAction = {
    type: 'YOUR_NEW_CARD',
    sourcePlayerId: playerId,
    targetPlayerId: targetPlayerId,
    cardId,
  };

  // Activate target player to respond
  if (ctx.events?.setActivePlayers) {
    ctx.events.setActivePlayers({
      value: { [targetPlayerId]: 'respondToYourNewCard' },
      moveLimit: 1,
    });
  }
}

// Create response function
export function respondToYourNewCard({ G, ctx }: { G: BangGameState; ctx: GameCtx }, responseCardId?: string) {
  const playerId = ctx.playerID || ctx.currentPlayer;

  if (!G.pendingAction || G.pendingAction.type !== 'YOUR_NEW_CARD') {
    return INVALID_MOVE;
  }

  // Handle response logic
  // ...

  // Clear pendingAction when done
  G.pendingAction = null;
}
```

### For Equipment Cards (Blue Border)

```typescript
export function equipYourCard({ G, ctx }: { G: BangGameState; ctx: GameCtx }, cardId: string) {
  const playerId = ctx.currentPlayer;
  const player = G.players[playerId];
  const card = G.cardMap[cardId];

  if (!hasCard(G, playerId, cardId)) return INVALID_MOVE;
  if (!player.hasDrawn) return INVALID_MOVE;

  // Remove from hand
  const index = player.hand.indexOf(cardId);
  player.hand.splice(index, 1);

  // Add to inPlay
  player.inPlay.push(cardId);

  // Update player state based on equipment type
  if (card.isWeapon) {
    // Replace existing weapon
    if (player.weapon) {
      const oldWeaponIndex = player.inPlay.indexOf(player.weapon.id);
      if (oldWeaponIndex !== -1) {
        const oldWeapon = G.cardMap[player.inPlay[oldWeaponIndex]];
        G.discardPile.push(oldWeapon);
        player.inPlay.splice(oldWeaponIndex, 1);
      }
    }
    player.weapon = card;
  } else {
    // Set boolean flag for equipment type
    player.yourEquipment = true;
  }
}
```

## Step 4: Add to PendingAction Type (If Reactive)

Edit `src/game/setup.ts`:

```typescript
export interface PendingAction {
  type: 'BANG' | 'DUEL' | /* ... */ | 'YOUR_NEW_CARD';
  // ... other fields
}
```

## Step 5: Add Phase Stage (If Reactive)

Edit `src/game/phases.ts`:

```typescript
stages: {
  // ... existing stages
  respondToYourNewCard: {
    moves: {
      respondToYourNewCard: (G: BangGameState, ctx: any, cardId?: string) => {
        const { respondToYourNewCard } = require('./moves');
        return respondToYourNewCard({ G, ctx }, cardId);
      },
    },
  },
}
```

## Step 6: Wire Up UI

Edit `src/components/GameBoard.tsx` in the `handlePlayCard` function:

```typescript
switch (card.type) {
  // ... existing cases
  case 'YOUR_NEW_CARD':
    console.log('[Calling] moves.playYourNewCard', cardId, targetId);
    moves.playYourNewCard(cardId, targetId);
    showAction('You played Your New Card!');
    break;
}
```

## Step 7: Add Tests

Create tests in `src/test/unit/moves.test.ts`:

```typescript
describe('Your New Card', () => {
  let G: any;
  let ctx: any;

  beforeEach(() => {
    ctx = { numPlayers: 4, currentPlayer: '0' };
    G = setup({ ctx });

    // Setup test scenario
    G.players['0'].hasDrawn = true;
    G.players['0'].hand = ['your-card-1'];

    G.cardMap['your-card-1'] = {
      id: 'your-card-1',
      name: 'Your New Card',
      type: 'YOUR_NEW_CARD',
      // ... other properties
    };
  });

  it('should play Your New Card correctly', () => {
    playYourNewCard({ G, ctx }, 'your-card-1');

    // Add assertions
    expect(G.players['0'].hand).not.toContain('your-card-1');
    expect(G.discardPile).toContainEqual(expect.objectContaining({ id: 'your-card-1' }));
  });
});
```

## Common Patterns

### Drawing Cards

```typescript
import { drawCards } from './utils/characterAbilities';

drawCards(G, playerId, 2);  // Draw 2 cards
```

### Dealing Damage

```typescript
const target = G.players[targetId];
target.health -= 1;

if (target.health <= 0) {
  target.isDead = true;
  // Handle death rewards
}
```

### Checking Distance

```typescript
import { calculateDistance, isInRange } from './utils/distance';

const distance = calculateDistance(G, playerId, targetId);
const inRange = isInRange(G, playerId, targetId);
```

### Multi-Target Cards

```typescript
const alivePlayers = getAlivePlayers(G);
const targets = alivePlayers.filter(id => id !== playerId);

G.pendingAction = {
  type: 'YOUR_NEW_CARD',
  sourcePlayerId: playerId,
  targetPlayerId: targets[0],
  remainingTargets: targets.slice(1),
};
```

## Validation Checklist

Before considering your card complete:

- [ ] Card type added to CardType union
- [ ] Card definition added to CARD_DEFINITIONS
- [ ] Card instances added to deck (with proper suit/rank)
- [ ] Move function implemented with proper validation
- [ ] hasDrawn check included (if not equipment)
- [ ] Card removed from hand and discarded/equipped
- [ ] PendingAction type updated (if reactive)
- [ ] Phase stage added (if reactive)
- [ ] UI wired up in GameBoard.tsx
- [ ] Tests written and passing
- [ ] Target validation added to isValidTarget (if requires target)

## Examples

See existing implementations:
- **Simple instant card:** `playBeer` in `src/game/moves.ts`
- **Card with target:** `playPanic` in `src/game/moves.ts`
- **Reactive card:** `playDuel` and `respondToDuel` in `src/game/moves.ts`
- **Multi-target card:** `playIndians` in `src/game/moves.ts`
- **Equipment card:** `equipCard` in `src/game/moves.ts`

## Troubleshooting

**Card not showing in UI:**
- Check that card instances were added to deck in `deck.ts`
- Verify card is in player's hand with console.log

**"INVALID_MOVE" returned:**
- Add console.log to identify which validation failed
- Check hasDrawn flag
- Verify targetId if requiresTarget is true

**Card not discarding:**
- Make sure to splice from hand AND push to discardPile
- For equipment, add to inPlay instead

**Tests failing:**
- Ensure G.cardMap has your card definition
- Set G.players['0'].hasDrawn = true in beforeEach
- Verify ctx has required fields (numPlayers, currentPlayer)
