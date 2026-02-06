// Main Bang! game definition

import { setup, BangGameState } from './game/setup';
import { moves } from './game/moves';
import { phases } from './game/phases';
import { bangPlayerView } from './game/playerView';
import { endGameCheck } from './game/victory';

// Define game as plain object (boardgame.io v0.50 pattern)
export const BangGame = {
  name: 'bang',

  setup,

  moves,

  phases,

  endIf: endGameCheck,

  playerView: bangPlayerView,

  minPlayers: 4,
  maxPlayers: 7,

  // AI/Bot configuration
  ai: {
    enumerate: (G: BangGameState, ctx: any) => {
      const moves = [];
      const playerId = ctx.currentPlayer;
      const player = G.players[playerId];

      // Check if player is in a stage (reactive moves required)
      const playerStage = ctx.activePlayers?.[playerId];

      // Handle stages (reactive responses)
      if (playerStage === 'respondToBang') {
        // Try to play Missed! card
        const missedCard = player.hand.find(cardId => {
          const card = G.cardMap[cardId];
          return card && card.type === 'MISSED';
        });

        if (missedCard) {
          moves.push({ move: 'playMissed', args: [missedCard] });
        }

        // Try Barrel if available
        if (player.barrel) {
          moves.push({ move: 'useBarrel', args: [] });
        }

        // Always allow taking damage as fallback
        moves.push({ move: 'takeDamage', args: [1] });
        return moves;
      }

      if (playerStage === 'respondToIndians') {
        // Try to play BANG! card to avoid damage
        const bangCard = player.hand.find(cardId => {
          const card = G.cardMap[cardId];
          return card && card.type === 'BANG';
        });

        if (bangCard) {
          moves.push({ move: 'respondToIndians', args: [bangCard] });
        } else {
          // No BANG!, take damage
          moves.push({ move: 'respondToIndians', args: [] });
        }
        return moves;
      }

      if (playerStage === 'respondToDuel') {
        // Try to play BANG! card
        const bangCard = player.hand.find(cardId => {
          const card = G.cardMap[cardId];
          return card && card.type === 'BANG';
        });

        if (bangCard) {
          moves.push({ move: 'respondToDuel', args: [bangCard] });
        } else {
          // No BANG!, pass (take damage)
          moves.push({ move: 'respondToDuel', args: [] });
        }
        return moves;
      }

      if (playerStage === 'respondToGeneralStore') {
        // Pick first available card
        if (G.pendingAction?.revealedCards && G.pendingAction.revealedCards.length > 0) {
          moves.push({ move: 'respondToGeneralStore', args: [G.pendingAction.revealedCards[0]] });
        }
        return moves;
      }

      if (playerStage === 'discard') {
        // Discard random cards until hand size <= health
        const cardsToDiscard = player.hand.slice(0, player.hand.length - player.health);
        if (cardsToDiscard.length > 0) {
          moves.push({ move: 'discardCards', args: [cardsToDiscard] });
        }
        return moves;
      }

      // Character selection phase
      if (ctx.phase === 'characterSelection') {
        if (!player.hasSelectedCharacter && player.characterChoices && player.characterChoices.length > 0) {
          moves.push({
            move: 'selectCharacter',
            args: [player.characterChoices[0].id]
          });
        }
      }

      // Play phase (normal turn)
      if (ctx.phase === 'play' && !playerStage) {
        // Must draw cards first
        if (!player.hasDrawn) {
          moves.push({
            move: 'standardDraw',
            args: []
          });
          return moves;
        }

        // After drawing, try to play BANG! if available
        const hasUnlimitedBangs = player.weapon?.type === 'VOLCANIC' || player.character?.id === 'willy-the-kid';
        const canPlayBang = hasUnlimitedBangs || player.bangsPlayedThisTurn < 1;

        if (canPlayBang) {
          const bangCard = player.hand.find(cardId => {
            const card = G.cardMap[cardId];
            return card && card.type === 'BANG';
          });

          if (bangCard) {
            const alivePlayers = Object.keys(G.players).filter(id =>
              id !== playerId && !G.players[id].isDead
            );

            if (alivePlayers.length > 0) {
              moves.push({
                move: 'playBang',
                args: [bangCard, alivePlayers[0]]
              });
              return moves;
            }
          }
        }

        // If can't play BANG!, pass turn
        moves.push({
          move: 'passTurn',
          args: []
        });
      }

      return moves;
    }
  }
};
