// Card utility functions

import { Card, Suit } from '../data/cards';

/**
 * Get color for card suit
 */
export function getSuitColor(suit: Suit): string {
  switch (suit) {
    case 'hearts':
    case 'diamonds':
      return '#DC2626'; // red
    case 'clubs':
    case 'spades':
      return '#000000'; // black
  }
}

/**
 * Get symbol for suit
 */
export function getSuitSymbol(suit: Suit): string {
  switch (suit) {
    case 'hearts':
      return '♥';
    case 'diamonds':
      return '♦';
    case 'clubs':
      return '♣';
    case 'spades':
      return '♠';
  }
}

/**
 * Get color for card category
 */
export function getCategoryColor(category: 'brown' | 'blue'): string {
  return category === 'brown' ? '#92400E' : '#1E3A8A';
}

/**
 * Get card type color for placeholders
 */
export function getCardTypeColor(card: Card): string {
  switch (card.type) {
    case 'BANG':
      return '#DC2626';
    case 'MISSED':
      return '#2563EB';
    case 'BEER':
      return '#CA8A04';
    case 'SALOON':
      return '#D97706';
    default:
      if (card.isWeapon) return '#1F2937';
      if (card.isEquipment) return '#7C3AED';
      return '#059669';
  }
}
