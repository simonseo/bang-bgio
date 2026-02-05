// All game moves and card effects

import type { Ctx } from 'boardgame.io';
import { BangGameState } from './setup';

// Extended Ctx type with events
type GameCtx = Ctx & {
  events?: {
    endTurn?: () => void;
    setActivePlayers?: (arg: any) => void;
  };
  playerID?: string;
};
import { canPlayCard, hasCard, isValidTarget } from './utils/validation';
import { getAlivePlayers } from './utils/distance';
import {
  drawCards,
  triggerAbility,
  requiresDoubleMissed,
  canSwapBangMissed,
  hasVirtualBarrel,
} from './utils/characterAbilities';
import { validateGameState, validatePlayer, validatePlayerHasCard } from './utils/stateValidation';

const INVALID_MOVE = 'INVALID_MOVE' as const;

/**
 * Standard draw phase - draw 2 cards
 */
export function standardDraw({ G, ctx }: { G: BangGameState; ctx: any }) {
  console.log('[standardDraw] Called', {
    currentPlayer: ctx.currentPlayer,
    hasDrawn: G.players[ctx.currentPlayer]?.hasDrawn,
  });

  // Validate game state
  validateGameState(G, 'standardDraw');

  const playerId = ctx.currentPlayer;
  validatePlayer(G, playerId, 'standardDraw');

  const player = G.players[playerId];

  if (player.hasDrawn) {
    console.log('[standardDraw] Already drawn, returning INVALID_MOVE');
    return INVALID_MOVE;
  }

  console.log('[standardDraw] Drawing 2 cards...');

  // Check for character abilities
  const abilityResult = triggerAbility(G, ctx, playerId, 'onDrawPhase');

  if (abilityResult?.useSpecialDraw) {
    // Kit Carlson or Black Jack - handled separately
    return;
  }

  // Standard draw 2 cards
  drawCards(G, playerId, 2);
  player.hasDrawn = true;

  console.log('[standardDraw] Complete', {
    playerId,
    hasDrawn: player.hasDrawn,
    handSize: player.hand.length,
  });

  // Check Suzy Lafayette (draw when hand empty)
  triggerAbility(G, ctx, playerId, 'onHandEmpty');
}

/**
 * Play a BANG! card
 */
export function playBang({ G, ctx, events }: { G: BangGameState; ctx: GameCtx; events: any }, cardId: string, targetId: string) {
  const playerId = ctx.currentPlayer;

  console.log('[playBang] Called', {
    cardId,
    targetId,
    playerId,
    currentPlayer: ctx.currentPlayer,
    hasEvents: !!events,
  });

  const validation = canPlayCard(G, ctx, playerId, cardId, targetId);

  if (validation === INVALID_MOVE) {
    console.log('[playBang] INVALID_MOVE - validation failed');
    return INVALID_MOVE;
  }

  const player = G.players[playerId];
  const card = G.cardMap[cardId];

  // Remove card from hand and discard
  const index = player.hand.indexOf(cardId);
  player.hand.splice(index, 1);
  G.discardPile.push(card);

  // Increment BANG! counter
  player.bangsPlayedThisTurn++;

  // Set up pending action for target to respond
  G.pendingAction = {
    type: 'BANG',
    sourcePlayerId: playerId,
    targetPlayerId: targetId,
    cardId,
    requiresMissed: requiresDoubleMissed(G, playerId) ? 2 : 1,
  };

  console.log('[playBang] Pending action set', {
    pendingAction: G.pendingAction,
    targetId,
  });

  // Target must respond - use events parameter (not ctx.events!)
  if (events && events.setActivePlayers) {
    console.log('[playBang] Calling events.setActivePlayers', { targetId });
    events.setActivePlayers({
      value: { [targetId]: 'respondToBang' },
      moveLimit: 1,
    });
    console.log('[playBang] Active players set successfully');
  } else {
    console.error('[playBang] events.setActivePlayers not available!', { events });
  }
}

/**
 * Play a Missed! card in response to BANG!
 */
