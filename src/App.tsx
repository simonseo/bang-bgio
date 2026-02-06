// Main App component with multiplayer support

import { useState, useEffect } from 'react';
import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';
import { Local } from 'boardgame.io/multiplayer';
import { MCTSBot } from 'boardgame.io/ai';
import { BangGame } from './Game';
import { GameBoard } from './components/GameBoard';
import { ModeSelection } from './components/ModeSelection';
import { NetworkLobby } from './components/NetworkLobby';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SpectatorBoard } from './components/SpectatorBoard';

type GameMode = 'select' | 'local' | 'network-host' | 'network-join' | 'spectator' | 'playing';

function App() {
  const [mode, setMode] = useState<GameMode>('select');
  const [numPlayers, setNumPlayers] = useState(4);
  const [playerID, setPlayerID] = useState('0');
  const [BangClient, setBangClient] = useState<any>(null);

  // Network game state
  const [matchID, setMatchID] = useState('');
  const [credentials, setCredentials] = useState('');

  const handleModeSelect = (selectedMode: 'local' | 'network-host' | 'network-join' | 'spectator') => {
    setMode(selectedMode);
  };

  const handleNetworkGameStart = (gameID: string, playerIDStr: string, creds: string) => {
    setMatchID(gameID);
    setPlayerID(playerIDStr);
    setCredentials(creds);
    setMode('playing');
  };

  const handleBack = () => {
    setMode('select');
    setBangClient(null);
  };

  useEffect(() => {
    if (mode === 'playing' && !BangClient) {
      let client;

      if (matchID && credentials) {
        // Network multiplayer
        client = Client({
          game: BangGame as any,
          board: GameBoard,
          multiplayer: SocketIO({ server: 'http://localhost:8000' }),
          debug: false,
        });
      } else if (matchID && playerID === '') {
        // Spectator mode
        client = Client({
          game: BangGame as any,
          board: SpectatorBoard,
          multiplayer: SocketIO({ server: 'http://localhost:8000' }),
          debug: false,
        });
      } else {
        // Local single player with AI bots
        const bots: any = {};
        for (let i = 1; i < numPlayers; i++) {
          bots[String(i)] = MCTSBot; // Use MCTS bot (calls game.ai.enumerate)
        }

        client = Client({
          game: BangGame as any,
          board: GameBoard,
          numPlayers: numPlayers,
          multiplayer: Local({
            bots: bots,
          }),
          debug: false,
        });
      }

      setBangClient(() => client);
    }
  }, [mode, matchID, credentials, numPlayers, playerID, BangClient]);

  // Mode selection screen
  if (mode === 'select') {
    return <ModeSelection onSelectMode={handleModeSelect} />;
  }

  // Local mode setup
  if (mode === 'local') {
    return (
      <div className="w-full h-screen bg-gradient-to-b from-amber-900 to-amber-950 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl max-w-md w-full">
          <button
            onClick={handleBack}
            className="text-white mb-4 hover:underline"
          >
            ← Back
          </button>

          <h1 className="text-3xl font-bold text-white mb-8 text-center">
            Local Play Setup
          </h1>

          <div className="mb-6">
            <label className="block text-white text-sm font-bold mb-2">
              Number of Players (4-7):
            </label>
            <select
              value={numPlayers}
              onChange={e => setNumPlayers(parseInt(e.target.value))}
              className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border-2 border-white/30"
            >
              <option value={4}>4 Players</option>
              <option value={5}>5 Players</option>
              <option value={6}>6 Players</option>
              <option value={7}>7 Players</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-white text-sm font-bold mb-2">
              Play as Player:
            </label>
            <select
              value={playerID}
              onChange={e => setPlayerID(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border-2 border-white/30"
            >
              {Array.from({ length: numPlayers }, (_, i) => (
                <option key={i} value={String(i)}>
                  Player {i}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
            <p className="text-white text-sm">
              <strong>🤖 AI Opponents:</strong> Other players are AI-controlled.
              They'll play automatically with strategic decision-making!
            </p>
          </div>

          <button
            onClick={() => setMode('playing')}
            className="w-full px-6 py-3 bg-red-600 text-white rounded-lg font-bold text-lg hover:bg-red-700 transition-colors"
          >
            Start Game
          </button>
        </div>
      </div>
    );
  }

  // Network lobby screens
  if (mode === 'network-host') {
    return (
      <NetworkLobby
        mode="host"
        onStartGame={handleNetworkGameStart}
        onBack={handleBack}
      />
    );
  }

  if (mode === 'network-join') {
    return (
      <NetworkLobby
        mode="join"
        onStartGame={handleNetworkGameStart}
        onBack={handleBack}
      />
    );
  }

  // Spectator mode
  if (mode === 'spectator') {
    return (
      <div className="w-full h-screen bg-gradient-to-b from-amber-900 to-amber-950 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl max-w-md w-full">
          <button
            onClick={handleBack}
            className="text-white mb-4 hover:underline"
          >
            ← Back
          </button>

          <h1 className="text-3xl font-bold text-white mb-8 text-center">
            Watch Game
          </h1>

          <div className="mb-6">
            <label className="block text-white text-sm font-bold mb-2">
              Game Code:
            </label>
            <input
              type="text"
              value={matchID}
              onChange={e => setMatchID(e.target.value.toUpperCase())}
              placeholder="Enter game code"
              className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border-2 border-white/30 placeholder-white/50"
              maxLength={6}
            />
          </div>

          <div className="mb-6 p-4 bg-purple-500/20 border border-purple-500/50 rounded-lg">
            <p className="text-white text-sm">
              <strong>👁️ Spectator Mode:</strong> You'll watch the game without playing.
              Hands and hidden roles will be concealed.
            </p>
          </div>

          <button
            onClick={() => {
              if (matchID) {
                setPlayerID(''); // Empty playerID for spectator
                setMode('playing');
              }
            }}
            disabled={!matchID}
            className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-bold text-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Watch Game
          </button>
        </div>
      </div>
    );
  }

  // Game playing
  if (mode === 'playing') {
    if (!BangClient) {
      return (
        <div className="w-full h-screen bg-gradient-to-b from-amber-900 to-amber-950 flex items-center justify-center">
          <div className="text-white text-xl">Loading game...</div>
        </div>
      );
    }

    if (matchID && credentials) {
      // Network game with credentials
      return (
        <ErrorBoundary onReset={handleBack}>
          <div className="w-full h-screen">
            <BangClient matchID={matchID} playerID={playerID} credentials={credentials} />
          </div>
        </ErrorBoundary>
      );
    } else if (matchID && playerID === '') {
      // Spectator mode
      return (
        <ErrorBoundary onReset={handleBack}>
          <div className="w-full h-screen">
            <BangClient matchID={matchID} />
          </div>
        </ErrorBoundary>
      );
    } else {
      // Local game
      return (
        <ErrorBoundary onReset={handleBack}>
          <div className="w-full h-screen">
            <BangClient playerID={playerID} />
          </div>
        </ErrorBoundary>
      );
    }
  }

  return null;
}

export default App;
