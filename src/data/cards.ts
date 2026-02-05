// Card types and definitions for Bang! card game

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export type CardType =
  // Brown border (instant use)
  | 'BANG'
  | 'MISSED'
  | 'BEER'
  | 'SALOON'
  | 'STAGECOACH'
  | 'WELLS_FARGO'
  | 'PANIC'
  | 'CAT_BALOU'
  | 'DUEL'
  | 'INDIANS'
  | 'GATLING'
  | 'GENERAL_STORE'
  // Blue border (equipment)
  | 'VOLCANIC'
  | 'SCHOFIELD'
  | 'REMINGTON'
  | 'REV_CARABINE'
  | 'WINCHESTER'
  | 'BARREL'
  | 'DYNAMITE'
  | 'JAIL'
  | 'MUSTANG'
  | 'SCOPE';

export interface Card {
  id: string;
  name: string;
  type: CardType;
  suit: Suit;
  rank: Rank;
  category: 'brown' | 'blue';
  description: string;
  // Card-specific properties
  range?: number;
  healing?: number;
  requiresTarget?: boolean;
  isWeapon?: boolean;
  isEquipment?: boolean;
}

// Card metadata by type
export const CARD_METADATA: Record<CardType, Omit<Card, 'id' | 'suit' | 'rank'>> = {
  BANG: {
    name: 'Bang!',
    type: 'BANG',
    category: 'brown',
    description: 'Deal 1 damage to a player in range',
    requiresTarget: true,
  },
  MISSED: {
    name: 'Missed!',
    type: 'MISSED',
    category: 'brown',
    description: 'Cancel a BANG! targeting you',
    requiresTarget: false,
  },
  BEER: {
    name: 'Beer',
    type: 'BEER',
    category: 'brown',
    description: 'Regain 1 health point',
    healing: 1,
    requiresTarget: false,
  },
  SALOON: {
    name: 'Saloon',
    type: 'SALOON',
    category: 'brown',
    description: 'All players regain 1 health point',
    healing: 1,
    requiresTarget: false,
  },
  STAGECOACH: {
    name: 'Stagecoach',
    type: 'STAGECOACH',
    category: 'brown',
    description: 'Draw 2 cards from the deck',
    requiresTarget: false,
  },
  WELLS_FARGO: {
    name: 'Wells Fargo',
    type: 'WELLS_FARGO',
    category: 'brown',
    description: 'Draw 3 cards from the deck',
    requiresTarget: false,
  },
  PANIC: {
    name: 'Panic!',
    type: 'PANIC',
    category: 'brown',
    description: 'Draw a card from a player at range 1',
    requiresTarget: true,
  },
  CAT_BALOU: {
    name: 'Cat Balou',
    type: 'CAT_BALOU',
    category: 'brown',
    description: 'Discard a card from any player',
    requiresTarget: true,
  },
  DUEL: {
    name: 'Duel',
    type: 'DUEL',
    category: 'brown',
    description: 'Challenge a player to a BANG! battle',
    requiresTarget: true,
  },
  INDIANS: {
    name: 'Indians!',
    type: 'INDIANS',
    category: 'brown',
    description: 'All other players must discard BANG! or lose 1 health',
    requiresTarget: false,
  },
  GATLING: {
    name: 'Gatling',
    type: 'GATLING',
    category: 'brown',
    description: 'BANG! all other players',
    requiresTarget: false,
  },
  GENERAL_STORE: {
    name: 'General Store',
    type: 'GENERAL_STORE',
    category: 'brown',
    description: 'Reveal cards equal to players, each picks one',
    requiresTarget: false,
  },
  VOLCANIC: {
    name: 'Volcanic',
    type: 'VOLCANIC',
    category: 'blue',
    description: 'Range 1. Unlimited BANGs per turn',
    range: 1,
    isWeapon: true,
    isEquipment: true,
    requiresTarget: false,
  },
  SCHOFIELD: {
    name: 'Schofield',
    type: 'SCHOFIELD',
    category: 'blue',
    description: 'Range 2 weapon',
    range: 2,
    isWeapon: true,
    isEquipment: true,
    requiresTarget: false,
  },
  REMINGTON: {
    name: 'Remington',
    type: 'REMINGTON',
    category: 'blue',
    description: 'Range 3 weapon',
    range: 3,
    isWeapon: true,
    isEquipment: true,
    requiresTarget: false,
  },
  REV_CARABINE: {
    name: 'Rev. Carabine',
    type: 'REV_CARABINE',
    category: 'blue',
    description: 'Range 4 weapon',
    range: 4,
    isWeapon: true,
    isEquipment: true,
    requiresTarget: false,
  },
  WINCHESTER: {
    name: 'Winchester',
    type: 'WINCHESTER',
    category: 'blue',
    description: 'Range 5 weapon',
    range: 5,
    isWeapon: true,
    isEquipment: true,
    requiresTarget: false,
  },
  BARREL: {
    name: 'Barrel',
    type: 'BARREL',
    category: 'blue',
    description: 'When targeted by BANG!, draw! If hearts, you miss',
    isEquipment: true,
    requiresTarget: false,
  },
  DYNAMITE: {
    name: 'Dynamite',
    type: 'DYNAMITE',
    category: 'blue',
    description: 'At turn start, draw! If spades 2-9, lose 3 health',
    isEquipment: true,
    requiresTarget: false,
  },
  JAIL: {
    name: 'Jail',
    type: 'JAIL',
    category: 'blue',
    description: 'At turn start, draw! If not hearts, skip turn',
    isEquipment: true,
    requiresTarget: true,
  },
  MUSTANG: {
    name: 'Mustang',
    type: 'MUSTANG',
    category: 'blue',
    description: 'Others see you at distance +1',
    isEquipment: true,
    requiresTarget: false,
  },
  SCOPE: {
    name: 'Scope',
    type: 'SCOPE',
    category: 'blue',
    description: 'You see others at distance -1',
    isEquipment: true,
    requiresTarget: false,
  },
};