export function playMissed({ G, ctx, events }: { G: BangGameState; ctx: GameCtx; events: any }, cardId: string) {
  const playerId = ctx.playerID || ctx.currentPlayer;

  console.log('[playMissed] Called', {
    cardId,
    playerId,
    'ctx.playerID': ctx.playerID,
    'ctx.currentPlayer': ctx.currentPlayer,
    pendingAction: G.pendingAction,
    targetPlayerId: G.pendingAction?.targetPlayerId,
    match: G.pendingAction?.targetPlayerId === playerId,
  });

  if (!G.pendingAction || G.pendingAction.targetPlayerId !== playerId) {
    console.log('[playMissed] INVALID_MOVE - no pending action or wrong target');
    return INVALID_MOVE;
  }

  const player = G.players[playerId];
  const card = G.cardMap[cardId];

  // Validate card type (allow Calamity Janet to use BANG! as Missed!)
  const isValidMissed =
    card.type === 'MISSED' ||
    (card.type === 'BANG' && canSwapBangMissed(G, playerId));

  if (!isValidMissed || !hasCard(G, playerId, cardId)) {
    return INVALID_MOVE;
  }

  // Remove card from hand and discard
  const index = player.hand.indexOf(cardId);
  player.hand.splice(index, 1);
  G.discardPile.push(card);

  // Reduce required Missed! count
  if (G.pendingAction.requiresMissed) {
    G.pendingAction.requiresMissed--;
  }

  // If all Missed! played, check for more targets or end
  if (G.pendingAction.requiresMissed === 0) {
    // Check if there are more targets (for Gatling)
    if (G.pendingAction.remainingTargets && G.pendingAction.remainingTargets.length > 0) {
      const remainingTargets = G.pendingAction.remainingTargets;
      G.pendingAction.targetPlayerId = remainingTargets[0];
      G.pendingAction.remainingTargets = remainingTargets.slice(1);
      G.pendingAction.requiresMissed = 1;

      if (events?.setActivePlayers) {
        events.setActivePlayers({
          value: { [remainingTargets[0]]: 'respondToBang' },
          moveLimit: 1,
        });
      }
    } else {
      G.pendingAction = null;
      if (events?.endTurn) events.endTurn();
    }
  } else {
    // Still need more Missed! (Slab the Killer)
    if (events?.setActivePlayers) {
      events.setActivePlayers({
        value: { [playerId]: 'respondToBang' },
        moveLimit: 1,
        });
    }
  }
}

/**
 * Use Barrel to try to dodge BANG!
 */
export function useBarrel({ G, ctx, events }: { G: BangGameState; ctx: any; events: any }) {
  const playerId = ctx.playerID || ctx.currentPlayer;

  if (!G.pendingAction || G.pendingAction.targetPlayerId !== playerId) {
    return INVALID_MOVE;
  }

  const player = G.players[playerId];

  // Check if player has barrel or Jourdonnais ability
  if (!player.barrel && !hasVirtualBarrel(G, playerId)) {
    return INVALID_MOVE;
  }

  // Draw! - reveal top card
  const drawnCard = G.deck.pop();
  if (!drawnCard) return INVALID_MOVE;

  G.discardPile.push(drawnCard);

  // If hearts, dodge successful
  if (drawnCard.suit === 'hearts') {
    G.pendingAction = null;
    if (events?.endTurn) events.endTurn();
  } else {
    // Failed, must play Missed! or take damage
    if (events?.setActivePlayers) {
      events.setActivePlayers({
        value: { [playerId]: 'respondToBang' },
        moveLimit: 1,
      });
    }
  }
}

/**
 * Take damage from BANG!
 */
export function takeDamage({ G, ctx, events }: { G: BangGameState; ctx: any; events: any }, amount: number = 1) {
  const playerId = ctx.playerID || ctx.currentPlayer;
  const player = G.players[playerId];

  console.log('[takeDamage] Called', {
    amount,
    playerId,
    'ctx.playerID': ctx.playerID,
    'ctx.currentPlayer': ctx.currentPlayer,
    healthBefore: player.health,
    pendingAction: G.pendingAction,
  });

  player.health -= amount;

  console.log('[takeDamage] Health updated', {
    playerId,
    healthAfter: player.health,
  });

  // Trigger damage abilities
  if (G.pendingAction?.sourcePlayerId) {
    triggerAbility(G, ctx, playerId, 'onDamage', {
      damageAmount: amount,
      attackerId: G.pendingAction.sourcePlayerId,
    });
  }

  // Check if player died
  if (player.health <= 0) {
    handlePlayerDeath(G, ctx, playerId);
  }

  // Check if there are more targets (for Gatling)
  if (G.pendingAction && G.pendingAction.remainingTargets && G.pendingAction.remainingTargets.length > 0) {
    const remainingTargets = G.pendingAction.remainingTargets;
    G.pendingAction.targetPlayerId = remainingTargets[0];
    G.pendingAction.remainingTargets = remainingTargets.slice(1);
    G.pendingAction.requiresMissed = 1;

    if (events?.setActivePlayers) {
      events.setActivePlayers({
        value: { [remainingTargets[0]]: 'respondToBang' },
        moveLimit: 1,
      });
    }
  } else {
    G.pendingAction = null;
  }
}

/**
 * Handle player death
 */
