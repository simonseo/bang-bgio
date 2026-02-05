// Complete 80-card deck composition for Bang!

import { Card, CardType, Suit, Rank, CARD_METADATA } from './cards';

// Card distribution from the base game
const DECK_COMPOSITION: Array<{ type: CardType; suit: Suit; rank: Rank }> = [
  // BANG! - 25 cards
  { type: 'BANG', suit: 'spades', rank: 'A' },
  { type: 'BANG', suit: 'clubs', rank: '2' },
  { type: 'BANG', suit: 'clubs', rank: '3' },
  { type: 'BANG', suit: 'clubs', rank: '4' },
  { type: 'BANG', suit: 'clubs', rank: '5' },
  { type: 'BANG', suit: 'clubs', rank: '6' },
  { type: 'BANG', suit: 'clubs', rank: '7' },
  { type: 'BANG', suit: 'clubs', rank: '8' },
  { type: 'BANG', suit: 'clubs', rank: '9' },
  { type: 'BANG', suit: 'diamonds', rank: '2' },
  { type: 'BANG', suit: 'diamonds', rank: '3' },
  { type: 'BANG', suit: 'diamonds', rank: '4' },
  { type: 'BANG', suit: 'diamonds', rank: '5' },
  { type: 'BANG', suit: 'diamonds', rank: '6' },
  { type: 'BANG', suit: 'diamonds', rank: '7' },
  { type: 'BANG', suit: 'diamonds', rank: '8' },
  { type: 'BANG', suit: 'diamonds', rank: '9' },
  { type: 'BANG', suit: 'diamonds', rank: '10' },
  { type: 'BANG', suit: 'diamonds', rank: 'J' },
  { type: 'BANG', suit: 'diamonds', rank: 'Q' },
  { type: 'BANG', suit: 'diamonds', rank: 'K' },
  { type: 'BANG', suit: 'diamonds', rank: 'A' },
  { type: 'BANG', suit: 'hearts', rank: 'Q' },
  { type: 'BANG', suit: 'hearts', rank: 'K' },
  { type: 'BANG', suit: 'hearts', rank: 'A' },

  // MISSED! - 12 cards
  { type: 'MISSED', suit: 'spades', rank: '10' },
  { type: 'MISSED', suit: 'spades', rank: 'J' },
  { type: 'MISSED', suit: 'spades', rank: 'Q' },
  { type: 'MISSED', suit: 'spades', rank: 'K' },
  { type: 'MISSED', suit: 'clubs', rank: '10' },
  { type: 'MISSED', suit: 'clubs', rank: 'J' },
  { type: 'MISSED', suit: 'clubs', rank: 'Q' },
  { type: 'MISSED', suit: 'clubs', rank: 'K' },
  { type: 'MISSED', suit: 'clubs', rank: 'A' },
  { type: 'MISSED', suit: 'hearts', rank: '10' },
  { type: 'MISSED', suit: 'hearts', rank: 'J' },
  { type: 'MISSED', suit: 'hearts', rank: '8' },

  // BEER - 6 cards
  { type: 'BEER', suit: 'hearts', rank: '6' },
  { type: 'BEER', suit: 'hearts', rank: '7' },
  { type: 'BEER', suit: 'hearts', rank: '8' },
  { type: 'BEER', suit: 'hearts', rank: '9' },
  { type: 'BEER', suit: 'hearts', rank: '10' },
  { type: 'BEER', suit: 'hearts', rank: 'J' },

  // SALOON - 1 card
  { type: 'SALOON', suit: 'hearts', rank: '5' },

  // STAGECOACH - 2 cards
  { type: 'STAGECOACH', suit: 'spades', rank: '9' },
  { type: 'STAGECOACH', suit: 'spades', rank: '9' },

  // WELLS FARGO - 1 card
  { type: 'WELLS_FARGO', suit: 'hearts', rank: '3' },

  // PANIC! - 4 cards
  { type: 'PANIC', suit: 'hearts', rank: 'J' },
  { type: 'PANIC', suit: 'hearts', rank: 'Q' },
  { type: 'PANIC', suit: 'hearts', rank: 'A' },
  { type: 'PANIC', suit: 'diamonds', rank: 'A' },

  // CAT BALOU - 4 cards
  { type: 'CAT_BALOU', suit: 'diamonds', rank: 'K' },
  { type: 'CAT_BALOU', suit: 'hearts', rank: 'K' },
  { type: 'CAT_BALOU', suit: 'diamonds', rank: 'J' },
  { type: 'CAT_BALOU', suit: 'hearts', rank: 'J' },

  // DUEL - 3 cards
  { type: 'DUEL', suit: 'spades', rank: '8' },
  { type: 'DUEL', suit: 'clubs', rank: '8' },
  { type: 'DUEL', suit: 'diamonds', rank: 'Q' },

  // INDIANS! - 2 cards
  { type: 'INDIANS', suit: 'diamonds', rank: 'K' },
  { type: 'INDIANS', suit: 'diamonds', rank: 'A' },

  // GATLING - 1 card
  { type: 'GATLING', suit: 'hearts', rank: '10' },

  // GENERAL STORE - 2 cards
  { type: 'GENERAL_STORE', suit: 'clubs', rank: '9' },
  { type: 'GENERAL_STORE', suit: 'spades', rank: 'Q' },

  // VOLCANIC - 2 cards
  { type: 'VOLCANIC', suit: 'spades', rank: '10' },
  { type: 'VOLCANIC', suit: 'clubs', rank: '10' },

  // SCHOFIELD - 3 cards
  { type: 'SCHOFIELD', suit: 'spades', rank: 'J' },
  { type: 'SCHOFIELD', suit: 'spades', rank: 'Q' },
  { type: 'SCHOFIELD', suit: 'clubs', rank: 'K' },

  // REMINGTON - 1 card
  { type: 'REMINGTON', suit: 'clubs', rank: 'K' },

  // REV. CARABINE - 1 card
  { type: 'REV_CARABINE', suit: 'clubs', rank: 'A' },

  // WINCHESTER - 1 card
  { type: 'WINCHESTER', suit: 'spades', rank: '8' },

  // BARREL - 2 cards
  { type: 'BARREL', suit: 'spades', rank: 'Q' },
  { type: 'BARREL', suit: 'spades', rank: 'K' },

  // DYNAMITE - 1 card
  { type: 'DYNAMITE', suit: 'hearts', rank: '2' },

  // JAIL - 3 cards
  { type: 'JAIL', suit: 'spades', rank: 'J' },
  { type: 'JAIL', suit: 'spades', rank: '10' },
  { type: 'JAIL', suit: 'hearts', rank: '4' },

  // MUSTANG - 2 cards
  { type: 'MUSTANG', suit: 'hearts', rank: '8' },
  { type: 'MUSTANG', suit: 'hearts', rank: '9' },

  // SCOPE - 1 card
  { type: 'SCOPE', suit: 'spades', rank: 'A' },
];

// Create the full deck
export function createDeck(): Card[] {
  return DECK_COMPOSITION.map((cardSpec, index) => {
    const metadata = CARD_METADATA[cardSpec.type];
    return {
      id: `card-${index + 1}`,
      ...metadata,
      suit: cardSpec.suit,
      rank: cardSpec.rank,
    };
  });
}

// Shuffle function
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
