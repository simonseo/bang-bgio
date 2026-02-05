# Network Multiplayer Setup

## Quick Start

### Local Development (Single Computer)
```bash
npm start
```
- Client: http://localhost:3000
- Server: http://localhost:8000

### Network Play (LAN/WiFi)
```bash
npm run start:host
```
- Client: http://[YOUR-IP]:3000
- Server: http://[YOUR-IP]:8000

## Finding Your IP Address

**Mac/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows:**
```bash
ipconfig
```

Look for "IPv4 Address" on your active network adapter.

## Configuration Details

### Vite Dev Server (Port 3000)
The vite.config.ts now includes:
```typescript
server: {
  port: 3000,
  host: true,        // Listen on all network interfaces (0.0.0.0)
  strictPort: false, // Allow fallback to another port if 3000 is in use
}
```

### Game Server (Port 8000)
The server.cjs:
- Listens on port 8000 (or PORT env variable)
- Accepts connections from all origins (CORS enabled)
- Provides helpful error messages for port conflicts

## NPM Scripts

- `npm run dev` - Start client only (localhost only)
- `npm run dev:host` - Start client with network access
- `npm run server` - Start game server only
- `npm start` - Start both (localhost only)
- `npm run start:host` - Start both with network access ✅

## Troubleshooting

### Port 8000 Already in Use

**Error:**
```
❌ Error: Port 8000 is already in use!
```

**Solution 1:** Kill the process
```bash
lsof -ti:8000 | xargs kill -9
```

**Solution 2:** Use different port
```bash
PORT=8001 npm run server
```

### Cannot Connect from Another Device

1. **Check firewall:** Allow ports 3000 and 8000
2. **Verify IP:** Make sure you're using the correct local IP
3. **Same network:** All devices must be on the same WiFi/LAN
4. **Use start:host:** Make sure you ran `npm run start:host`, not just `npm start`

### Client Shows "Cannot connect to server"

1. **Server running?** Check if `npm run server` is running
2. **Port 8000 open?** Verify server started without errors
3. **Correct URL?** In NetworkLobby.tsx, check server URL configuration

## Security Notes

⚠️ **Development Only**
- The current CORS config (`/^https?:\/\/.*$/`) accepts all origins
- This is fine for local development but **NOT for production**
- For production, specify exact allowed origins

## Next Steps for Production

1. Build the game with actual game logic in server.cjs
2. Configure proper CORS origins
3. Add authentication/authorization
4. Use environment variables for configuration
5. Deploy to a hosting service (Heroku, Railway, etc.)
6. See DEPLOYMENT.md for full production setup

## Related Files

- `vite.config.ts` - Vite dev server configuration
- `server.cjs` - Multiplayer game server
- `package.json` - NPM scripts
- `src/components/NetworkLobby.tsx` - Client connection logic