function handlePlayerDeath(G: BangGameState, ctx: GameCtx, playerId: string) {
  const player = G.players[playerId];
  player.isDead = true;

  // Discard all cards
  G.discardPile.push(...player.hand.map(id => G.cardMap[id]));
  G.discardPile.push(...player.inPlay.map(id => G.cardMap[id]));

  player.hand = [];
  player.inPlay = [];

  // Trigger death abilities (Vulture Sam)
  getAlivePlayers(G).forEach(id => {
    triggerAbility(G, ctx, id, 'onDeath', { deadPlayerId: playerId });
  });

  // Reward/penalty for killing
  if (G.pendingAction?.sourcePlayerId) {
    const killer = G.players[G.pendingAction.sourcePlayerId];

    // If Sheriff killed Deputy, discard all cards
    if (killer.role === 'sheriff' && player.role === 'deputy') {
      G.discardPile.push(...killer.hand.map(id => G.cardMap[id]));
      killer.hand = [];
    }

    // If killed Outlaw, draw 3 cards
    if (player.role === 'outlaw') {
      drawCards(G, G.pendingAction.sourcePlayerId, 3);
    }
  }
}

/**
 * Play Beer
 */
export function playBeer({ G, ctx }: { G: BangGameState; ctx: GameCtx }, cardId: string) {
  const playerId = ctx.currentPlayer;
  const player = G.players[playerId];
  const card = G.cardMap[cardId];

  if (!hasCard(G, playerId, cardId)) return INVALID_MOVE;

  // Must have drawn cards first
  if (!player.hasDrawn) return INVALID_MOVE;

  // Can't use Beer when at full health
  if (player.health >= player.maxHealth) return INVALID_MOVE;

  // Can't use Beer with only 2 players alive
  const alivePlayers = getAlivePlayers(G);
  if (alivePlayers.length === 2) return INVALID_MOVE;

  // Remove card and discard
  const index = player.hand.indexOf(cardId);
  player.hand.splice(index, 1);
  G.discardPile.push(card);

  // Heal 1 health
  player.health = Math.min(player.maxHealth, player.health + 1);
}

/**
 * Play Saloon
 */
export function playSaloon({ G, ctx }: { G: BangGameState; ctx: GameCtx }, cardId: string) {
  const playerId = ctx.currentPlayer;
  const player = G.players[playerId];
  const card = G.cardMap[cardId];

  if (!hasCard(G, playerId, cardId)) return INVALID_MOVE;
  if (!player.hasDrawn) return INVALID_MOVE;

  // Remove card and discard
  const index = player.hand.indexOf(cardId);
  player.hand.splice(index, 1);
  G.discardPile.push(card);

  // All players heal 1
  getAlivePlayers(G).forEach(id => {
    const p = G.players[id];
    p.health = Math.min(p.maxHealth, p.health + 1);
  });
}

/**
 * Play Stagecoach
 */
export function playStagecoach({ G, ctx }: { G: BangGameState; ctx: GameCtx }, cardId: string) {
  const playerId = ctx.currentPlayer;
  const player = G.players[playerId];
  const card = G.cardMap[cardId];

  if (!hasCard(G, playerId, cardId)) return INVALID_MOVE;
  if (!player.hasDrawn) return INVALID_MOVE;

  const index = player.hand.indexOf(cardId);
  player.hand.splice(index, 1);
  G.discardPile.push(card);

  drawCards(G, playerId, 2);
}

/**
 * Play Wells Fargo
 */
export function playWellsFargo({ G, ctx }: { G: BangGameState; ctx: GameCtx }, cardId: string) {
  const playerId = ctx.currentPlayer;
  const player = G.players[playerId];
  const card = G.cardMap[cardId];

  if (!hasCard(G, playerId, cardId)) return INVALID_MOVE;
  if (!player.hasDrawn) return INVALID_MOVE;

  const index = player.hand.indexOf(cardId);
  player.hand.splice(index, 1);
  G.discardPile.push(card);

  drawCards(G, playerId, 3);
}

/**
 * Play Panic
 */
export function playPanic({ G, ctx }: { G: BangGameState; ctx: GameCtx }, cardId: string, targetId: string) {
  const playerId = ctx.currentPlayer;
  const player = G.players[playerId];
  const card = G.cardMap[cardId];

  if (!hasCard(G, playerId, cardId)) return INVALID_MOVE;
  if (!player.hasDrawn) return INVALID_MOVE;
  if (!isValidTarget(G, playerId, targetId, 'PANIC')) return INVALID_MOVE;

  const target = G.players[targetId];

  // Remove card and discard
  const index = player.hand.indexOf(cardId);
  player.hand.splice(index, 1);
  G.discardPile.push(card);

  // Steal random card from target
  const allCards = [...target.hand, ...target.inPlay];
  if (allCards.length > 0) {
    const randomIndex = Math.floor(Math.random() * allCards.length);
    const stolenCardId = allCards[randomIndex];

    // Remove from target
    const handIndex = target.hand.indexOf(stolenCardId);
    if (handIndex !== -1) {
      target.hand.splice(handIndex, 1);
    } else {
      const playIndex = target.inPlay.indexOf(stolenCardId);
      if (playIndex !== -1) {
        target.inPlay.splice(playIndex, 1);
      }
    }

    // Add to player's hand
    player.hand.push(stolenCardId);
  }
}

