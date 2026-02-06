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
        // For now, just allow passing turn (can enhance with card plays later)
        moves.push({
          move: 'passTurn',
          args: []
        });
      }

      return moves;
    }
  }
};
