// Turn Indicator Component - Shows whose turn it is and waiting status

import React, { useEffect, useState } from 'react';
import { BangGameState } from '../game/setup';

interface TurnIndicatorProps {
  G: BangGameState;
  ctx: any;
  playerID: string | null;
}

export const TurnIndicator: React.FC<TurnIndicatorProps> = ({ G, ctx, playerID }) => {
  const [pulseCount, setPulseCount] = useState(0);

  // Pulse animation counter for waiting indicator
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseCount(prev => (prev + 1) % 3);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  if (!playerID || !G || !G.players || !ctx) {
    return null;
  }

  const currentPlayer = G.players[ctx.currentPlayer];
  const isMyTurn = ctx.currentPlayer === playerID;
  const currentPlayerName = currentPlayer?.character?.name || `Player ${ctx.currentPlayer}`;

  // Check if waiting for a response
  const pendingAction = G.pendingAction;
  const waitingForResponse = pendingAction && pendingAction.targetPlayerId;
  const isWaitingForMe = waitingForResponse && pendingAction.targetPlayerId === playerID;
  const waitingForPlayer = waitingForResponse ? G.players[pendingAction.targetPlayerId] : null;

  // Check active players (stages)
  const activePlayers = ctx.activePlayers;
  const someoneInStage = activePlayers && Object.keys(activePlayers).length > 0;

  // Build waiting message
  let waitingMessage = '';
  if (waitingForResponse && waitingForPlayer) {
    const actionType = pendingAction.type === 'BANG' ? 'BANG!' :
                      pendingAction.type === 'INDIANS' ? 'Indians attack' :
                      pendingAction.type === 'GATLING' ? 'Gatling' :
                      pendingAction.type === 'DUEL' ? 'Duel' :
                      'action';

    if (isWaitingForMe) {
      waitingMessage = `🎯 Respond to ${actionType}!`;
    } else {
      const targetName = waitingForPlayer.character?.name || `Player ${pendingAction.targetPlayerId}`;
      waitingMessage = `⏳ Waiting for ${targetName} to respond to ${actionType}`;
    }
  } else if (someoneInStage && !isMyTurn) {
    waitingMessage = `⏳ Waiting for ${currentPlayerName}`;
  }

  // Animated dots for waiting
  const dots = '.'.repeat((pulseCount % 3) + 1);

  return (
    <div className="bg-gradient-to-r from-amber-800 to-amber-900 p-3 border-b-4 border-amber-950 shadow-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left side - Current turn info */}
        <div className="flex items-center gap-4">
          {isMyTurn ? (
            <div className="flex items-center gap-2 bg-green-500/20 px-4 py-2 rounded-lg border-2 border-green-400 animate-pulse">
              <span className="text-3xl">🎯</span>
              <div>
                <div className="text-green-300 text-sm font-semibold">YOUR TURN</div>
                <div className="text-white font-bold text-lg">It's your turn!</div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg border-2 border-white/30">
              <span className="text-3xl">⏱️</span>
              <div>
                <div className="text-amber-300 text-sm font-semibold">CURRENT TURN</div>
                <div className="text-white font-bold text-lg">{currentPlayerName}</div>
              </div>
            </div>
          )}

          {/* Phase indicator */}
          <div className="bg-black/30 px-3 py-2 rounded-lg border border-white/20">
            <div className="text-amber-200 text-xs font-semibold">PHASE</div>
            <div className="text-white font-mono text-sm">{ctx.phase}</div>
          </div>
        </div>

        {/* Center - Waiting/Action indicator */}
        {waitingMessage && (
          <div className={`flex items-center gap-2 px-6 py-3 rounded-lg border-2 ${
            isWaitingForMe
              ? 'bg-red-500/20 border-red-400 animate-pulse'
              : 'bg-blue-500/20 border-blue-400'
          }`}>
            <div className={`font-bold text-lg ${isWaitingForMe ? 'text-red-300' : 'text-blue-300'}`}>
              {waitingMessage}{!isWaitingForMe && dots}
            </div>
          </div>
        )}

        {/* Right side - Game stats */}
        <div className="flex items-center gap-4">
          <div className="bg-black/30 px-3 py-2 rounded-lg border border-white/20">
            <div className="text-amber-200 text-xs font-semibold">DECK</div>
            <div className="text-white font-mono text-sm">{G.deck.length} cards</div>
          </div>

          {G.discard && G.discard.length > 0 && (
            <div className="bg-black/30 px-3 py-2 rounded-lg border border-white/20">
              <div className="text-amber-200 text-xs font-semibold">DISCARD</div>
              <div className="text-white font-mono text-sm">{G.discard.length} cards</div>
            </div>
          )}

          {/* Turn number */}
          <div className="bg-black/30 px-3 py-2 rounded-lg border border-white/20">
            <div className="text-amber-200 text-xs font-semibold">TURN</div>
            <div className="text-white font-mono text-sm">#{ctx.turn || 1}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