/**
 * Play Cat Balou
 */
export function playCatBalou({ G, ctx }: { G: BangGameState; ctx: GameCtx }, cardId: string, targetId: string, targetCardId?: string) {
  const playerId = ctx.currentPlayer;
  const player = G.players[playerId];
  const card = G.cardMap[cardId];

  if (!hasCard(G, playerId, cardId)) return INVALID_MOVE;
  if (!player.hasDrawn) return INVALID_MOVE;
  if (!isValidTarget(G, playerId, targetId, 'CAT_BALOU')) return INVALID_MOVE;

  const target = G.players[targetId];

  // Remove card and discard
  const index = player.hand.indexOf(cardId);
  player.hand.splice(index, 1);
  G.discardPile.push(card);

  // Discard target card (random if not specified)
  let cardToDiscard = targetCardId;
  if (!cardToDiscard) {
    const allCards = [...target.hand, ...target.inPlay];
    if (allCards.length > 0) {
      const randomIndex = Math.floor(Math.random() * allCards.length);
      cardToDiscard = allCards[randomIndex];
    }
  }

  if (cardToDiscard) {
    // Remove from target
    const handIndex = target.hand.indexOf(cardToDiscard);
    if (handIndex !== -1) {
      target.hand.splice(handIndex, 1);
    } else {
      const playIndex = target.inPlay.indexOf(cardToDiscard);
      if (playIndex !== -1) {
        target.inPlay.splice(playIndex, 1);
      }
    }

    // Add to discard pile
    const discardedCard = G.cardMap[cardToDiscard];
    if (discardedCard) {
      G.discardPile.push(discardedCard);
    }
  }
}

/**
 * Play Gatling - BANG! all other players
 */
export function playGatling({ G, ctx, events }: { G: BangGameState; ctx: GameCtx; events: any }, cardId: string) {
  const playerId = ctx.currentPlayer;
  const player = G.players[playerId];
  const card = G.cardMap[cardId];

  if (!hasCard(G, playerId, cardId)) return INVALID_MOVE;
  if (!player.hasDrawn) return INVALID_MOVE;

  // Remove card and discard
  const index = player.hand.indexOf(cardId);
  player.hand.splice(index, 1);
  G.discardPile.push(card);

  // Get all other alive players
  const alivePlayers = getAlivePlayers(G);
  const targets = alivePlayers.filter(id => id !== playerId);

  // Create pending action for each target
  // For simplicity, we'll handle them one at a time in sequence
  // Store all targets in pendingAction
  G.pendingAction = {
    type: 'GATLING',
    sourcePlayerId: playerId,
    targetPlayerId: targets[0], // First target
    cardId,
    remainingTargets: targets.slice(1), // Rest of targets
    requiresMissed: 1,
  };

  // First target must respond
  if (events?.setActivePlayers && targets.length > 0) {
    events.setActivePlayers({
      value: { [targets[0]]: 'respondToBang' },
      moveLimit: 1,
    });
  }
}

/**
 * Play Indians - All players must discard BANG! or lose 1 health
 */
export function playIndians({ G, ctx, events }: { G: BangGameState; ctx: GameCtx; events: any }, cardId: string) {
  const playerId = ctx.currentPlayer;
  const player = G.players[playerId];
  const card = G.cardMap[cardId];

  if (!hasCard(G, playerId, cardId)) return INVALID_MOVE;
  if (!player.hasDrawn) return INVALID_MOVE;

  // Remove card and discard
  const index = player.hand.indexOf(cardId);
  player.hand.splice(index, 1);
  G.discardPile.push(card);

  // Get all other alive players
  const alivePlayers = getAlivePlayers(G);
  const targets = alivePlayers.filter(id => id !== playerId);

  // Each player must respond by discarding BANG! or taking damage
  G.pendingAction = {
    type: 'INDIANS',
    sourcePlayerId: playerId,
    targetPlayerId: targets[0], // First target
    cardId,
    remainingTargets: targets.slice(1),
    requiresMissed: 0, // Indians doesn't use Missed, uses BANG!
  };

  // Set all targets to respond simultaneously or in sequence
  if (events?.setActivePlayers && targets.length > 0) {
    // For now, handle sequentially like Gatling
    events.setActivePlayers({
      value: { [targets[0]]: 'respondToIndians' },
      moveLimit: 1,
    });
  }
}

