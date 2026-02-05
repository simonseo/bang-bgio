// Utility functions to determine which cards can be played and which players can be targeted

import { BangGameState } from '../setup';
import { Card, CardType } from '../../data/cards';
import { canPlayCard, isValidTarget, canPlayBang } from './validation';
import { getAlivePlayers } from './distance';

/**
 * Check if a card can be played right now (not considering targets)
 */
export function isCardPlayable(
  G: BangGameState,
  ctx: any,
  playerId: string,
  cardId: string
): boolean {
  const player = G.players[playerId];
  const card = G.cardMap[cardId];

  if (!card || !player) return false;

  // Must be player's turn
  if (ctx.currentPlayer !== playerId) return false;

  // Must have drawn cards
  if (!player.hasDrawn) return false;

  // Check BANG! limit
  if (card.type === 'BANG' && !canPlayBang(G, playerId)) {
    return false;
  }

  // For cards that require targets, check if any valid targets exist
  if (card.requiresTarget) {
    const validTargets = getValidTargetsForCard(G, playerId, card);
    return validTargets.length > 0;
  }

  return true;
}

/**
 * Get list of valid target player IDs for a card
 */
export function getValidTargetsForCard(
  G: BangGameState,
  playerId: string,
  card: Card
): string[] {
  if (!card.requiresTarget) return [];

  // getAlivePlayers returns player IDs (strings), not objects
  const alivePlayerIds = getAlivePlayers(G);
  return alivePlayerIds
    .filter(targetId => isValidTarget(G, playerId, targetId, card.type));
}

/**
 * Get all playable card IDs from a player's hand
 */
export function getPlayableCards(
  G: BangGameState,
  ctx: any,
  playerId: string
): string[] {
  const player = G.players[playerId];
  if (!player) return [];

  return player.hand.filter(cardId =>
    isCardPlayable(G, ctx, playerId, cardId)
  );
}
