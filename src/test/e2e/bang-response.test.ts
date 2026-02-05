/**
 * E2E Tests: BANG Card → AI Response → Health Reduction
 *
 * Tests the complete flow of reactive gameplay using boardgame.io Client
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { playBang, playMissed, takeDamage } from '../../game/moves';
import { setup } from '../../game/setup';
import { BangGameState } from '../../game/setup';

describe('BANG Response Flow E2E', () => {
  let G: BangGameState;
  let ctx: any;
  let events: any;

  beforeEach(() => {
    // Setup game state
    ctx = {
      numPlayers: 4,
      currentPlayer: '0',
      playerID: '0',
      turn: 1,
      phase: 'play',
      activePlayers: null,
    };

    // Mock events object (boardgame.io provides this)
    let activePlayersState: any = null;
    events = {
      setActivePlayers: (config: any) => {
        activePlayersState = config.value;
        ctx.activePlayers = config.value;
      },
      endStage: () => {
        ctx.activePlayers = null;
      },
    };

    G = setup({ ctx });

    // Add BANG card to cardMap
    G.cardMap['bang-1'] = {
      id: 'bang-1',
      name: 'BANG!',
      type: 'BANG',
      suit: 'hearts',
      rank: 'A',
      category: 'brown',
      description: 'BANG!',
      requiresTarget: true,
    };

    // Add MISSED card to cardMap
    G.cardMap['missed-1'] = {
      id: 'missed-1',
      name: 'Missed!',
      type: 'MISSED',
      suit: 'spades',
      rank: '2',
      category: 'brown',
      description: 'Missed!',
    };

    // Setup players
    G.players['0'].hand = ['bang-1'];
    G.players['0'].hasDrawn = true;
    G.players['0'].bangsPlayedThisTurn = 0;
    G.players['0'].weapon = null; // Default weapon (range 1)

    G.players['1'].hand = ['missed-1'];
    G.players['1'].health = 4;
    G.players['1'].maxHealth = 4;
  });

  describe('BANG → Missed → No Damage', () => {
    it('should allow target to play Missed and prevent damage', () => {
      // Player 0 plays BANG on player 1
      const bangResult = playBang({ G, ctx, events }, 'bang-1', '1');

      // Check: Move succeeded
      expect(bangResult).not.toBe('INVALID_MOVE');

      // Check: Pending action created
      expect(G.pendingAction).toBeTruthy();
      expect(G.pendingAction?.type).toBe('BANG');
      expect(G.pendingAction?.targetPlayerId).toBe('1');

      // Check: Player 1 now in respondToBang stage
      expect(ctx.activePlayers).toBeTruthy();
      expect(ctx.activePlayers?.['1']).toBe('respondToBang');

      // Check: BANG card removed from player 0's hand
      expect(G.players['0'].hand).not.toContain('bang-1');

      // Player 1 responds with Missed
      ctx.currentPlayer = '1';
      ctx.playerID = '1';
      const missedResult = playMissed({ G, ctx, events }, 'missed-1');

      // Check: Missed succeeded
      expect(missedResult).not.toBe('INVALID_MOVE');

      // Check: Health unchanged
      expect(G.players['1'].health).toBe(4);

      // Check: Pending action cleared
      expect(G.pendingAction).toBeNull();

      // Check: MISSED card removed
      expect(G.players['1'].hand).not.toContain('missed-1');
    });
  });

  describe('BANG → Take Damage → Health Reduced', () => {
    it('should reduce health when target takes damage', () => {
      // Setup: Player 1 has no Missed card
      G.players['1'].hand = [];

      // Player 0 plays BANG on player 1
      playBang({ G, ctx, events }, 'bang-1', '1');

      // Check: Player 1 in respondToBang stage
      expect(ctx.activePlayers?.['1']).toBe('respondToBang');

      // Player 1 takes damage
      ctx.currentPlayer = '1';
      ctx.playerID = '1';
      takeDamage({ G, ctx, events }, 1);

      // Check: Health reduced by 1
      expect(G.players['1'].health).toBe(3);

      // Check: Pending action cleared
      expect(G.pendingAction).toBeNull();
    });
  });

  describe('Multiple BANGs in Turn', () => {
    it('should enforce BANG limit (1 per turn with default weapon)', () => {
      // Add second BANG card
      G.cardMap['bang-2'] = {
        id: 'bang-2',
        name: 'BANG!',
        type: 'BANG',
        suit: 'diamonds',
        rank: 'K',
        category: 'brown',
        description: 'BANG!',
        requiresTarget: true,
      };
      G.players['0'].hand = ['bang-1', 'bang-2'];

      // Play first BANG
      const result1 = playBang({ G, ctx, events }, 'bang-1', '1');
      expect(result1).not.toBe('INVALID_MOVE');
      expect(G.players['0'].bangsPlayedThisTurn).toBe(1);

      // Resolve first BANG
      ctx.playerID = '1';
      takeDamage({ G, ctx, events }, 1);
      events.endStage();

      // Try to play second BANG - should fail
      ctx.playerID = '0';
      ctx.currentPlayer = '0';
      const result2 = playBang({ G, ctx, events }, 'bang-2', '1');
      expect(result2).toBe('INVALID_MOVE');
      expect(G.players['0'].bangsPlayedThisTurn).toBe(1);
    });

    it('should allow unlimited BANGs with Volcanic weapon', () => {
      // Add Volcanic weapon
      G.cardMap['volcanic-1'] = {
        id: 'volcanic-1',
        name: 'Volcanic',
        type: 'VOLCANIC',
        suit: 'spades',
        rank: '10',
        category: 'blue',
        description: 'Unlimited BANGs',
        isWeapon: true,
        isEquipment: true,
        range: 1,
      };
      G.players['0'].weapon = G.cardMap['volcanic-1'];

      // Add second BANG
      G.cardMap['bang-2'] = {
        id: 'bang-2',
        name: 'BANG!',
        type: 'BANG',
        suit: 'diamonds',
        rank: 'K',
        category: 'brown',
        description: 'BANG!',
        requiresTarget: true,
      };
      G.players['0'].hand = ['bang-1', 'bang-2'];

      // Play first BANG
      playBang({ G, ctx, events }, 'bang-1', '1');
      ctx.playerID = '1';
      takeDamage({ G, ctx, events }, 1);
      events.endStage();

      // Play second BANG - should succeed with Volcanic
      ctx.playerID = '0';
      ctx.currentPlayer = '0';
      const result2 = playBang({ G, ctx, events }, 'bang-2', '1');
      expect(result2).not.toBe('INVALID_MOVE');
      expect(G.players['0'].bangsPlayedThisTurn).toBe(2);
    });
  });

  describe('Death from BANG', () => {
    it('should kill player when health reaches 0', () => {
      // Setup: Player 1 at 1 health
      G.players['1'].health = 1;
      G.players['1'].hand = [];

      // Play BANG
      playBang({ G, ctx, events }, 'bang-1', '1');

      // Take lethal damage
      ctx.playerID = '1';
      takeDamage({ G, ctx, events }, 1);

      // Check: Player dead
      expect(G.players['1'].health).toBeLessThanOrEqual(0);
      expect(G.players['1'].isDead).toBe(true);
    });
  });
});
