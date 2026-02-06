# Multiplayer Lobby Features Design

**Date:** 2026-02-06
**Author:** Agent 4
**Status:** Approved
**Branch:** TBD (agent-4/feature/multiplayer-lobby)

---

## Overview

This design document covers three interconnected multiplayer features:
1. **Match Browser** - Browse and join available games
2. **Lobby Waiting Room** - Real-time player list with live updates
3. **Player Names in Game** - Display player names throughout gameplay

These features create a cohesive multiplayer experience where player identity flows from lobby to game.

---

## Architecture

### Data Flow

```
LobbyClient API → Match Browser → Waiting Room → Game (with player names)
                      ↓
                  Player metadata stored in boardgame.io matchData
```

### Core Components

**1. Match Browser Component** (`src/components/MatchBrowser.tsx`)
- New screen accessible from main menu
- Polls `lobby.listMatches('bang')` every 1 second
- Displays joinable matches with "Show all games" toggle
- On join → transitions to Waiting Room

**2. Enhanced Waiting Room** (update `src/components/NetworkLobby.tsx`)
- After creating/joining, poll `lobby.getMatch(matchID)` every 1 second
- Display real-time player list with names
- Host can start when minimum players met
- All players auto-transition when game starts

**3. Player Names in Game** (update `src/components/GameBoard.tsx` and related)
- Player names stored in `matchData` from boardgame.io
- Passed as props through component tree
- Displayed on player cards, turn indicator, action notifications
- Fallback to "Player {id}" if name missing (backwards compatibility)

### Technical Decisions

- **Polling interval:** 1 second (responsive without overloading server)
- **Real-time mechanism:** React `useEffect` + `setInterval` (cleanup on unmount)
- **Player data source:** boardgame.io's `matchData` array (already supported)
- **Server modifications:** None needed - use existing LobbyClient API
- **Error handling:** Graceful degradation if server unreachable

---

## Feature 1: Match Browser

### UI Layout

```
┌─────────────────────────────────────┐
│  ← Back          Browse Games       │
│                                     │
│  [Show All Games: ☐]               │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ GAME-ABC123                 │   │
│  │ Host: Alice                 │   │
│  │ Players: 3/5  AI: 1         │   │
│  │              [Join Game →]  │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ GAME-XYZ789                 │   │
│  │ Host: Bob                   │   │
│  │ Players: 1/4  AI: 0         │   │
│  │              [Join Game →]  │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Refresh]  [Create New Game]      │
└─────────────────────────────────────┘
```

### Filtering Logic

**Default View (Show All Games: unchecked):**
- Only show matches where `players.some(p => !p.name)` (has empty slots)
- Hide matches that have started (game in play phase)

**Show All Games (checked):**
- Display all matches with status badges:
  - 🟢 "Joinable" - has empty slots
  - 🔴 "Full" - all slots taken
  - 🎮 "In Progress" - game started

### Data Types

```typescript
interface MatchCard {
  matchID: string;
  hostName: string;        // players[0].name
  currentPlayers: number;  // players.filter(p => p.name).length
  maxPlayers: number;      // players.length
  numAI: number;          // from setupData if available
  isJoinable: boolean;    // has empty slots && not started
}
```

### User Flow

1. User clicks "Browse Games" from main menu
2. See list of joinable games (auto-refresh every 1 second)
3. Click "Join Game" on a match
4. Prompt for player name (if not already set)
5. Call `lobby.joinMatch()` to join
6. Transition to Waiting Room

### Error Handling

- Server unreachable: Show error message with retry button
- No matches available: Show "No games available. Create one?"
- Join fails (full/started): Show error, refresh list automatically
- Network timeout: Continue showing stale data with warning indicator

---

## Feature 2: Lobby Waiting Room

### Enhanced UI

