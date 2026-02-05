// Character ability implementations

import type { Ctx } from 'boardgame.io';
import { BangGameState } from '../setup';
import { Card } from '../../data/cards';

type GameCtx = Ctx & {
  events?: {
    endTurn?: () => void;
    setActivePlayers?: (arg: any) => void;
  };
};

export type AbilityTrigger =
  | 'onDrawPhase'
  | 'onDamage'
  | 'onDeath'
  | 'onBangPlayed'
  | 'onBangReceived'
  | 'onDraw'
  | 'onHandEmpty';

/**
 * Trigger character ability at specific game event
 */
export function triggerAbility(
  G: BangGameState,
  _ctx: GameCtx,
  playerId: string,
  trigger: AbilityTrigger,
  payload?: any
): any {
  const player = G.players[playerId];
  const characterId = player.character.id;

  switch (characterId) {
    case 'bart-cassidy':
      if (trigger === 'onDamage' && payload?.damageAmount) {
        // Draw cards equal to damage taken
        drawCards(G, playerId, payload.damageAmount);
      }
      break;

    case 'black-jack':
      if (trigger === 'onDrawPhase') {
        // Show second card, if red draw third
        // This will be handled in the draw move
        return { useSpecialDraw: true };
      }
      break;

    case 'el-gringo':
      if (trigger === 'onDamage' && payload?.attackerId) {
        // Draw from attacker's hand
        const attacker = G.players[payload.attackerId];
        if (attacker.hand.length > 0) {
          const randomIndex = Math.floor(Math.random() * attacker.hand.length);
          const cardId = attacker.hand.splice(randomIndex, 1)[0];
          player.hand.push(cardId);
        }
      }
      break;

    case 'jesse-jones':
      if (trigger === 'onDrawPhase') {
        // Can draw first card from player's hand
        return { canDrawFromPlayer: true };
      }
      break;

    case 'kit-carlson':
      if (trigger === 'onDrawPhase') {
        // Look at top 3, choose 2
        return { useSpecialDraw: true };
      }
      break;

    case 'pedro-ramirez':
      if (trigger === 'onDrawPhase') {
        // Can draw first card from discard pile
        return { canDrawFromDiscard: true };
      }
      break;

    case 'sid-ketchum':
      // Ability triggered manually during turn
      break;

    case 'suzy-lafayette':
      if (trigger === 'onHandEmpty' && player.hand.length === 0) {
        // Draw a card when hand is empty
        drawCards(G, playerId, 1);
      }
      break;

    case 'vulture-sam':
      if (trigger === 'onDeath' && payload?.deadPlayerId) {
        // Take all cards from dead player
        const deadPlayer = G.players[payload.deadPlayerId];
        player.hand.push(...deadPlayer.hand);
        player.hand.push(...deadPlayer.inPlay);
      }
      break;

    // Passive abilities handled elsewhere:
    // - calamity-janet: handled in card validation
    // - jourdonnais: handled in barrel logic
    // - lucky-duke: handled in draw! logic
    // - paul-regret: handled in distance calculation
    // - rose-doolan: handled in distance calculation
    // - slab-the-killer: handled in BANG! validation
    // - willy-the-kid: handled in BANG! limit check
  }
}

/**
 * Check if player can use unlimited BANGs (Willy the Kid or Volcanic)
 */
export function canPlayUnlimitedBangs(G: BangGameState, playerId: string): boolean {
  const player = G.players[playerId];

  // Willy the Kid ability
  if (player.character.id === 'willy-the-kid') {
    return true;
  }

  // Volcanic weapon
  if (player.weapon && player.weapon.type === 'VOLCANIC') {
    return true;
  }

  return false;
}

/**
 * Check if BANG! target needs 2 Missed! (Slab the Killer)
 */
export function requiresDoubleMissed(G: BangGameState, attackerId: string): boolean {
  return G.players[attackerId].character.id === 'slab-the-killer';
}

/**
 * Check if Calamity Janet can swap BANG!/Missed!
 */
export function canSwapBangMissed(G: BangGameState, playerId: string): boolean {
  return G.players[playerId].character.id === 'calamity-janet';
}

/**
 * Check if player has virtual Barrel (Jourdonnais)
 */
export function hasVirtualBarrel(G: BangGameState, playerId: string): boolean {
  return G.players[playerId].character.id === 'jourdonnais';
}

/**
 * Handle Lucky Duke's double draw
 */
export function luckyDukeDraw(G: BangGameState): Card[] {
  const card1 = G.deck.pop();
  const card2 = G.deck.pop();

  if (!card1 || !card2) return [];

  // For now, just return first card (UI would let player choose)
  G.deck.push(card2);
  return [card1];
}

