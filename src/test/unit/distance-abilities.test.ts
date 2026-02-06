/**
 * Unit tests for distance-modifying character abilities
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { setup } from '../../game/setup';
import { calculateDistance } from '../../game/utils/distance';
import { CHARACTERS } from '../../data/characters';

describe('Distance-Modifying Character Abilities', () => {
  let G: any;
  let ctx: any;

  beforeEach(() => {
    ctx = {
      numPlayers: 4,
      currentPlayer: '0',
    };
    G = setup({ ctx });
  });

  describe('Paul Regret - Seen at distance +1', () => {
    it('should add 1 to distance when targeting Paul Regret', () => {
      // IMPORTANT: Set both players to neutral characters first to avoid flakiness
      // (setup() randomly assigns characters, could assign Rose Doolan who counters Paul Regret)
      const neutralChar = CHARACTERS.find(c => c.id === 'bart-cassidy')!;
      G.players['0'].character = neutralChar;

      // Set player 1 to Paul Regret
      const paulRegret = CHARACTERS.find(c => c.id === 'paul-regret')!;
      G.players['1'].character = paulRegret;

      // Calculate distance from player 0 to player 1
      const distance = calculateDistance(G, '0', '1');

      // Normal distance between adjacent players would be 1
      // With Paul Regret, it should be 2
      expect(distance).toBe(2);
    });

    it('should not affect distance when Paul Regret is the attacker', () => {
      // Set player 0 to Paul Regret
      const paulRegret = CHARACTERS.find(c => c.id === 'paul-regret')!;
      G.players['0'].character = paulRegret;

      // Set player 1 to a neutral character (not Rose Doolan to avoid distance modifier conflicts)
      const neutralChar = CHARACTERS.find(c => c.id === 'bart-cassidy')!;
      G.players['1'].character = neutralChar;

      // Calculate distance from player 0 to player 1
      const distance = calculateDistance(G, '0', '1');

      // Should be normal distance (1 for adjacent players)
      expect(distance).toBe(1);
    });

    it('should stack with Mustang', () => {
      // Set player 0 to neutral character
      const neutralChar = CHARACTERS.find(c => c.id === 'bart-cassidy')!;
      G.players['0'].character = neutralChar;

      // Set player 1 to Paul Regret with Mustang
      const paulRegret = CHARACTERS.find(c => c.id === 'paul-regret')!;
      G.players['1'].character = paulRegret;
      G.players['1'].mustang = true;

      // Calculate distance
      const distance = calculateDistance(G, '0', '1');

      // Base 1 + Paul Regret 1 + Mustang 1 = 3
      expect(distance).toBe(3);
    });
  });

  describe('Rose Doolan - Sees all at distance -1', () => {
    it('should subtract 1 from distance when Rose Doolan is attacking', () => {
      // Set player 0 to Rose Doolan
      const roseDoolan = CHARACTERS.find(c => c.id === 'rose-doolan')!;
      G.players['0'].character = roseDoolan;

      // Set player 2 to neutral character
      const neutralChar = CHARACTERS.find(c => c.id === 'bart-cassidy')!;
      G.players['2'].character = neutralChar;

      // Player 2 is at distance 2 normally
      const distance = calculateDistance(G, '0', '2');

      // Should be 2 - 1 = 1
      expect(distance).toBe(1);
    });

    it('should not go below minimum distance of 1', () => {
      // Set player 0 to Rose Doolan
      const roseDoolan = CHARACTERS.find(c => c.id === 'rose-doolan')!;
      G.players['0'].character = roseDoolan;

      // Set player 1 to neutral character
      const neutralChar = CHARACTERS.find(c => c.id === 'bart-cassidy')!;
      G.players['1'].character = neutralChar;

      // Calculate distance to adjacent player
      const distance = calculateDistance(G, '0', '1');

      // 1 - 1 = 0, but minimum is 1
      expect(distance).toBe(1);
    });

    it('should not affect distance when Rose Doolan is the target', () => {
      // Set player 1 to Rose Doolan
      const roseDoolan = CHARACTERS.find(c => c.id === 'rose-doolan')!;
      G.players['1'].character = roseDoolan;

      // Set player 0 to neutral character
      const neutralChar = CHARACTERS.find(c => c.id === 'bart-cassidy')!;
      G.players['0'].character = neutralChar;

      // Calculate distance from player 0 to player 1
      const distance = calculateDistance(G, '0', '1');

      // Should be normal distance (1 for adjacent)
      expect(distance).toBe(1);
    });

    it('should counteract Paul Regret effect', () => {
      // Player 0 is Rose Doolan (attacker)
      const roseDoolan = CHARACTERS.find(c => c.id === 'rose-doolan')!;
      G.players['0'].character = roseDoolan;

      // Player 1 is Paul Regret (target)
      const paulRegret = CHARACTERS.find(c => c.id === 'paul-regret')!;
      G.players['1'].character = paulRegret;

      // Calculate distance
      const distance = calculateDistance(G, '0', '1');

      // Base 1 + Paul Regret 1 - Rose Doolan 1 = 1
      expect(distance).toBe(1);
    });

    it('should work with Scope equipment', () => {
      // Player 0 is Rose Doolan with Scope
      const roseDoolan = CHARACTERS.find(c => c.id === 'rose-doolan')!;
      G.players['0'].character = roseDoolan;
      G.players['0'].scope = true;

      // Calculate distance to player 2
      const distance = calculateDistance(G, '0', '2');

      // Base 2 - Rose Doolan 1 - Scope 1 = 0, but minimum is 1
      expect(distance).toBe(1);
    });
  });

  describe('Combined distance modifiers', () => {
    it('should correctly apply all distance modifiers together', () => {
      // Player 0: Rose Doolan with Scope
      const roseDoolan = CHARACTERS.find(c => c.id === 'rose-doolan')!;
      G.players['0'].character = roseDoolan;
      G.players['0'].scope = true;

      // Player 2: Paul Regret with Mustang
      const paulRegret = CHARACTERS.find(c => c.id === 'paul-regret')!;
      G.players['2'].character = paulRegret;
      G.players['2'].mustang = true;

      // Calculate distance
      const distance = calculateDistance(G, '0', '2');

      // Base 2 (two players away)
      // + Paul Regret 1
      // + Mustang 1
      // - Rose Doolan 1
      // - Scope 1
      // = 2, minimum 1
      expect(distance).toBe(2);
    });
  });
});