```
┌─────────────────────────────────────┐
│         Game Created!               │
│                                     │
│  ┌─────────────────────────────┐   │
│  │     Game Code: ABC123       │   │
│  │  Server: 192.168.1.100:3000 │   │
│  └─────────────────────────────┘   │
│                                     │
│  Players (3/5):                     │
│  ┌─────────────────────────────┐   │
│  │ 👑 Alice (Host)             │   │
│  │ 🎮 Bob                      │   │
│  │ 🎮 Charlie                  │   │
│  │ 💤 Waiting for player...    │   │
│  │ 💤 Waiting for player...    │   │
│  └─────────────────────────────┘   │
│                                     │
│  AI Players: 1                      │
│                                     │
│  [Start Game] (host only)          │
│  [Leave Game]                       │
└─────────────────────────────────────┘
```

### Real-time Polling

```typescript
// Polling implementation
useEffect(() => {
  if (!matchID || !lobby) return;

  const interval = setInterval(async () => {
    try {
      const match = await lobby.getMatch('bang', matchID);
      setMatchData(match); // Update player list

      // Check if game started
      if (match.setupData?.gameStarted ||
          match.gameover !== undefined) {
        // Auto-transition to game
        onStartGame(matchID, playerID, credentials);
      }
    } catch (err) {
      console.error('Failed to refresh match:', err);
      // Don't clear interval - keep trying
    }
  }, 1000);

  return () => clearInterval(interval);
}, [matchID, lobby]);
```

### Player List Display

- Show players in order (players[0] = host)
- Empty slots show "💤 Waiting for player..."
- Host has crown icon 👑
- Current player highlighted (different background color)
- Player count updates live as people join/leave

### Start Game Button

- **Visibility:** Only shown to host (playerID === '0')
- **Enabled when:** `filledSlots >= minPlayers` (4 for Bang!)
- **On click:**
  - Call server API to start game (if needed)
  - Trigger `onStartGame()` for host
  - Other players auto-transition via polling detection

### Leave Game Flow

- Call `lobby.leaveMatch()`
- If host leaves: game cancelled, notify other players
- If non-host leaves: just remove from player list
- Return to main menu or match browser

---

## Feature 3: Player Names in Game

### Where Names Appear

**1. Player Card Areas:**
```
┌─────────────────────────┐
│ Alice (Sheriff) - 4❤️   │ ← Name, role, health
│ [hand cards] [equipped] │
└─────────────────────────┘
```

**2. Turn Indicator:**
```typescript
"Alice's Turn"  // Instead of "Player 0's Turn"
```

**3. Action Notifications:**
```typescript
"Bob played BANG! at Charlie"   // Instead of "Player 1 played..."
"Alice drew 2 cards"
"Charlie took 1 damage"
```

**4. Target Selection:**
```typescript
"Select target for BANG!:"
[Bob - 3❤️] [Charlie - 4❤️] [Dave - 2❤️]  // Show names on buttons
```

### Implementation

```typescript
// Utility to extract player names from matchData
interface PlayerNameMap {
  [playerID: string]: string;
}

export const getPlayerNames = (matchData?: any[]): PlayerNameMap => {
  if (!matchData) return {};

  return matchData.reduce((acc, player, index) => {
    acc[index.toString()] = player.name || `Player ${index}`;
    return acc;
  }, {} as PlayerNameMap);
};

// Usage in GameBoard
const GameBoard = ({ matchData, ...props }) => {
  const playerNames = getPlayerNames(matchData);

  return (
    <div>
      <TurnIndicator playerName={playerNames[ctx.currentPlayer]} />
      <PlayerArea
        playerName={playerNames[playerID]}
        {...otherProps}
      />
    </div>
  );
};
```

### Components to Update

1. **`src/components/GameBoard.tsx`**
   - Pass `matchData` prop from Client
   - Extract `playerNames` map
   - Pass names to child components

2. **`src/components/TurnIndicator.tsx`**
   - Accept `playerName` prop
   - Display `"{playerName}'s Turn"`

3. **`src/components/ActionNotification.tsx`**
   - Accept `playerNames` map
   - Replace player IDs with names in messages

4. **`src/components/PlayerArea.tsx`**
   - Accept `playerName` prop
   - Display name on player card

5. **Target selection UI** (modals/buttons)
   - Show player names instead of "Player {id}"

### Backwards Compatibility

- **No matchData:** Fallback to "Player {id}"
- **Empty name string:** Fallback to "Player {id}"
- **Local games:** Works with default names or prompts for names
- **Existing saved games:** Gracefully degrades to player IDs

