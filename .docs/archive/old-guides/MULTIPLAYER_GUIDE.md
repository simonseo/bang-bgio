// Multiplayer Implementation Guide

# Multiplayer System

## Overview

Bang! now supports two multiplayer modes:
1. **Local Mode** - Single human player vs AI opponents (current implementation)
2. **Network Mode** - Computer hosts game, human players join from phones/tablets with AI fill

## Mode Selection

When you start the game, you'll see three options:

### 1. 🤖 Local Play
- Single player vs AI on one device
- Perfect for: Solo practice, learning the game
- AI automatically plays for all other players
- No network required

### 2. 🖥️ Host Game
- Host a networked game on your computer
- Players join from phones/tablets
- Configure number of AI players to fill empty slots
- Perfect for: Parties, family gatherings

### 3. 📱 Join Game
- Join an existing game from phone/tablet
- Enter game code provided by host
- Mobile-optimized interface
- Perfect for: Playing from anywhere in the room

## Network Mode - Step by Step

### Host Setup

1. **Start Server**
   ```bash
   npm run server
   ```
   Server starts on port 8000

2. **Start Client**
   ```bash
   npm run dev
   ```
   Client starts on port 3000

3. **Or Start Both**
   ```bash
   npm start
   ```
   Starts server and client simultaneously

4. **Host the Game**
   - Open http://localhost:3000
   - Click "Host Game"
   - Enter your name
   - Select total players (4-7)
   - Select number of AI players
   - Click "Create Game"

5. **Share Game Info**
   - Game Code displays (e.g., "abc123")
   - Share with players:
     - Game Code: abc123
     - Server URL: http://[YOUR-IP]:3000

6. **Find Your IP**
   - Windows: `ipconfig`
   - Mac/Linux: `ifconfig`
   - Look for local IP (e.g., 192.168.1.100)

### Player Join

1. **Connect to Network**
   - Connect phone/tablet to same Wi-Fi as host

2. **Open Browser**
   - Navigate to: http://[HOST-IP]:3000
   - Example: http://192.168.1.100:3000

3. **Join Game**
   - Click "Join Game"
   - Enter your name
   - Enter game code from host
   - Click "Join Game"

4. **Wait for Start**
   - Host will start game when ready
   - You'll see your role and character

### Starting the Game

**Host Controls:**
- See number of connected players
- Can start game when ready
- AI fills remaining slots automatically

**Example:**
- 5 player game configured
- 2 AI players selected
- Need 3 human players (including host)
- Once 3 humans joined, host can start

## AI Fill System

The host can configure how many AI players to include:

**Configuration:**
- Total Players: 4-7
- AI Players: 0 to (Total - 1)
- Human slots = Total - AI

**Examples:**

4-Player Game:
- 3 AI: 1 human + 3 AI (solo with friends watching)
- 2 AI: 2 humans + 2 AI
- 1 AI: 3 humans + 1 AI
- 0 AI: 4 humans (full human game)

7-Player Game:
- 4 AI: 3 humans + 4 AI
- 2 AI: 5 humans + 2 AI
- 0 AI: 7 humans (full human game)

**AI Behavior in Network Games:**
- AI plays automatically on server
- All players see AI moves
- AI uses same strategy as local mode
- 1-second delay for visibility

## Network Architecture

```
┌─────────────┐
│  Server     │  Port 8000
│  (Node.js)  │  - Game state
│             │  - Match making
│             │  - AI execution
└──────┬──────┘
       │
       ├─── WebSocket ───┐
       │                 │
┌──────┴──────┐    ┌────┴─────┐
│  Host PC    │    │  Phone 1 │
│  localhost  │    │  Player  │
│  :3000      │    │          │
└─────────────┘    └──────────┘
                         │
                   ┌────┴─────┐
                   │  Phone 2 │
                   │  Player  │
                   └──────────┘
```

## Technical Details

### Server
- **Technology:** boardgame.io Server with Socket.IO
- **Port:** 8000 (configurable via PORT env var)
- **File:** `server.js`
- **Runs:** Node.js

