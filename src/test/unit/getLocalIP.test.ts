/**
 * Tests for local IP detection utility
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getLocalIP, getConnectionInfo } from '../../utils/getLocalIP';

describe('getLocalIP', () => {
  beforeEach(() => {
    // Mock RTCPeerConnection
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should return localhost when RTCPeerConnection is not available', async () => {
    // Mock window without RTCPeerConnection
    const originalRTC = (global as any).RTCPeerConnection;
    (global as any).RTCPeerConnection = undefined;

    const ip = await getLocalIP();
    expect(ip).toBe('localhost');

    (global as any).RTCPeerConnection = originalRTC;
  });

  it('should detect local network IP (192.168.x.x)', async () => {
    // Mock RTCPeerConnection that returns a local IP
    const mockPeerConnection = {
      createDataChannel: vi.fn(),
      createOffer: vi.fn().mockResolvedValue({}),
      setLocalDescription: vi.fn().mockResolvedValue(undefined),
      onicecandidate: null as any,
      close: vi.fn(),
    };

    (global as any).RTCPeerConnection = vi.fn(() => mockPeerConnection);

    const ipPromise = getLocalIP();

    // Wait for promise chain to complete so onicecandidate handler is set
    await Promise.resolve();
    await Promise.resolve();

    // Now simulate ICE candidate with local IP
    if (mockPeerConnection.onicecandidate) {
      mockPeerConnection.onicecandidate({
        candidate: {
          candidate: 'candidate:1 1 UDP 2130706431 192.168.1.100 54321 typ host',
        },
      });
    }

    const ip = await ipPromise;
    expect(ip).toBe('192.168.1.100');
    expect(mockPeerConnection.close).toHaveBeenCalled();
  });

  it('should detect local network IP (10.x.x.x)', async () => {
    const mockPeerConnection = {
      createDataChannel: vi.fn(),
      createOffer: vi.fn().mockResolvedValue({}),
      setLocalDescription: vi.fn().mockResolvedValue(undefined),
      onicecandidate: null as any,
      close: vi.fn(),
    };

    (global as any).RTCPeerConnection = vi.fn(() => mockPeerConnection);

    const ipPromise = getLocalIP();

    // Wait for promise chain to complete
    await Promise.resolve();
    await Promise.resolve();

    // Simulate ICE candidate
    if (mockPeerConnection.onicecandidate) {
      mockPeerConnection.onicecandidate({
        candidate: {
          candidate: 'candidate:1 1 UDP 2130706431 10.0.1.50 54321 typ host',
        },
      });
    }

    const ip = await ipPromise;
    expect(ip).toBe('10.0.1.50');
  });

  it('should skip loopback addresses (127.x.x.x)', async () => {
    const mockPeerConnection = {
      createDataChannel: vi.fn(),
      createOffer: vi.fn().mockResolvedValue({}),
      setLocalDescription: vi.fn().mockResolvedValue(undefined),
      onicecandidate: null as any,
      close: vi.fn(),
    };

    (global as any).RTCPeerConnection = vi.fn(() => mockPeerConnection);

    const ipPromise = getLocalIP();

    // Wait for promise chain to complete
    await Promise.resolve();
    await Promise.resolve();

    // Send loopback (should be ignored)
    if (mockPeerConnection.onicecandidate) {
      mockPeerConnection.onicecandidate({
        candidate: {
          candidate: 'candidate:1 1 UDP 2130706431 127.0.0.1 54321 typ host',
        },
      });
    }

    // Advance time to trigger timeout
    vi.advanceTimersByTime(2000);

    const ip = await ipPromise;
    expect(ip).toBe('localhost');
  });

  it('should timeout after 2 seconds if no valid IP found', async () => {
    const mockPeerConnection = {
      createDataChannel: vi.fn(),
      createOffer: vi.fn().mockResolvedValue({}),
      setLocalDescription: vi.fn().mockResolvedValue(undefined),
      onicecandidate: null as any,
      close: vi.fn(),
    };

    (global as any).RTCPeerConnection = vi.fn(() => mockPeerConnection);

    const ipPromise = getLocalIP();

    // Wait for promise chain to complete
    await Promise.resolve();
    await Promise.resolve();

    // Don't send any candidates, just advance time to timeout
    vi.advanceTimersByTime(2000);

    const ip = await ipPromise;
    expect(ip).toBe('localhost');
    expect(mockPeerConnection.close).toHaveBeenCalled();
  });
});

describe('getConnectionInfo', () => {
  it('should return connection info with localhost', async () => {
    // Mock RTCPeerConnection to return localhost
    const originalRTC = (global as any).RTCPeerConnection;
    (global as any).RTCPeerConnection = undefined;

    const info = await getConnectionInfo(3000);
    expect(info.localIP).toBe('localhost');
    expect(info.connectionURL).toBe('http://localhost:3000');

    (global as any).RTCPeerConnection = originalRTC;
  });

  it('should return connection info with local IP', async () => {
    // Mock RTCPeerConnection that returns a local IP
    const mockPeerConnection = {
      createDataChannel: vi.fn(),
      createOffer: vi.fn().mockResolvedValue({}),
      setLocalDescription: vi.fn().mockResolvedValue(undefined),
      onicecandidate: null as any,
      close: vi.fn(),
    };

    (global as any).RTCPeerConnection = vi.fn(() => mockPeerConnection);

    // Start getting connection info
    const infoPromise = getConnectionInfo(3000);

    // Wait for promise chain
    await Promise.resolve();
    await Promise.resolve();

    // Simulate ICE candidate
    if (mockPeerConnection.onicecandidate) {
      mockPeerConnection.onicecandidate({
        candidate: {
          candidate: 'candidate:1 1 UDP 2130706431 192.168.1.100 54321 typ host',
        },
      });
    }

    const info = await infoPromise;
    expect(info.localIP).toBe('192.168.1.100');
    expect(info.connectionURL).toBe('http://192.168.1.100:3000');
  });

  it('should use custom port', async () => {
    // Mock RTCPeerConnection that returns a local IP
    const mockPeerConnection = {
      createDataChannel: vi.fn(),
      createOffer: vi.fn().mockResolvedValue({}),
      setLocalDescription: vi.fn().mockResolvedValue(undefined),
      onicecandidate: null as any,
      close: vi.fn(),
    };

    (global as any).RTCPeerConnection = vi.fn(() => mockPeerConnection);

    // Start getting connection info with custom port
    const infoPromise = getConnectionInfo(8080);

    // Wait for promise chain
    await Promise.resolve();
    await Promise.resolve();

    // Simulate ICE candidate
    if (mockPeerConnection.onicecandidate) {
      mockPeerConnection.onicecandidate({
        candidate: {
          candidate: 'candidate:1 1 UDP 2130706431 10.0.1.50 54321 typ host',
        },
      });
    }

    const info = await infoPromise;
    expect(info.connectionURL).toBe('http://10.0.1.50:8080');
  });
});
