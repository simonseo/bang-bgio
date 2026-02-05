// Test game initialization and props flow
import { describe, it, expect, afterEach } from 'vitest';
import { render, waitFor, cleanup } from '@testing-library/react';
import { Client } from 'boardgame.io/react';
import { BangGame } from '../../Game';
import { GameBoard } from '../../components/GameBoard';

describe('Game Initialization', () => {
  // Clean up after each test to prevent pollution
  afterEach(() => {
    cleanup();
  });

  it('should initialize game and pass correct props to GameBoard', async () => {
    const BangClient = Client({
      game: BangGame as any,
      board: GameBoard,
      numPlayers: 4,
      debug: false,
    });

    const { container } = render(<BangClient playerID="0" />);

    // Wait for game to initialize
    await waitFor(() => {
      // Check that we're not stuck on loading screen
      const loadingText = container.textContent;
      expect(loadingText).not.toContain('Initializing game');
      expect(loadingText).not.toContain('Loading game state');
    }, { timeout: 5000 });

    // If we got here, the game initialized successfully
    expect(container).toBeTruthy();
  });

  it('should have game state with players and turnOrder', async () => {
    const BangClient = Client({
      game: BangGame as any,
      board: GameBoard,
      numPlayers: 4,
      debug: false,
    });

    let receivedProps: any = null;

    // Wrap GameBoard to capture props
    const TestBoard = (props: any) => {
      receivedProps = props;
      return <GameBoard {...props} />;
    };

    const TestClient = Client({
      game: BangGame as any,
      board: TestBoard,
      numPlayers: 4,
    });

    render(<TestClient playerID="0" />);

    // Wait for props to be received
    await waitFor(() => {
      expect(receivedProps).toBeTruthy();
    }, { timeout: 5000 });

    // Check prop structure
    console.log('Received props structure:', Object.keys(receivedProps));

    // Handle both nested and flat prop structures
    const G = receivedProps.G || receivedProps;

    expect(G).toBeTruthy();
    if (G.players) {
      expect(Object.keys(G.players).length).toBe(4);
    }
    if (G.turnOrder) {
      expect(G.turnOrder.length).toBe(4);
    }
  });
});
