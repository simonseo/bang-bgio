# How to Add New Characters to Bang!

This guide explains how to add a new character with abilities to the game.

## Overview

Adding a new character involves:
1. Define the character data
2. Implement the ability logic
3. Add tests
4. (Optional) Add character portrait image

## Step 1: Define Character Data

Edit `src/data/characters.ts`:

```typescript
export const CHARACTERS: Character[] = [
  // ... existing characters
  {
    id: 'your-character-id',
    name: 'Your Character Name',
    health: 4,  // Base health (3 or 4)
    ability: 'your-ability-id',
    description: 'Brief description of ability',
    timing: 'passive',  // or 'onDraw', 'onDamage', 'onTurn', 'reactive'
  },
];
```

### Character Ability Timing Types

- **passive**: Always active (e.g., Paul Regret's +1 distance)
- **onDrawPhase**: Triggers during draw phase (e.g., Kit Carlson)
- **onDamage**: Triggers when taking damage (e.g., Bart Cassidy)
- **onTurn**: Triggers at start of turn
- **reactive**: Triggers in specific situations (e.g., Jourdonnais' barrel)

## Step 2: Implement Ability Logic

Character abilities are implemented in `src/game/utils/characterAbilities.ts`.

### For Passive Abilities

Passive abilities are usually checked in validation or calculation functions:

```typescript
// Example: Distance modifier (like Paul Regret)
// In src/game/utils/distance.ts
export function calculateDistance(G: BangGameState, fromId: string, toId: string): number {
  // ... base calculation ...

  // Add character ability modifier
  const fromPlayer = G.players[fromId];
  const toPlayer = G.players[toId];

  if (toPlayer.character.id === 'paul-regret') {
    distance += 1;  // All see Paul Regret at +1 distance
  }

  if (fromPlayer.character.id === 'rose-doolan') {
    distance -= 1;  // Rose Doolan sees all at -1 distance
  }

  return Math.max(1, distance);
}
```

```typescript
// Example: Unlimited BANGs (like Willy the Kid)
// In src/game/utils/characterAbilities.ts
export function canPlayUnlimitedBangs(G: BangGameState, playerId: string): boolean {
  const player = G.players[playerId];

  if (player.character.id === 'willy-the-kid') {
    return true;
  }

  // Check weapon too
  if (player.weapon && player.weapon.type === 'VOLCANIC') {
    return true;
  }

  return false;
}
```

### For Draw Phase Abilities

Add to the `triggerAbility` function:

```typescript
export function triggerAbility(
  G: BangGameState,
  ctx: any,
  playerId: string,
  trigger: 'onDrawPhase' | 'onDamage' | 'onTurn' | 'onHandEmpty',
  payload?: any
): any {
  const player = G.players[playerId];
  const characterId = player.character.id;

  if (trigger === 'onDrawPhase') {
    switch (characterId) {
      // ... existing cases

      case 'your-character-id':
        // Implement special draw logic
        // Example: Look at top 3 cards and choose 2
        if (G.deck.length >= 3) {
          const top3 = [G.deck.pop()!, G.deck.pop()!, G.deck.pop()!];
          // For now, just take first 2 (UI would let player choose)
          player.hand.push(top3[0].id, top3[1].id);
          G.deck.push(top3[2]);
          player.hasDrawn = true;
          return { useSpecialDraw: true };
        }
        break;
    }
  }

  if (trigger === 'onDamage') {
    switch (characterId) {
      // ... existing cases

      case 'your-character-id':
        // Example: Draw cards when damaged
        const damageAmount = payload?.damageAmount || 1;
        drawCards(G, playerId, damageAmount);
        break;
    }
  }

  return null;
}
```

### For Reactive Abilities

Add checks in the relevant move functions:

```typescript
// Example: Virtual Barrel (like Jourdonnais)
// In src/game/utils/characterAbilities.ts
export function hasVirtualBarrel(G: BangGameState, playerId: string): boolean {
  const player = G.players[playerId];
  return player.character.id === 'jourdonnais';
}

// Then use in moves.ts
export function useBarrel({ G, ctx }: { G: BangGameState; ctx: any }) {
  const playerId = ctx.playerID || ctx.currentPlayer;
  const player = G.players[playerId];

  // Check if player has barrel OR Jourdonnais ability
  if (!player.barrel && !hasVirtualBarrel(G, playerId)) {
    return INVALID_MOVE;
  }

  // ... rest of barrel logic
}
```

### For Abilities That Modify Requirements

```typescript
// Example: Slab the Killer (requires 2 Missed! to dodge)
// In src/game/utils/characterAbilities.ts
export function requiresDoubleMissed(G: BangGameState, attackerId: string): boolean {
  const attacker = G.players[attackerId];
  return attacker.character.id === 'slab-the-killer';
}

// Then use in playBang
export function playBang({ G, ctx }: { G: BangGameState; ctx: GameCtx }, cardId: string, targetId: string) {
  // ...
  G.pendingAction = {
    type: 'BANG',
    sourcePlayerId: playerId,
    targetPlayerId: targetId,
    cardId,
    requiresMissed: requiresDoubleMissed(G, playerId) ? 2 : 1,  // Slab needs 2
  };
  // ...
}
```

### For Abilities That Swap Card Functions

```typescript
// Example: Calamity Janet (BANG! as Missed! and vice versa)
// In src/game/utils/characterAbilities.ts
export function canSwapBangMissed(G: BangGameState, playerId: string): boolean {
  const player = G.players[playerId];
  return player.character.id === 'calamity-janet';
}

// Then in validation logic
export function canPlayCard(G: BangGameState, ctx: Ctx, playerId: string, cardId: string, targetId?: string) {
  const card = G.cardMap[cardId];

  // Allow Calamity Janet to play BANG! as Missed!
  if (card.type === 'BANG' && canSwapBangMissed(G, playerId)) {
    // Allow playing as defensive card
  }

  // ... rest of validation
}
```

## Step 3: Add Tests

Create tests in `src/test/unit/characterAbilities.test.ts`:

```typescript
describe('Your Character Ability', () => {
  let G: any;
  let ctx: any;

  beforeEach(() => {
    ctx = { numPlayers: 4, currentPlayer: '0' };
    G = setup({ ctx });

    // Give player your character
    G.players['0'].character = {
      id: 'your-character-id',
      name: 'Your Character',
      health: 4,
      ability: 'your-ability-id',
      description: 'Description',
    };
  });

  it('should trigger ability correctly', () => {
    // Test your ability
    // Example for draw phase ability:
    const result = triggerAbility(G, ctx, '0', 'onDrawPhase');

    expect(result?.useSpecialDraw).toBe(true);
    expect(G.players['0'].hand.length).toBe(/* expected count */);
  });

  it('should handle edge cases', () => {
    // Test edge cases like empty deck, etc.
  });
});
```

## Step 4: Add Character Portrait (Optional)

1. Add image file to `public/assets/cards/characters/your-character-id.png`
2. Update `src/utils/assetMapping.ts`:

```typescript
export const characterImageMap: Record<string, string> = {
  // ... existing characters
  'your-character-id': '/assets/cards/characters/your-character-id.png',
};
```

## Common Character Ability Patterns

### Drawing Extra Cards

```typescript
case 'your-character-id':
  if (trigger === 'onDrawPhase') {
    drawCards(G, playerId, 3);  // Draw 3 instead of 2
    player.hasDrawn = true;
    return { useSpecialDraw: true };
  }
  break;
```

### Drawing When Damaged

```typescript
case 'bart-cassidy':
  if (trigger === 'onDamage') {
    const damageAmount = payload?.damageAmount || 1;
    drawCards(G, playerId, damageAmount);
  }
  break;
```

### Modifying Distance

```typescript
// In distance.ts
if (toPlayer.character.id === 'paul-regret') {
  distance += 1;
}
if (fromPlayer.character.id === 'rose-doolan') {
  distance -= 1;
}
```

### Stealing Cards on Death

```typescript
case 'vulture-sam':
  if (trigger === 'onPlayerDeath') {
    const deadPlayerId = payload?.deadPlayerId;
    const deadPlayer = G.players[deadPlayerId];

    // Take all cards from dead player
    deadPlayer.hand.forEach(cardId => {
      player.hand.push(cardId);
    });
    deadPlayer.hand = [];
  }
  break;
```

### Conditional Card Effects

```typescript
// Lucky Duke: Draw 2 cards for "draw!" checks, choose 1
export function luckyDukeDraw(G: BangGameState): Card[] {
  const card1 = G.deck.pop();
  const card2 = G.deck.pop();

  if (!card1 || !card2) return [];

  // For now, just return first card (UI would let player choose)
  G.deck.push(card2);
  return [card1];
}
```

## Character Balance Considerations

When creating new characters, consider:

- **Health**: Most characters have 4 health, some have 3 for stronger abilities
- **Passive vs Active**: Passive abilities are simpler but less interactive
- **Frequency**: How often will the ability trigger?
- **Power Level**: Compare to existing characters
- **Complexity**: Simpler is better for new players

### Power Level Examples

- **Weak ability → 4 health**: Paul Regret (+1 distance to target)
- **Medium ability → 4 health**: Bart Cassidy (draw when damaged)
- **Strong ability → 3 health**: Willy the Kid (unlimited BANGs)

## Testing Checklist

- [ ] Character added to CHARACTERS array
- [ ] Ability logic implemented
- [ ] Ability triggers at correct timing
- [ ] Edge cases handled (empty deck, no targets, etc.)
- [ ] Tests written and passing
- [ ] Character works with 4, 5, 6, 7 player games
- [ ] Ability doesn't break game rules
- [ ] (Optional) Character portrait added

## Examples in Codebase

See existing implementations:
- **Passive distance:** Paul Regret, Rose Doolan in `distance.ts`
- **Draw phase:** Kit Carlson, Black Jack in `characterAbilities.ts`
- **On damage:** Bart Cassidy, El Gringo in `characterAbilities.ts`
- **Reactive:** Jourdonnais (virtual barrel) in `characterAbilities.ts`
- **Unlimited actions:** Willy the Kid in `characterAbilities.ts`
- **Card swapping:** Calamity Janet in `characterAbilities.ts`

## Troubleshooting

**Ability not triggering:**
- Check trigger type matches timing field
- Verify triggerAbility is called in correct place
- Add console.log to confirm code path

**Ability too powerful in testing:**
- Reduce health from 4 to 3
- Add restrictions (once per turn, specific situations)
- Make effect optional rather than automatic

**Ability conflicts with rules:**
- Check if ability properly validates game state
- Ensure ability respects hasDrawn, BANG! limits, etc.
- Test with other characters and cards
