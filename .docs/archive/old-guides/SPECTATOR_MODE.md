# Spectator Mode Implementation Plan

## Overview

Spectator mode allows users to watch a game in progress without participating. Spectators can see:
- All players and their public information
- Current game state and turn
- Card plays as they happen
- Victory conditions when game ends

Spectators **cannot** see:
- Players' hands (card backs shown)
- Hidden roles (except Sheriff and dead players)
- Deck contents

## Features

### 1. Spectator Join
- New "Watch Game" option in NetworkLobby
- Enter game code to watch
- No player slot required
- Can join mid-game

### 2. Spectator View
- Read-only game board
- All UI controls disabled
- Special "SPECTATOR" badge displayed
- Can see all players from bird's-eye view

### 3. Spectator Controls
- Leave game button
- Game history/log viewer
- Optional: Chat with other spectators

## Implementation

### Files to Create:
1. `src/components/SpectatorBoard.tsx` - Spectator-specific game board
2. `src/components/SpectatorBadge.tsx` - Visual indicator

### Files to Modify:
1. `src/components/ModeSelection.tsx` - Add "Watch Game" option
2. `src/components/NetworkLobby.tsx` - Add spectator join mode
3. `src/App.tsx` - Handle spectator mode
4. `src/game/playerView.ts` - Already handles spectator (playerID === null)

### Implementation Steps:
1. Add "Watch Game" button to mode selection
2. Create spectator lobby entry point
3. Connect as spectator (playerID = null)
4. Create read-only game board component
5. Test spectator view
6. Add spectator count display for players

## Technical Details

### boardgame.io Spectator Support

boardgame.io supports spectators natively:
```typescript
// Join as spectator
<BangClient
  matchID={gameCode}
  playerID={null}  // null = spectator
/>
```

### Spectator Player View

Already implemented in `src/game/playerView.ts`:
```typescript
if (playerID === null) {
  // Spectator view - hide all hands and roles
  return hideAllSecrets(G);
}
```

### UI Differences

**Player View:**
- Can play cards
- See own hand
- Active turn indicator for self
- Move controls enabled

**Spectator View:**
- All cards disabled
- See card backs for all hands
- No active turn for spectator
- All move controls hidden
- "SPECTATOR MODE" banner

## Benefits

1. **Learning** - New players can watch experienced players
2. **Entertainment** - Friends can watch ongoing games
3. **Tournaments** - Audience can watch competitive matches
4. **Debugging** - Developers can observe live games
5. **Streaming** - Streamers can show game to audience

## Future Enhancements

- Multiple spectators per game
- Spectator chat
- Replay controls (rewind/fast-forward)
- Different spectator camera angles
- Show/hide advanced statistics
- Spectator achievements
