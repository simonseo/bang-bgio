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

      // Character selection phase
      if (ctx.phase === 'characterSelection') {
        const player = G.players[ctx.currentPlayer];
        if (!player.hasSelectedCharacter && player.characterChoices && player.characterChoices.length > 0) {
          // AI selects first character
          moves.push({
            move: 'selectCharacter',
            args: [player.characterChoices[0].id]
          });
        }
      }

      // Play phase
      if (ctx.phase === 'play') {
        const player = G.players[ctx.currentPlayer];

        // Must draw cards first
        if (!player.hasDrawn) {
          moves.push({
            move: 'standardDraw',
            args: []
          });
          return moves; // Only return draw move if not drawn yet
        }

        // After drawing, enumerate playable cards
        // Simple bot logic: Try to play BANG! if available and not at limit
        const hasUnlimitedBangs = player.weapon?.type === 'VOLCANIC' || player.character?.id === 'willy-the-kid';
        const canPlayBang = hasUnlimitedBangs || player.bangsPlayedThisTurn < 1;

        if (canPlayBang) {
          // Find BANG! cards in hand
          const bangCard = player.hand.find(cardId => {
            const card = G.cardMap[cardId];
            return card && card.type === 'BANG';
          });

          if (bangCard) {
            // Find valid targets (alive players within range)
            const alivePlayers = Object.keys(G.players).filter(id =>
              id !== ctx.currentPlayer && !G.players[id].isDead
            );

            if (alivePlayers.length > 0) {
              // Simple strategy: target first alive player
              const target = alivePlayers[0];
              moves.push({
                move: 'playBang',
                args: [bangCard, target]
              });
              return moves;
            }
          }
        }

        // If can't play BANG!, just pass turn
        moves.push({
          move: 'passTurn',
          args: []
        });
      }

      return moves;
    }
  }
};
