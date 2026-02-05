/**
 * Unit tests for draw phase ability helper functions
 *
 * Testing the actual implementations of Black Jack, Jesse Jones, Kit Carlson, Pedro Ramirez
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { setup } from '../../game/setup';
import {
  blackJackDraw,
  jesseJonesDraw,
  kitCarlsonDraw,
  pedroRamirezDraw,
} from '../../game/utils/characterAbilities';
import { CHARACTERS } from '../../data/characters';

describe('Draw Phase Ability Helpers', () => {
  let G: any;
  let ctx: any;

  beforeEach(() => {
    ctx = {
      numPlayers: 4,
      currentPlayer: '0',
    };
    G = setup({ ctx });
  });

  describe('blackJackDraw', () => {
    it('should draw 3 cards when 2nd card is red (hearts)', () => {
      const blackJack = CHARACTERS.find(c => c.id === 'black-jack')!;
      G.players['0'].character = blackJack;

      // Setup: Ensure 2nd card from top is hearts (red)
      const deck = G.deck;
      const heartCard = Object.values(G.cardMap).find(
        (c: any) => c.suit === 'hearts'
      );

      // Put a heart card as 2nd from top
      deck[deck.length - 2] = heartCard;

      const initialHandSize = G.players['0'].hand.length;
      const initialDeckSize = G.deck.length;

      blackJackDraw(G, '0');

      // Should draw 3 cards total (2 standard + 1 bonus for red)
      expect(G.players['0'].hand.length).toBe(initialHandSize + 3);
      expect(G.deck.length).toBe(initialDeckSize - 3);
    });

    it('should draw 3 cards when 2nd card is red (diamonds)', () => {
      const blackJack = CHARACTERS.find(c => c.id === 'black-jack')!;
      G.players['0'].character = blackJack;

      // Setup: Ensure 2nd card from top is diamonds (red)
      const deck = G.deck;
      const diamondCard = Object.values(G.cardMap).find(
        (c: any) => c.suit === 'diamonds'
      );

      deck[deck.length - 2] = diamondCard;

      const initialHandSize = G.players['0'].hand.length;

      blackJackDraw(G, '0');

      expect(G.players['0'].hand.length).toBe(initialHandSize + 3);
    });

    it('should draw only 2 cards when 2nd card is black (spades)', () => {
      const blackJack = CHARACTERS.find(c => c.id === 'black-jack')!;
      G.players['0'].character = blackJack;

      // Setup: Ensure 2nd card from top is spades (black)
      const deck = G.deck;
      const spadeCard = Object.values(G.cardMap).find(
        (c: any) => c.suit === 'spades'
      );

      deck[deck.length - 2] = spadeCard;

      const initialHandSize = G.players['0'].hand.length;

      blackJackDraw(G, '0');

      // Should draw only 2 cards (no bonus for black)
      expect(G.players['0'].hand.length).toBe(initialHandSize + 2);
    });

    it('should draw only 2 cards when 2nd card is black (clubs)', () => {
      const blackJack = CHARACTERS.find(c => c.id === 'black-jack')!;
      G.players['0'].character = blackJack;

      const deck = G.deck;
      const clubCard = Object.values(G.cardMap).find(
        (c: any) => c.suit === 'clubs'
      );

      deck[deck.length - 2] = clubCard;

      const initialHandSize = G.players['0'].hand.length;

      blackJackDraw(G, '0');

      expect(G.players['0'].hand.length).toBe(initialHandSize + 2);
    });
  });

  describe('jesseJonesDraw', () => {
    it('should draw 1 card from target player and 1 from deck', () => {
      const jesseJones = CHARACTERS.find(c => c.id === 'jesse-jones')!;
      G.players['0'].character = jesseJones;

      // Give player 1 some cards
      G.players['1'].hand = ['card-1', 'card-2', 'card-3'];

      const initialJesseHand = G.players['0'].hand.length;
      const initialTargetHand = G.players['1'].hand.length;
      const initialDeckSize = G.deck.length;

      jesseJonesDraw(G, '0', '1');

      // Jesse should gain 2 cards total
      expect(G.players['0'].hand.length).toBe(initialJesseHand + 2);
      // Target should lose 1 card
      expect(G.players['1'].hand.length).toBe(initialTargetHand - 1);
      // Deck should lose 1 card
      expect(G.deck.length).toBe(initialDeckSize - 1);
    });

    it('should draw 2 from deck if target has no cards', () => {
      const jesseJones = CHARACTERS.find(c => c.id === 'jesse-jones')!;
      G.players['0'].character = jesseJones;

      // Empty target's hand
      G.players['1'].hand = [];

      const initialJesseHand = G.players['0'].hand.length;
      const initialDeckSize = G.deck.length;

      jesseJonesDraw(G, '0', '1');

      // Should still draw 2 cards, both from deck
      expect(G.players['0'].hand.length).toBe(initialJesseHand + 2);
      expect(G.deck.length).toBe(initialDeckSize - 2);
    });

    it('should transfer actual card from target to Jesse', () => {
      const jesseJones = CHARACTERS.find(c => c.id === 'jesse-jones')!;
      G.players['0'].character = jesseJones;

      G.players['1'].hand = ['specific-card'];

      jesseJonesDraw(G, '0', '1');

      // Jesse should have the specific card
      expect(G.players['0'].hand).toContain('specific-card');
      // Target should not have it
      expect(G.players['1'].hand).not.toContain('specific-card');
    });
  });

  describe('kitCarlsonDraw', () => {
    it('should draw 2 chosen cards and put 3rd back on deck', () => {
      const kitCarlson = CHARACTERS.find(c => c.id === 'kit-carlson')!;
      G.players['0'].character = kitCarlson;

      // Get top 3 cards from deck
      const deckSize = G.deck.length;
      const card1 = G.deck[deckSize - 1];
      const card2 = G.deck[deckSize - 2];
      const card3 = G.deck[deckSize - 3];

      const initialHandSize = G.players['0'].hand.length;

      // Choose first 2 cards
      kitCarlsonDraw(G, '0', [card1.id, card2.id]);

      // Should have 2 more cards
      expect(G.players['0'].hand.length).toBe(initialHandSize + 2);
      // Should have the chosen cards
      expect(G.players['0'].hand).toContain(card1.id);
      expect(G.players['0'].hand).toContain(card2.id);
      // Should not have the 3rd card
      expect(G.players['0'].hand).not.toContain(card3.id);
      // 3rd card should be back on top of deck
      expect(G.deck[G.deck.length - 1]).toBe(card3);
    });

    it('should work when choosing last card instead of first', () => {
      const kitCarlson = CHARACTERS.find(c => c.id === 'kit-carlson')!;
      G.players['0'].character = kitCarlson;

      const deckSize = G.deck.length;
      const card1 = G.deck[deckSize - 1];
      const card2 = G.deck[deckSize - 2];
      const card3 = G.deck[deckSize - 3];

      // Choose 2nd and 3rd cards, skip 1st
      kitCarlsonDraw(G, '0', [card2.id, card3.id]);

      expect(G.players['0'].hand).toContain(card2.id);
      expect(G.players['0'].hand).toContain(card3.id);
      expect(G.deck[G.deck.length - 1]).toBe(card1);
    });

    it('should return false if deck has fewer than 3 cards', () => {
      const kitCarlson = CHARACTERS.find(c => c.id === 'kit-carlson')!;
      G.players['0'].character = kitCarlson;

      // Empty deck to only 2 cards
      G.deck = [G.deck[0], G.deck[1]];

      const result = kitCarlsonDraw(G, '0', []);

      // Should fail
      expect(result).toBe(false);
    });
  });

  describe('pedroRamirezDraw', () => {
    it('should draw 1 from discard and 1 from deck', () => {
      const pedroRamirez = CHARACTERS.find(c => c.id === 'pedro-ramirez')!;
      G.players['0'].character = pedroRamirez;

      // Put a card in discard pile
      const discardCard = G.cardMap['card-1'];
      G.discardPile = [discardCard];

      const initialHandSize = G.players['0'].hand.length;
      const initialDeckSize = G.deck.length;

      pedroRamirezDraw(G, '0');

      // Should have 2 more cards
      expect(G.players['0'].hand.length).toBe(initialHandSize + 2);
      // Should have the discard card
      expect(G.players['0'].hand).toContain('card-1');
      // Discard should be empty
      expect(G.discardPile.length).toBe(0);
      // Deck should lose 1 card
      expect(G.deck.length).toBe(initialDeckSize - 1);
    });

    it('should draw 2 from deck if discard is empty', () => {
      const pedroRamirez = CHARACTERS.find(c => c.id === 'pedro-ramirez')!;
      G.players['0'].character = pedroRamirez;

      // Empty discard pile
      G.discardPile = [];

      const initialHandSize = G.players['0'].hand.length;
      const initialDeckSize = G.deck.length;

      pedroRamirezDraw(G, '0');

      // Should draw 2 from deck
      expect(G.players['0'].hand.length).toBe(initialHandSize + 2);
      expect(G.deck.length).toBe(initialDeckSize - 2);
    });

    it('should take top card from discard pile', () => {
      const pedroRamirez = CHARACTERS.find(c => c.id === 'pedro-ramirez')!;
      G.players['0'].character = pedroRamirez;

      // Put multiple cards in discard, most recent on top
      const card1 = G.cardMap['card-1'];
      const card2 = G.cardMap['card-2'];
      G.discardPile = [card1, card2];

      pedroRamirezDraw(G, '0');

      // Should take the top card (card-2)
      expect(G.players['0'].hand).toContain('card-2');
      // card-1 should still be in discard
      expect(G.discardPile).toContainEqual(card1);
      expect(G.discardPile.length).toBe(1);
    });
  });
});
