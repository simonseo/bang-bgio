// Player view filtering for secret information

import { BangGameState } from './setup';

/**
 * Filter game state to hide secret information from other players
 * NOTE: boardgame.io passes { G, ctx, playerID } as a single object
 */
export function bangPlayerView({ G, ctx, playerID }: { G: BangGameState; ctx: any; playerID: string | null }): any {
  // Safety check - game state may not be fully initialized
  if (!G) {
    return {};
  }

  // If core game state not initialized, return as-is
  if (!G.players || !G.turnOrder || !G.deck) {
    return G;
  }

  if (playerID === null) {
    // Spectator view - hide all hands and roles
    return hideAllSecrets(G);
  }

  // Clone the game state
  let filteredG;
  try {
    filteredG = JSON.parse(JSON.stringify(G));
  } catch (error) {
    console.error('Failed to clone game state:', error);
    return G;
  }

  // Safety check after cloning
  if (!filteredG.players) {
    return filteredG;
  }

  // Hide other players' hands
  Object.keys(filteredG.players).forEach(id => {
    if (id !== playerID) {
      const player = filteredG.players[id];
      // Replace hand cards with placeholders
      player.hand = player.hand.map(() => 'HIDDEN');
    }
  });

  // Hide roles except:
  // - Sheriff (always visible)
  // - Own role
  // - Dead players (revealed)
  Object.keys(filteredG.players).forEach(id => {
    const player = filteredG.players[id];
    if (
      id !== playerID &&
      player.role !== 'sheriff' &&
      !player.isDead
    ) {
      player.role = 'HIDDEN';
    }
  });

  // Hide deck contents (but keep count)
  filteredG.deck = filteredG.deck.map(() => 'HIDDEN');

  return filteredG;
}

/**
 * Hide all secrets for spectator view
 */
function hideAllSecrets(G: BangGameState): any {
  const filteredG = JSON.parse(JSON.stringify(G));

  // Hide all hands
  Object.keys(filteredG.players).forEach(id => {
    const player = filteredG.players[id];
    player.hand = player.hand.map(() => 'HIDDEN');
  });

  // Hide all roles except Sheriff and dead players
  Object.keys(filteredG.players).forEach(id => {
    const player = filteredG.players[id];
    if (player.role !== 'sheriff' && !player.isDead) {
      player.role = 'HIDDEN';
    }
  });

  // Hide deck
  filteredG.deck = filteredG.deck.map(() => 'HIDDEN');

  return filteredG;
}
