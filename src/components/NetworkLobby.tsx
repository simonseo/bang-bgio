// Network multiplayer lobby

import React, { useState, useEffect } from 'react';
import { LobbyClient } from 'boardgame.io/client';

interface NetworkLobbyProps {
  mode: 'host' | 'join';
  onStartGame: (gameID: string, playerID: string, credentials: string) => void;
  onBack: () => void;
}

export const NetworkLobby: React.FC<NetworkLobbyProps> = ({ mode, onStartGame, onBack }) => {
  const [serverURL, setServerURL] = useState('http://localhost:8000');
  const [numPlayers, setNumPlayers] = useState(4);
  const [numAI, setNumAI] = useState(3);
  const [playerName, setPlayerName] = useState('');
  const [gameID, setGameID] = useState('');
  const [matchID, setMatchID] = useState('');
  const [playerID, setPlayerID] = useState('');
  const [credentials, setCredentials] = useState('');
  const [lobby, setLobby] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get local IP for sharing
  const [localIP, setLocalIP] = useState('');

  useEffect(() => {
    // Try to get local IP (this is approximate)
    fetch('https://api.ipify.org?format=json')
      .then(r => r.json())
      .then(data => setLocalIP(data.ip))
      .catch(() => setLocalIP('your-ip'));
  }, []);

  const initLobby = () => {
    const lobbyClient = new LobbyClient({ server: serverURL });
    setLobby(lobbyClient);
    return lobbyClient;
  };

  const createGame = async () => {
    setLoading(true);
    setError('');

    try {
      // Check if server is reachable first
      try {
        const response = await fetch(serverURL, { method: 'HEAD' });
        if (!response.ok) throw new Error('Server not responding');
      } catch (fetchErr) {
        throw new Error('Cannot connect to server. Make sure the server is running:\n\nnpm run server\n\nOr start both server and client:\n\nnpm start');
      }

      const lobbyClient = initLobby();

      // Create a new match
      const { matchID } = await lobbyClient.createMatch('bang', {
        numPlayers,
      });

      setMatchID(matchID);
      setGameID(matchID);

      // Join as first player
      const { playerCredentials } = await lobbyClient.joinMatch('bang', matchID, {
        playerName: playerName || 'Host',
        playerID: '0',
      });

      setPlayerID('0');
      setCredentials(playerCredentials);

      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create game');
      setLoading(false);
    }
  };

  const joinGame = async () => {
    setLoading(true);
    setError('');

    try {
      const lobbyClient = initLobby();

      // Get match info
      const match = await lobbyClient.getMatch('bang', gameID);

      if (!match) {
        throw new Error('Game not found');
      }

      // Find available player slot
      const availableSlot = match.players.find((p: any) => !p.name);
      if (!availableSlot) {
        throw new Error('Game is full');
      }

      // Join match
      const { playerCredentials } = await lobbyClient.joinMatch('bang', gameID, {
        playerName: playerName || 'Player',
        playerID: String(availableSlot.id),
      });

      setPlayerID(String(availableSlot.id));
      setCredentials(playerCredentials);
      setMatchID(gameID);

      setLoading(false);
    } catch (err: any) {
      setError(`Failed to join game: ${err.message}`);
      setLoading(false);
    }
  };

  const startMatch = () => {
    if (matchID && playerID && credentials) {
      onStartGame(matchID, playerID, credentials);
    }
  };

  if (mode === 'host') {
    if (!matchID) {
      // Host setup screen
      return (
        <div className="w-full h-screen bg-gradient-to-b from-amber-900 to-amber-950 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl max-w-md w-full">
            <button
              onClick={onBack}
              className="text-white mb-4 hover:underline"
            >
              ← Back
            </button>

            <h1 className="text-3xl font-bold text-white mb-6 text-center">
              Host Game
            </h1>

            <div className="space-y-4">
              <div>
                <label className="block text-white text-sm font-bold mb-2">
                  Your Name:
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={e => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border-2 border-white/30 placeholder-white/50"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-bold mb-2">
                  Total Players (4-7):
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

              <div>
                <label className="block text-white text-sm font-bold mb-2">
                  AI Players (0-{numPlayers - 1}):
                </label>
                <input
                  type="number"
                  min="0"
                  max={numPlayers - 1}
                  value={numAI}
                  onChange={e => setNumAI(Math.min(numPlayers - 1, parseInt(e.target.value) || 0))}
                  className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border-2 border-white/30"
                />
                <p className="text-white text-xs mt-1 opacity-75">
                  {numPlayers - numAI} human player{numPlayers - numAI !== 1 ? 's' : ''} + {numAI} AI
                </p>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500 rounded p-3 text-white text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={createGame}
                disabled={loading || !playerName}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Game'}
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Waiting for players
    return (
      <div className="w-full h-screen bg-gradient-to-b from-amber-900 to-amber-950 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl max-w-md w-full">
          <h1 className="text-3xl font-bold text-white mb-6 text-center">
            Game Created!
          </h1>

          <div className="bg-green-500/20 border-2 border-green-500 rounded-lg p-4 mb-6">
            <p className="text-white font-bold text-center text-2xl mb-2">
              Game Code
            </p>
            <p className="text-white text-center text-4xl font-mono">
              {matchID}
            </p>
          </div>

          <div className="bg-white/10 rounded-lg p-4 mb-6">
            <p className="text-white text-sm mb-2">
              <strong>Share this info with players:</strong>
            </p>
            <p className="text-white text-xs font-mono break-all">
              Game Code: {matchID}
            </p>
            <p className="text-white text-xs font-mono break-all mt-1">
              Server: http://{localIP}:3000
            </p>
          </div>

          <div className="text-white text-sm mb-6">
            <p>Players: 1 / {numPlayers}</p>
            <p>AI: {numAI}</p>
            <p className="text-xs opacity-75 mt-2">
              Waiting for {numPlayers - numAI - 1} more player{numPlayers - numAI - 1 !== 1 ? 's' : ''}...
            </p>
          </div>

          <button
            onClick={startMatch}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 mb-3"
          >
            Start Game (Debug)
          </button>

          <button
            onClick={onBack}
            className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg font-bold hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Join mode
  return (
    <div className="w-full h-screen bg-gradient-to-b from-amber-900 to-amber-950 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl max-w-md w-full">
        <button
          onClick={onBack}
          className="text-white mb-4 hover:underline"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          Join Game
        </h1>

        <div className="space-y-4">
          <div>
            <label className="block text-white text-sm font-bold mb-2">
              Your Name:
            </label>
            <input
              type="text"
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border-2 border-white/30 placeholder-white/50"
            />
          </div>

          <div>
            <label className="block text-white text-sm font-bold mb-2">
              Game Code:
            </label>
            <input
              type="text"
              value={gameID}
              onChange={e => setGameID(e.target.value)}
              placeholder="Enter game code"
              className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border-2 border-white/30 placeholder-white/50 font-mono"
            />
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500 rounded p-3 text-white text-sm">
              {error}
            </div>
          )}

          {matchID && (
            <div className="bg-green-500/20 border border-green-500 rounded p-3 text-white text-sm">
              Joined successfully! Waiting for host to start...
            </div>
          )}

          <button
            onClick={matchID ? startMatch : joinGame}
            disabled={loading || !playerName || !gameID}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Joining...' : matchID ? 'Enter Game' : 'Join Game'}
          </button>
        </div>
      </div>
    </div>
  );
};
