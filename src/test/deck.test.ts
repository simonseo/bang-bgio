// Unit tests for deck creation and shuffling

import { describe, it, expect } from 'vitest';
import { createDeck, shuffleDeck } from '../data/deck';
import { CARD_METADATA } from '../data/cards';

describe('Deck Creation', () => {
  it('should create exactly 80 cards', () => {
    const deck = createDeck();
    expect(deck).toHaveLength(80);
  });

  it('should have all cards with unique IDs', () => {
    const deck = createDeck();
    const ids = deck.map(c => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(80);
  });

  it('should have correct number of BANG! cards (25)', () => {
    const deck = createDeck();
    const bangCards = deck.filter(c => c.type === 'BANG');
    expect(bangCards).toHaveLength(25);
  });

  it('should have correct number of Missed! cards (12)', () => {
    const deck = createDeck();
    const missedCards = deck.filter(c => c.type === 'MISSED');
    expect(missedCards).toHaveLength(12);
  });

  it('should have correct number of Beer cards (6)', () => {
    const deck = createDeck();
    const beerCards = deck.filter(c => c.type === 'BEER');
    expect(beerCards).toHaveLength(6);
  });

  it('should have all cards with valid suits', () => {
    const deck = createDeck();
    const validSuits = ['hearts', 'diamonds', 'clubs', 'spades'];
    deck.forEach(card => {
      expect(validSuits).toContain(card.suit);
    });
  });

  it('should have all cards with valid ranks', () => {
    const deck = createDeck();
    const validRanks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    deck.forEach(card => {
      expect(validRanks).toContain(card.rank);
    });
  });

  it('should have correct metadata for each card type', () => {
    const deck = createDeck();
    deck.forEach(card => {
      const metadata = CARD_METADATA[card.type];
      expect(metadata).toBeDefined();
      expect(card.name).toBe(metadata.name);
      expect(card.category).toBe(metadata.category);
    });
  });
});

describe('Deck Shuffling', () => {
  it('should maintain deck size after shuffling', () => {
    const deck = createDeck();
    const shuffled = shuffleDeck(deck);
    expect(shuffled).toHaveLength(80);
  });

  it('should not modify original deck', () => {
    const deck = createDeck();
    const originalFirstCard = deck[0];
    shuffleDeck(deck);
    expect(deck[0]).toBe(originalFirstCard);
  });

  it('should produce different order (probabilistically)', () => {
    const deck = createDeck();
    const shuffled = shuffleDeck(deck);

    // Check if at least some cards are in different positions
    let differentPositions = 0;
    for (let i = 0; i < deck.length; i++) {
      if (deck[i].id !== shuffled[i].id) {
        differentPositions++;
      }
    }

    // Expect at least 50 cards to be in different positions
    expect(differentPositions).toBeGreaterThan(50);
  });

  it('should contain same cards after shuffling', () => {
    const deck = createDeck();
    const shuffled = shuffleDeck(deck);

    const deckIds = deck.map(c => c.id).sort();
    const shuffledIds = shuffled.map(c => c.id).sort();

    expect(shuffledIds).toEqual(deckIds);
  });
});
