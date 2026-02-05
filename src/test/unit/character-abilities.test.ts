/**
 * Unit tests for character abilities
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { setup } from '../../game/setup';
import {
  canPlayUnlimitedBangs,
  requiresDoubleMissed,
  canSwapBangMissed,
  hasVirtualBarrel,
  drawCards,
  triggerAbility,
  sidKetchumHeal,
  luckyDukeDraw,
} from '../../game/utils/characterAbilities';
import { CHARACTERS } from '../../data/characters';

describe('Character Abilities', () => {
  let G: any;
  let ctx: any;

  beforeEach(() => {
    ctx = {
      numPlayers: 4,
      currentPlayer: '0',
    };
    G = setup({ ctx });
  });

  describe('Willy the Kid - Unlimited BANGs', () => {
    it('should allow unlimited BANGs when player has Willy the Kid', () => {
      // Set player 0 to Willy the Kid
      const willyTheKid = CHARACTERS.find(c => c.id === 'willy-the-kid')!;
      G.players['0'].character = willyTheKid;

      // Should return true
      expect(canPlayUnlimitedBangs(G, '0')).toBe(true);
    });

    it('should not allow unlimited BANGs for other characters', () => {
      // Set player 0 to a character that's NOT Willy the Kid
      const notWilly = CHARACTERS.find(c => c.id !== 'willy-the-kid')!;
      G.players['0'].character = notWilly;

      expect(canPlayUnlimitedBangs(G, '0')).toBe(false);
    });
  });

  describe('Slab the Killer - Double Missed Required', () => {
    it('should require double Missed when attacker is Slab the Killer', () => {
      // Set player 0 to Slab the Killer
      const slabTheKiller = CHARACTERS.find(c => c.id === 'slab-the-killer')!;
      G.players['0'].character = slabTheKiller;

      // Should return true
      expect(requiresDoubleMissed(G, '0')).toBe(true);
    });

    it('should not require double Missed for other characters', () => {
      // Set player 0 to a character that's NOT Slab the Killer
      const notSlab = CHARACTERS.find(c => c.id !== 'slab-the-killer')!;
      G.players['0'].character = notSlab;

      expect(requiresDoubleMissed(G, '0')).toBe(false);
    });
  });

  describe('Calamity Janet - Swap BANG/Missed', () => {
    it('should allow swapping BANG and Missed when player is Calamity Janet', () => {
      // Set player 0 to Calamity Janet
      const calamityJanet = CHARACTERS.find(c => c.id === 'calamity-janet')!;
      G.players['0'].character = calamityJanet;

      // Should return true
      expect(canSwapBangMissed(G, '0')).toBe(true);
    });

    it('should not allow swapping for other characters', () => {
      // Set player 0 to a character that's NOT Calamity Janet
      const notCalamity = CHARACTERS.find(c => c.id !== 'calamity-janet')!;
      G.players['0'].character = notCalamity;

      expect(canSwapBangMissed(G, '0')).toBe(false);
    });
  });

  describe('Jourdonnais - Virtual Barrel', () => {
    it('should have virtual barrel when player is Jourdonnais', () => {
      // Set player 0 to Jourdonnais
      const jourdonnais = CHARACTERS.find(c => c.id === 'jourdonnais')!;
      G.players['0'].character = jourdonnais;

      // Should return true
      expect(hasVirtualBarrel(G, '0')).toBe(true);
    });

    it('should not have virtual barrel for other characters', () => {
      // Set player 0 to a character that's NOT Jourdonnais
      const notJourdonnais = CHARACTERS.find(c => c.id !== 'jourdonnais')!;
      G.players['0'].character = notJourdonnais;

      expect(hasVirtualBarrel(G, '0')).toBe(false);
    });
  });

  describe('Draw Cards Helper', () => {
    it('should draw specified number of cards', () => {
      const initialHandSize = G.players['0'].hand.length;
      const initialDeckSize = G.deck.length;

      drawCards(G, '0', 3);

      // Hand should increase by 3
      expect(G.players['0'].hand.length).toBe(initialHandSize + 3);
      // Deck should decrease by 3
      expect(G.deck.length).toBe(initialDeckSize - 3);
    });

    it('should reshuffle discard pile when deck runs out', () => {
      // Empty the deck
      G.deck = [];
      G.discardPile = [
        G.cardMap['card-1'],
        G.cardMap['card-2'],
        G.cardMap['card-3'],
      ];

      const initialHandSize = G.players['0'].hand.length;

      drawCards(G, '0', 2);

      // Hand should increase by 2
      expect(G.players['0'].hand.length).toBe(initialHandSize + 2);
      // Deck should have reshuffled discard (minus drawn cards)
      expect(G.deck.length).toBe(1); // 3 reshuffled - 2 drawn = 1
    });
  });

  describe('Bart Cassidy - Draw when damaged', () => {
    it('should draw cards equal to damage taken', () => {
      // Set player 0 to Bart Cassidy
      const bartCassidy = CHARACTERS.find(c => c.id === 'bart-cassidy')!;
      G.players['0'].character = bartCassidy;

      const initialHandSize = G.players['0'].hand.length;

      // Trigger ability when taking 2 damage
      triggerAbility(G, ctx, '0', 'onDamage', { damageAmount: 2 });

      // Should draw 2 cards
      expect(G.players['0'].hand.length).toBe(initialHandSize + 2);
    });

    it('should not draw cards for other characters', () => {
      // Set player 0 to someone else
      const notBart = CHARACTERS.find(c => c.id !== 'bart-cassidy')!;
      G.players['0'].character = notBart;

      const initialHandSize = G.players['0'].hand.length;

      // Trigger ability (should do nothing)
      triggerAbility(G, ctx, '0', 'onDamage', { damageAmount: 2 });

      // Hand size should not change
      expect(G.players['0'].hand.length).toBe(initialHandSize);
    });
  });

  describe('Suzy Lafayette - Draw when hand empty', () => {
    it('should draw a card when hand becomes empty', () => {
      // Set player 0 to Suzy Lafayette
      const suzyLafayette = CHARACTERS.find(c => c.id === 'suzy-lafayette')!;
      G.players['0'].character = suzyLafayette;

      // Empty the hand
      G.players['0'].hand = [];

      // Trigger ability
      triggerAbility(G, ctx, '0', 'onHandEmpty');

      // Should have 1 card
      expect(G.players['0'].hand.length).toBe(1);
    });
  });

  describe('El Gringo - Draw from attacker when hit', () => {
    it('should draw card from attacker when damaged', () => {
      // Set player 0 to El Gringo
      const elGringo = CHARACTERS.find(c => c.id === 'el-gringo')!;
      G.players['0'].character = elGringo;

      // Give player 1 some cards
      G.players['1'].hand = ['card-1', 'card-2', 'card-3'];

      const initialElGringoHand = G.players['0'].hand.length;
      const initialAttackerHand = G.players['1'].hand.length;

      // Trigger ability when damaged by player 1
      triggerAbility(G, ctx, '0', 'onDamage', {
        damageAmount: 1,
        attackerId: '1'
      });

      // El Gringo should gain 1 card
      expect(G.players['0'].hand.length).toBe(initialElGringoHand + 1);
      // Attacker should lose 1 card
      expect(G.players['1'].hand.length).toBe(initialAttackerHand - 1);
    });

    it('should not draw if attacker has no cards', () => {
      // Set player 0 to El Gringo
      const elGringo = CHARACTERS.find(c => c.id === 'el-gringo')!;
      G.players['0'].character = elGringo;

      // Empty attacker's hand
      G.players['1'].hand = [];

      const initialElGringoHand = G.players['0'].hand.length;

      // Trigger ability
      triggerAbility(G, ctx, '0', 'onDamage', {
        damageAmount: 1,
        attackerId: '1'
      });

      // El Gringo hand should not change
      expect(G.players['0'].hand.length).toBe(initialElGringoHand);
    });
  });

  describe('Vulture Sam - Take cards from dead player', () => {
    it('should take all cards when another player dies', () => {
      // Set player 0 to Vulture Sam
      const vultureSam = CHARACTERS.find(c => c.id === 'vulture-sam')!;
      G.players['0'].character = vultureSam;

      // Give player 1 cards in hand and in play
      G.players['1'].hand = ['card-1', 'card-2'];
      G.players['1'].inPlay = ['card-3', 'card-4'];

      const initialVultureHand = G.players['0'].hand.length;

      // Trigger ability when player 1 dies
      triggerAbility(G, ctx, '0', 'onDeath', { deadPlayerId: '1' });

      // Vulture Sam should have all cards from dead player
      // Original hand + 2 from hand + 2 from inPlay = +4 cards
      expect(G.players['0'].hand.length).toBe(initialVultureHand + 4);
      expect(G.players['0'].hand).toContain('card-1');
      expect(G.players['0'].hand).toContain('card-2');
      expect(G.players['0'].hand).toContain('card-3');
      expect(G.players['0'].hand).toContain('card-4');
    });

    it('should work even if dead player had no cards', () => {
      // Set player 0 to Vulture Sam
      const vultureSam = CHARACTERS.find(c => c.id === 'vulture-sam')!;
      G.players['0'].character = vultureSam;

      // Empty dead player's cards
      G.players['1'].hand = [];
      G.players['1'].inPlay = [];

      const initialVultureHand = G.players['0'].hand.length;

      // Trigger ability
      triggerAbility(G, ctx, '0', 'onDeath', { deadPlayerId: '1' });

      // Vulture Sam hand unchanged
      expect(G.players['0'].hand.length).toBe(initialVultureHand);
    });
  });

  describe('Sid Ketchum - Discard 2 cards to heal', () => {
    it('should heal 1 health when discarding 2 cards', () => {
      // Set player 0 to Sid Ketchum
      const sidKetchum = CHARACTERS.find(c => c.id === 'sid-ketchum')!;
      G.players['0'].character = sidKetchum;

      // Give player cards and reduce health
      G.players['0'].hand = ['card-1', 'card-2', 'card-3'];
      G.players['0'].maxHealth = 4;
      G.players['0'].health = 2;

      const initialHandSize = G.players['0'].hand.length;

      // Use ability
      const result = sidKetchumHeal(G, '0', ['card-1', 'card-2']);

      // Should succeed
      expect(result).toBe(true);
      // Health should increase by 1
      expect(G.players['0'].health).toBe(3);
      // Hand should decrease by 2
      expect(G.players['0'].hand.length).toBe(initialHandSize - 2);
      expect(G.players['0'].hand).not.toContain('card-1');
      expect(G.players['0'].hand).not.toContain('card-2');
    });

    it('should not exceed max health', () => {
      // Set player 0 to Sid Ketchum at max health - 1
      const sidKetchum = CHARACTERS.find(c => c.id === 'sid-ketchum')!;
      G.players['0'].character = sidKetchum;
      G.players['0'].hand = ['card-1', 'card-2'];
      G.players['0'].maxHealth = 4;
      G.players['0'].health = 4;

      // Try to use ability at max health
      const result = sidKetchumHeal(G, '0', ['card-1', 'card-2']);

      // Should fail
      expect(result).toBe(false);
      // Health unchanged
      expect(G.players['0'].health).toBe(4);
    });

    it('should require exactly 2 cards', () => {
      // Set player 0 to Sid Ketchum
      const sidKetchum = CHARACTERS.find(c => c.id === 'sid-ketchum')!;
      G.players['0'].character = sidKetchum;
      G.players['0'].hand = ['card-1', 'card-2', 'card-3'];
      G.players['0'].health = 2;
      G.players['0'].maxHealth = 4;

      // Try with 1 card
      const result1 = sidKetchumHeal(G, '0', ['card-1']);
      expect(result1).toBe(false);

      // Try with 3 cards
      const result3 = sidKetchumHeal(G, '0', ['card-1', 'card-2', 'card-3']);
      expect(result3).toBe(false);
    });

    it('should fail if player does not have the cards', () => {
      // Set player 0 to Sid Ketchum
      const sidKetchum = CHARACTERS.find(c => c.id === 'sid-ketchum')!;
      G.players['0'].character = sidKetchum;
      G.players['0'].hand = ['card-1'];
      G.players['0'].health = 2;
      G.players['0'].maxHealth = 4;

      // Try with cards player doesn't have
      const result = sidKetchumHeal(G, '0', ['card-2', 'card-3']);
      expect(result).toBe(false);
    });

    it('should only work for Sid Ketchum', () => {
      // Set player 0 to someone else
      const notSid = CHARACTERS.find(c => c.id !== 'sid-ketchum')!;
      G.players['0'].character = notSid;
      G.players['0'].hand = ['card-1', 'card-2'];
      G.players['0'].health = 2;
      G.players['0'].maxHealth = 4;

      // Try to use ability
      const result = sidKetchumHeal(G, '0', ['card-1', 'card-2']);
      expect(result).toBe(false);
    });
  });

  describe('Lucky Duke - Draw 2 cards for "draw!" effects', () => {
    it('should draw 2 cards and return array', () => {
      const initialDeckSize = G.deck.length;

      // Use Lucky Duke draw
      const cards = luckyDukeDraw(G);

      // Should return array with card(s)
      expect(Array.isArray(cards)).toBe(true);
      expect(cards.length).toBeGreaterThan(0);

      // Deck should have decreased (draws 2, puts 1 back)
      expect(G.deck.length).toBe(initialDeckSize - 1);
    });

    it('should handle empty deck gracefully', () => {
      // Empty the deck
      G.deck = [];

      const cards = luckyDukeDraw(G);

      // Should return empty array
      expect(cards).toEqual([]);
    });

    it('should handle deck with only 1 card', () => {
      // Leave only 1 card in deck
      const lastCard = G.deck[G.deck.length - 1];
      G.deck = [lastCard];

      const cards = luckyDukeDraw(G);

      // Should return empty array (needs 2 cards)
      expect(cards).toEqual([]);
    });
  });
});
