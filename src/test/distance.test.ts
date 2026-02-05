// Unit tests for distance and range calculations

import { describe, it, expect, beforeEach } from 'vitest';
import { calculateDistance, getAttackRange, isInRange, getPlayersInRange } from '../game/utils/distance';
import { BangGameState, PlayerState } from '../game/setup';
import { CHARACTERS } from '../data/characters';

// Mock game state for testing
function createMockGameState(numPlayers: number = 4): BangGameState {
  const players: Record<string, PlayerState> = {};
  const turnOrder: string[] = [];

  for (let i = 0; i < numPlayers; i++) {
    const id = String(i);
    turnOrder.push(id);
    players[id] = {
      health: 4,
      maxHealth: 4,
      hand: [],
      inPlay: [],
      character: CHARACTERS[i],
      role: i === 0 ? 'sheriff' : 'outlaw',
      isDead: false,
      weapon: null,
      barrel: false,
      mustang: false,
      scope: false,
      dynamite: false,
      inJail: false,
      bangsPlayedThisTurn: 0,
      hasDrawn: false,
    };
  }

  return {
    deck: [],
    discardPile: [],
    players,
    sheriffId: '0',
    pendingAction: null,
    turnOrder,
    characterAbilitiesUsed: {},
    cardMap: {},
  } as BangGameState;
}

describe('Distance Calculation', () => {
  it('should calculate distance 0 for same player', () => {
    const G = createMockGameState(4);
    const distance = calculateDistance(G, '0', '0');
    expect(distance).toBe(0);
  });

  it('should calculate distance 1 for adjacent players', () => {
    const G = createMockGameState(4);
    expect(calculateDistance(G, '0', '1')).toBe(1);
    expect(calculateDistance(G, '1', '2')).toBe(1);
    expect(calculateDistance(G, '2', '3')).toBe(1);
    expect(calculateDistance(G, '3', '0')).toBe(1); // Circular
  });

  it('should calculate distance 2 for opposite players in 4-player game', () => {
    const G = createMockGameState(4);
    expect(calculateDistance(G, '0', '2')).toBe(2);
    expect(calculateDistance(G, '1', '3')).toBe(2);
  });

  it('should use minimum circular distance', () => {
    const G = createMockGameState(5);
    // Player 0 to Player 3: clockwise=3, counterclockwise=2
    expect(calculateDistance(G, '0', '3')).toBe(2);
  });

  it('should add 1 distance for Mustang', () => {
    const G = createMockGameState(4);
    G.players['1'].mustang = true;
    expect(calculateDistance(G, '0', '1')).toBe(2); // 1 + 1 (Mustang)
  });

  it('should subtract 1 distance for Scope', () => {
    const G = createMockGameState(4);
    G.players['0'].scope = true;
    expect(calculateDistance(G, '0', '2')).toBe(1); // 2 - 1 (Scope)
  });

  it('should handle Mustang + Scope combination', () => {
    const G = createMockGameState(4);
    G.players['0'].scope = true;
    G.players['2'].mustang = true;
    // Base distance: 2, Scope: -1, Mustang: +1 = 2
    expect(calculateDistance(G, '0', '2')).toBe(2);
  });

  it('should add 1 distance for Paul Regret ability', () => {
    const G = createMockGameState(4);
    G.players['1'].character = CHARACTERS.find(c => c.id === 'paul-regret')!;
    expect(calculateDistance(G, '0', '1')).toBe(2); // 1 + 1 (Paul Regret)
  });

  it('should subtract 1 distance for Rose Doolan ability', () => {
    const G = createMockGameState(4);
    G.players['0'].character = CHARACTERS.find(c => c.id === 'rose-doolan')!;
    expect(calculateDistance(G, '0', '2')).toBe(1); // 2 - 1 (Rose Doolan)
  });

  it('should never go below distance 1', () => {
    const G = createMockGameState(4);
    G.players['0'].scope = true;
    G.players['0'].character = CHARACTERS.find(c => c.id === 'rose-doolan')!;
    // Base: 1, Scope: -1, Rose: -1 = -1, but min is 1
    expect(calculateDistance(G, '0', '1')).toBe(1);
  });

  it('should return Infinity for dead players', () => {
    const G = createMockGameState(4);
    G.players['1'].isDead = true;
    expect(calculateDistance(G, '0', '1')).toBe(Infinity);
  });

  it('should recalculate when players die', () => {
    const G = createMockGameState(5);
    // 0-1-2-3-4
    expect(calculateDistance(G, '0', '3')).toBe(2);

    // Kill players 1 and 2
    G.players['1'].isDead = true;
    G.players['2'].isDead = true;

    // Now: 0-3-4, so 0 to 3 is distance 1
    expect(calculateDistance(G, '0', '3')).toBe(1);
  });
});

