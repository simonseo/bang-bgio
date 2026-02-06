// Main game board component

import React, { useState } from 'react';
import { BangGameState } from '../game/setup';
import { Card as CardComponent } from './Card';
import { HealthDisplay } from './HealthDisplay';
import { RoleBadge } from './RoleBadge';
import { AIManager } from './AIManager';
import { HelpPanel } from './HelpPanel';
import { TurnIndicator } from './TurnIndicator';
import { ActionNotification } from './ActionNotification';
import { isCardPlayable, getValidTargetsForCard } from '../game/utils/playability';
import { calculateDistance } from '../game/utils/distance';

interface GameBoardProps {
  G: BangGameState;
  ctx: any;
  moves: any;
  playerID: string | null;
}

export const GameBoard: React.FC<GameBoardProps> = ({ G, ctx, moves, playerID }) => {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [targetingMode, setTargetingMode] = useState(false);
  const [validTargets, setValidTargets] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cardsToDiscard, setCardsToDiscard] = useState<string[]>([]);
  const [actionNotification, setActionNotification] = useState<string | null>(null);

  // Debug role visibility - verify playerView filtering is working
  if (G && G.players && playerID) {
    console.log(`[GameBoard Player ${playerID}] Received props:`, {
      myRole: G.players[playerID]?.role,
      player0Role: G.players['0']?.role,
      player1Role: G.players['1']?.role,
      player2Role: G.players['2']?.role,
      player3Role: G.players['3']?.role,
    });
  }

  // Safety checks
  if (!ctx || (ctx.gameover === undefined && (!G || !G.players || !G.turnOrder))) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-amber-900 to-red-900 flex items-center justify-center">
        <div className="text-white text-2xl">Initializing game...</div>
      </div>
    );
  }

  if (!playerID) {
    return <div className="text-white">Spectator mode not supported yet</div>;
  }

  // Defensive check for player data
  if (!G || !G.players || !G.players[playerID]) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-amber-900 to-red-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading game state...</div>
      </div>
    );
  }

  const player = G.players[playerID];
  const isMyTurn = ctx.currentPlayer === playerID;

  // Check if we're actually in the discard stage (not just over hand limit)
  const inDiscardStage = ctx.activePlayers?.[playerID] === 'discard';
  const needsToDiscard = inDiscardStage && player.hand.length > player.health;
  const cardsOverLimit = player.hand.length - player.health;

  const handleDiscardCard = (cardId: string) => {
    if (cardsToDiscard.includes(cardId)) {
      // Unselect
      setCardsToDiscard(cardsToDiscard.filter(id => id !== cardId));
    } else {
      // Select
      setCardsToDiscard([...cardsToDiscard, cardId]);
    }
  };

  const handleConfirmDiscard = () => {
    if (cardsToDiscard.length !== cardsOverLimit) {
      showError(`You must discard exactly ${cardsOverLimit} cards!`);
      return;
    }
    moves.discardCards(cardsToDiscard);
    setCardsToDiscard([]);
  };

  const handleCardClick = (cardId: string) => {
    if (!isMyTurn) return;

    // Clear previous selection when clicking different card
    if (selectedCard && selectedCard !== cardId) {
      setSelectedCard(null);
      setTargetingMode(false);
      setValidTargets([]);
    }

    if (selectedCard === cardId) {
      // Deselect if clicking same card
      setSelectedCard(null);
      setTargetingMode(false);
      setValidTargets([]);
    } else {
      setSelectedCard(cardId);
      const card = G.cardMap[cardId];
      console.log('[Card Click]', { cardId, cardType: card?.type, requiresTarget: card?.requiresTarget, isEquipment: card?.isEquipment });

      if (card?.requiresTarget) {
        setTargetingMode(true);
        const targets = getValidTargetsForCard(G, playerID, card);
        console.log('[Valid Targets]', targets);
        setValidTargets(targets);
      } else {
        // Play card without target immediately
        console.log('[Playing card without target]', cardId);
        handlePlayCard(cardId);
      }
    }
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(null), 3000); // Clear after 3 seconds
  };

  const showAction = (message: string) => {
    setActionNotification(message);
    setTimeout(() => setActionNotification(null), 2000);
  };

  const handlePlayCard = (cardId: string, targetId?: string) => {
    const card = G.cardMap[cardId];
    if (!card) {
      console.error('[handlePlayCard] Card not found:', cardId);
      showError('Card not found!');
      return;
    }

    const player = G.players[playerID || '0'];

    // Validate before playing
    if (!player.hasDrawn) {
      showError('You must draw cards first! Click "Draw Cards" button.');
      console.error('[Invalid] Must draw cards first');
      return;
    }

    if (card.type === 'BANG' && player.bangsPlayedThisTurn >= 1 && !player.weapon?.type?.includes('VOLCANIC')) {
      showError('You can only play 1 BANG! per turn!');
      console.error('[Invalid] BANG limit exceeded');
      return;
    }

    if (card.requiresTarget && !targetId) {
      showError('This card requires a target! Click on an opponent.');
      console.error('[Invalid] Card requires target but none provided');
      return;
    }

    console.log('[handlePlayCard]', { cardType: card.type, cardId, targetId, isEquipment: card.isEquipment });

    // Route to appropriate move based on card type
    switch (card.type) {
      case 'BANG':
        if (targetId) {
          console.log('[Calling] moves.playBang', cardId, targetId);
          moves.playBang(cardId, targetId);
        } else {
          console.error('[BANG requires target but none provided]');
        }
        break;
      case 'BEER':
        console.log('[Calling] moves.playBeer', cardId);
        moves.playBeer(cardId);
        break;
      case 'SALOON':
        console.log('[Calling] moves.playSaloon', cardId);
        moves.playSaloon(cardId);
        break;
      case 'STAGECOACH':
        console.log('[Calling] moves.playStagecoach', cardId);
        moves.playStagecoach(cardId);
        break;
      case 'WELLS_FARGO':
        console.log('[Calling] moves.playWellsFargo', cardId);
        moves.playWellsFargo(cardId);
        break;
      case 'PANIC':
        if (targetId) moves.playPanic(cardId, targetId);
        break;
      case 'CAT_BALOU':
        if (targetId) moves.playCatBalou(cardId, targetId);
        break;
      case 'JAIL':
        if (targetId) {
          console.log('[Calling] moves.playJail', cardId, targetId);
          moves.playJail(cardId, targetId);
        }
        break;
      case 'GATLING':
        console.log('[Calling] moves.playGatling', cardId);
        moves.playGatling(cardId);
        break;
      case 'INDIANS':
        console.log('[Calling] moves.playIndians', cardId);
        moves.playIndians(cardId);
        break;
      case 'GENERAL_STORE':
        console.log('[Calling] moves.playGeneralStore', cardId);
        moves.playGeneralStore(cardId);
        break;
      case 'DUEL':
        if (targetId) {
          console.log('[Calling] moves.playDuel', cardId, targetId);
          moves.playDuel(cardId, targetId);
        }
        break;
      case 'DYNAMITE':
        console.log('[Calling] moves.playDynamite', cardId);
        moves.playDynamite(cardId);
        break;
      default:
        if (card.isEquipment) {
          console.log('[Calling] moves.equipCard', cardId);
          moves.equipCard(cardId);
        } else {
          console.error('[Unknown card type]', card.type);
        }
    }

    setSelectedCard(null);
    setTargetingMode(false);
    setValidTargets([]);
  };

  const handleTargetSelect = (targetId: string) => {
    if (!selectedCard || !targetingMode) return;
    handlePlayCard(selectedCard, targetId);
  };

  const handleDraw = () => {
    console.log('[handleDraw] Called', {
      isMyTurn,
      hasDrawn: player.hasDrawn,
      playerID,
      currentPlayer: ctx.currentPlayer,
    });

    if (!isMyTurn) {
      console.log('[handleDraw] Not my turn, returning');
      return;
    }

    if (player.hasDrawn) {
      console.log('[handleDraw] Already drawn, returning');
      return;
    }

    console.log('[handleDraw] Calling moves.standardDraw()');
    moves.standardDraw();
  };

  const handleEndTurn = () => {
    if (!isMyTurn) return;

    const player = G.players[playerID || '0'];

    // Validate before ending turn
    if (!player.hasDrawn) {
      showError('You must draw cards before ending your turn!');
      return;
    }

    if (G.pendingAction && G.pendingAction.targetPlayerId !== playerID) {
      showError('Cannot end turn while waiting for opponent to respond!');
      return;
    }

    console.log('[End Turn] Calling passTurn');
    moves.passTurn();
  };

  const handleCharacterSelect = (characterId: string) => {
    console.log('[Character Select] Player', playerID, 'selecting character:', characterId);
    moves.selectCharacter(characterId);
  };

  // CHARACTER SELECTION PHASE UI
  if (ctx.phase === 'characterSelection') {
    const player = G.players[playerID || '0'];
    const hasSelected = player.hasSelectedCharacter;
    const characterChoices = player.characterChoices || [];

    return (
      <div className="w-full h-screen bg-gradient-to-br from-amber-900 to-red-900 flex flex-col items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <h1 className="text-white text-4xl font-bold text-center mb-2">Bang! Card Game</h1>
          <h2 className="text-amber-200 text-2xl font-bold text-center mb-8">Character Selection</h2>

          {hasSelected ? (
            <div className="bg-green-900/50 border-4 border-green-500 rounded-xl p-8 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-white text-2xl font-bold mb-2">Character Selected!</h3>
              <p className="text-green-200 text-lg mb-4">
                You chose: <span className="font-bold">{player.character.name}</span>
              </p>
              <p className="text-amber-200 text-sm italic">{player.character.description}</p>
              <p className="text-white mt-6 animate-pulse">Waiting for other players to select their characters...</p>
            </div>
          ) : (
            <>
              <div className="bg-white/10 border-2 border-white/30 rounded-xl p-6 mb-6 text-center">
                <p className="text-white text-lg mb-2">
                  Choose your character for this game:
                </p>
                <p className="text-amber-200 text-sm">
                  Each character has unique abilities that can help you win!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {characterChoices.map((character: any) => (
                  <button
                    key={character.id}
                    onClick={() => handleCharacterSelect(character.id)}
                    className="bg-gradient-to-br from-amber-800 to-red-800 hover:from-amber-700 hover:to-red-700 border-4 border-amber-600 hover:border-yellow-400 rounded-xl p-6 transition-all duration-200 transform hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/50"
                  >
                    <div className="text-center">
                      <h3 className="text-white text-3xl font-bold mb-2">{character.name}</h3>
                      <div className="flex justify-center items-center gap-4 mb-4">
                        <div className="text-red-400 text-xl">
                          ❤️ Health: {character.health}
                        </div>
                      </div>
                      <div className="bg-black/30 rounded-lg p-4 mb-4">
                        <div className="text-yellow-400 text-sm font-bold mb-2">Special Ability:</div>
                        <p className="text-white text-base italic">{character.description}</p>
                      </div>
                      <div className="text-green-400 font-bold text-lg">
                        Click to Choose →
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // MAIN GAME UI (play phase)
  return (
    <div className="w-full h-screen bg-gradient-to-b from-amber-900 to-amber-950 flex flex-col">
      {/* Error Toast */}
      {errorMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-pulse">
          <div className="bg-red-600 text-white px-6 py-4 rounded-lg shadow-2xl border-4 border-red-800 max-w-md">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⚠️</span>
              <div>
                <div className="font-bold text-lg">Invalid Move!</div>
                <div className="text-sm">{errorMessage}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Notification */}
      {actionNotification && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-xl border-2 border-blue-400">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✨</span>
              <div className="font-bold">{actionNotification}</div>
            </div>
          </div>
        </div>
      )}

      {/* Help Panel */}
      <HelpPanel />

      {/* AI Manager - automatically plays for AI players */}
      <AIManager G={G} ctx={ctx} moves={moves} playerID={playerID} />

      {/* Action Notifications - Show opponent actions */}
      <ActionNotification G={G} ctx={ctx} playerID={playerID} />

      {/* Turn Indicator - Shows whose turn it is and waiting status */}
      <TurnIndicator G={G} ctx={ctx} playerID={playerID} />

      {/* Opponents section - Horizontal scroll at top */}
      <div className="bg-black/30 p-4 border-b-2 border-black/50">
        <h3 className="text-white font-bold mb-2 text-sm">Other Players</h3>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {Object.keys(G.players)
            .filter(id => id !== playerID)
            .map(id => {
              const opponent = G.players[id];
              if (!opponent || !opponent.character) return null; // Safety check
              const isValidTarget = validTargets.includes(id);
              const distance = calculateDistance(G, playerID || '0', id);
              const opponentReach = opponent.weapon?.range || 1; // Default Colt .45 has range 1
              return (
                <div
                  key={id}
                  className={`flex-shrink-0 w-64 p-3 rounded-lg transition-all duration-200 group relative ${
                    isValidTarget ? 'cursor-pointer bg-green-500/30 ring-2 ring-green-400 shadow-lg shadow-green-400/50 hover:bg-green-400/40' :
                    targetingMode ? 'opacity-50 bg-white/10' :
                    'bg-white/10'
                  } ${opponent.isDead ? 'opacity-50' : ''}`}
                  onClick={() => isValidTarget && handleTargetSelect(id)}
                  title={`${opponent.character.name}: ${opponent.character.description}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <RoleBadge role={opponent.role} size="small" />
                    <span className="text-white font-bold">Player {id}</span>
                    <span className="text-blue-300 text-xs ml-1" title={`Distance from you: ${distance}`}>
                      📏{distance}
                    </span>
                    <span className="text-red-400 text-xs ml-1" title={`Their attack range: ${opponentReach}`}>
                      🔫{opponentReach}
                    </span>
                    {isValidTarget && (
                      <span className="ml-auto text-green-400 text-xs font-bold animate-pulse">✓ TARGET</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <HealthDisplay current={opponent.health} max={opponent.maxHealth} size="small" />
                    <span className="text-white text-xs">({opponent.health}/{opponent.maxHealth})</span>
                  </div>
                  <div className="text-white text-xs font-bold mt-1">{opponent.character.name}</div>
                  <div className="text-gray-300 text-xs italic mb-1">{opponent.character.description}</div>
                  <div className="text-white text-xs">Cards: {opponent.hand.length}</div>

                  {/* Equipment display */}
                  <div className="mt-1 flex flex-wrap gap-1">
                    {opponent.weapon && (
                      <div className="text-yellow-400 text-xs bg-yellow-900/30 px-1 rounded" title={opponent.weapon.description}>
                        🔫 {opponent.weapon.name}
                      </div>
                    )}
                    {opponent.barrel && (
                      <div className="text-blue-400 text-xs bg-blue-900/30 px-1 rounded" title="Can draw! to dodge BANG!">
                        🛢️ Barrel
                      </div>
                    )}
                    {opponent.mustang && (
                      <div className="text-green-400 text-xs bg-green-900/30 px-1 rounded" title="All see this player at +1 distance">
                        🐴 Mustang
                      </div>
                    )}
                    {opponent.scope && (
                      <div className="text-purple-400 text-xs bg-purple-900/30 px-1 rounded" title="Sees all at -1 distance">
                        🔭 Scope
                      </div>
                    )}
                    {opponent.dynamite && (
                      <div className="text-red-400 text-xs bg-red-900/30 px-1 rounded animate-pulse" title="Explodes on spades 2-9">
                        💣 Dynamite
                      </div>
                    )}
                    {opponent.inJail && (
                      <div className="text-gray-400 text-xs bg-gray-900/30 px-1 rounded" title="Must draw hearts to escape">
                        ⛓️ Jailed
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Main game area - Center table */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="text-white text-2xl mb-2">
            {isMyTurn ? "Your Turn!" : `Player ${ctx.currentPlayer}'s Turn`}
          </div>

          {/* Phase Indicator & BANG Counter */}
          {isMyTurn && (
            <div className="mb-6">
              <div className="px-6 py-2 rounded-lg bg-blue-900/50 border-2 border-blue-400">
                <div className="text-blue-200 text-lg font-bold text-center">
                  {needsToDiscard ? (
                    <span>🗑️ Discard Phase - Select {cardsOverLimit} card{cardsOverLimit > 1 ? 's' : ''} to discard</span>
                  ) : !player.hasDrawn ? (
                    <span>📥 Draw Phase - Click "Draw Cards"</span>
                  ) : (
                    <span>🎴 Action Phase - Play cards or End Turn</span>
                  )}
                </div>
              </div>

              {/* BANG! Counter */}
              {player.hasDrawn && !needsToDiscard && (
                <div className="mt-2 px-4 py-1 rounded bg-red-900/50 border border-red-600 text-center">
                  <span className="text-red-200 text-sm font-bold">
                    💥 BANG!: {
                      player.weapon?.type === 'VOLCANIC' || player.character?.name === 'Willy the Kid'
                        ? '∞'
                        : `${player.bangsPlayedThisTurn}/1`
                    }
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Deck and discard pile */}
          <div className="flex gap-8 mb-8">
            <div className="text-center">
              <div className="w-24 h-36 bg-red-900 rounded-lg border-4 border-yellow-600 flex items-center justify-center text-white font-bold">
                DECK
                <br />
                {G.deck.length}
              </div>
            </div>
            <div className="text-center">
              <div className="w-24 h-36 bg-gray-700 rounded-lg border-4 border-gray-400 flex items-center justify-center text-white font-bold">
                DISCARD
                <br />
                {G.discardPile.length}
              </div>
            </div>
          </div>

          {/* Action buttons - Only show in play phase */}
          {isMyTurn && ctx.phase === 'play' && (
            <div className="flex gap-4">
              <button
                onClick={handleDraw}
                disabled={player.hasDrawn}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Draw Cards
              </button>
              <button
                onClick={handleEndTurn}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
              >
                End Turn
              </button>
            </div>
          )}

          {/* Character Selection Phase Message */}
          {isMyTurn && ctx.phase === 'characterSelection' && (
            <div className="bg-yellow-900/50 border-2 border-yellow-500 rounded-lg p-4 text-center">
              <p className="text-yellow-200 font-bold">Character Selection Phase</p>
              <p className="text-white text-sm">Select your character to continue</p>
            </div>
          )}
      </div>

      {/* Bottom - Player's hand and area */}
      <div className="bg-black/50 p-2 sm:p-4 max-h-[40vh] sm:max-h-[50vh] overflow-y-auto">
        <div className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-4 flex-wrap">
          <RoleBadge role={player.role} />
          <div className="flex-1 min-w-0">
            <div className="text-white font-bold text-sm sm:text-lg truncate">{player.character.name}</div>
            <div className="text-gray-300 text-xs sm:text-sm truncate">{player.character.description}</div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <HealthDisplay current={player.health} max={player.maxHealth} />
            <span className="text-white font-bold text-sm sm:text-lg">({player.health}/{player.maxHealth})</span>
          </div>
        </div>

        {/* Equipment */}
        {player.inPlay.length > 0 && (
          <div className="mb-4 max-h-32 overflow-y-auto">
            <div className="text-white text-sm mb-2">Equipment:</div>
            <div className="flex gap-2 flex-wrap">
              {player.inPlay.map(cardId => {
                const card = G.cardMap[cardId];
                return card ? (
                  <CardComponent key={cardId} card={card} size="small" />
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* Hand */}
        <div className="min-h-[120px] sm:min-h-[150px]">
          <div className="text-white text-xs sm:text-sm mb-1 sm:mb-2">
            Hand ({player.hand.length} cards):
          </div>
          <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-2">
            {player.hand.map(cardId => {
              const card = G.cardMap[cardId];
              const playable = isMyTurn && !needsToDiscard && isCardPlayable(G, ctx, playerID, cardId);
              const selectedForDiscard = cardsToDiscard.includes(cardId);

              return card ? (
                <CardComponent
                  key={cardId}
                  card={card}
                  onClick={() => needsToDiscard ? handleDiscardCard(cardId) : handleCardClick(cardId)}
                  selected={needsToDiscard ? selectedForDiscard : (selectedCard === cardId)}
                  disabled={!isMyTurn}
                  playable={playable}
                />
              ) : null;
            })}
          </div>

          {/* Discard Confirm Button */}
          {needsToDiscard && isMyTurn && (
            <button
              onClick={handleConfirmDiscard}
              disabled={cardsToDiscard.length !== cardsOverLimit}
              className={`mt-4 px-6 py-3 rounded-lg font-bold text-white text-lg transition-all
                ${cardsToDiscard.length === cardsOverLimit
                  ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                  : 'bg-gray-500 cursor-not-allowed'
                }`}
            >
              Discard {cardsToDiscard.length}/{cardsOverLimit} Cards
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