/**
 * Respond to Indians by discarding BANG!
 */
export function respondToIndians({ G, ctx, events }: { G: BangGameState; ctx: GameCtx; events: any }, cardId?: string) {
  const playerId = ctx.playerID || ctx.currentPlayer;

  if (!G.pendingAction || G.pendingAction.type !== 'INDIANS') {
    return INVALID_MOVE;
  }

  if (G.pendingAction.targetPlayerId !== playerId) {
    return INVALID_MOVE;
  }

  const player = G.players[playerId];

  // If player provides cardId, they're discarding a BANG!
  if (cardId) {
    const card = G.cardMap[cardId];
    if (!card || card.type !== 'BANG' || !hasCard(G, playerId, cardId)) {
      return INVALID_MOVE;
    }

    // Discard the BANG!
    const index = player.hand.indexOf(cardId);
    player.hand.splice(index, 1);
    G.discardPile.push(card);
  } else {
    // No BANG! discarded, take damage
    player.health -= 1;

    // Check if player died
    if (player.health <= 0) {
      handlePlayerDeath(G, ctx, playerId);
    }
  }

  // Move to next target or clear pending action
  const remainingTargets = G.pendingAction.remainingTargets || [];
  if (remainingTargets.length > 0) {
    G.pendingAction.targetPlayerId = remainingTargets[0];
    G.pendingAction.remainingTargets = remainingTargets.slice(1);

    if (events?.setActivePlayers) {
      events.setActivePlayers({
        value: { [remainingTargets[0]]: 'respondToIndians' },
        moveLimit: 1,
      });
    }
  } else {
    // All targets responded
    G.pendingAction = null;
  }
}

/**
 * Play Duel - BANG! battle between two players
 */
export function playDuel({ G, ctx, events }: { G: BangGameState; ctx: GameCtx; events: any }, cardId: string, targetId: string) {
  const playerId = ctx.currentPlayer;
  const player = G.players[playerId];
  const card = G.cardMap[cardId];

  // Validate
  if (!hasCard(G, playerId, cardId)) return INVALID_MOVE;
  if (!player.hasDrawn) return INVALID_MOVE;
  if (playerId === targetId) return INVALID_MOVE;
  if (!G.players[targetId] || G.players[targetId].isDead) return INVALID_MOVE;

  // Remove card and discard
  const index = player.hand.indexOf(cardId);
  player.hand.splice(index, 1);
  G.discardPile.push(card);

  // Set up duel - target must respond first
  G.pendingAction = {
    type: 'DUEL',
    sourcePlayerId: playerId,
    targetPlayerId: targetId,
    cardId,
    bangCount: 0, // Track who's turn it is in the duel
  };

  // Target must respond with BANG!
  if (events?.setActivePlayers) {
    events.setActivePlayers({
      value: { [targetId]: 'respondToDuel' },
      moveLimit: 1,
    });
  }
}

/**
 * Play General Store - reveal cards for all players to choose from
 */
export function playGeneralStore({ G, ctx, events }: { G: BangGameState; ctx: GameCtx; events: any }, cardId: string) {
  const playerId = ctx.currentPlayer;
  const player = G.players[playerId];
  const card = G.cardMap[cardId];

  // Validate
  if (!hasCard(G, playerId, cardId)) return INVALID_MOVE;
  if (!player.hasDrawn) return INVALID_MOVE;

  // Remove card and discard
  const index = player.hand.indexOf(cardId);
  player.hand.splice(index, 1);
  G.discardPile.push(card);

  // Count alive players
  const alivePlayers = getAlivePlayers(G);
  const numCards = alivePlayers.length;

  // Draw cards equal to number of alive players
  const revealedCards: string[] = [];
  for (let i = 0; i < numCards; i++) {
    // Reshuffle discard pile if deck is empty
    if (G.deck.length === 0) {
      G.deck = [...G.discardPile];
      G.discardPile = [];
      // TODO: shuffle deck
    }

    const drawnCard = G.deck.pop();
    if (drawnCard) {
      revealedCards.push(drawnCard.id);
    }
  }

  // Set up General Store selection - first player in turn order chooses first
  G.pendingAction = {
    type: 'GENERAL_STORE',
    sourcePlayerId: playerId,
    targetPlayerId: alivePlayers[0], // First player to choose
    remainingTargets: alivePlayers.slice(1), // Rest of players
    cardId: cardId,
    revealedCards: revealedCards, // Store revealed cards
  };

  // First player must choose a card
  if (events?.setActivePlayers) {
    events.setActivePlayers({
      value: { [alivePlayers[0]]: 'respondToGeneralStore' },
      moveLimit: 1,
    });
  }
}

/**
 * Respond to General Store by choosing a card
 */
