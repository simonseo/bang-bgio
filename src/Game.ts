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
};
