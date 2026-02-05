# How to Start the Server

## Quick Start

### Option 1: Start Both Server and Client (Recommended)
```bash
npm start
```
This starts:
- Server on port 8000
- Client on port 3000

### Option 2: Start Separately

**Terminal 1 - Server:**
```bash
npm run server
```

**Terminal 2 - Client:**
```bash
npm run dev
```

## What Each Mode Needs

### Local Play (🤖)
- **Requires:** Only the client (npm run dev)
- **No server needed!**

### Host Game (🖥️) and Join Game (📱)
- **Requires:** Both server and client
- **Start with:** `npm start`

### Watch Game (👁️)
- **Requires:** Both server and client
- **Start with:** `npm start`

## Troubleshooting

### "Failed to fetch" Error
This means the server isn't running.

**Solution:**
```bash
# Kill any existing processes on port 8000
lsof -ti:8000 | xargs kill -9

# Start the server
npm run server
```

### Port Already in Use
```bash
# For port 8000 (server)
lsof -ti:8000 | xargs kill -9

# For port 3000 (client)
lsof -ti:3000 | xargs kill -9
```

## Current Status

Check what's running:
```bash
# Check if server is running
curl http://localhost:8000

# Check if client is running
curl http://localhost:3000
```

## Ports Used

- **8000** - Multiplayer server (boardgame.io)
- **3000** - React client (Vite dev server)

## Local vs Network

| Mode | Server Needed? | Command |
|------|---------------|---------|
| Local Play | ❌ No | `npm run dev` |
| Host Game | ✅ Yes | `npm start` |
| Join Game | ✅ Yes | `npm start` |
| Watch Game | ✅ Yes | `npm start` |

## Quick Commands

```bash
# Just play locally (no multiplayer)
npm run dev

# Full multiplayer experience
npm start

# Server only
npm run server

# Run tests
npm test

# Build for production
npm run build
```
