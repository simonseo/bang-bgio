/**
 * CommonJS wrapper for port utilities
 * Used by server.cjs
 */

const net = require('net');

/**
 * Check if a port is available
 * @param {number} port - Port number to check
 * @returns {Promise<boolean>} Promise resolving to true if port is available
 */
async function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        resolve(false);
      }
    });

    server.once('listening', () => {
      server.close(() => {
        resolve(true);
      });
    });

    server.listen(port);
  });
}

/**
 * Find an available port starting from the preferred port
 * @param {number} preferredPort - The port to try first
 * @param {number} maxAttempts - Maximum number of ports to try (default: 10)
 * @returns {Promise<number>} Promise resolving to an available port number
 * @throws {Error} if no available port found within maxAttempts
 */
async function findAvailablePort(preferredPort, maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    const portToTry = preferredPort + i;
    const available = await isPortAvailable(portToTry);
    if (available) {
      return portToTry;
    }
  }

  throw new Error(`Could not find available port after ${maxAttempts} attempts`);
}

module.exports = {
  isPortAvailable,
  findAvailablePort,
};
