// Victory condition logic

import { Ctx } from 'boardgame.io';
import { BangGameState } from './setup';
import { getAlivePlayers } from './utils/distance';

export interface VictoryResult {
  winner: 'sheriff' | 'outlaws' | 'renegade';
  survivors: string[];
}

/**
 * Check if game has ended and determine winner
 */
export function checkVictory(G: BangGameState, _ctx: Ctx): VictoryResult | null {
  // Safety check - don't check victory if game not initialized
  if (!G || !G.turnOrder || !G.players) {
    return null;
  }

  const alivePlayers = getAlivePlayers(G);

  // Get alive roles
  const aliveRoles = alivePlayers.map(id => G.players[id].role);
  const sheriffAlive = aliveRoles.includes('sheriff');
  const outlawsAlive = aliveRoles.some(r => r === 'outlaw');
  const renegadeAlive = aliveRoles.includes('renegade');

  // Sheriff dead → Check who wins
  if (!sheriffAlive) {
    // If only Renegade killed the Sheriff and is alone
    if (alivePlayers.length === 1 && renegadeAlive) {
      return {
        winner: 'renegade',
        survivors: alivePlayers,
      };
    }

    // Otherwise Outlaws win (even if dead)
    return {
      winner: 'outlaws',
      survivors: alivePlayers,
    };
  }

  // All Outlaws and Renegade dead → Sheriff and Deputies win
  if (!outlawsAlive && !renegadeAlive) {
    return {
      winner: 'sheriff',
      survivors: alivePlayers,
    };
  }

  // Only Sheriff and Renegade alive → Renegade can win
  if (alivePlayers.length === 2 && sheriffAlive && renegadeAlive) {
    // Continue playing - Renegade wins by eliminating Sheriff
    return null;
  }

  // Only Renegade alive (Sheriff somehow died) → Renegade wins
  if (alivePlayers.length === 1 && renegadeAlive) {
    return {
      winner: 'renegade',
      survivors: alivePlayers,
    };
  }

  // Game continues
  return null;
}

/**
 * Check victory at end of turn
 */
export function endGameCheck(G: BangGameState, ctx: Ctx): VictoryResult | undefined {
  const result = checkVictory(G, ctx);
  if (result) {
    return result;
  }
  return undefined;
}
