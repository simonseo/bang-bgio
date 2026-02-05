// All 16 character definitions for Bang!

export interface Character {
  id: string;
  name: string;
  health: number;
  ability: string;
  description: string;
  timing?: 'passive' | 'onDraw' | 'onDamage' | 'onTurn' | 'reactive' | 'onDeath';
}

export const CHARACTERS: Character[] = [
  {
    id: 'bart-cassidy',
    name: 'Bart Cassidy',
    health: 4,
    ability: 'draw-on-damage',
    description: 'Each time he loses a life point, he draws a card',
    timing: 'onDamage',
  },
  {
    id: 'black-jack',
    name: 'Black Jack',
    health: 4,
    ability: 'second-card-reveal',
    description: 'He shows the second card he draws. If it\'s red, he draws a third card',
    timing: 'onDraw',
  },
  {
    id: 'calamity-janet',
    name: 'Calamity Janet',
    health: 4,
    ability: 'bang-missed-swap',
    description: 'She can play BANG! as Missed! and vice versa',
    timing: 'passive',
  },
  {
    id: 'el-gringo',
    name: 'El Gringo',
    health: 3,
    ability: 'draw-from-attacker',
    description: 'When hit by a player, he draws a card from their hand',
    timing: 'onDamage',
  },
  {
    id: 'jesse-jones',
    name: 'Jesse Jones',
    health: 4,
    ability: 'draw-from-player',
    description: 'He may draw his first card from a player\'s hand',
    timing: 'onDraw',
  },
  {
    id: 'jourdonnais',
    name: 'Jourdonnais',
    health: 4,
    ability: 'virtual-barrel',
    description: 'He is considered to have a Barrel in play at all times',
    timing: 'reactive',
  },
  {
    id: 'kit-carlson',
    name: 'Kit Carlson',
    health: 4,
    ability: 'look-top-three',
    description: 'He looks at the top 3 cards and draws 2 of them',
    timing: 'onDraw',
  },
  {
    id: 'lucky-duke',
    name: 'Lucky Duke',
    health: 4,
    ability: 'double-draw-flip',
    description: 'For draw! effects, he flips 2 cards and chooses which applies',
    timing: 'reactive',
  },
  {
    id: 'paul-regret',
    name: 'Paul Regret',
    health: 3,
    ability: 'distance-plus-one',
    description: 'All other players see him at distance +1',
    timing: 'passive',
  },
  {
    id: 'pedro-ramirez',
    name: 'Pedro Ramirez',
    health: 4,
    ability: 'draw-from-discard',
    description: 'He may draw his first card from the discard pile',
    timing: 'onDraw',
  },
  {
    id: 'rose-doolan',
    name: 'Rose Doolan',
    health: 4,
    ability: 'distance-minus-one',
    description: 'She sees all other players at distance -1',
    timing: 'passive',
  },
  {
    id: 'sid-ketchum',
    name: 'Sid Ketchum',
    health: 4,
    ability: 'discard-for-health',
    description: 'He may discard 2 cards to regain 1 health',
    timing: 'onTurn',
  },
  {
    id: 'slab-the-killer',
    name: 'Slab the Killer',
    health: 4,
    ability: 'double-missed-required',
    description: 'Players targeted by his BANG! need 2 Missed! to dodge',
    timing: 'passive',
  },
  {
    id: 'suzy-lafayette',
    name: 'Suzy Lafayette',
    health: 4,
    ability: 'draw-when-empty',
    description: 'When she has no cards in hand, she draws a card',
    timing: 'reactive',
  },
  {
    id: 'vulture-sam',
    name: 'Vulture Sam',
    health: 4,
    ability: 'take-dead-cards',
    description: 'When a player is eliminated, he takes all their cards',
    timing: 'onDeath',
  },
  {
    id: 'willy-the-kid',
    name: 'Willy the Kid',
    health: 4,
    ability: 'unlimited-bangs',
    description: 'He can play any number of BANG! cards per turn',
    timing: 'passive',
  },
];

// Helper to get character by id
export function getCharacterById(id: string): Character | undefined {
  return CHARACTERS.find(c => c.id === id);
}

// Shuffle and deal characters
export function shuffleCharacters(): Character[] {
  const shuffled = [...CHARACTERS];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
