// AI Manager - Automatically plays moves for AI players

import { useEffect, useRef } from 'react';
import { BangGameState } from '../game/setup';
import { playAITurn } from '../ai/AIPlayer';

interface AIManagerProps {
  G: BangGameState;
  ctx: any;
  moves: any;
  playerID: string;
}

export const AIManager: React.FC<AIManagerProps> = ({ G, ctx, moves, playerID }) => {
  const lastTurnRef = useRef<string>('');
  const processingRef = useRef(false);

  useEffect(() => {
    const currentPlayer = ctx.currentPlayer;

    console.log('[AIManager] useEffect triggered', {
      currentPlayer,
      playerID,
      activePlayers: ctx.activePlayers,
      pendingAction: G.pendingAction,
      processing: processingRef.current,
      gameover: ctx.gameover,
    });

    // Skip if currently processing
    if (processingRef.current) {
      console.log('[AIManager] Skipping - already processing');
      return;
    }

    // Skip if game is over
    if (ctx.gameover) {
      console.log('[AIManager] Skipping - game over');
      return;
    }

    // Check if any AI player needs to respond to a reactive action
    if (ctx.activePlayers && G.pendingAction) {
      const activePlayerIds = Object.keys(ctx.activePlayers);
      console.log('[AIManager] Active players detected', activePlayerIds);

      for (const activePlayerId of activePlayerIds) {
        // Skip if it's the human player
        if (activePlayerId === playerID) {
          console.log(`[AIManager] Skipping ${activePlayerId} - is human player`);
          continue;
        }

        const stage = ctx.activePlayers[activePlayerId];
        const turnKey = `${activePlayerId}-${stage}-${ctx.turn}`;

        // Skip if already processed this reactive action
        if (lastTurnRef.current === turnKey) {
          console.log(`[AIManager] Skipping ${activePlayerId} - already processed ${turnKey}`);
          continue;
        }

        console.log(`[AIManager] AI player ${activePlayerId} needs to respond in stage ${stage}`);
        console.log('[AIManager] Available moves:', Object.keys(moves));

        // AI needs to respond
        processingRef.current = true;
        lastTurnRef.current = turnKey;

        const delay = 1000;

        const timer = setTimeout(() => {
          try {
            console.log(`[AIManager] Executing AI response for player ${activePlayerId}`);
            handleAIReactiveResponse(G, ctx, moves, activePlayerId, stage);
          } catch (error) {
            console.error('[AIManager] AI Reactive Error:', error);
          } finally {
            processingRef.current = false;
          }
        }, delay);

        return () => clearTimeout(timer);
      }
    }

    // Regular turn handling
    const turnKey = `${currentPlayer}-${ctx.turn}`;

    // Skip if already processed this turn
    if (lastTurnRef.current === turnKey) {
      console.log('[AIManager] Skipping - already processed turn', turnKey);
      return;
    }

    // Skip if it's the human player's turn
    if (currentPlayer === playerID) {
      console.log('[AIManager] Skipping - human player turn');
      return;
    }

    console.log(`[AIManager] AI player ${currentPlayer}'s turn`);

    // Play AI turn after a short delay for visibility
    processingRef.current = true;
    lastTurnRef.current = turnKey;

    const delay = 1000; // 1 second delay so players can see what's happening

    const timer = setTimeout(() => {
      try {
        console.log(`[AIManager] Executing AI turn for player ${currentPlayer}`);
        playAITurn(G, ctx, moves, currentPlayer);
      } catch (error) {
        console.error('[AIManager] AI Error:', error);
      } finally {
        processingRef.current = false;
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [G, ctx, moves, playerID]);

  return null; // This component doesn't render anything
};

/**
 * Handle AI responses to reactive actions
 */
function handleAIReactiveResponse(G: BangGameState, ctx: any, moves: any, playerID: string, stage: string) {
  const player = G.players[playerID];

  console.log(`[AI ${playerID}] Responding to ${stage}`, {
    playerHealth: player.health,
    handSize: player.hand.length,
    availableMoves: Object.keys(moves),
    stage,
  });

  switch (stage) {
    case 'respondToBang':
      // Try to play Missed!
      const missed = player.hand.find(id => G.cardMap[id]?.type === 'MISSED');
      if (missed) {
        console.log(`[AI ${playerID}] Playing Missed!`);
        moves.playMissed(missed);
      } else {
        // No Missed! - call playMissed() without cardId to accept damage
        console.log(`[AI ${playerID}] No Missed! - accepting damage`);
        moves.playMissed();
      }
      break;

    case 'respondToIndians':
      // Try to discard BANG!
      const bang = player.hand.find(id => G.cardMap[id]?.type === 'BANG');
      if (bang) {
        console.log(`[AI ${playerID}] Discarding BANG for Indians`);
        moves.respondToIndians(bang);
      } else {
        // Take damage
        console.log(`[AI ${playerID}] Taking damage from Indians`);
        moves.respondToIndians();
      }
      break;

    case 'respondToDuel':
      // Try to play BANG!
      const duelBang = player.hand.find(id => G.cardMap[id]?.type === 'BANG');
      if (duelBang) {
        console.log(`[AI ${playerID}] Playing BANG in duel`);
        moves.respondToDuel(duelBang);
      } else {
        // Lose the duel
        console.log(`[AI ${playerID}] Losing duel`);
        moves.respondToDuel();
      }
      break;

    case 'respondToGeneralStore':
      // Pick first available card
      if (G.pendingAction?.revealedCards && G.pendingAction.revealedCards.length > 0) {
        const firstCard = G.pendingAction.revealedCards[0];
        console.log(`[AI ${playerID}] Choosing ${firstCard} from General Store`);
        moves.respondToGeneralStore(firstCard);
      }
      break;

    case 'discard':
      // Discard worst cards
      if (player.hand.length > player.health) {
        const cardsToDiscard = player.hand.slice(0, player.hand.length - player.health);
        console.log(`[AI ${playerID}] Discarding ${cardsToDiscard.length} cards`);
        moves.discardCards(cardsToDiscard);
      }
      break;

    default:
      console.warn(`[AI ${playerID}] Unknown stage: ${stage}`);
  }
}