### Client
- **Technology:** React + boardgame.io Client
- **Port:** 3000 (Vite dev server)
- **Multiplayer:** SocketIO transport
- **File:** `src/App.tsx`

### Game State Sync
- Server maintains authoritative state
- Clients receive state updates via WebSocket
- Moves validated on server
- AI plays on server, synced to all clients

## Mobile Optimization

The UI automatically adapts for mobile devices:

**Desktop:**
- Full radial layout
- Large cards
- Detailed information

**Tablet:**
- Condensed layout
- Medium cards
- Essential info shown

**Phone:**
- Vertical stack layout
- Small cards
- Swipeable hand
- Tap to play

## Troubleshooting

### Can't Connect to Server

**Problem:** Players can't reach http://[IP]:3000

**Solutions:**
1. Check same Wi-Fi network
2. Disable firewall temporarily
3. Verify IP address correct
4. Try localhost if on same machine
5. Check port 8000 and 3000 not blocked

### Game Code Not Working

**Problem:** "Game not found" error

**Solutions:**
1. Verify code typed correctly
2. Check server still running
3. Host may have cancelled game
4. Create new game if needed

### AI Not Playing

**Problem:** AI turn hangs

**Solutions:**
1. Check server console for errors
2. Verify AI count configured correctly
3. Restart server if needed
4. Check network connection stable

### Mobile Display Issues

**Problem:** Cards too small, can't click

**Solutions:**
1. Zoom browser (pinch/spread)
2. Rotate device to landscape
3. Use responsive UI controls
4. Update browser to latest version

## Security Considerations

**Current Implementation:**
- No authentication
- No SSL/TLS
- Local network only
- Game codes are simple

**For Public Deployment:**
- Add authentication
- Use HTTPS
- Implement game code validation
- Add rate limiting
- Use secure WebSockets (wss://)

## Performance

**Network Requirements:**
- Bandwidth: < 1 Mbps per player
- Latency: < 100ms recommended
- Good for local Wi-Fi
- May struggle on poor connections

**Server Requirements:**
- CPU: Minimal (game is turn-based)
- RAM: ~100MB per game
- Concurrent games: Limited by RAM
- Can run on Raspberry Pi

## Development

### Running Locally

```bash
# Terminal 1: Start server
npm run server

# Terminal 2: Start client
npm run dev

# Or combined:
npm start
```

### Testing Multiplayer

1. Open multiple browser tabs
2. First tab: Host game
3. Other tabs: Join with code
4. Test cross-tab communication

### Debugging

Enable debug mode in `src/App.tsx`:
```typescript
debug: true
```

Shows:
- Game state
- WebSocket messages
- Move history
- AI decisions (in console)

## Future Enhancements

### Planned Features
- [ ] Online matchmaking
- [ ] Game lobby browser
- [ ] Player avatars
- [ ] Chat system
- [ ] Spectator mode
- [ ] Game replay
- [ ] Statistics tracking
- [ ] Tournament mode

### Nice to Have
- [ ] Voice chat integration
- [ ] Animated emotes
- [ ] Custom game rules
- [ ] Save/load games
- [ ] AI difficulty levels
- [ ] Player rankings

## API Reference

### Server Endpoints

```javascript
// Create match
POST /games/bang/create
Body: { numPlayers: 4 }
Response: { matchID: "abc123" }

// Join match
POST /games/bang/abc123/join
Body: { playerID: "0", playerName: "Alice" }
Response: { playerCredentials: "secret" }

// Get match
GET /games/bang/abc123
Response: { players: [...], setupData: {...} }
```

### Client API

```typescript
// Connect to game
const client = Client({
  game: BangGame,
  board: GameBoard,
  multiplayer: SocketIO({ server: 'http://localhost:8000' })
});

// Join with credentials
<BangClient
  matchID="abc123"
  playerID="0"
  credentials="secret"
/>
```

## Conclusion

The multiplayer system allows flexible game hosting:
- **Local:** Quick solo play vs AI
- **Network:** Social play with friends
- **Mixed:** Humans + AI together
- **Mobile:** Play from anywhere in room

Perfect for parties, game nights, or online sessions with friends!

🎮 Enjoy playing Bang! together! 🤠
