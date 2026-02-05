// AI Bot for Bang! Card Game

import { BangGameState } from '../game/setup';
import { isInRange, calculateDistance } from '../game/utils/distance';

interface AIContext {
  G: BangGameState;
  ctx: any;
  playerID: string;
}

/**
 * Bang! AI Bot with strategic decision making
 */
export const BangBot = {
  enumerate: (G: BangGameState, ctx: any, playerID: string) => {
    const moves: Array<{ move: string; args: any[] }> = [];
    const player = G.players[playerID];

    // Skip if dead
    if (player.isDead) return moves;

    // Check if it's this player's turn
    if (ctx.currentPlayer !== playerID) return moves;

    // 1. DRAW PHASE - Always draw if haven't yet
    if (!player.hasDrawn) {
      moves.push({ move: 'standardDraw', args: [] });
      return moves; // Only return draw move during draw phase
    }

    // 2. ACTION PHASE - Play cards strategically
    const hand = player.hand.map(id => G.cardMap[id]).filter(c => c);

    // Get player role and strategy
    const strategy = getStrategy(G, playerID);

    // Prioritize healing if low on health
    if (player.health <= 2 && player.health < player.maxHealth) {
      const beer = hand.find(c => c.type === 'BEER');
      if (beer) {
        moves.push({ move: 'playBeer', args: [beer.id] });
      }
    }

    // Equip better weapons if available
    const currentRange = player.weapon?.range || 1;
    const betterWeapon = hand.find(c => c.isWeapon && (c.range || 1) > currentRange);
    if (betterWeapon) {
      moves.push({ move: 'equipCard', args: [betterWeapon.id] });
    }

    // Equip defensive equipment
    if (!player.barrel) {
      const barrel = hand.find(c => c.type === 'BARREL');
      if (barrel) {
        moves.push({ move: 'equipCard', args: [barrel.id] });
      }
    }

    if (!player.mustang) {
      const mustang = hand.find(c => c.type === 'MUSTANG');
      if (mustang) {
        moves.push({ move: 'equipCard', args: [mustang.id] });
      }
    }

    // Draw cards if hand is low
    const stagecoach = hand.find(c => c.type === 'STAGECOACH');
    if (stagecoach && hand.length < 3) {
      moves.push({ move: 'playStagecoach', args: [stagecoach.id] });
    }

    const wellsFargo = hand.find(c => c.type === 'WELLS_FARGO');
    if (wellsFargo && hand.length < 4) {
      moves.push({ move: 'playWellsFargo', args: [wellsFargo.id] });
    }

    // ATTACK - Target enemies based on role
    const targets = strategy.getTargets(G, playerID);

    for (const targetId of targets) {
      if (!isInRange(G, playerID, targetId)) continue;

      // Check if can play BANG!
      const canBang = player.bangsPlayedThisTurn === 0 ||
                      player.weapon?.type === 'VOLCANIC' ||
                      player.character.id === 'willy-the-kid';

      if (canBang) {
        const bang = hand.find(c => c.type === 'BANG');
        if (bang) {
          moves.push({ move: 'playBang', args: [bang.id, targetId] });
        }
      }

      // Use Panic! to steal from close enemies
      const panic = hand.find(c => c.type === 'PANIC');
      if (panic && calculateDistance(G, playerID, targetId) === 1) {
        moves.push({ move: 'playPanic', args: [panic.id, targetId] });
      }

      // Use Cat Balou to remove cards
      const catBalou = hand.find(c => c.type === 'CAT_BALOU');
      if (catBalou) {
        moves.push({ move: 'playCatBalou', args: [catBalou.id, targetId] });
      }
    }

    // If no good moves, pass turn
    if (moves.length === 0) {
      moves.push({ move: 'passTurn', args: [] });
    }

    return moves;
  },
};

/**
 * Get AI strategy based on role
 */
function getStrategy(G: BangGameState, playerID: string) {
  const player = G.players[playerID];
  const role = player.role;
  const sheriffId = G.sheriffId;

  return {
    getTargets: (G: BangGameState, playerId: string): string[] => {
      const alivePlayers = Object.keys(G.players).filter(
        id => !G.players[id].isDead && id !== playerId
      );

      // Sort targets by priority
      const targets = alivePlayers.sort((a, b) => {
        const scoreA = getTargetScore(G, playerId, a, role, sheriffId);
        const scoreB = getTargetScore(G, playerId, b, role, sheriffId);
        return scoreB - scoreA; // Higher score = better target
      });

      return targets;
    },
  };
}

/**
 * Score a target based on AI strategy
 */
function getTargetScore(
  G: BangGameState,
  playerId: string,
  targetId: string,
  myRole: string,
  sheriffId: string
): number {
  const target = G.players[targetId];
  let score = 0;

  // Sheriff strategy
  if (myRole === 'sheriff') {
    // Target known outlaws
    if (target.role === 'outlaw') score += 100;
    // Target suspicious players (high damage dealers)
    score += 50;
    // Avoid deputies
    if (target.role === 'deputy') score -= 1000;
  }

  // Deputy strategy
  if (myRole === 'deputy') {
    // Protect sheriff, target outlaws
    if (target.role === 'outlaw') score += 100;
    // Don't target sheriff
    if (targetId === sheriffId) score -= 1000;
  }

  // Outlaw strategy
  if (myRole === 'outlaw') {
    // Primary target: Sheriff
    if (targetId === sheriffId) score += 200;
    // Secondary: Deputies
    if (target.role === 'deputy') score += 80;
    // Avoid other outlaws (probably)
    if (target.role === 'outlaw') score -= 50;
  }

  // Renegade strategy
  if (myRole === 'renegade') {
    // Early game: Help eliminate outlaws
    // Late game: Target sheriff
    const aliveCount = Object.values(G.players).filter(p => !p.isDead).length;

    if (aliveCount > 3) {
      // Early game: target outlaws
      if (target.role === 'outlaw') score += 80;
    } else {
      // Late game: target strongest player (usually sheriff)
      if (targetId === sheriffId) score += 150;
      score += target.health * 10; // Target high health players
    }
  }

  // Universal targeting logic
  // Prefer low health targets (easier to eliminate)
  score += (target.maxHealth - target.health) * 15;

  // Prefer targets without defensive equipment
  if (!target.barrel) score += 10;
  if (!target.mustang) score += 5;

  // Prefer targets in range
  if (isInRange(G, playerId, targetId)) {
    score += 30;
  } else {
    score -= 50;
  }

  return score;
}
