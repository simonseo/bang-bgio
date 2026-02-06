// Test that standardDraw sets hasDrawn flag even for characters with special draw abilities

import { Client } from 'boardgame.io/client';
import { BangGame } from '../../../Game';
import { BangGameState } from '../../../game/setup';

describe('standardDraw with special draw abilities', () => {
  it('should set hasDrawn=true for Black Jack after drawing', () => {
    const client = Client({ game: BangGame, numPlayers: 4 });

    let state = client.getState();

    // Find Black Jack in the choices and select him
    let blackJackId: string | null = null;
    for (let i = 0; i < 4; i++) {
      state = client.getState();
      const playerId = String(i);
      const choices = state.G.players[playerId].characterChoices;

      // Check if Black Jack is in choices
      const blackJackChoice = choices.find((c: any) => c.id === 'black-jack');
      if (blackJackChoice) {
        blackJackId = playerId;
        client.moves.selectCharacter(blackJackChoice.id);
      } else {
        // Select first character
        client.moves.selectCharacter(choices[0].id);
      }
    }

    state = client.getState();

    // Should be in play phase now
    expect(state.ctx.phase).toBe('play');

    // If no one got Black Jack, skip test
    if (!blackJackId) {
      console.log('Black Jack not in any player choices, skipping test');
      return;
    }

    // Get the player who has Black Jack
    const blackJackPlayer = state.G.players[blackJackId];
    expect(blackJackPlayer.character.id).toBe('black-jack');
    expect(blackJackPlayer.hasDrawn).toBe(false);

    // Have Black Jack draw
    if (state.ctx.currentPlayer === blackJackId) {
      client.moves.standardDraw();
    } else {
      // Fast forward to Black Jack's turn
      while (state.ctx.currentPlayer !== blackJackId && state.ctx.turn < 10) {
        state = client.getState();
        if (!state.G.players[state.ctx.currentPlayer].hasDrawn) {
          client.moves.standardDraw();
        }
        client.moves.passTurn();
        state = client.getState();
      }

      state = client.getState();
      if (state.ctx.currentPlayer === blackJackId) {
        client.moves.standardDraw();
      }
    }

    state = client.getState();
    const finalPlayer = state.G.players[blackJackId];

    // CRITICAL: hasDrawn MUST be true after drawing, even with special ability
    expect(finalPlayer.hasDrawn).toBe(true);
  });

  it('should set hasDrawn=true for Kit Carlson after drawing', () => {
    const client = Client({ game: BangGame, numPlayers: 4 });

    let state = client.getState();

    // Find Kit Carlson in the choices and select him
    let kitCarlsonId: string | null = null;
    for (let i = 0; i < 4; i++) {
      state = client.getState();
      const playerId = String(i);
      const choices = state.G.players[playerId].characterChoices;

      // Check if Kit Carlson is in choices
      const kitCarlsonChoice = choices.find((c: any) => c.id === 'kit-carlson');
      if (kitCarlsonChoice) {
        kitCarlsonId = playerId;
        client.moves.selectCharacter(kitCarlsonChoice.id);
      } else {
        // Select first character
        client.moves.selectCharacter(choices[0].id);
      }
    }

    state = client.getState();

    // Should be in play phase now
    expect(state.ctx.phase).toBe('play');

    // If no one got Kit Carlson, skip test
    if (!kitCarlsonId) {
      console.log('Kit Carlson not in any player choices, skipping test');
      return;
    }

    // Get the player who has Kit Carlson
    const kitCarlsonPlayer = state.G.players[kitCarlsonId];
    expect(kitCarlsonPlayer.character.id).toBe('kit-carlson');
    expect(kitCarlsonPlayer.hasDrawn).toBe(false);

    // Have Kit Carlson draw
    if (state.ctx.currentPlayer === kitCarlsonId) {
      client.moves.standardDraw();
    } else {
      // Fast forward to Kit Carlson's turn
      while (state.ctx.currentPlayer !== kitCarlsonId && state.ctx.turn < 10) {
        state = client.getState();
        if (!state.G.players[state.ctx.currentPlayer].hasDrawn) {
          client.moves.standardDraw();
        }
        client.moves.passTurn();
        state = client.getState();
      }

      state = client.getState();
      if (state.ctx.currentPlayer === kitCarlsonId) {
        client.moves.standardDraw();
      }
    }

    state = client.getState();
    const finalPlayer = state.G.players[kitCarlsonId];

    // CRITICAL: hasDrawn MUST be true after drawing, even with special ability
    expect(finalPlayer.hasDrawn).toBe(true);
  });
});
