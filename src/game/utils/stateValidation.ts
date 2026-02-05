// Runtime state validation to catch initialization errors early

import { BangGameState } from '../setup';

export class GameStateValidationError extends Error {
  constructor(context: string, message: string) {
    super(`[${context}] ${message}`);
    this.name = 'GameStateValidationError';
  }
}

/**
 * Validates that game state is properly initialized
 * Call this at the start of any move or phase that accesses game state
 */
export function validateGameState(G: BangGameState, context: string): void {
  if (!G) {
    throw new GameStateValidationError(context, 'Game state is null or undefined');
  }

  if (!G.players) {
    throw new GameStateValidationError(context, 'Players object not initialized');
  }

  if (!G.turnOrder || !Array.isArray(G.turnOrder)) {
    throw new GameStateValidationError(context, 'Turn order not initialized or not an array');
  }

  if (!G.deck || !Array.isArray(G.deck)) {
    throw new GameStateValidationError(context, 'Deck not initialized or not an array');
  }

  if (!G.discardPile || !Array.isArray(G.discardPile)) {
    throw new GameStateValidationError(context, 'Discard pile not initialized or not an array');
  }

  if (!G.sheriffId) {
    throw new GameStateValidationError(context, 'Sheriff ID not set');
  }

  if (!G.cardMap) {
    throw new GameStateValidationError(context, 'Card map not initialized');
  }

  // Validate player count
  const playerCount = Object.keys(G.players).length;
  if (playerCount < 4 || playerCount > 7) {
    throw new GameStateValidationError(
      context,
      `Invalid player count: ${playerCount} (must be 4-7)`
    );
  }

  // Validate turn order matches players
  if (G.turnOrder.length !== playerCount) {
    throw new GameStateValidationError(
      context,
      `Turn order length (${G.turnOrder.length}) doesn't match player count (${playerCount})`
    );
  }

  // Validate sheriff exists in players
  if (!G.players[G.sheriffId]) {
    throw new GameStateValidationError(
      context,
      `Sheriff player (${G.sheriffId}) not found in players object`
    );
  }
}

/**
 * Validates a specific player exists and is properly initialized
 */
export function validatePlayer(G: BangGameState, playerId: string, context: string): void {
  if (!playerId) {
    throw new GameStateValidationError(context, 'Player ID is null or undefined');
  }

  const player = G.players[playerId];
  if (!player) {
    throw new GameStateValidationError(context, `Player ${playerId} not found`);
  }

  if (typeof player.health !== 'number' || player.health < 0) {
    throw new GameStateValidationError(
      context,
      `Player ${playerId} has invalid health: ${player.health}`
    );
  }

  if (!Array.isArray(player.hand)) {
    throw new GameStateValidationError(context, `Player ${playerId} hand is not an array`);
  }

  if (!Array.isArray(player.inPlay)) {
    throw new GameStateValidationError(context, `Player ${playerId} inPlay is not an array`);
  }

  if (!player.character) {
    throw new GameStateValidationError(context, `Player ${playerId} has no character assigned`);
  }

  if (!player.role) {
    throw new GameStateValidationError(context, `Player ${playerId} has no role assigned`);
  }
}

/**
 * Validates a card exists in the game
 */
export function validateCard(G: BangGameState, cardId: string, context: string): void {
  if (!cardId) {
    throw new GameStateValidationError(context, 'Card ID is null or undefined');
  }

  const card = G.cardMap[cardId];
  if (!card) {
    throw new GameStateValidationError(context, `Card ${cardId} not found in card map`);
  }
}

/**
 * Validates that a player has a specific card
 */
export function validatePlayerHasCard(
  G: BangGameState,
  playerId: string,
  cardId: string,
  context: string
): void {
  validatePlayer(G, playerId, context);
  validateCard(G, cardId, context);

  const player = G.players[playerId];
  if (!player.hand.includes(cardId)) {
    throw new GameStateValidationError(
      context,
      `Player ${playerId} does not have card ${cardId} in hand`
    );
  }
}

/**
 * Validates a target player for an action
 */
export function validateTarget(
  G: BangGameState,
  targetId: string,
  context: string
): void {
  validatePlayer(G, targetId, context);

  const target = G.players[targetId];
  if (target.isDead) {
    throw new GameStateValidationError(
      context,
      `Target player ${targetId} is dead`
    );
  }
}

/**
 * Safe wrapper that logs validation errors but doesn't throw
 * Use for non-critical validations
 */
export function validateGameStateSafe(G: BangGameState, context: string): boolean {
  try {
    validateGameState(G, context);
    return true;
  } catch (error) {
    console.error(`State validation failed: ${error}`);
    return false;
  }
}