export function respondToGeneralStore({ G, ctx, events }: { G: BangGameState; ctx: GameCtx; events: any }, cardId: string) {
  const playerId = ctx.playerID || ctx.currentPlayer;

  if (!G.pendingAction || G.pendingAction.type !== 'GENERAL_STORE') {
    return INVALID_MOVE;
  }

  if (G.pendingAction.targetPlayerId !== playerId) {
    return INVALID_MOVE;
  }

  const revealedCards = G.pendingAction.revealedCards || [];
  if (!revealedCards.includes(cardId)) {
    return INVALID_MOVE;
  }

  // Add card to player's hand
  const player = G.players[playerId];
  player.hand.push(cardId);

  // Remove card from revealed cards
  const index = revealedCards.indexOf(cardId);
  revealedCards.splice(index, 1);

  // Check if more players need to choose
  if (G.pendingAction.remainingTargets && G.pendingAction.remainingTargets.length > 0) {
    // Move to next player
    const nextPlayer = G.pendingAction.remainingTargets[0];
    G.pendingAction.targetPlayerId = nextPlayer;
    G.pendingAction.remainingTargets = G.pendingAction.remainingTargets.slice(1);
    G.pendingAction.revealedCards = revealedCards;

    if (events?.setActivePlayers) {
      events.setActivePlayers({
        value: { [nextPlayer]: 'respondToGeneralStore' },
        moveLimit: 1,
      });
    }
  } else {
    // All players have chosen, discard remaining cards (if any)
    revealedCards.forEach(remainingCardId => {
      const remainingCard = G.cardMap[remainingCardId];
      if (remainingCard) {
        G.discardPile.push(remainingCard);
      }
    });

    // Clear pending action
    G.pendingAction = null;

    // Return control to active player
    if (events?.setActivePlayers) {
      events.setActivePlayers({ value: {} });
    }
  }
}

/**
 * Play Dynamite card - place it on yourself
 */
export function playDynamite({ G, ctx }: { G: BangGameState; ctx: GameCtx }, cardId: string) {
  const playerId = ctx.currentPlayer;
  const player = G.players[playerId];
  const card = G.cardMap[cardId];

  // Validate
  if (!hasCard(G, playerId, cardId)) return INVALID_MOVE;
  if (!player.hasDrawn) return INVALID_MOVE;
  if (player.dynamite) return INVALID_MOVE; // Already have dynamite

  // Remove card from hand
  const index = player.hand.indexOf(cardId);
  player.hand.splice(index, 1);

  // Place dynamite on yourself
  player.dynamite = true;

  // Add to inPlay
  player.inPlay.push(cardId);
}

/**
 * Resolve Dynamite at start of turn
 * Draw a card - if it's spades 2-9, take 3 damage
 * Otherwise, pass Dynamite to next player
 */
export function resolveDynamite({ G, ctx, events }: { G: BangGameState; ctx: GameCtx; events: any }) {
  const playerId = ctx.currentPlayer;
  const player = G.players[playerId];

  if (!player.dynamite) {
    return; // No dynamite on this player
  }

  // Draw a card for the "draw!" check
  if (G.deck.length === 0) {
    G.deck = [...G.discardPile];
    G.discardPile = [];
  }

  const drawnCard = G.deck.pop();
  if (!drawnCard) return;

  // Add to discard pile
  G.discardPile.push(drawnCard);

  // Check if it's spades 2-9
  const isExplosion = drawnCard.suit === 'spades' &&
    ['2', '3', '4', '5', '6', '7', '8', '9'].includes(drawnCard.rank);

  if (isExplosion) {
    // Dynamite explodes! Take 3 damage
    player.health -= 3;
    player.dynamite = false;

    // Remove from inPlay and discard
    const dynamiteIndex = player.inPlay.findIndex(id => G.cardMap[id]?.type === 'DYNAMITE');
    if (dynamiteIndex !== -1) {
      const dynamiteCardId = player.inPlay[dynamiteIndex];
      player.inPlay.splice(dynamiteIndex, 1);
      const dynamiteCard = G.cardMap[dynamiteCardId];
      if (dynamiteCard) {
        G.discardPile.push(dynamiteCard);
      }
    }

    // Check for death
    if (player.health <= 0) {
      player.isDead = true;
      // TODO: Handle death (rewards, etc.)
    }
  } else {
    // Pass Dynamite to next alive player
    player.dynamite = false;

    // Remove from current player's inPlay
    const dynamiteIndex = player.inPlay.findIndex(id => G.cardMap[id]?.type === 'DYNAMITE');
    let dynamiteCardId: string | undefined;
    if (dynamiteIndex !== -1) {
      dynamiteCardId = player.inPlay[dynamiteIndex];
      player.inPlay.splice(dynamiteIndex, 1);
    }

    const alivePlayers = getAlivePlayers(G);
    const currentIndex = alivePlayers.indexOf(playerId);
    const nextIndex = (currentIndex + 1) % alivePlayers.length;
    const nextPlayerId = alivePlayers[nextIndex];

    G.players[nextPlayerId].dynamite = true;

    // Add to next player's inPlay
    if (dynamiteCardId) {
      G.players[nextPlayerId].inPlay.push(dynamiteCardId);
    }
  }
}