---

## Implementation Plan

### Phase 1: Match Browser
1. Create `MatchBrowser.tsx` component
2. Add "Browse Games" button to main menu
3. Implement `listMatches()` polling
4. Add filter toggle and UI
5. Wire up join flow
6. Add tests

### Phase 2: Waiting Room
1. Update `NetworkLobby.tsx` with polling
2. Add player list UI
3. Implement auto-transition detection
4. Add host-only start button logic
5. Add leave game flow
6. Add tests

### Phase 3: Player Names in Game
1. Create `getPlayerNames()` utility
2. Update `GameBoard.tsx` to pass names
3. Update `TurnIndicator.tsx`
4. Update `ActionNotification.tsx`
5. Update `PlayerArea.tsx`
6. Update target selection UI
7. Add tests

### Phase 4: Integration & Polish
1. Test complete flow: Browse → Join → Wait → Play
2. Test edge cases (disconnections, host leaves, etc.)
3. Add loading states and error messages
4. Polish animations and transitions
5. Browser testing
6. Performance testing

---

## Testing Strategy

### Unit Tests

- `MatchBrowser`: Filter logic, match card rendering
- `NetworkLobby`: Polling logic, player list updates
- `getPlayerNames()`: Utility function with various inputs

### Integration Tests

- Match browser → waiting room flow
- Waiting room → game start transition
- Player names display throughout game

### E2E Tests

- Create game, browse and join from second client
- Wait in lobby, start game, verify names in gameplay
- Leave game scenarios
- Network error recovery

### Manual Browser Tests

- Multi-device testing (host on laptop, join from phone)
- Network latency simulation
- Server restart scenarios
- Full/empty match list edge cases

---

## Error Handling

### Match Browser Errors

- **Server unreachable:** "Cannot connect to server. [Retry]"
- **No matches found:** "No games available. [Create New Game]"
- **Join failed:** "Failed to join game: {reason}. [Try Again]"

### Waiting Room Errors

- **Polling failure:** Show last known state + warning icon
- **Game start failed:** "Failed to start game. [Retry]"
- **Host disconnected:** "Host left. Returning to lobby..."

### Player Names Errors

- **matchData missing:** Fallback to "Player {id}"
- **Name fetch failed:** Use cached names if available

---

## Performance Considerations

- **Polling overhead:** 1 second = 60 requests/minute per client
  - Acceptable for development/LAN play
  - Consider WebSockets for production scaling
- **List rendering:** Virtualize if >50 matches (unlikely for LAN)
- **Memory:** Clean up intervals on component unmount

---

## Future Enhancements (Out of Scope)

- WebSocket real-time updates (instead of polling)
- Player ready status checkboxes
- Game settings preview in match browser
- Spectator mode
- Chat in waiting room
- Match passwords for private games
- Reconnection handling for dropped players

---

## Success Criteria

✅ Users can browse available games without knowing game codes
✅ Players see real-time updates in waiting room
✅ Host can start game when ready
✅ All players auto-transition to game on start
✅ Player names visible throughout gameplay
✅ Graceful error handling and backwards compatibility
✅ All tests passing

---

## Appendix: API Reference

### boardgame.io LobbyClient Methods

```typescript
// List all matches for a game
await lobby.listMatches('bang', {
  isGameover: false,  // optional filter
  updatedAfter: timestamp,  // optional
  updatedBefore: timestamp  // optional
});

// Get specific match details
await lobby.getMatch('bang', matchID);

// Join a match
await lobby.joinMatch('bang', matchID, {
  playerID: '1',
  playerName: 'Alice'
});

// Leave a match
await lobby.leaveMatch('bang', matchID, {
  playerID: '1',
  credentials: 'secret'
});
```

### Match Data Structure

```typescript
interface Match {
  matchID: string;
  gameName: string;
  players: Array<{
    id: number;
    name?: string;
    credentials?: string;
  }>;
  setupData?: any;
  gameover?: any;
  createdAt: number;
  updatedAt: number;
}
```

---

**End of Design Document**
