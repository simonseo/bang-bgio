// Game setup and initial state

import { Ctx } from 'boardgame.io';
import { Card } from '../data/cards';
import { Character, shuffleCharacters } from '../data/characters';
import { Role, assignRoles } from '../data/roles';
import { createDeck, shuffleDeck } from '../data/deck';

export interface PlayerState {
  health: number;
  maxHealth: number;
  hand: string[];
  inPlay: string[];
  character: Character;
  characterChoices: Character[];
  role: Role;
  isDead: boolean;
  weapon: Card | null;
  barrel: boolean;
  mustang: boolean;
  scope: boolean;
  dynamite: boolean;
  inJail: boolean;
  bangsPlayedThisTurn: number;
  hasDrawn: boolean;
}

export interface PendingAction {
  type: 'BANG' | 'DUEL' | 'INDIANS' | 'GATLING' | 'GENERAL_STORE' | 'BARREL_DRAW' | 'DYNAMITE_DRAW' | 'JAIL_DRAW';
  sourcePlayerId?: string;
  targetPlayerId?: string;
  cardId?: string;
  requiresMissed?: number;
  bangCount?: number;
  remainingTargets?: string[];  // For multi-target cards (Gatling, Indians, General Store)
  revealedCards?: string[];  // For General Store
}

export interface BangGameState {
  deck: Card[];
  discardPile: Card[];
  players: Record<string, PlayerState>;
  sheriffId: string;
  pendingAction: PendingAction | null;
  turnOrder: string[];
  characterAbilitiesUsed: Record<string, any>;
  cardMap: Record<string, Card>;
}

export function setup(context: any): BangGameState {
  // Extract ctx from the context object (boardgame.io v0.50 format)
  const ctx = context.ctx || context;
  const numPlayers = ctx.numPlayers || 4;

  console.log('Setup called with numPlayers:', numPlayers);

  // Create and shuffle deck
  const fullDeck = createDeck();
  const shuffledDeck = shuffleDeck(fullDeck);

  // Create card lookup map
  const cardMap: Record<string, Card> = {};
  fullDeck.forEach(card => {
    cardMap[card.id] = card;
  });

  // Assign roles
  const roles = assignRoles(numPlayers);

  // Prepare character choices (2 per player) and assign one randomly
  const allCharacters = shuffleCharacters();
  const characterChoicesPerPlayer: Character[][] = [];
  const assignedCharacters: Character[] = [];

  for (let i = 0; i < numPlayers; i++) {
    const choice1 = allCharacters[i * 2];
    const choice2 = allCharacters[i * 2 + 1];
    characterChoicesPerPlayer.push([choice1, choice2]);
    // For now, automatically assign the first choice
    // TODO: Add character selection phase where player chooses
    assignedCharacters.push(choice1);
  }

  // Find sheriff
  const sheriffIndex = roles.indexOf('sheriff');
  const sheriffId = String(sheriffIndex);

  // Initialize players
  const players: Record<string, PlayerState> = {};
  const turnOrder: string[] = [];

  for (let i = 0; i < numPlayers; i++) {
    const playerId = String(i);
    const characterChoices = characterChoicesPerPlayer[i];
    const character = assignedCharacters[i];
    const role = roles[i];
    const isSheriff = role === 'sheriff';

    // Sheriff gets +1 health
    const maxHealth = character.health + (isSheriff ? 1 : 0);

    // Deal initial hand (cards equal to health)
    const hand: string[] = [];
    for (let j = 0; j < maxHealth; j++) {
      const card = shuffledDeck.pop();
      if (card) {
        hand.push(card.id);
      }
    }

    players[playerId] = {
      health: maxHealth,
      maxHealth,
      hand,
      inPlay: [],
      character,
      characterChoices,
      role,
      isDead: false,
      weapon: null,
      barrel: false,
      mustang: false,
      scope: false,
      dynamite: false,
      inJail: false,
      bangsPlayedThisTurn: 0,
      hasDrawn: false,
    };

    turnOrder.push(playerId);
  }

  // Rotate turn order to start with sheriff
  while (turnOrder[0] !== sheriffId) {
    const first = turnOrder.shift();
    if (first) turnOrder.push(first);
  }

  return {
    deck: shuffledDeck,
    discardPile: [],
    players,
    sheriffId,
    pendingAction: null,
    turnOrder,
    characterAbilitiesUsed: {},
    cardMap,
  };
}
