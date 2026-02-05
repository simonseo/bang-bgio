/**
 * Victory condition tests
 * Tests all possible win conditions in Bang!
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { checkVictory } from '../../game/victory';
import { setup } from '../../game/setup';

describe('Victory Conditions', () => {
  let G: any;
  let ctx: any;

  beforeEach(() => {
    ctx = {
      numPlayers: 4,
      currentPlayer: '0',
    };
    G = setup({ ctx });

    // 4-player setup: Sheriff, Deputy, 2 Outlaws
    // Force specific role assignment for testing
    G.players['0'].role = 'sheriff';
    G.players['1'].role = 'outlaw';
    G.players['2'].role = 'outlaw';
    G.players['3'].role = 'deputy';
    G.sheriffId = '0';

    G.turnOrder = ['0', '1', '2', '3'];
  });

  describe('Sheriff Victory', () => {
    it('should return sheriff victory when all outlaws and renegades are dead', () => {
      // Kill all outlaws
      G.players['1'].isDead = true;
      G.players['2'].isDead = true;

      // Sheriff and deputy alive
      G.players['0'].isDead = false;
      G.players['3'].isDead = false;

      const result = checkVictory(G, ctx);

      expect(result).toBeDefined();
      expect(result?.winner).toBe('sheriff');
      expect(result?.survivors).toContain('0');
      expect(result?.survivors).toContain('3');
    });

    it('should return sheriff victory even if deputies are dead', () => {
      // Kill all outlaws
      G.players['1'].isDead = true;
      G.players['2'].isDead = true;
      // Kill deputy
      G.players['3'].isDead = true;

      // Only sheriff alive
      G.players['0'].isDead = false;

      const result = checkVictory(G, ctx);

      expect(result).toBeDefined();
      expect(result?.winner).toBe('sheriff');
      expect(result?.survivors).toEqual(['0']);
    });
  });

  describe('Outlaw Victory', () => {
    it('should return outlaws victory when sheriff is dead', () => {
      // Kill sheriff
      G.players['0'].isDead = true;

      // Outlaws alive
      G.players['1'].isDead = false;
      G.players['2'].isDead = false;

      const result = checkVictory(G, ctx);

      expect(result).toBeDefined();
      expect(result?.winner).toBe('outlaws');
    });

    it('should return outlaws victory even if all outlaws are dead (sheriff died first)', () => {
      // All dead
      G.players['0'].isDead = true; // Sheriff
      G.players['1'].isDead = true; // Outlaw
      G.players['2'].isDead = true; // Outlaw
      G.players['3'].isDead = false; // Deputy survives

      const result = checkVictory(G, ctx);

      expect(result).toBeDefined();
      expect(result?.winner).toBe('outlaws');
    });
  });

  describe('Renegade Victory', () => {
    it('should return renegade victory when only renegade alive', () => {
      // Setup with renegade
      G.players['2'].role = 'renegade';

      // Kill everyone except renegade
      G.players['0'].isDead = true; // Sheriff
      G.players['1'].isDead = true; // Outlaw
      G.players['2'].isDead = false; // Renegade
      G.players['3'].isDead = true; // Deputy

      const result = checkVictory(G, ctx);

      expect(result).toBeDefined();
      expect(result?.winner).toBe('renegade');
      expect(result?.survivors).toEqual(['2']);
    });

    it('should NOT end game when sheriff and renegade are both alive (2 players)', () => {
      // Setup with renegade
      G.players['2'].role = 'renegade';

      // Kill outlaws and deputy
      G.players['1'].isDead = true;
      G.players['2'].isDead = false; // Renegade alive
      G.players['3'].isDead = true;

      // Only sheriff and renegade alive
      G.players['0'].isDead = false;

      const result = checkVictory(G, ctx);

      // Game should continue
      expect(result).toBeNull();
    });
  });

  describe('5-player game', () => {
    beforeEach(() => {
      ctx = {
        numPlayers: 5,
        currentPlayer: '0',
      };
      G = setup({ ctx });

      // 5-player: Sheriff, Deputy, 2 Outlaws, Renegade
      G.players['0'].role = 'sheriff';
      G.players['1'].role = 'deputy';
      G.players['2'].role = 'outlaw';
      G.players['3'].role = 'outlaw';
      G.players['4'].role = 'renegade';
      G.sheriffId = '0';

      G.turnOrder = ['0', '1', '2', '3', '4'];
    });

    it('should return sheriff victory when all threats eliminated', () => {
      // Kill outlaws and renegade
      G.players['2'].isDead = true;
      G.players['3'].isDead = true;
      G.players['4'].isDead = true;

      // Sheriff and deputy alive
      G.players['0'].isDead = false;
      G.players['1'].isDead = false;

      const result = checkVictory(G, ctx);

      expect(result).toBeDefined();
      expect(result?.winner).toBe('sheriff');
    });

    it('should continue when renegade helps kill outlaws', () => {
      // Only outlaws dead
      G.players['2'].isDead = true;
      G.players['3'].isDead = true;

      // Sheriff, deputy, renegade alive
      G.players['0'].isDead = false;
      G.players['1'].isDead = false;
      G.players['4'].isDead = false;

      const result = checkVictory(G, ctx);

      // Game continues - renegade must eliminate sheriff
      expect(result).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle uninitialized game state', () => {
      const emptyG: any = {};
      const result = checkVictory(emptyG, ctx);

      expect(result).toBeNull();
    });

    it('should handle all players dead (draw)', () => {
      // All dead
      G.players['0'].isDead = true;
      G.players['1'].isDead = true;
      G.players['2'].isDead = true;
      G.players['3'].isDead = true;

      const result = checkVictory(G, ctx);

      // Sheriff died so outlaws win
      expect(result?.winner).toBe('outlaws');
    });
  });
});
