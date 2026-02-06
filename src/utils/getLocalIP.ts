/**
 * Get local network IP address
 * Uses WebRTC to discover the local IP address for LAN play
 */

export async function getLocalIP(): Promise<string> {
  return new Promise((resolve) => {
    // Fallback if WebRTC is not available
    if (!window.RTCPeerConnection) {
      resolve('localhost');
      return;
    }

    const pc = new RTCPeerConnection({
      iceServers: []
    });

    // Create a dummy data channel
    pc.createDataChannel('');

    // Create an offer to trigger ICE candidate gathering
    pc.createOffer()
      .then(offer => pc.setLocalDescription(offer))
      .catch(() => {
        pc.close();
        resolve('localhost');
      });

    // Listen for ICE candidates
    let timeout: NodeJS.Timeout;

    pc.onicecandidate = (event) => {
      if (!event || !event.candidate || !event.candidate.candidate) {
        return;
      }

      const candidate = event.candidate.candidate;

      // Parse the candidate string to extract IP
      // Format: "candidate:... typ host" contains local IPs
      const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/;
      const ipMatch = candidate.match(ipRegex);

      if (ipMatch && ipMatch[1]) {
        const ip = ipMatch[1];

        // Filter out invalid IPs
        // We want local network IPs (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
        // Skip loopback (127.x.x.x) and link-local (169.254.x.x)
        if (
          ip.startsWith('192.168.') ||
          ip.startsWith('10.') ||
          /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)
        ) {
          clearTimeout(timeout);
          pc.close();
          resolve(ip);
          return;
        }
      }
    };

    // Timeout after 2 seconds
    timeout = setTimeout(() => {
      pc.close();
      resolve('localhost');
    }, 2000);
  });
}

/**
 * Get connection info for displaying to users
 * Returns both local IP and connection URL
 */
export async function getConnectionInfo(port: number = 3000): Promise<{
  localIP: string;
  connectionURL: string;
}> {
  const localIP = await getLocalIP();

  const connectionURL = localIP === 'localhost'
    ? `http://localhost:${port}`
    : `http://${localIP}:${port}`;

  return {
    localIP,
    connectionURL,
  };
}
