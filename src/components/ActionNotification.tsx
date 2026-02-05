// Action Notification Component - Shows game events to all players

import React, { useEffect, useState, useRef } from 'react';
import { BangGameState } from '../game/setup';

interface Notification {
  id: string;
  type: 'action' | 'damage' | 'death' | 'heal' | 'draw' | 'discard';
  message: string;
  playerName: string;
  timestamp: number;
}

interface ActionNotificationProps {
  G: BangGameState;
  ctx: any;
  playerID: string | null;
}

export const ActionNotification: React.FC<ActionNotificationProps> = ({ G, ctx, playerID }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const prevGameStateRef = useRef<any>(null);

  useEffect(() => {
    if (!G || !G.players || !playerID) return;

    const prevState = prevGameStateRef.current;
    if (!prevState) {
      prevGameStateRef.current = JSON.parse(JSON.stringify(G));
      return;
    }

    const newNotifications: Notification[] = [];

    // Check each player for changes
    Object.keys(G.players).forEach(playerId => {
      if (playerId === playerID) return; // Don't show notifications for own actions

      const currentPlayer = G.players[playerId];
      const prevPlayer = prevState.players[playerId];

      if (!currentPlayer || !prevPlayer) return;

      const playerName = currentPlayer.character?.name || `Player ${playerId}`;

      // Check for health changes
      if (currentPlayer.health < prevPlayer.health) {
        const damage = prevPlayer.health - currentPlayer.health;
        newNotifications.push({
          id: `${Date.now()}-${playerId}-damage`,
          type: 'damage',
          message: `${playerName} took ${damage} damage! (${currentPlayer.health}❤️ remaining)`,
          playerName,
          timestamp: Date.now(),
        });
      } else if (currentPlayer.health > prevPlayer.health) {
        const healing = currentPlayer.health - prevPlayer.health;
        newNotifications.push({
          id: `${Date.now()}-${playerId}-heal`,
          type: 'heal',
          message: `${playerName} healed ${healing} health! (${currentPlayer.health}❤️)`,
          playerName,
          timestamp: Date.now(),
        });
      }

      // Check for death
      if (currentPlayer.isDead && !prevPlayer.isDead) {
        newNotifications.push({
          id: `${Date.now()}-${playerId}-death`,
          type: 'death',
          message: `💀 ${playerName} has been eliminated!`,
          playerName,
          timestamp: Date.now(),
        });
      }

      // Check for card plays (by looking at hand size decrease without discard stage)
      const handDiff = prevPlayer.hand.length - currentPlayer.hand.length;
      const inDiscardStage = ctx.activePlayers?.[playerId] === 'discard';
      if (handDiff > 0 && !inDiscardStage && ctx.currentPlayer === playerId) {
        // Player played card(s) on their turn
        newNotifications.push({
          id: `${Date.now()}-${playerId}-action`,
          type: 'action',
          message: `${playerName} played a card`,
          playerName,
          timestamp: Date.now(),
        });
      }

      // Check for drawing cards
      if (currentPlayer.hand.length > prevPlayer.hand.length) {
        const drawn = currentPlayer.hand.length - prevPlayer.hand.length;
        if (ctx.currentPlayer === playerId && !prevPlayer.hasDrawn && currentPlayer.hasDrawn) {
          newNotifications.push({
            id: `${Date.now()}-${playerId}-draw`,
            type: 'draw',
            message: `${playerName} drew ${drawn} cards`,
            playerName,
            timestamp: Date.now(),
          });
        }
      }

      // Check for equipment changes
      const prevEquipment = prevPlayer.inPlay.length;
      const currEquipment = currentPlayer.inPlay.length;
      if (currEquipment > prevEquipment) {
        const newItem = currentPlayer.inPlay[currentPlayer.inPlay.length - 1];
        const itemName = newItem?.name || 'equipment';
        newNotifications.push({
          id: `${Date.now()}-${playerId}-equip`,
          type: 'action',
          message: `${playerName} equipped ${itemName}`,
          playerName,
          timestamp: Date.now(),
        });
      }
    });

    // Add pending action notifications
    if (G.pendingAction && !prevState.pendingAction) {
      const action = G.pendingAction;
      const sourcePlayer = G.players[action.sourcePlayerId];
      const targetPlayer = G.players[action.targetPlayerId];

      if (sourcePlayer && targetPlayer && action.sourcePlayerId !== playerID) {
        const sourceName = sourcePlayer.character?.name || `Player ${action.sourcePlayerId}`;
        const targetName = targetPlayer.character?.name || `Player ${action.targetPlayerId}`;

        const actionType = action.type === 'BANG' ? '🔫 BANG!' :
                          action.type === 'INDIANS' ? '🏹 Indians!' :
                          action.type === 'GATLING' ? '💥 Gatling!' :
                          action.type === 'DUEL' ? '⚔️ Duel!' :
                          'an attack';

        if (action.targetPlayerId === playerID) {
          newNotifications.push({
            id: `${Date.now()}-pending-target`,
            type: 'damage',
            message: `${sourceName} attacked you with ${actionType}`,
            playerName: sourceName,
            timestamp: Date.now(),
          });
        } else {
          newNotifications.push({
            id: `${Date.now()}-pending`,
            type: 'action',
            message: `${sourceName} attacked ${targetName} with ${actionType}`,
            playerName: sourceName,
            timestamp: Date.now(),
          });
        }
      }
    }

    if (newNotifications.length > 0) {
      setNotifications(prev => [...prev, ...newNotifications]);
    }

    prevGameStateRef.current = JSON.parse(JSON.stringify(G));
  }, [G, playerID, ctx]);

  // Auto-remove notifications after 5 seconds
  useEffect(() => {
    if (notifications.length === 0) return;

    const timer = setTimeout(() => {
      const now = Date.now();
      setNotifications(prev => prev.filter(n => now - n.timestamp < 5000));
    }, 1000);

    return () => clearTimeout(timer);
  }, [notifications]);

  if (notifications.length === 0) return null;

  const getNotificationStyle = (type: Notification['type']) => {
    switch (type) {
      case 'damage':
        return 'bg-red-600 border-red-400';
      case 'death':
        return 'bg-gray-900 border-gray-600';
      case 'heal':
        return 'bg-green-600 border-green-400';
      case 'draw':
        return 'bg-blue-600 border-blue-400';
      case 'discard':
        return 'bg-yellow-600 border-yellow-400';
      case 'action':
      default:
        return 'bg-purple-600 border-purple-400';
    }
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'damage': return '💥';
      case 'death': return '💀';
      case 'heal': return '💚';
      case 'draw': return '🃏';
      case 'discard': return '🗑️';
      case 'action': return '⚡';
      default: return '📢';
    }
  };

  return (
    <div className="fixed right-4 top-24 z-40 flex flex-col gap-2 max-w-sm">
      {notifications.slice(-5).map((notification, index) => {
        const age = Date.now() - notification.timestamp;
        const opacity = age > 4000 ? 'opacity-50' : 'opacity-100';

        return (
          <div
            key={notification.id}
            className={`${getNotificationStyle(notification.type)} ${opacity}
                       text-white px-4 py-3 rounded-lg shadow-xl border-2
                       transform transition-all duration-300 animate-slideInRight`}
            style={{
              animationDelay: `${index * 50}ms`,
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getIcon(notification.type)}</span>
              <div className="text-sm font-semibold">{notification.message}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
