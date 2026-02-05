// AI Player Logic - Makes intelligent moves for AI-controlled players

import { BangGameState } from '../game/setup';
import { isInRange, calculateDistance } from '../game/utils/distance';

/**
 * Main AI turn execution
 */
export function playAITurn(G: BangGameState, ctx: any, moves: any, playerID: string): void {
  const player = G.players[playerID];

  // Skip if dead
  if (player.isDead) {
    moves.passTurn();
    return;
  }

  // Phase 1: Draw cards if haven't yet
  if (!player.hasDrawn) {
    moves.standardDraw();
    return;
  }

  // Phase 2: Action phase - play cards
  const hand = player.hand.map(id => G.cardMap[id]).filter(c => c);

  // Strategy: Prioritize survival, then attack
  let actionTaken = false;

  // 1. Heal if low on health
  if (player.health <= 2 && player.health < player.maxHealth) {
    const beer = hand.find(c => c.type === 'BEER');
    if (beer) {
      moves.playBeer(beer.id);
      actionTaken = true;
      return;
    }
  }

  // 2. Equip better weapons
  if (!actionTaken) {
    const currentRange = player.weapon?.range || 1;
    const betterWeapon = hand.find(c => c.isWeapon && (c.range || 1) > currentRange);
    if (betterWeapon) {
      moves.equipCard(betterWeapon.id);
      actionTaken = true;
      return;
    }
  }

  // 3. Equip defensive equipment
  if (!actionTaken && !player.barrel) {
    const barrel = hand.find(c => c.type === 'BARREL');
    if (barrel) {
      moves.equipCard(barrel.id);
      actionTaken = true;
      return;
    }
  }

  if (!actionTaken && !player.mustang) {
    const mustang = hand.find(c => c.type === 'MUSTANG');
    if (mustang) {
      moves.equipCard(mustang.id);
      actionTaken = true;
      return;
    }
  }

  // 4. Draw more cards if hand is low
  if (!actionTaken && hand.length < 4) {
    const wellsFargo = hand.find(c => c.type === 'WELLS_FARGO');
    if (wellsFargo) {
      moves.playWellsFargo(wellsFargo.id);
      actionTaken = true;
      return;
    }

    const stagecoach = hand.find(c => c.type === 'STAGECOACH');
    if (stagecoach) {
      moves.playStagecoach(stagecoach.id);
      actionTaken = true;
      return;
    }
  }

  // 5. Attack enemies
  if (!actionTaken) {
    const targets = getTargetPriority(G, playerID);

    for (const targetId of targets) {
      if (G.players[targetId].isDead) continue;

      // Check if can play BANG!
      const canBang = player.bangsPlayedThisTurn === 0 ||
                      player.weapon?.type === 'VOLCANIC' ||
                      player.character.id === 'willy-the-kid';

      if (canBang && isInRange(G, playerID, targetId)) {
        const bang = hand.find(c => c.type === 'BANG');
        if (bang) {
          moves.playBang(bang.id, targetId);
          actionTaken = true;
          return;
        }
      }

      // Use Panic! at distance 1
      const distance = calculateDistance(G, playerID, targetId);
      if (distance === 1) {
        const panic = hand.find(c => c.type === 'PANIC');
        if (panic) {
          moves.playPanic(panic.id, targetId);
          actionTaken = true;
          return;
        }
      }

      // Use Cat Balou
      const catBalou = hand.find(c => c.type === 'CAT_BALOU');
      if (catBalou) {
        moves.playCatBalou(catBalou.id, targetId);
        actionTaken = true;
        return;
      }
    }
  }

  // 6. Play support cards
  if (!actionTaken) {
    const saloon = hand.find(c => c.type === 'SALOON');
    if (saloon && player.health < player.maxHealth) {
      moves.playSaloon(saloon.id);
      actionTaken = true;
      return;
    }
  }

  // 7. Discard and pass if nothing else to do
  moves.passTurn();
}

/**
 * Get list of targets sorted by priority
 */
function getTargetPriority(G: BangGameState, playerID: string): string[] {
  const player = G.players[playerID];
  const role = player.role;
  const sheriffId = G.sheriffId;

  const alivePlayers = Object.keys(G.players).filter(
    id => !G.players[id].isDead && id !== playerID
  );

  // Score each target
  const scored = alivePlayers.map(targetId => {
    let score = 0;
    const target = G.players[targetId];

    // Role-based targeting
    if (role === 'sheriff' || role === 'deputy') {
      // Law team: target outlaws
      if (target.role === 'outlaw') score += 100;
      if (target.role === 'renegade') score += 50;
      if (targetId === sheriffId && role === 'deputy') score -= 1000; // Don't shoot sheriff
    } else if (role === 'outlaw') {
      // Outlaws: target sheriff and deputies
      if (targetId === sheriffId) score += 150;
      if (target.role === 'deputy') score += 100;
      if (target.role === 'outlaw') score -= 50; // Avoid allies
    } else if (role === 'renegade') {
      // Renegade: complex strategy
      const aliveCount = alivePlayers.length + 1;
      if (aliveCount > 3) {
        // Early game: blend in, target outlaws
        if (target.role === 'outlaw') score += 80;
      } else {
        // Late game: target sheriff to win
        if (targetId === sheriffId) score += 150;
      }
    }

    // Universal factors
    // Target low health players
    score += (target.maxHealth - target.health) * 20;

    // Prefer targets in range
    if (isInRange(G, playerID, targetId)) {
      score += 40;
    } else {
      score -= 30;
    }

    // Prefer undefended targets
    if (!target.barrel) score += 15;
    if (!target.mustang) score += 10;

    return { targetId, score };
  });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  return scored.map(s => s.targetId);
}
