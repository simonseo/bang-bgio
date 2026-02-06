// Bang! Multiplayer Server
// Run with: node server.js
//
// NOTE: This is a placeholder server for development.
// The game logic is loaded from the client-side build.
// For production, you should build the server separately.

const { Server, Origins } = require('boardgame.io/server');
const { findAvailablePort } = require('./src/server/port-utils.cjs');

// Minimal game definition for server
// The actual game logic runs on the client
const BangGame = {
  name: 'bang',
  minPlayers: 4,
  maxPlayers: 7,

  setup: () => ({
    placeholder: true,
    message: 'Game state will be loaded from client'
  }),

  moves: {},
};

const server = Server({
  games: [BangGame],

  origins: [
    // Allow connections from any origin (for local network play)
    Origins.LOCALHOST_IN_DEVELOPMENT,
    /^https?:\/\/.*$/,
  ],
});

const PREFERRED_PORT = parseInt(process.env.PORT || '8000', 10);

// Start server with automatic port finding
const startServer = async () => {
  try {
    // Try to find an available port starting from the preferred port
    const port = await findAvailablePort(PREFERRED_PORT, 10);

    if (port !== PREFERRED_PORT) {
      console.log(`⚠️  Port ${PREFERRED_PORT} is in use, using port ${port} instead`);
    }

    await server.run(port, () => {
      console.log('🤠 Bang! Multiplayer Server Running');
      console.log('=====================================');
      console.log(`📡 Server: http://localhost:${port}`);
      console.log('');
      console.log('⚠️  NOTE: This is a placeholder server.');
      console.log('    Game logic runs on the client side.');
      console.log('    For full multiplayer, the client needs to connect.');
      console.log('');
      console.log('🎮 Players can connect from:');
      console.log('   - Same computer: http://localhost:3000');
      console.log('   - Local network: http://[YOUR-IP]:3000');
      console.log('');
      console.log('💡 To find your IP:');
      console.log('   - Windows: ipconfig');
      console.log('   - Mac/Linux: ifconfig');
      console.log('');
      console.log('📱 Mobile players: Use the local network IP');
      console.log('');
      console.log('💡 To use a specific port: PORT=8001 npm run server');
      console.log('');
    });
  } catch (error) {
    if (error.message && error.message.includes('Could not find available port')) {
      console.error('❌ Error: Could not find an available port!');
      console.error('');
      console.error('Tried ports', PREFERRED_PORT, 'through', PREFERRED_PORT + 9);
      console.error('');
      console.error('💡 Solutions:');
      console.error('   1. Kill processes using these ports');
      console.error('   2. Use a different port range: PORT=9000 npm run server');
      console.error('');
      process.exit(1);
    } else {
      console.error('❌ Server error:', error.message);
      process.exit(1);
    }
  }
};

startServer();
