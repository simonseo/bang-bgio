// Bang! Multiplayer Server
// Run with: node server.js
//
// NOTE: This is a placeholder server for development.
// The game logic is loaded from the client-side build.
// For production, you should build the server separately.

const { Server, Origins } = require('boardgame.io/server');

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

const PORT = process.env.PORT || 8000;

server.run(PORT, () => {
  console.log('🤠 Bang! Multiplayer Server Running');
  console.log('=====================================');
  console.log(`📡 Server: http://localhost:${PORT}`);
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
});
