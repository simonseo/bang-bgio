// Phase and turn structure definitions

import { BangGameState } from './setup';
import { validateGameState, validatePlayer } from './utils/stateValidation';
import { selectCharacter, moves } from './moves';

export const phases = {
  characterSelection: {
    start: true,
    turn: {
      order: {
        first: () => 0,
        next: ({ ctx }: { ctx: any }) => (ctx.playOrderPos + 1) % ctx.numPlayers,
      },
    },
    moves: {
      selectCharacter: (G: BangGameState, ctx: any, characterId: string) => {
        return selectCharacter({ G, ctx, events: ctx.events }, characterId);
      },
    },
    endIf: ({ G }: { G: BangGameState }) => {
      // End phase when all players have selected their characters
      const allSelected = Object.values(G.players).every(
        player => player.hasSelectedCharacter
      );
      return allSelected;
    },
    next: 'play',
  },
  play: {
    start: false,
    moves: moves, // Make all moves available during play phase
    turn: {
      order: {
        first: ({ G }: { G: BangGameState }) => {
          // Start with sheriff
          if (!G.turnOrder || !G.sheriffId) {
            // Silent return during initialization
            return 0;
          }
          return G.turnOrder.indexOf(G.sheriffId);
        },
        next: ({ G, ctx }: { G: BangGameState; ctx: any }) => {
          // Get next alive player
          if (!G.turnOrder || !G.players) {
            console.warn('turnOrder or players not initialized');
            return 0;
          }
          const alivePlayers = G.turnOrder.filter(id => !G.players[id].isDead);
          if (alivePlayers.length === 0) {
            console.warn('No alive players found');
            return 0;
          }
          const currentIndex = alivePlayers.indexOf(ctx.currentPlayer);
          const nextIndex = (currentIndex + 1) % alivePlayers.length;
          return G.turnOrder.indexOf(alivePlayers[nextIndex]);
        },
      },
      onMove: (G: BangGameState, ctx: any) => {
        console.log('[onMove] Hook called', {
          hasPendingAction: !!G.pendingAction,
          pendingAction: G.pendingAction,
          hasCtx: !!ctx,
          hasCtxEvents: !!(ctx && ctx.events),
          ctxEventsKeys: (ctx && ctx.events) ? Object.keys(ctx.events) : [],
          hasSetActivePlayers: !!(ctx && ctx.events && ctx.events.setActivePlayers),
        });

        // Check if a move created a pending action that requires a response
        if (G.pendingAction && ctx.events?.setActivePlayers) {
          const { pendingAction } = G;

          console.log('[onMove] Pending action detected, setting active players', pendingAction);

          if (pendingAction.type === 'BANG' && pendingAction.targetPlayerId) {
            console.log('[onMove] Setting active player for BANG response', {
              targetPlayerId: pendingAction.targetPlayerId,
            });
            ctx.events.setActivePlayers({
              value: { [pendingAction.targetPlayerId]: 'respondToBang' },
              moveLimit: 1,
            });
            console.log('[onMove] Active players set successfully');
          } else if (pendingAction.type === 'INDIANS' && pendingAction.remainingTargets) {
            const targets = pendingAction.remainingTargets;
            const activePlayers: any = {};
            targets.forEach((id: string) => {
              activePlayers[id] = 'respondToIndians';
            });
            ctx.events.setActivePlayers({ value: activePlayers, moveLimit: 1 });
          } else if (pendingAction.type === 'GATLING' && pendingAction.remainingTargets) {
            const targets = pendingAction.remainingTargets;
            if (targets.length > 0) {
              ctx.events.setActivePlayers({
                value: { [targets[0]]: 'respondToBang' },
                moveLimit: 1,
              });
            }
          } else if (pendingAction.type === 'DUEL' && pendingAction.targetPlayerId) {
            ctx.events.setActivePlayers({
              value: { [pendingAction.targetPlayerId]: 'respondToDuel' },
              moveLimit: 1,
            });
          } else if (pendingAction.type === 'GENERAL_STORE' && pendingAction.remainingTargets) {
            const targets = pendingAction.remainingTargets;
            if (targets.length > 0) {
              ctx.events.setActivePlayers({
                value: { [targets[0]]: 'respondToGeneralStore' },
                moveLimit: 1,
              });
            }
          }
        } else {
          if (G.pendingAction) {
            console.error('[onMove] Pending action exists but ctx.events.setActivePlayers not available!', {
              pendingAction: G.pendingAction,
              hasCtxEvents: !!ctx.events,
            });
          }
        }
      },
      onBegin: (G: BangGameState, ctx: any) => {
        // Safety check - boardgame.io calls this before G is fully initialized
        if (!G || !G.players || !G.turnOrder) {
          // Silent return during initialization
          return;
        }

        const playerId = ctx.currentPlayer;
        if (!G.players[playerId]) {
          // Silent return if player not ready
          return;
        }

        const player = G.players[playerId];

        // Reset turn state
        player.bangsPlayedThisTurn = 0;
        player.hasDrawn = false;
        G.pendingAction = null;

        // Resolve start-of-turn triggers
        const { resolveDynamite, resolveJail } = require('./moves');

        // Dynamite must be resolved first (can skip turn if it kills)
        resolveDynamite({ G, ctx, events: ctx.events });

        // Only resolve Jail if player is still alive
        if (!player.isDead) {
          resolveJail({ G, ctx, events: ctx.events });
        }
      },
      onEnd: (G: BangGameState, ctx: any) => {
        // Guard against undefined ctx during turn transition
        if (!ctx || !ctx.currentPlayer || !G.players[ctx.currentPlayer]) {
          return;
        }

        const playerId = ctx.currentPlayer;
        const player = G.players[playerId];

        // Check if need to discard down to health
        if (player && player.hand && player.hand.length > player.health) {
          // Force discard phase
          if (ctx.events && ctx.events.setStage) {
            ctx.events.setStage('discard');
          }
        }
      },
      stages: {
        respondToBang: {
          moves: {
            playMissed: (G: BangGameState, ctx: any, cardId: string) => {
              // Import from moves
              const { playMissed } = require('./moves');
              return playMissed({ G, ctx, events: ctx.events }, cardId);
            },
            useBarrel: (G: BangGameState, ctx: any) => {
              const { useBarrel } = require('./moves');
              return useBarrel({ G, ctx, events: ctx.events });
            },
            takeDamage: (G: BangGameState, ctx: any, amount?: number) => {
              const { takeDamage } = require('./moves');
              return takeDamage({ G, ctx, events: ctx.events }, amount || 1);
            },
          },
        },
        discard: {
          moves: {
            discardCards: (G: BangGameState, ctx: any, cardIds: string[]) => {
              const { discardCards } = require('./moves');
              return discardCards({ G, ctx, events: ctx.events }, cardIds);
            },
          },
        },
        respondToIndians: {
          moves: {
            respondToIndians: (G: BangGameState, ctx: any, cardId?: string) => {
              const { respondToIndians } = require('./moves');
              return respondToIndians({ G, ctx, events: ctx.events }, cardId);
            },
            takeDamage: (G: BangGameState, ctx: any, amount?: number) => {
              const { takeDamage } = require('./moves');
              return takeDamage({ G, ctx, events: ctx.events }, amount || 1);
            },
          },
        },
        respondToDuel: {
          moves: {
            respondToDuel: (G: BangGameState, ctx: any, cardId?: string) => {
              const { respondToDuel } = require('./moves');
              return respondToDuel({ G, ctx, events: ctx.events }, cardId);
            },
          },
        },
        respondToGeneralStore: {
          moves: {
            respondToGeneralStore: (G: BangGameState, ctx: any, cardId: string) => {
              const { respondToGeneralStore } = require('./moves');
              return respondToGeneralStore({ G, ctx, events: ctx.events }, cardId);
            },
          },
        },
      },
    },
  },
};
