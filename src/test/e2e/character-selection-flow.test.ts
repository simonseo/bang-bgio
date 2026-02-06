// E2E Test: Complete Character Selection Flow
// Tests that all players (human + AI) can select characters and transition to play phase

import { Client } from 'boardgame.io/client';
import { BangGame } from '../../Game';
import { BangGameState } from '../../game/setup';

describe('Character Selection Flow E2E', () => {
  it('should allow all 4 players to select characters and transition to play phase', () => {
    const client = Client({ game: BangGame, numPlayers: 4 });

    // Initial state: should be in characterSelection phase
    let state = client.getState();
    expect(state.ctx.phase).toBe('characterSelection');
    expect(state.ctx.currentPlayer).toBe('0');

    // Player 0 (human) selects character
    const player0Choices = state.G.players['0'].characterChoices;
    expect(player0Choices).toHaveLength(2);

    client.moves.selectCharacter(player0Choices[0].id);

    state = client.getState();

    // After player 0 selects:
    // 1. Player 0 should have selected flag set
    expect(state.G.players['0'].hasSelectedCharacter).toBe(true);
    expect(state.G.players['0'].character.id).toBe(player0Choices[0].id);

    // 2. Turn should advance to player 1
    expect(state.ctx.currentPlayer).toBe('1');

    // 3. Still in characterSelection phase (not all selected yet)
    expect(state.ctx.phase).toBe('characterSelection');

    // Player 1 (AI) selects character
    const player1Choices = state.G.players['1'].characterChoices;
    client.moves.selectCharacter(player1Choices[0].id);

    state = client.getState();
    expect(state.G.players['1'].hasSelectedCharacter).toBe(true);
    expect(state.ctx.currentPlayer).toBe('2');
    expect(state.ctx.phase).toBe('characterSelection');

    // Player 2 (AI) selects character
    const player2Choices = state.G.players['2'].characterChoices;
    client.moves.selectCharacter(player2Choices[0].id);

    state = client.getState();
    expect(state.G.players['2'].hasSelectedCharacter).toBe(true);
    expect(state.ctx.currentPlayer).toBe('3');
    expect(state.ctx.phase).toBe('characterSelection');

    // Player 3 (AI) selects character (last player)
    const player3Choices = state.G.players['3'].characterChoices;
    client.moves.selectCharacter(player3Choices[0].id);

    state = client.getState();

    // After all players select:
    // 1. All players should have hasSelectedCharacter = true
    expect(state.G.players['0'].hasSelectedCharacter).toBe(true);
    expect(state.G.players['1'].hasSelectedCharacter).toBe(true);
    expect(state.G.players['2'].hasSelectedCharacter).toBe(true);
    expect(state.G.players['3'].hasSelectedCharacter).toBe(true);

    // 2. All players should have characters assigned
    expect(state.G.players['0'].character).toBeTruthy();
    expect(state.G.players['1'].character).toBeTruthy();
    expect(state.G.players['2'].character).toBeTruthy();
    expect(state.G.players['3'].character).toBeTruthy();

    // 3. Phase should transition to 'play'
    expect(state.ctx.phase).toBe('play');

    // 4. Current player should be sheriff (play phase starts with sheriff)
    const sheriffId = state.G.sheriffId;
    expect(state.ctx.currentPlayer).toBe(sheriffId);
  });

  it('should handle 5 players selecting characters', () => {
    const client = Client({ game: BangGame, numPlayers: 5 });

    let state = client.getState();
    expect(state.ctx.phase).toBe('characterSelection');

    // All 5 players select
    for (let i = 0; i < 5; i++) {
      state = client.getState();
      const choices = state.G.players[String(i)].characterChoices;
      client.moves.selectCharacter(choices[0].id);
    }

    state = client.getState();

    // Should transition to play phase
    expect(state.ctx.phase).toBe('play');

    // All 5 should have characters
    for (let i = 0; i < 5; i++) {
      expect(state.G.players[String(i)].hasSelectedCharacter).toBe(true);
      expect(state.G.players[String(i)].character).toBeTruthy();
    }
  });

  it('should not transition to play phase until all players select', () => {
    const client = Client({ game: BangGame, numPlayers: 4 });

    let state = client.getState();

    // Only 3 out of 4 players select
    for (let i = 0; i < 3; i++) {
      state = client.getState();
      const choices = state.G.players[String(i)].characterChoices;
      client.moves.selectCharacter(choices[0].id);
    }

    state = client.getState();

    // Should still be in characterSelection phase
    expect(state.ctx.phase).toBe('characterSelection');

    // Player 3 hasn't selected yet
    expect(state.G.players['3'].hasSelectedCharacter).toBe(false);

    // Turn should be on player 3
    expect(state.ctx.currentPlayer).toBe('3');
  });

  it('should update player health based on character and role', () => {
    const client = Client({ game: BangGame, numPlayers: 4 });

    let state = client.getState();
    const sheriffId = state.G.sheriffId;

    // Select characters for all players
    for (let i = 0; i < 4; i++) {
      state = client.getState();
      const playerId = String(i);
      const choices = state.G.players[playerId].characterChoices;
      const selectedChar = choices[0];

      client.moves.selectCharacter(selectedChar.id);

      state = client.getState();
      const player = state.G.players[playerId];

      // Sheriff gets +1 health
      if (playerId === sheriffId) {
        expect(player.maxHealth).toBe(selectedChar.health + 1);
        expect(player.health).toBe(selectedChar.health + 1);
      } else {
        expect(player.maxHealth).toBe(selectedChar.health);
        expect(player.health).toBe(selectedChar.health);
      }
    }
  });

  it('should reject invalid character selection', () => {
    const client = Client({ game: BangGame, numPlayers: 4 });

    let state = client.getState();

    // Try to select a character not in choices
    const invalidCharacterId = 'non-existent-character';
    client.moves.selectCharacter(invalidCharacterId);

    state = client.getState();

    // Selection should be rejected
    expect(state.G.players['0'].hasSelectedCharacter).toBe(false);
    expect(state.ctx.currentPlayer).toBe('0'); // Turn should not advance
  });
});
