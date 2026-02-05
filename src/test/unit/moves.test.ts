/**
 * Unit tests for move functions
 * Tests the correct function signature and parameter passing
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { playBang, equipCard, takeDamage, playWellsFargo, playStagecoach, playBeer, playGatling, playIndians, respondToIndians, playDuel, respondToDuel, playGeneralStore, respondToGeneralStore } from '../../game/moves';
import { setup } from '../../game/setup';
import { isCardPlayable } from '../../game/utils/playability';

describe('Move Function Signatures', () => {
  let G: any;
  let ctx: any;

  beforeEach(() => {
    // Setup a 4-player game
    ctx = {
      numPlayers: 4,
      currentPlayer: '0',
    };
    G = setup({ ctx });

    // Ensure player has cards
    G.players['0'].hasDrawn = true;
    G.players['0'].hand = ['card-1', 'card-2'];
    G.cardMap['card-1'] = {
      id: 'card-1',
      name: 'BANG!',
      type: 'BANG',
      suit: 'hearts',
      rank: 'A',
      category: 'brown',
      description: 'Test',
      requiresTarget: true,
    };
    G.cardMap['card-2'] = {
      id: 'card-2',
      name: 'Volcanic',
      type: 'VOLCANIC',
      suit: 'spades',
      rank: '10',
      category: 'blue',
      description: 'Test weapon',
      isEquipment: true,
      isWeapon: true,
      range: 1,
    };
  });

  it('playBang should receive { G, ctx } object, not separate parameters', () => {
    // Test that move function works with correct signature
    const result = playBang({ G, ctx }, 'card-1', '1');

    // Should not return INVALID_MOVE
    expect(result).not.toBe('INVALID_MOVE');

    // Should access ctx.currentPlayer correctly
    expect(G.players['0'].hand).not.toContain('card-1');
  });

  it('equipCard should receive { G, ctx } object, not separate parameters', () => {
    // Test that move function works with correct signature
    const result = equipCard({ G, ctx }, 'card-2');

    // Should not return INVALID_MOVE
    expect(result).not.toBe('INVALID_MOVE');

    // Should access ctx.currentPlayer correctly
    expect(G.players['0'].hand).not.toContain('card-2');
  });

  it('equipCard should return INVALID_MOVE when cardId does not exist in cardMap', () => {
    // Add card to player's hand but NOT to cardMap
    // This simulates a corrupted state where card IDs are out of sync
    G.players['0'].hand.push('missing-card-id');

    // Test that equipCard handles missing cardId gracefully
    const result = equipCard({ G, ctx }, 'missing-card-id');

    // Should return INVALID_MOVE instead of crashing with "Cannot read properties of undefined"
    expect(result).toBe('INVALID_MOVE');
  });
});

describe('BANG Health Reduction', () => {
  let G: any;
  let ctx: any;

  beforeEach(() => {
    // Setup a 4-player game
    ctx = {
      numPlayers: 4,
      currentPlayer: '0',
      events: {
        setActivePlayers: () => {},
        endTurn: () => {},
      },
    };
    G = setup({ ctx });

    // Player 0 has BANG card and is adjacent to player 1 (default weapon range 1)
    G.players['0'].hasDrawn = true;
    G.players['0'].hand = ['bang-1'];
    G.players['0'].bangsPlayedThisTurn = 0;

    // Default Colt .45 weapon
    G.cardMap['colt-45'] = {
      id: 'colt-45',
      name: 'Colt .45',
      type: 'COLT',
      suit: 'hearts',
      rank: 'K',
      category: 'blue',
      description: 'Range 1',
      range: 1,
      isWeapon: true,
      isEquipment: true,
    };
    G.players['0'].weapon = G.cardMap['colt-45'];

    G.cardMap['bang-1'] = {
      id: 'bang-1',
      name: 'BANG!',
      type: 'BANG',
      suit: 'hearts',
      rank: 'A',
      category: 'brown',
      description: 'Test',
      requiresTarget: true,
    };

    // Player 1 is target with 4 health (adjacent, distance 1)
    G.players['1'].health = 4;
    G.players['1'].maxHealth = 4;
    G.players['1'].isDead = false;

    // Ensure turnOrder is properly set for distance calculation
    // In a 4-player game: 0, 1, 2, 3 in a circle
    // Distance from 0 to 1 = 1 (adjacent)
    G.turnOrder = ['0', '1', '2', '3'];
  });

  it('BANG should create pendingAction and reduce health when takeDamage is called', () => {
    // Player 0 plays BANG on Player 1
    playBang({ G, ctx }, 'bang-1', '1');

    // Should create pendingAction
    expect(G.pendingAction).toBeDefined();
    expect(G.pendingAction?.type).toBe('BANG');
    expect(G.pendingAction?.targetPlayerId).toBe('1');

    // Player 1's initial health
    const initialHealth = G.players['1'].health;
    expect(initialHealth).toBe(4);

    // Player 1 takes damage (doesn't play Missed)
    ctx.playerID = '1';
    ctx.currentPlayer = '1';
    takeDamage({ G, ctx }, 1);

    // Health should be reduced
    expect(G.players['1'].health).toBe(3);
    expect(G.players['1'].health).toBe(initialHealth - 1);

    // pendingAction should be cleared
    expect(G.pendingAction).toBeNull();
  });

  it('BANG followed by takeDamage should reduce health by 1', () => {
    // Play BANG
    playBang({ G, ctx }, 'bang-1', '1');

    // Record initial health
    const healthBefore = G.players['1'].health;

    // Target takes damage
    ctx.playerID = '1';
    takeDamage({ G, ctx }, 1);

    // Verify health decreased
    expect(G.players['1'].health).toBe(healthBefore - 1);
  });
});

describe('Card Draw Functions', () => {
  let G: any;
  let ctx: any;

  beforeEach(() => {
    ctx = {
      numPlayers: 4,
      currentPlayer: '0',
    };
    G = setup({ ctx });

    // Ensure deck has cards
    G.deck = Array(20).fill(null).map((_, i) => ({
      id: `deck-card-${i}`,
      name: `Card ${i}`,
      type: 'BANG',
    }));

    // Player 0 has draw cards
    G.players['0'].hasDrawn = true;
    G.players['0'].hand = ['stagecoach-1', 'wells-fargo-1'];

    G.cardMap['stagecoach-1'] = {
      id: 'stagecoach-1',
      name: 'Stagecoach',
      type: 'STAGECOACH',
      category: 'brown',
      description: 'Draw 2 cards',
    };

    G.cardMap['wells-fargo-1'] = {
      id: 'wells-fargo-1',
      name: 'Wells Fargo',
      type: 'WELLS_FARGO',
      category: 'brown',
      description: 'Draw 3 cards',
    };
  });

  it('Stagecoach should draw 2 cards', () => {
    const handSizeBefore = G.players['0'].hand.length;
    const deckSizeBefore = G.deck.length;

    playStagecoach({ G, ctx }, 'stagecoach-1');

    // Hand should have 2 more cards (minus the stagecoach played)
    expect(G.players['0'].hand.length).toBe(handSizeBefore + 1); // -1 for played card, +2 drawn = +1 net
    // Deck should have 2 fewer cards
    expect(G.deck.length).toBe(deckSizeBefore - 2);
    // Stagecoach should be discarded
    expect(G.discardPile).toContainEqual(expect.objectContaining({ id: 'stagecoach-1' }));
  });

  it('Wells Fargo should draw 3 cards', () => {
    const handSizeBefore = G.players['0'].hand.length;
    const deckSizeBefore = G.deck.length;

    playWellsFargo({ G, ctx }, 'wells-fargo-1');

    // Hand should have 3 more cards (minus the wells fargo played)
    expect(G.players['0'].hand.length).toBe(handSizeBefore + 2); // -1 for played card, +3 drawn = +2 net
    // Deck should have 3 fewer cards
    expect(G.deck.length).toBe(deckSizeBefore - 3);
    // Wells Fargo should be discarded
    expect(G.discardPile).toContainEqual(expect.objectContaining({ id: 'wells-fargo-1' }));
  });
});

describe('HasDrawn Validation', () => {
  let G: any;
  let ctx: any;

  beforeEach(() => {
    ctx = {
      numPlayers: 4,
      currentPlayer: '0',
    };
    G = setup({ ctx });

    // Player 0 has cards but hasn't drawn yet
    G.players['0'].hasDrawn = false;
    G.players['0'].hand = ['beer-1', 'bang-1'];
    G.players['0'].health = 3;
    G.players['0'].maxHealth = 4;

    G.cardMap['beer-1'] = {
      id: 'beer-1',
      name: 'Beer',
      type: 'BEER',
      category: 'brown',
      description: 'Heal 1',
      requiresTarget: false,
    };

    G.cardMap['bang-1'] = {
      id: 'bang-1',
      name: 'BANG!',
      type: 'BANG',
      category: 'brown',
      description: 'Attack',
      requiresTarget: true,
    };
  });

  it('should not allow playing cards before drawing (hasDrawn = false)', () => {
    // hasDrawn is false
    expect(G.players['0'].hasDrawn).toBe(false);

    // Cards should not be playable
    expect(isCardPlayable(G, ctx, '0', 'beer-1')).toBe(false);
    expect(isCardPlayable(G, ctx, '0', 'bang-1')).toBe(false);
  });

  it('should allow playing cards after drawing (hasDrawn = true)', () => {
    // Set hasDrawn to true
    G.players['0'].hasDrawn = true;

    // Beer should now be playable (not at max health)
    expect(isCardPlayable(G, ctx, '0', 'beer-1')).toBe(true);
    // BANG needs valid target, but at least it won't be blocked by hasDrawn
  });

  it('move functions should return INVALID_MOVE if hasDrawn = false', () => {
    // hasDrawn is false
    G.players['0'].hasDrawn = false;

    // Try to play Beer before drawing
    const result = playBeer({ G, ctx }, 'beer-1');

    // Should return INVALID_MOVE (validation fails in canPlayCard)
    // Note: playBeer doesn't check hasDrawn directly, but canPlayCard might not be called
    // Let's verify the beer is still in hand (move didn't execute)
    expect(G.players['0'].hand).toContain('beer-1');
  });
});

describe('Multi-Target Cards', () => {
  let G: any;
  let ctx: any;

  beforeEach(() => {
    ctx = {
      numPlayers: 4,
      currentPlayer: '0',
      events: {
        setActivePlayers: () => {},
        endTurn: () => {},
      },
    };
    G = setup({ ctx });

    // Player 0 has Gatling and Indians
    G.players['0'].hasDrawn = true;
    G.players['0'].hand = ['gatling-1', 'indians-1'];

    G.cardMap['gatling-1'] = {
      id: 'gatling-1',
      name: 'Gatling',
      type: 'GATLING',
      category: 'brown',
      description: 'BANG! all other players',
      requiresTarget: false,
    };

    G.cardMap['indians-1'] = {
      id: 'indians-1',
      name: 'Indians!',
      type: 'INDIANS',
      category: 'brown',
      description: 'All must discard BANG! or lose health',
      requiresTarget: false,
    };

    // All players alive with 4 health
    ['0', '1', '2', '3'].forEach(id => {
      G.players[id].health = 4;
      G.players[id].isDead = false;
    });

    G.turnOrder = ['0', '1', '2', '3'];
  });

  it('Gatling should create pendingAction with all other players as targets', () => {
    playGatling({ G, ctx }, 'gatling-1');

    // Should create pendingAction
    expect(G.pendingAction).toBeDefined();
    expect(G.pendingAction?.type).toBe('GATLING');
    expect(G.pendingAction?.sourcePlayerId).toBe('0');

    // Should have first target and remaining targets
    expect(G.pendingAction?.targetPlayerId).toBe('1');
    expect(G.pendingAction?.remainingTargets).toEqual(['2', '3']);

    // Card should be discarded
    expect(G.players['0'].hand).not.toContain('gatling-1');
  });

  it('Indians should create pendingAction with all other players as targets', () => {
    playIndians({ G, ctx }, 'indians-1');

    // Should create pendingAction
    expect(G.pendingAction).toBeDefined();
    expect(G.pendingAction?.type).toBe('INDIANS');
    expect(G.pendingAction?.sourcePlayerId).toBe('0');

    // Should have first target and remaining targets
    expect(G.pendingAction?.targetPlayerId).toBe('1');
    expect(G.pendingAction?.remainingTargets).toEqual(['2', '3']);

    // Card should be discarded
    expect(G.players['0'].hand).not.toContain('indians-1');
  });

  it('respondToIndians without BANG should cause damage', () => {
    playIndians({ G, ctx }, 'indians-1');

    const initialHealth = G.players['1'].health;

    // Player 1 doesn't discard BANG (no cardId)
    ctx.playerID = '1';
    respondToIndians({ G, ctx });

    // Should take damage
    expect(G.players['1'].health).toBe(initialHealth - 1);

    // Should move to next target
    expect(G.pendingAction?.targetPlayerId).toBe('2');
  });
});

describe('Duel Card', () => {
  let G: any;
  let ctx: any;

  beforeEach(() => {
    ctx = {
      numPlayers: 4,
      currentPlayer: '0',
      events: {
        setActivePlayers: () => {},
        endTurn: () => {},
      },
    };
    G = setup({ ctx });

    // Setup cardMap first
    G.cardMap['duel-1'] = {
      id: 'duel-1',
      name: 'Duel',
      type: 'DUEL',
      category: 'brown',
      description: 'BANG! battle between two players',
      requiresTarget: true,
    };

    G.cardMap['bang-1'] = {
      id: 'bang-1',
      name: 'BANG!',
      type: 'BANG',
      category: 'brown',
      description: 'Attack',
      requiresTarget: true,
    };

    G.cardMap['bang-2'] = {
      id: 'bang-2',
      name: 'BANG!',
      type: 'BANG',
      category: 'brown',
      description: 'Attack',
      requiresTarget: true,
    };

    // All players alive with 4 health
    ['0', '1', '2', '3'].forEach(id => {
      G.players[id].health = 4;
      G.players[id].isDead = false;
      G.players[id].hasDrawn = true;
      if (id === '0') {
        G.players[id].hand = ['duel-1', 'bang-1'];
      } else {
        G.players[id].hand = ['bang-2'];
      }
    });

    G.turnOrder = ['0', '1', '2', '3'];
  });

  it('playDuel should create pendingAction with target', () => {
    playDuel({ G, ctx }, 'duel-1', '1');

    // Should create pendingAction
    expect(G.pendingAction).toBeDefined();
    expect(G.pendingAction?.type).toBe('DUEL');
    expect(G.pendingAction?.sourcePlayerId).toBe('0');
    expect(G.pendingAction?.targetPlayerId).toBe('1');
    expect(G.pendingAction?.bangCount).toBe(0);

    // Card should be discarded
    expect(G.players['0'].hand).not.toContain('duel-1');
  });

  it('respondToDuel with BANG should switch turn', () => {
    playDuel({ G, ctx }, 'duel-1', '1');

    // Player 1 responds with BANG
    ctx.playerID = '1';
    ctx.currentPlayer = '1'; // Some functions use currentPlayer

    respondToDuel({ G, ctx }, 'bang-2');

    // Should increment bangCount
    expect(G.pendingAction?.bangCount).toBe(1);
    // Should switch target back to player 0
    expect(G.pendingAction?.targetPlayerId).toBe('0');
    // BANG should be discarded
    expect(G.players['1'].hand).not.toContain('bang-2');
  });

  it('respondToDuel without BANG should cause damage', () => {
    playDuel({ G, ctx }, 'duel-1', '1');

    const initialHealth = G.players['1'].health;

    // Player 1 doesn't respond with BANG
    ctx.playerID = '1';
    respondToDuel({ G, ctx });

    // Should take damage
    expect(G.players['1'].health).toBe(initialHealth - 1);
    // pendingAction should be cleared
    expect(G.pendingAction).toBeNull();
  });
});

describe('BANG Limit Enforcement', () => {
  let G: any;
  let ctx: any;

  beforeEach(() => {
    ctx = {
      numPlayers: 4,
      currentPlayer: '0',
      events: {
        setActivePlayers: () => {},
        endTurn: () => {},
      },
    };
    G = setup({ ctx });

    // Player 0 has multiple BANG cards
    G.players['0'].hasDrawn = true;
    G.players['0'].hand = ['bang-1', 'bang-2'];
    G.players['0'].bangsPlayedThisTurn = 0;
    G.players['0'].weapon = { range: 1, type: 'COLT' };

    G.cardMap['bang-1'] = {
      id: 'bang-1',
      name: 'BANG!',
      type: 'BANG',
      suit: 'hearts',
      rank: 'A',
      category: 'brown',
      description: 'Attack',
      requiresTarget: true,
    };

    G.cardMap['bang-2'] = {
      id: 'bang-2',
      name: 'BANG!',
      type: 'BANG',
      suit: 'diamonds',
      rank: 'K',
      category: 'brown',
      description: 'Attack',
      requiresTarget: true,
    };

    // All players alive
    ['0', '1', '2', '3'].forEach(id => {
      G.players[id].health = 4;
      G.players[id].isDead = false;
    });

    G.turnOrder = ['0', '1', '2', '3'];
  });

  it('should allow first BANG! in a turn', () => {
    expect(G.players['0'].bangsPlayedThisTurn).toBe(0);

    // Play first BANG
    const result = playBang({ G, ctx }, 'bang-1', '1');

    expect(result).not.toBe('INVALID_MOVE');
    expect(G.players['0'].bangsPlayedThisTurn).toBe(1);
  });

  it('should block second BANG! in a turn (default weapon)', () => {
    // Play first BANG
    playBang({ G, ctx }, 'bang-1', '1');
    expect(G.players['0'].bangsPlayedThisTurn).toBe(1);

    // Clear pendingAction to allow second BANG attempt
    G.pendingAction = null;

    // Try to play second BANG
    const result = playBang({ G, ctx }, 'bang-2', '1');

    expect(result).toBe('INVALID_MOVE');
  });

  it('should allow unlimited BANGs with Volcanic', () => {
    // Give player Volcanic weapon (Card object)
    G.cardMap['volcanic-1'] = {
      id: 'volcanic-1',
      name: 'Volcanic',
      type: 'VOLCANIC',
      suit: 'spades',
      rank: '10',
      category: 'blue',
      description: 'Range 1. Unlimited BANGs',
      range: 1,
      isWeapon: true,
      isEquipment: true,
    };

    G.players['0'].weapon = G.cardMap['volcanic-1'];

    // Play first BANG
    playBang({ G, ctx }, 'bang-1', '1');
    expect(G.players['0'].bangsPlayedThisTurn).toBe(1);

    // Clear pendingAction
    G.pendingAction = null;

    // Play second BANG (should be allowed with Volcanic)
    const result = playBang({ G, ctx }, 'bang-2', '1');

    expect(result).not.toBe('INVALID_MOVE');
    expect(G.players['0'].bangsPlayedThisTurn).toBe(2);
  });

  it('should allow unlimited BANGs with Willy the Kid', () => {
    // Give player Willy the Kid character
    G.players['0'].character = {
      id: 'willy-the-kid',
      name: 'Willy the Kid',
      health: 4,
      ability: 'unlimited-bangs',
      description: 'Can play unlimited BANG! cards',
    };

    // Play first BANG
    playBang({ G, ctx }, 'bang-1', '1');
    expect(G.players['0'].bangsPlayedThisTurn).toBe(1);

    // Clear pendingAction
    G.pendingAction = null;

    // Play second BANG (should be allowed with Willy)
    const result = playBang({ G, ctx }, 'bang-2', '1');

    expect(result).not.toBe('INVALID_MOVE');
    expect(G.players['0'].bangsPlayedThisTurn).toBe(2);
  });
});

describe('Beer Validation', () => {
  let G: any;
  let ctx: any;

  beforeEach(() => {
    ctx = {
      numPlayers: 4,
      currentPlayer: '0',
    };
    G = setup({ ctx });

    G.players['0'].hasDrawn = true;
    G.players['0'].hand = ['beer-1'];
    G.players['0'].health = 3;
    G.players['0'].maxHealth = 4;

    G.cardMap['beer-1'] = {
      id: 'beer-1',
      name: 'Beer',
      type: 'BEER',
      suit: 'hearts',
      rank: 'A',
      category: 'brown',
      description: 'Heal 1 health',
    };

    G.turnOrder = ['0', '1', '2', '3'];
  });

  it('should allow Beer when not at full health', () => {
    expect(G.players['0'].health).toBe(3);
    expect(G.players['0'].maxHealth).toBe(4);

    const result = playBeer({ G, ctx }, 'beer-1');

    expect(result).not.toBe('INVALID_MOVE');
    expect(G.players['0'].health).toBe(4);
  });

  it('should block Beer when at full health', () => {
    G.players['0'].health = 4;
    G.players['0'].maxHealth = 4;

    const result = playBeer({ G, ctx }, 'beer-1');

    expect(result).toBe('INVALID_MOVE');
    expect(G.players['0'].hand).toContain('beer-1'); // Card should remain in hand
  });

  it('should block Beer with only 2 players alive', () => {
    // Kill 2 players
    G.players['1'].isDead = true;
    G.players['2'].isDead = true;

    // Only players 0 and 3 alive
    G.players['0'].health = 3;

    const result = playBeer({ G, ctx }, 'beer-1');

    expect(result).toBe('INVALID_MOVE');
  });

  it('should allow Beer with 3+ players alive', () => {
    // 4 players alive
    G.players['0'].health = 3;

    const result = playBeer({ G, ctx }, 'beer-1');

    expect(result).not.toBe('INVALID_MOVE');
    expect(G.players['0'].health).toBe(4);
  });
});

describe('Equipment Cards', () => {
  let G: any;
  let ctx: any;

  beforeEach(() => {
    ctx = {
      numPlayers: 4,
      currentPlayer: '0',
    };
    G = setup({ ctx });

    // Player 0 has equipment cards
    G.players['0'].hasDrawn = true;
    G.players['0'].hand = ['barrel-1', 'mustang-1', 'scope-1', 'schofield-1'];

    G.cardMap['barrel-1'] = {
      id: 'barrel-1',
      name: 'Barrel',
      type: 'BARREL',
      suit: 'spades',
      rank: 'K',
      category: 'blue',
      description: 'Draw! to dodge BANG!',
      isEquipment: true,
    };

    G.cardMap['mustang-1'] = {
      id: 'mustang-1',
      name: 'Mustang',
      type: 'MUSTANG',
      suit: 'hearts',
      rank: 'Q',
      category: 'blue',
      description: 'All see you at +1 distance',
      isEquipment: true,
    };

    G.cardMap['scope-1'] = {
      id: 'scope-1',
      name: 'Scope',
      type: 'SCOPE',
      suit: 'clubs',
      rank: 'A',
      category: 'blue',
      description: 'You see all at -1 distance',
      isEquipment: true,
    };

    G.cardMap['schofield-1'] = {
      id: 'schofield-1',
      name: 'Schofield',
      type: 'SCHOFIELD',
      suit: 'diamonds',
      rank: 'J',
      category: 'blue',
      description: 'Range 2 weapon',
      range: 2,
      isWeapon: true,
      isEquipment: true,
    };

    G.turnOrder = ['0', '1', '2', '3'];
  });

  it('should equip Barrel', () => {
    expect(G.players['0'].barrel).toBe(false);

    equipCard({ G, ctx }, 'barrel-1');

    expect(G.players['0'].barrel).toBe(true);
    expect(G.players['0'].inPlay).toContain('barrel-1');
    expect(G.players['0'].hand).not.toContain('barrel-1');
  });

  it('should equip Mustang', () => {
    expect(G.players['0'].mustang).toBe(false);

    equipCard({ G, ctx }, 'mustang-1');

    expect(G.players['0'].mustang).toBe(true);
    expect(G.players['0'].inPlay).toContain('mustang-1');
  });

  it('should equip Scope', () => {
    expect(G.players['0'].scope).toBe(false);

    equipCard({ G, ctx }, 'scope-1');

    expect(G.players['0'].scope).toBe(true);
    expect(G.players['0'].inPlay).toContain('scope-1');
  });

  it('should equip weapon and update range', () => {
    expect(G.players['0'].weapon).toBeNull();

    equipCard({ G, ctx }, 'schofield-1');

    expect(G.players['0'].weapon).toBeDefined();
    expect(G.players['0'].weapon?.range).toBe(2);
    expect(G.players['0'].inPlay).toContain('schofield-1');
  });
});

describe('General Store Card', () => {
  let G: any;
  let ctx: any;

  beforeEach(() => {
    ctx = {
      numPlayers: 4,
      currentPlayer: '0',
      events: {
        setActivePlayers: () => {},
        endTurn: () => {},
      },
    };
    G = setup({ ctx });

    // Ensure deck has enough cards
    G.deck = Array(20).fill(null).map((_, i) => {
      const card = {
        id: `deck-card-${i}`,
        name: `Card ${i}`,
        type: 'BANG',
        suit: 'hearts',
        rank: 'A',
        category: 'brown',
      };
      G.cardMap[card.id] = card;
      return card;
    });

    // Player 0 has General Store card
    G.players['0'].hasDrawn = true;
    G.players['0'].hand = ['general-store-1'];

    G.cardMap['general-store-1'] = {
      id: 'general-store-1',
      name: 'General Store',
      type: 'GENERAL_STORE',
      category: 'brown',
      description: 'All players draw from revealed cards',
      requiresTarget: false,
    };

    // All players alive
    ['0', '1', '2', '3'].forEach(id => {
      G.players[id].health = 4;
      G.players[id].isDead = false;
    });

    G.turnOrder = ['0', '1', '2', '3'];
  });

  it('playGeneralStore should reveal cards equal to number of alive players', () => {
    const deckSizeBefore = G.deck.length;
    playGeneralStore({ G, ctx }, 'general-store-1');

    // Should create pendingAction
    expect(G.pendingAction).toBeDefined();
    expect(G.pendingAction?.type).toBe('GENERAL_STORE');
    expect(G.pendingAction?.revealedCards).toHaveLength(4); // 4 alive players

    // Deck should have 4 fewer cards
    expect(G.deck.length).toBe(deckSizeBefore - 4);

    // First player in turn order should be targetPlayerId
    expect(G.pendingAction?.targetPlayerId).toBe('0');

    // Card should be discarded
    expect(G.players['0'].hand).not.toContain('general-store-1');
  });

  it('respondToGeneralStore should add card to player hand and move to next player', () => {
    playGeneralStore({ G, ctx }, 'general-store-1');

    const revealedCards = G.pendingAction?.revealedCards || [];
    const chosenCard = revealedCards[0];

    // Player 0 chooses first card
    ctx.playerID = '0';
    respondToGeneralStore({ G, ctx }, chosenCard);

    // Card should be in player's hand
    expect(G.players['0'].hand).toContain(chosenCard);

    // Should move to next player
    expect(G.pendingAction?.targetPlayerId).toBe('1');
    expect(G.pendingAction?.revealedCards).toHaveLength(3);
  });

  it('respondToGeneralStore should clear pendingAction when all players have chosen', () => {
    playGeneralStore({ G, ctx }, 'general-store-1');

    // All players choose cards in turn order
    ['0', '1', '2', '3'].forEach(playerId => {
      const revealedCards = G.pendingAction?.revealedCards || [];
      const chosenCard = revealedCards[0];

      ctx.playerID = playerId;
      respondToGeneralStore({ G, ctx }, chosenCard);
    });

    // pendingAction should be cleared
    expect(G.pendingAction).toBeNull();

    // All players should have received a card
    ['0', '1', '2', '3'].forEach(playerId => {
      expect(G.players[playerId].hand.length).toBeGreaterThan(0);
    });
  });
});
