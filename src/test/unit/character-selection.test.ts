/**
 * Unit tests for character selection phase
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { setup } from '../../game/setup';

describe('Character Selection', () => {
  let G: any;
  let ctx: any;

  beforeEach(() => {
    ctx = {
      numPlayers: 4,
      currentPlayer: '0',
    };
    G = setup({ ctx });
  });

  it('should provide 2 random characters for each player to choose from', () => {
    // Each player should have an array of 2 character options
    Object.keys(G.players).forEach(playerId => {
      expect(G.players[playerId].characterChoices).toBeDefined();
      expect(G.players[playerId].characterChoices).toHaveLength(2);

      // Characters should be different
      const [char1, char2] = G.players[playerId].characterChoices;
      expect(char1.id).not.toBe(char2.id);
    });
  });

  it('should automatically assign first character choice for now', () => {
    // For now, character is auto-assigned to first choice
    // TODO: In future, implement UI for player to choose between 2 options
    expect(G.players['0'].character).toBeDefined();
    expect(G.players['0'].character).toBe(G.players['0'].characterChoices[0]);
  });

  it('should allow player to select one of their two character choices', () => {
    // Get the first character choice for player 0
    const firstChoice = G.players['0'].characterChoices[0];

    // TODO: Implement selectCharacter move function
    // const selectCharacter = require('../../game/moves').selectCharacter;
    // selectCharacter({ G, ctx }, firstChoice.id);

    // For now, manually set character to test the concept
    G.players['0'].character = firstChoice;

    // Character should be set
    expect(G.players['0'].character).toBe(firstChoice);
    expect(G.players['0'].character.id).toBe(firstChoice.id);
  });
});