describe('Attack Range', () => {
  it('should return 1 for default Colt .45', () => {
    const G = createMockGameState(4);
    expect(getAttackRange(G, '0')).toBe(1);
  });

  it('should return weapon range when equipped', () => {
    const G = createMockGameState(4);
    G.players['0'].weapon = {
      id: 'test-1',
      name: 'Schofield',
      type: 'SCHOFIELD',
      suit: 'spades',
      rank: 'J',
      category: 'blue',
      description: 'Range 2',
      range: 2,
      isWeapon: true,
      isEquipment: true,
    };
    expect(getAttackRange(G, '0')).toBe(2);
  });

  it('should handle Winchester (range 5)', () => {
    const G = createMockGameState(7);
    G.players['0'].weapon = {
      id: 'test-2',
      name: 'Winchester',
      type: 'WINCHESTER',
      suit: 'spades',
      rank: '8',
      category: 'blue',
      description: 'Range 5',
      range: 5,
      isWeapon: true,
      isEquipment: true,
    };
    expect(getAttackRange(G, '0')).toBe(5);
  });
});

describe('Range Validation', () => {
  it('should allow attack within range', () => {
    const G = createMockGameState(4);
    expect(isInRange(G, '0', '1')).toBe(true); // Distance 1, range 1
  });

  it('should block attack out of range', () => {
    const G = createMockGameState(4);
    expect(isInRange(G, '0', '2')).toBe(false); // Distance 2, range 1
  });

  it('should allow attack with weapon range', () => {
    const G = createMockGameState(4);
    G.players['0'].weapon = {
      id: 'test-3',
      name: 'Remington',
      type: 'REMINGTON',
      suit: 'clubs',
      rank: 'K',
      category: 'blue',
      description: 'Range 3',
      range: 3,
      isWeapon: true,
      isEquipment: true,
    };
    expect(isInRange(G, '0', '2')).toBe(true); // Distance 2, range 3
  });

  it('should respect Mustang when checking range', () => {
    const G = createMockGameState(4);
    G.players['1'].mustang = true;
    expect(isInRange(G, '0', '1')).toBe(false); // Distance 2 (1+Mustang), range 1
  });
});

describe('Players In Range', () => {
  it('should return adjacent players with default range', () => {
    const G = createMockGameState(4);
    const inRange = getPlayersInRange(G, '0');
    expect(inRange).toHaveLength(2); // Players 1 and 3
    expect(inRange).toContain('1');
    expect(inRange).toContain('3');
  });

  it('should return more players with extended range', () => {
    const G = createMockGameState(5);
    G.players['0'].weapon = {
      id: 'test-4',
      name: 'Schofield',
      type: 'SCHOFIELD',
      suit: 'spades',
      rank: 'Q',
      category: 'blue',
      description: 'Range 2',
      range: 2,
      isWeapon: true,
      isEquipment: true,
    };
    const inRange = getPlayersInRange(G, '0');
    expect(inRange).toHaveLength(4); // All others in 5-player game
  });

  it('should exclude self from targets', () => {
    const G = createMockGameState(4);
    const inRange = getPlayersInRange(G, '0');
    expect(inRange).not.toContain('0');
  });

  it('should exclude dead players', () => {
    const G = createMockGameState(4);
    G.players['1'].isDead = true;
    const inRange = getPlayersInRange(G, '0');
    expect(inRange).not.toContain('1');
  });
});
