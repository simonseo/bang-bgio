// Test: AI players automatically select characters in characterSelection phase

import { playAITurn } from '../../ai/AIPlayer';
import { BangGameState } from '../../game/setup';

describe('AI Character Selection', () => {
  it('should select first character choice during characterSelection phase', () => {
    // Setup: Create a minimal game state in characterSelection phase
    const mockG: Partial<BangGameState> = {
      players: {
        '1': {
          id: '1',
          health: 4,
          maxHealth: 4,
          hand: [],
          inPlay: [],
          isDead: false,
          role: 'outlaw',
          character: null as any,
          hasSelectedCharacter: false,
          characterChoices: [
            { id: 'bart-cassidy', name: 'Bart Cassidy', health: 4, description: 'Test' },
            { id: 'willy-the-kid', name: 'Willy the Kid', health: 4, description: 'Test' },
          ],
          weapon: null,
          barrel: false,
          mustang: false,
          scope: false,
          inJail: false,
          dynamite: false,
          bangsPlayedThisTurn: 0,
          hasDrawn: false,
        },
      },
      cardMap: {},
    } as any;

    const mockCtx = {
      currentPlayer: '1',
      phase: 'characterSelection',
      turn: 1,
    };

    let selectedCharacterId: string | null = null;

    const mockMoves = {
      selectCharacter: (characterId: string) => {
        selectedCharacterId = characterId;
      },
      standardDraw: () => {}, // Mock this to avoid errors in current code
      passTurn: () => {},
    };

    // Execute: AI turn during character selection
    playAITurn(mockG as BangGameState, mockCtx, mockMoves, '1');

    // Assert: AI should have selected the first character
    expect(selectedCharacterId).toBe('bart-cassidy');
  });

  it('should do nothing if character already selected', () => {
    const mockG: Partial<BangGameState> = {
      players: {
        '1': {
          id: '1',
          health: 4,
          maxHealth: 4,
          hand: [],
          inPlay: [],
          isDead: false,
          role: 'outlaw',
          character: { id: 'bart-cassidy', name: 'Bart Cassidy', health: 4, description: 'Test' },
          hasSelectedCharacter: true,
          characterChoices: [
            { id: 'bart-cassidy', name: 'Bart Cassidy', health: 4, description: 'Test' },
            { id: 'willy-the-kid', name: 'Willy the Kid', health: 4, description: 'Test' },
          ],
          weapon: null,
          barrel: false,
          mustang: false,
          scope: false,
          inJail: false,
          dynamite: false,
          bangsPlayedThisTurn: 0,
          hasDrawn: false,
        },
      },
      cardMap: {},
    } as any;

    const mockCtx = {
      currentPlayer: '1',
      phase: 'characterSelection',
      turn: 1,
    };

    let callCount = 0;

    const mockMoves = {
      selectCharacter: () => {
        callCount++;
      },
      standardDraw: () => {},
      passTurn: () => {},
    };

    playAITurn(mockG as BangGameState, mockCtx, mockMoves, '1');

    // Should not call selectCharacter if already selected
    expect(callCount).toBe(0);
  });
});
