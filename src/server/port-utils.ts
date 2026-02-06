/**
 * Server port utilities
 * Helper functions for finding available ports
 */

import net from 'net';

/**
 * Check if a port is available
 * @param port - Port number to check
 * @returns Promise resolving to true if port is available
 */
export async function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once('error', (err: NodeJS.ErrnoException) => {
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
 * @param preferredPort - The port to try first
 * @param maxAttempts - Maximum number of ports to try (default: 10)
 * @param checkPortFn - Optional function to check port availability (for testing)
 * @returns Promise resolving to an available port number
 * @throws Error if no available port found within maxAttempts
 */
export async function findAvailablePort(
  preferredPort: number,
  maxAttempts: number = 10,
  checkPortFn: (port: number) => Promise<boolean> = isPortAvailable
): Promise<number> {
  for (let i = 0; i < maxAttempts; i++) {
    const portToTry = preferredPort + i;
    const available = await checkPortFn(portToTry);
    if (available) {
      return portToTry;
    }
  }

  throw new Error(`Could not find available port after ${maxAttempts} attempts`);
}