/**
 * Resolve Jail at start of turn
 * Draw a card - if it's hearts, escape jail
 * Otherwise, skip turn
 */
export function resolveJail({ G, ctx, events }: { G: BangGameState; ctx: GameCtx; events: any }) {
  const playerId = ctx.currentPlayer;
  const player = G.players[playerId];

  if (!player.inJail) {
    return; // Not in jail
  }

  // Draw a card for the "draw!" check
  if (G.deck.length === 0) {
    G.deck = [...G.discardPile];
    G.discardPile = [];
  }

  const drawnCard = G.deck.pop();
  if (!drawnCard) return;

  // Add to discard pile
  G.discardPile.push(drawnCard);

  // Check if it's hearts
  const escaped = drawnCard.suit === 'hearts';

  if (escaped) {
    // Escape jail, continue turn normally
    player.inJail = false;
  } else {
    // Stay in jail, skip turn
    player.inJail = false; // Remove jail after one turn
    // Skip the rest of the turn
    if (events?.endTurn) {
      events.endTurn();
    }
  }
}

/**
 * Respond to Duel by playing BANG! or taking damage
 */
export function respondToDuel({ G, ctx, events }: { G: BangGameState; ctx: GameCtx; events: any }, cardId?: string) {
  const playerId = ctx.playerID || ctx.currentPlayer;

  if (!G.pendingAction || G.pendingAction.type !== 'DUEL') {
    return INVALID_MOVE;
  }

  if (G.pendingAction.targetPlayerId !== playerId) {
    return INVALID_MOVE;
  }

  const player = G.players[playerId];

  // If player provides cardId, they're playing a BANG!
  if (cardId) {
    const card = G.cardMap[cardId];
    if (!card || card.type !== 'BANG' || !hasCard(G, playerId, cardId)) {
      return INVALID_MOVE;
    }

    // Discard the BANG!
    const index = player.hand.indexOf(cardId);
    player.hand.splice(index, 1);
    G.discardPile.push(card);

    // Switch turn in duel - now the other player must respond
    const otherPlayer = playerId === G.pendingAction.sourcePlayerId
      ? G.pendingAction.targetPlayerId
      : G.pendingAction.sourcePlayerId;

    G.pendingAction.targetPlayerId = otherPlayer;
    G.pendingAction.bangCount = (G.pendingAction.bangCount || 0) + 1;

    if (events?.setActivePlayers) {
      events.setActivePlayers({
        value: { [otherPlayer]: 'respondToDuel' },
        moveLimit: 1,
      });
    }
  } else {
    // No BANG! played, lose the duel and take 1 damage
    player.health -= 1;

    // Trigger damage abilities
    if (G.pendingAction.sourcePlayerId) {
      triggerAbility(G, ctx, playerId, 'onDamage', {
        damageAmount: 1,
        attackerId: G.pendingAction.sourcePlayerId,
      });
    }

    // Check if player died
    if (player.health <= 0) {
      handlePlayerDeath(G, ctx, playerId);
    }

    // Duel ends
    G.pendingAction = null;
  }
}

/**
 * Play Jail card on target player
 */
export function playJail({ G, ctx }: { G: BangGameState; ctx: GameCtx }, cardId: string, targetId: string) {
  const playerId = ctx.currentPlayer;
  const player = G.players[playerId];
  const target = G.players[targetId];
  const card = G.cardMap[cardId];

  if (!hasCard(G, playerId, cardId)) return INVALID_MOVE;
  if (!player.hasDrawn) return INVALID_MOVE;

  // Cannot jail the Sheriff
  if (targetId === G.sheriffId) {
    return INVALID_MOVE;
  }

  // Cannot jail if target already has jail
  if (target.inJail) return INVALID_MOVE;

  // Remove from source player's hand
  const index = player.hand.indexOf(cardId);
  player.hand.splice(index, 1);

  // Add to TARGET player's inPlay (not source!)
  target.inPlay.push(cardId);
  target.inJail = true;
}

/**
 * Equip a weapon or equipment card
 */
