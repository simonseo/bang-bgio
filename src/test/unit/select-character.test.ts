/**
 * Unit tests for selectCharacter move
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { setup } from '../../game/setup';
import { selectCharacter } from '../../game/moves';

describe('Select Character Move', () => {
  let G: any;
  let ctx: any;

  beforeEach(() => {
    ctx = {
      numPlayers: 4,
      currentPlayer: '0',
    };
    G = setup({ ctx });
  });

  it('should allow player to select one of their character choices', () => {
    const firstChoice = G.players['0'].characterChoices[0];
    const secondChoice = G.players['0'].characterChoices[1];

    // Select the second choice
    const result = selectCharacter({ G, ctx }, secondChoice.id);

    // Should not return INVALID_MOVE
    expect(result).not.toBe('INVALID_MOVE');

    // Character should be set to second choice
    expect(G.players['0'].character).toBe(secondChoice);
    expect(G.players['0'].character.id).toBe(secondChoice.id);
  });

  it('should reject selection of character not in choices', () => {
    // Try to select a character that's not in the player's choices
    const invalidCharacterId = 'bart-cassidy';

    // Make sure it's not one of their choices
    const isInChoices = G.players['0'].characterChoices.some((c: any) => c.id === invalidCharacterId);
    if (isInChoices) {
      // Skip this test if by chance it IS in their choices
      return;
    }

    const result = selectCharacter({ G, ctx }, invalidCharacterId);

    // Should return INVALID_MOVE
    expect(result).toBe('INVALID_MOVE');
  });

  it('should update health based on selected character', () => {
    const secondChoice = G.players['0'].characterChoices[1];
    const isSheriff = G.players['0'].role === 'sheriff';
    const expectedHealth = secondChoice.health + (isSheriff ? 1 : 0);

    selectCharacter({ G, ctx }, secondChoice.id);

    // Health should match character health (+ 1 for sheriff)
    expect(G.players['0'].maxHealth).toBe(expectedHealth);
    expect(G.players['0'].health).toBe(expectedHealth);
  });

  it('should adjust hand size to match new health', () => {
    const secondChoice = G.players['0'].characterChoices[1];
    const isSheriff = G.players['0'].role === 'sheriff';
    const expectedHealth = secondChoice.health + (isSheriff ? 1 : 0);

    selectCharacter({ G, ctx }, secondChoice.id);

    // Hand size should equal health
    expect(G.players['0'].hand.length).toBe(expectedHealth);
  });
});
