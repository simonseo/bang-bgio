// Spectator view of the game - read-only observer mode

import React from 'react';
import type { BangGameState } from '../game/setup';
import { HealthDisplay } from './HealthDisplay';
import { RoleBadge } from './RoleBadge';

interface SpectatorBoardProps {
  G: BangGameState;
  ctx: any;
}

export const SpectatorBoard: React.FC<SpectatorBoardProps> = ({ G, ctx }) => {
  // Safety check
  if (!G || !G.players || !G.turnOrder) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-amber-900 to-red-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading game...</div>
      </div>
    );
  }

  const currentPlayer = ctx.currentPlayer;

  return (
    <div className="w-full h-screen bg-gradient-to-br from-amber-900 to-red-900 overflow-hidden relative">
      {/* Spectator Badge */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-purple-600 text-white px-6 py-3 rounded-full shadow-2xl border-4 border-purple-400">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👁️</span>
            <span className="font-bold text-lg">SPECTATOR MODE</span>
          </div>
        </div>
      </div>

      {/* Game Info Panel */}
      <div className="absolute top-20 left-4 bg-black/50 backdrop-blur-lg p-4 rounded-lg text-white">
        <h3 className="font-bold mb-2">Game Info</h3>
        <div className="text-sm space-y-1">
          <div>Players: {G.turnOrder.length}</div>
          <div>Deck: {G.deck.length} cards</div>
          <div>Discard: {G.discardPile.length} cards</div>
          {ctx.phase && <div>Phase: {ctx.phase}</div>}
        </div>
      </div>

      {/* Center Table - Deck and Discard */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="flex gap-8 items-center">
          {/* Deck */}
          <div className="text-center">
            <div className="w-24 h-36 bg-red-800 border-4 border-red-600 rounded-lg flex items-center justify-center shadow-xl">
              <div className="text-white font-bold">
                <div className="text-3xl">🎴</div>
                <div className="text-sm mt-1">{G.deck.length}</div>
              </div>
            </div>
            <div className="text-white text-sm mt-2">Deck</div>
          </div>

          {/* Discard Pile */}
          <div className="text-center">
            {G.discardPile.length > 0 ? (
              <div className="w-24 h-36 bg-gray-800 border-4 border-gray-600 rounded-lg flex items-center justify-center shadow-xl">
                <div className="text-white text-xs">
                  Top: {(G.cardMap as any)[String(G.discardPile[G.discardPile.length - 1])]?.name || 'Card'}
                </div>
              </div>
            ) : (
              <div className="w-24 h-36 bg-gray-900 border-4 border-gray-700 rounded-lg border-dashed opacity-50" />
            )}
            <div className="text-white text-sm mt-2">Discard</div>
          </div>
        </div>
      </div>

      {/* Players in Circle */}
      <div className="absolute inset-0">
        {G.turnOrder.map((playerId, index) => {
          const player = G.players[playerId];
          const angle = (360 / G.turnOrder.length) * index;
          const radius = 35; // percentage
          const x = 50 + radius * Math.cos((angle - 90) * Math.PI / 180);
          const y = 50 + radius * Math.sin((angle - 90) * Math.PI / 180);

          const isCurrentPlayer = playerId === currentPlayer;

          return (
            <div
              key={playerId}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <div
                className={`
                  bg-black/60 backdrop-blur-lg p-4 rounded-xl shadow-2xl
                  border-4 transition-all
                  ${isCurrentPlayer ? 'border-yellow-400 scale-110' : 'border-gray-600'}
                  ${player.isDead ? 'opacity-50 grayscale' : ''}
                `}
              >
                {/* Player Name and Role */}
                <div className="text-center mb-2">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="text-white font-bold">Player {playerId}</span>
                    {isCurrentPlayer && (
                      <span className="text-yellow-400 text-xl">⭐</span>
                    )}
                  </div>
                  <RoleBadge role={player.role} />
                </div>

                {/* Character */}
                <div className="text-white text-sm text-center mb-2">
                  {player.character?.name || String(player.character)}
                </div>

                {/* Health */}
                <div className="mb-2">
                  <HealthDisplay
                    current={player.health}
                    max={player.maxHealth}
                  />
                </div>

                {/* Hand Count (cards hidden) */}
                <div className="flex items-center justify-center gap-1 mb-2">
                  <span className="text-white text-sm">Hand:</span>
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(player.hand.length, 10) }).map((_, i) => (
                      <div
                        key={i}
                        className="w-4 h-6 bg-red-800 border border-red-600 rounded-sm"
                      />
                    ))}
                    {player.hand.length > 10 && (
                      <span className="text-white text-xs">+{player.hand.length - 10}</span>
                    )}
                  </div>
                </div>

                {/* Equipment */}
                {player.inPlay.length > 0 && (
                  <div className="text-white text-xs text-center">
                    <div className="opacity-70">Equipment:</div>
                    <div className="flex gap-1 justify-center flex-wrap mt-1">
                      {player.inPlay.map((cardId) => {
                        const card = (G.cardMap as any)[cardId];
                        return (
                          <div
                            key={cardId}
                            className="bg-blue-600 px-2 py-1 rounded text-xs"
                            title={card?.description}
                          >
                            {card?.name || 'Card'}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Status Effects */}
                <div className="flex gap-1 justify-center mt-2">
                  {player.barrel && (
                    <span title="Has Barrel">🛢️</span>
                  )}
                  {player.mustang && (
                    <span title="Has Mustang">🐴</span>
                  )}
                  {player.scope && (
                    <span title="Has Scope">🔭</span>
                  )}
                  {player.inJail && (
                    <span title="In Jail">⛓️</span>
                  )}
                  {player.dynamite && (
                    <span title="Has Dynamite">🧨</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Help Text */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center text-sm opacity-75">
        <div>You are watching this game as a spectator.</div>
        <div>Player hands and hidden roles are concealed.</div>
      </div>
    </div>
  );
};