export function equipCard({ G, ctx }: { G: BangGameState; ctx: GameCtx }, cardId: string) {
  const playerId = ctx.currentPlayer;
  const player = G.players[playerId];
  const card = G.cardMap[cardId];

  if (!hasCard(G, playerId, cardId) || !card || !card.isEquipment) {
    return INVALID_MOVE;
  }

  // Must have drawn cards first
  if (!player.hasDrawn) return INVALID_MOVE;

  // Remove from hand
  const index = player.hand.indexOf(cardId);
  player.hand.splice(index, 1);

  // Handle weapon replacement
  if (card.isWeapon) {
    if (player.weapon) {
      // Discard old weapon
      const oldWeaponIndex = player.inPlay.indexOf(player.weapon.id);
      if (oldWeaponIndex !== -1) {
        player.inPlay.splice(oldWeaponIndex, 1);
      }
      G.discardPile.push(player.weapon);
    }
    player.weapon = card;
  }

  // Add to play area
  player.inPlay.push(cardId);

  // Update equipment flags
  switch (card.type) {
    case 'BARREL':
      player.barrel = true;
      break;
    case 'MUSTANG':
      player.mustang = true;
      break;
    case 'SCOPE':
      player.scope = true;
      break;
    case 'DYNAMITE':
      player.dynamite = true;
      break;
  }
}

/**
 * Pass turn (end action phase)
 */
export function passTurn({ G, ctx, events }: { G: BangGameState; ctx: GameCtx; events?: any }) {
  const playerId = ctx.currentPlayer;
  const player = G.players[playerId];

  console.log('[passTurn] Called', {
    playerId,
    hasDrawn: player.hasDrawn,
    hasEvents: !!events,
    hasEndTurn: !!(events?.endTurn),
    eventKeys: events ? Object.keys(events) : 'no events',
  });

  // Cannot end turn if there's a pending action that needs resolution
  if (G.pendingAction && G.pendingAction.targetPlayerId !== playerId) {
    console.warn('[passTurn] Cannot end turn while action pending');
    return INVALID_MOVE;
  }

  // Must have drawn cards
  if (!player.hasDrawn) {
    console.warn('[passTurn] Must draw cards before ending turn');
    return INVALID_MOVE;
  }

  if (events?.endTurn) {
    console.log('[passTurn] Calling events.endTurn() for player', playerId);
    events.endTurn();
    console.log('[passTurn] events.endTurn() called successfully');
  } else {
    console.warn('[passTurn] events.endTurn not available!', { hasEvents: !!events });
  }
}

/**
 * Discard cards at end of turn
 */
export function discardCards({ G, ctx, events }: { G: BangGameState; ctx: GameCtx; events?: any }, cardIds: string[]) {
  const playerId = ctx.currentPlayer;
  const player = G.players[playerId];

  // Validate all cards belong to player
  const valid = cardIds.every(id => player.hand.includes(id));
  if (!valid) return INVALID_MOVE;

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

  // Check if hand size is now valid
  if (player.hand.length <= player.health) {
    if (events?.endTurn) events.endTurn();
  }
}

/**
 * Select character from choices at game start
 */
export function selectCharacter({ G, ctx }: { G: BangGameState; ctx: GameCtx }, characterId: string) {
  const playerId = ctx.currentPlayer;
  const player = G.players[playerId];

  // Validate character is in player's choices
  const selectedCharacter = player.characterChoices.find(c => c.id === characterId);
  if (!selectedCharacter) {
    return INVALID_MOVE;
  }

  // Set the character
  player.character = selectedCharacter;

  // Update health based on character
  const isSheriff = player.role === 'sheriff';
  const newMaxHealth = selectedCharacter.health + (isSheriff ? 1 : 0);
  player.maxHealth = newMaxHealth;
  player.health = newMaxHealth;

  // Adjust hand size to match health
  const currentHandSize = player.hand.length;
  if (currentHandSize < newMaxHealth) {
    // Draw more cards
    const cardsToDraw = newMaxHealth - currentHandSize;
    drawCards(G, playerId, cardsToDraw);
  } else if (currentHandSize > newMaxHealth) {
    // Discard excess cards
    const cardsToDiscard = currentHandSize - newMaxHealth;
    for (let i = 0; i < cardsToDiscard; i++) {
      const cardId = player.hand.pop();
      if (cardId) {
        const card = G.cardMap[cardId];
        if (card) {
          G.discardPile.push(card);
        }
      }
    }
  }
}

// Export all moves
export const moves = {
  standardDraw,
  playBang,
  playMissed,
  useBarrel,
  takeDamage,
  playBeer,
  playSaloon,
  playStagecoach,
  playWellsFargo,
  playPanic,
  playCatBalou,
  playGatling,
  playIndians,
  respondToIndians,
  playDuel,
  respondToDuel,
  playGeneralStore,
  respondToGeneralStore,
  playDynamite,
  resolveDynamite,
  resolveJail,
  playJail,
  equipCard,
  passTurn,
  discardCards,
  selectCharacter,
};