/**
 * Helper to draw cards from deck
 */
export function drawCards(G: BangGameState, playerId: string, count: number): void {
  const player = G.players[playerId];

  for (let i = 0; i < count; i++) {
    if (G.deck.length === 0) {
      // Reshuffle discard pile if deck is empty
      G.deck = shuffleArray([...G.discardPile]);
      G.discardPile = [];
    }

    const card = G.deck.pop();
    if (card) {
      player.hand.push(card.id);
    }
  }
}

/**
 * Helper to shuffle array
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Discard cards for Sid Ketchum ability
 */
export function sidKetchumHeal(G: BangGameState, playerId: string, cardIds: string[]): boolean {
  const player = G.players[playerId];

  if (player.character.id !== 'sid-ketchum') return false;
  if (cardIds.length !== 2) return false;
  if (player.health >= player.maxHealth) return false;

  // Check player has the cards
  const hasCards = cardIds.every(id => player.hand.includes(id));
  if (!hasCards) return false;

  // Discard cards
  cardIds.forEach(id => {
    const index = player.hand.indexOf(id);
    if (index !== -1) {
      player.hand.splice(index, 1);
      const card = G.cardMap[id];
      if (card) {
        G.discardPile.push(card);
      }
    }
  });

  // Heal 1 health
  player.health = Math.min(player.maxHealth, player.health + 1);

  return true;
}

/**
 * Black Jack draw - Show 2nd card, if red draw 3rd
 */
export function blackJackDraw(G: BangGameState, playerId: string): void {
  const player = G.players[playerId];

  // Draw first card
  const card1 = G.deck.pop();
  if (card1) {
    player.hand.push(card1.id);
  }

  // Draw second card and check if red
  const card2 = G.deck.pop();
  if (card2) {
    player.hand.push(card2.id);

    // If 2nd card is red (hearts or diamonds), draw 3rd card
    if (card2.suit === 'hearts' || card2.suit === 'diamonds') {
      const card3 = G.deck.pop();
      if (card3) {
        player.hand.push(card3.id);
      }
    }
  }
}

/**
 * Jesse Jones draw - Draw 1st from player's hand, 2nd from deck
 */
export function jesseJonesDraw(G: BangGameState, playerId: string, targetPlayerId: string): void {
  const player = G.players[playerId];
  const target = G.players[targetPlayerId];

  // Draw 1st card from target if they have cards
  if (target.hand.length > 0) {
    // Take random card from target
    const randomIndex = Math.floor(Math.random() * target.hand.length);
    const cardId = target.hand.splice(randomIndex, 1)[0];
    player.hand.push(cardId);
  } else {
    // If target has no cards, draw from deck instead
    const card = G.deck.pop();
    if (card) {
      player.hand.push(card.id);
    }
  }

  // Draw 2nd card from deck
  const card2 = G.deck.pop();
  if (card2) {
    player.hand.push(card2.id);
  }
}

/**
 * Kit Carlson draw - Look at top 3, choose 2
 */
export function kitCarlsonDraw(G: BangGameState, playerId: string, chosenCardIds: string[]): boolean {
  const player = G.players[playerId];

  // Need at least 3 cards in deck
  if (G.deck.length < 3) {
    return false;
  }

  // Get top 3 cards
  const card1 = G.deck.pop()!;
  const card2 = G.deck.pop()!;
  const card3 = G.deck.pop()!;

  const threeCards = [card1, card2, card3];

  // Find which cards were chosen and which was not
  const chosenCards = threeCards.filter(c => chosenCardIds.includes(c.id));
  const unchosen = threeCards.find(c => !chosenCardIds.includes(c.id));

  // Add chosen cards to hand
  chosenCards.forEach(card => {
    player.hand.push(card.id);
  });

  // Put unchosen card back on top of deck
  if (unchosen) {
    G.deck.push(unchosen);
  }

  return true;
}

/**
 * Pedro Ramirez draw - Draw 1st from discard (if available), 2nd from deck
 */
export function pedroRamirezDraw(G: BangGameState, playerId: string): void {
  const player = G.players[playerId];

  // Draw 1st card from discard if available
  if (G.discardPile.length > 0) {
    const card = G.discardPile.pop()!;
    player.hand.push(card.id);
  } else {
    // If discard empty, draw from deck
    const card = G.deck.pop();
    if (card) {
      player.hand.push(card.id);
    }
  }

  // Draw 2nd card from deck
  const card2 = G.deck.pop();
  if (card2) {
    player.hand.push(card2.id);
  }
}
