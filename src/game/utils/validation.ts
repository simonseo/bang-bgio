// Move validation utilities

import { Ctx } from 'boardgame.io';
import { BangGameState } from '../setup';
import { CardType } from '../../data/cards';

const INVALID_MOVE = 'INVALID_MOVE' as const;
import { isInRange, calculateDistance } from './distance';
import { canPlayUnlimitedBangs } from './characterAbilities';

/**
 * Check if player has a card
 */
export function hasCard(G: BangGameState, playerId: string, cardId: string): boolean {
  return G.players[playerId].hand.includes(cardId);
}

/**
 * Check if target is valid for a card
 */
export function isValidTarget(
  G: BangGameState,
  playerId: string,
  targetId: string,
  cardType: CardType
): boolean {
  const target = G.players[targetId];

  // Can't target dead players
  if (target.isDead) return false;

  // Can't target self (except for some cards)
  if (playerId === targetId && !['BEER'].includes(cardType)) return false;

  switch (cardType) {
    case 'BANG':
      // Must be in range and not self
      return playerId !== targetId && isInRange(G, playerId, targetId);

    case 'PANIC':
      // Must be at distance 1 and have cards
      const distance = calculateDistance(G, playerId, targetId);
      return distance === 1 && (target.hand.length > 0 || target.inPlay.length > 0);

    case 'CAT_BALOU':
      // Must have cards
      return target.hand.length > 0 || target.inPlay.length > 0;

    case 'DUEL':
      // Can't duel yourself
      return playerId !== targetId;

    case 'JAIL':
      // Can only jail the Sheriff or if not Sheriff
      return targetId !== G.sheriffId;

    default:
      return true;
  }
}

/**
 * Check if player can play BANG!
 */
export function canPlayBang(G: BangGameState, playerId: string): boolean {
  const player = G.players[playerId];

  // Check if unlimited BANGs allowed
  if (canPlayUnlimitedBangs(G, playerId)) {
    return true;
  }

  // Otherwise, only 1 BANG! per turn
  return player.bangsPlayedThisTurn === 0;
}

/**
 * Check if player can play a card
 */
export function canPlayCard(
  G: BangGameState,
  _ctx: Ctx,
  playerId: string,
  cardId: string,
  targetId?: string
): string | 'INVALID_MOVE' {
  const player = G.players[playerId];

  // Must have drawn cards first
  if (!player.hasDrawn) {
    return INVALID_MOVE;
  }

  // Check player has the card
  if (!hasCard(G, playerId, cardId)) {
    return INVALID_MOVE;
  }

  const card = G.cardMap[cardId];
  if (!card) return INVALID_MOVE;

  // Check BANG! limit
  if (card.type === 'BANG' && !canPlayBang(G, playerId)) {
    return INVALID_MOVE;
  }

  // Check target requirement
  if (card.requiresTarget && !targetId) {
    return INVALID_MOVE;
  }

  // Validate target
  if (targetId && card.requiresTarget) {
    if (!isValidTarget(G, playerId, targetId, card.type)) {
      return INVALID_MOVE;
    }
  }

  return 'OK';
}

/**
 * Check if player is alive
 */
export function isPlayerAlive(G: BangGameState, playerId: string): boolean {
  return !G.players[playerId].isDead;
}

/**
 * Check if it's player's turn
 */
export function isPlayerTurn(ctx: Ctx, playerId: string): boolean {
  return ctx.currentPlayer === playerId;
}

/**
 * Validate card can be equipped
 */
export function canEquipCard(G: BangGameState, playerId: string, cardId: string): boolean {
  const card = G.cardMap[cardId];
  if (!card || !card.isEquipment) return false;

  const player = G.players[playerId];

  // Check if player already has this equipment type
  if (card.isWeapon && player.weapon) {
    // Can replace weapon
    return true;
  }

  switch (card.type) {
    case 'BARREL':
      return !player.barrel;
    case 'MUSTANG':
      return !player.mustang;
    case 'SCOPE':
      return !player.scope;
    case 'DYNAMITE':
      return !player.dynamite;
    default:
      return true;
  }
}
