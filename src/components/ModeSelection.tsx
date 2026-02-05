// Game mode selection screen

import React from 'react';

interface ModeSelectionProps {
  onSelectMode: (mode: 'local' | 'network-host' | 'network-join' | 'spectator') => void;
}

export const ModeSelection: React.FC<ModeSelectionProps> = ({ onSelectMode }) => {
  return (
    <div className="w-full h-screen bg-gradient-to-b from-amber-900 to-amber-950 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          Bang! Card Game
        </h1>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Local Mode */}
          <button
            onClick={() => onSelectMode('local')}
            className="bg-gradient-to-br from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 p-6 rounded-xl text-white transition-all transform hover:scale-105 shadow-lg"
          >
            <div className="text-5xl mb-3">🤖</div>
            <h2 className="text-2xl font-bold mb-2">Local Play</h2>
            <p className="text-sm opacity-90">
              Single player vs AI opponents on this device
            </p>
            <div className="mt-4 text-xs opacity-75">
              Perfect for: Solo practice, learning the game
            </div>
          </button>

          {/* Network Host */}
          <button
            onClick={() => onSelectMode('network-host')}
            className="bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 p-6 rounded-xl text-white transition-all transform hover:scale-105 shadow-lg"
          >
            <div className="text-5xl mb-3">🖥️</div>
            <h2 className="text-2xl font-bold mb-2">Host Game</h2>
            <p className="text-sm opacity-90">
              Host on this computer, players join from phones/tablets
            </p>
            <div className="mt-4 text-xs opacity-75">
              Perfect for: Party games, family gatherings
            </div>
          </button>

          {/* Network Join */}
          <button
            onClick={() => onSelectMode('network-join')}
            className="bg-gradient-to-br from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 p-6 rounded-xl text-white transition-all transform hover:scale-105 shadow-lg"
          >
            <div className="text-5xl mb-3">📱</div>
            <h2 className="text-2xl font-bold mb-2">Join Game</h2>
            <p className="text-sm opacity-90">
              Join a game hosted by someone else (mobile-friendly)
            </p>
            <div className="mt-4 text-xs opacity-75">
              Perfect for: Joining from phone/tablet
            </div>
          </button>

          {/* Spectator Mode */}
          <button
            onClick={() => onSelectMode('spectator')}
            className="bg-gradient-to-br from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 p-6 rounded-xl text-white transition-all transform hover:scale-105 shadow-lg"
          >
            <div className="text-5xl mb-3">👁️</div>
            <h2 className="text-2xl font-bold mb-2">Watch Game</h2>
            <p className="text-sm opacity-90">
              Spectate an ongoing game without playing
            </p>
            <div className="mt-4 text-xs opacity-75">
              Perfect for: Learning, watching friends, streaming
            </div>
          </button>
        </div>

        <div className="mt-8 text-white text-sm text-center">
          <p className="mb-2">Welcome to Bang!</p>
          <p className="text-xs opacity-75">
            A social deduction card game where the Sheriff and Deputies fight against Outlaws and a Renegade
          </p>
        </div>
      </div>
    </div>
  );
};
