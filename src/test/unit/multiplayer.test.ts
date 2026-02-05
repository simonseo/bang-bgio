/**
 * Multi-player scenario tests
 * Tests proper role distribution and game setup for 4-7 players
 */

import { describe, it, expect } from 'vitest';
import { setup } from '../../game/setup';
import { assignRoles } from '../../data/roles';

describe('Multi-Player Scenarios', () => {
  describe('4-player game', () => {
    it('should assign correct roles: 1 Sheriff, 1 Renegade, 2 Outlaws', () => {
      const ctx = { numPlayers: 4, currentPlayer: '0' };
      const G = setup({ ctx });

      const roles = Object.values(G.players).map(p => p.role);

      expect(roles.filter(r => r === 'sheriff').length).toBe(1);
      expect(roles.filter(r => r === 'outlaw').length).toBe(2);
      expect(roles.filter(r => r === 'renegade').length).toBe(1);
      expect(roles.filter(r => r === 'deputy').length).toBe(0);
    });

    it('should have sheriff with +1 health', () => {
      const ctx = { numPlayers: 4, currentPlayer: '0' };
      const G = setup({ ctx });

      const sheriff = Object.values(G.players).find(p => p.role === 'sheriff');
      const nonSheriff = Object.values(G.players).find(p => p.role !== 'sheriff');

      expect(sheriff).toBeDefined();
      expect(sheriff!.maxHealth).toBe(sheriff!.character.health + 1);
      expect(nonSheriff!.maxHealth).toBe(nonSheriff!.character.health);
    });

    it('should deal cards equal to health', () => {
      const ctx = { numPlayers: 4, currentPlayer: '0' };
      const G = setup({ ctx });

      Object.values(G.players).forEach(player => {
        expect(player.hand.length).toBe(player.maxHealth);
      });
    });
  });

  describe('5-player game', () => {
    it('should assign correct roles: 1 Sheriff, 1 Deputy, 2 Outlaws, 1 Renegade', () => {
      const ctx = { numPlayers: 5, currentPlayer: '0' };
      const G = setup({ ctx });

      const roles = Object.values(G.players).map(p => p.role);

      expect(roles.filter(r => r === 'sheriff').length).toBe(1);
      expect(roles.filter(r => r === 'deputy').length).toBe(1);
      expect(roles.filter(r => r === 'outlaw').length).toBe(2);
      expect(roles.filter(r => r === 'renegade').length).toBe(1);
    });

    it('should have all players initialized', () => {
      const ctx = { numPlayers: 5, currentPlayer: '0' };
      const G = setup({ ctx });

      expect(Object.keys(G.players).length).toBe(5);
      expect(G.turnOrder.length).toBe(5);
    });
  });

  describe('6-player game', () => {
    it('should assign correct roles: 1 Sheriff, 1 Deputy, 3 Outlaws, 1 Renegade', () => {
      const ctx = { numPlayers: 6, currentPlayer: '0' };
      const G = setup({ ctx });

      const roles = Object.values(G.players).map(p => p.role);

      expect(roles.filter(r => r === 'sheriff').length).toBe(1);
      expect(roles.filter(r => r === 'deputy').length).toBe(1);
      expect(roles.filter(r => r === 'outlaw').length).toBe(3);
      expect(roles.filter(r => r === 'renegade').length).toBe(1);
    });
  });

  describe('7-player game', () => {
    it('should assign correct roles: 1 Sheriff, 2 Deputies, 3 Outlaws, 1 Renegade', () => {
      const ctx = { numPlayers: 7, currentPlayer: '0' };
      const G = setup({ ctx });

      const roles = Object.values(G.players).map(p => p.role);

      expect(roles.filter(r => r === 'sheriff').length).toBe(1);
      expect(roles.filter(r => r === 'deputy').length).toBe(2);
      expect(roles.filter(r => r === 'outlaw').length).toBe(3);
      expect(roles.filter(r => r === 'renegade').length).toBe(1);
    });

    it('should have turn order starting with sheriff', () => {
      const ctx = { numPlayers: 7, currentPlayer: '0' };
      const G = setup({ ctx });

      const sheriffId = G.sheriffId;
      expect(G.turnOrder[0]).toBe(sheriffId);
    });
  });

  describe('Role distribution logic', () => {
    it('should follow official Bang! role distribution', () => {
      const roles4 = assignRoles(4);
      expect(roles4).toHaveLength(4);
      expect(roles4.filter(r => r === 'sheriff').length).toBe(1);

      const roles5 = assignRoles(5);
      expect(roles5).toHaveLength(5);
      expect(roles5.filter(r => r === 'deputy').length).toBe(1);

      const roles6 = assignRoles(6);
      expect(roles6).toHaveLength(6);
      expect(roles6.filter(r => r === 'outlaw').length).toBe(3);

      const roles7 = assignRoles(7);
      expect(roles7).toHaveLength(7);
      expect(roles7.filter(r => r === 'deputy').length).toBe(2);
    });
  });

  describe('Game initialization', () => {
    it('should initialize all required game state for each player count', () => {
      [4, 5, 6, 7].forEach(numPlayers => {
        const ctx = { numPlayers, currentPlayer: '0' };
        const G = setup({ ctx });

        // Check basic state
        expect(G.deck).toBeDefined();
        expect(G.discardPile).toBeDefined();
        expect(G.players).toBeDefined();
        expect(G.sheriffId).toBeDefined();
        expect(G.turnOrder).toBeDefined();
        expect(G.cardMap).toBeDefined();

        // Check player count
        expect(Object.keys(G.players).length).toBe(numPlayers);
        expect(G.turnOrder.length).toBe(numPlayers);

        // Check each player is fully initialized
        Object.values(G.players).forEach(player => {
          expect(player.health).toBeGreaterThan(0);
          expect(player.maxHealth).toBeGreaterThan(0);
          expect(player.hand).toBeDefined();
          expect(player.inPlay).toBeDefined();
          expect(player.character).toBeDefined();
          expect(player.role).toBeDefined();
          expect(player.isDead).toBe(false);
          expect(player.bangsPlayedThisTurn).toBe(0);
          expect(player.hasDrawn).toBe(false);
        });

        // Check sheriff starts first
        const sheriff = Object.values(G.players).find(p => p.role === 'sheriff');
        expect(sheriff).toBeDefined();
        expect(G.turnOrder[0]).toBe(G.sheriffId);
      });
    });
  });
});
