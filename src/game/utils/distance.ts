// Distance and range calculations

import { BangGameState } from '../setup';

/**
 * Calculate the distance between two players
 * Distance is the minimum number of steps clockwise or counterclockwise
 * Modified by equipment (Mustang, Scope) and character abilities
 */
export function calculateDistance(
  G: BangGameState,
  fromPlayerId: string,
  toPlayerId: string
): number {
  if (fromPlayerId === toPlayerId) return 0;

  // Get alive players in order
  const alivePlayers = G.turnOrder.filter(id => !G.players[id].isDead);

  const fromIndex = alivePlayers.indexOf(fromPlayerId);
  const toIndex = alivePlayers.indexOf(toPlayerId);

  if (fromIndex === -1 || toIndex === -1) return Infinity;

  // Calculate clockwise and counterclockwise distances
  const totalPlayers = alivePlayers.length;
  const clockwise = (toIndex - fromIndex + totalPlayers) % totalPlayers;
  const counterclockwise = (fromIndex - toIndex + totalPlayers) % totalPlayers;

  let distance = Math.min(clockwise, counterclockwise);

  // Apply target's Mustang (+1 to distance)
  if (G.players[toPlayerId].mustang) {
    distance += 1;
  }

  // Apply attacker's Scope (-1 to distance)
  if (G.players[fromPlayerId].scope) {
    distance = Math.max(1, distance - 1);
  }

  // Apply Paul Regret's ability (target seen at +1)
  const targetCharacter = G.players[toPlayerId].character;
  if (targetCharacter.id === 'paul-regret') {
    distance += 1;
  }

  // Apply Rose Doolan's ability (attacker sees all at -1)
  const attackerCharacter = G.players[fromPlayerId].character;
  if (attackerCharacter.id === 'rose-doolan') {
    distance = Math.max(1, distance - 1);
  }

  return Math.max(1, distance);
}

/**
 * Get the attack range of a player based on their weapon
 */
export function getAttackRange(G: BangGameState, playerId: string): number {
  const player = G.players[playerId];

  if (player.weapon) {
    return player.weapon.range || 1;
  }

  // Default Colt .45 has range 1
  return 1;
}

/**
 * Check if a target is in range for an attack
 */
export function isInRange(
  G: BangGameState,
  attackerId: string,
  targetId: string
): boolean {
  const distance = calculateDistance(G, attackerId, targetId);
  const range = getAttackRange(G, attackerId);
  return distance <= range;
}

/**
 * Get all players in range of an attacker
 */
export function getPlayersInRange(
  G: BangGameState,
  attackerId: string
): string[] {
  return G.turnOrder
    .filter(id => !G.players[id].isDead && id !== attackerId)
    .filter(id => isInRange(G, attackerId, id));
}

/**
 * Get all alive players
 */
export function getAlivePlayers(G: BangGameState): string[] {
  return G.turnOrder.filter(id => !G.players[id].isDead);
}

/**
 * Get distance to nearest player at distance 1
 */
export function hasPlayerAtDistanceOne(
  G: BangGameState,
  playerId: string
): boolean {
  return G.turnOrder.some(
    id => !G.players[id].isDead &&
    id !== playerId &&
    calculateDistance(G, playerId, id) === 1
  );
}
