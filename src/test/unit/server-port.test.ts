/**
 * Server port management tests
 * Tests automatic port selection when preferred port is unavailable
 */

import { describe, it, expect, vi } from 'vitest';
import * as portUtils from '../../server/port-utils';

describe('Server Port Management', () => {
  describe('findAvailablePort', () => {
    it('should return the preferred port when available', async () => {
      // Mock port checker that returns true
      const mockCheckPort = vi.fn().mockResolvedValue(true);

      const port = await portUtils.findAvailablePort(8000, 10, mockCheckPort);
      expect(port).toBe(8000);
      expect(mockCheckPort).toHaveBeenCalledWith(8000);
    });

    it('should find next available port when preferred port is in use', async () => {
      // Mock: 8000 is busy, 8001 is available
      const mockCheckPort = vi
        .fn()
        .mockResolvedValueOnce(false) // 8000 busy
        .mockResolvedValueOnce(true); // 8001 available

      const port = await portUtils.findAvailablePort(8000, 10, mockCheckPort);
      expect(port).toBe(8001);
      expect(mockCheckPort).toHaveBeenCalledTimes(2);
      expect(mockCheckPort).toHaveBeenNthCalledWith(1, 8000);
      expect(mockCheckPort).toHaveBeenNthCalledWith(2, 8001);
    });

    it('should find next available port when multiple ports are occupied', async () => {
      // Mock: 8000, 8001, 8002 busy, 8003 available
      const mockCheckPort = vi
        .fn()
        .mockResolvedValueOnce(false) // 8000
        .mockResolvedValueOnce(false) // 8001
        .mockResolvedValueOnce(false) // 8002
        .mockResolvedValueOnce(true); // 8003

      const port = await portUtils.findAvailablePort(8000, 10, mockCheckPort);
      expect(port).toBe(8003);
      expect(mockCheckPort).toHaveBeenCalledTimes(4);
    });

    it('should try up to maxAttempts before giving up', async () => {
      // Mock: all ports busy
      const mockCheckPort = vi.fn().mockResolvedValue(false);

      // With maxAttempts=5, should fail after trying 5 ports
      await expect(
        portUtils.findAvailablePort(8000, 5, mockCheckPort)
      ).rejects.toThrow('Could not find available port after 5 attempts');

      expect(mockCheckPort).toHaveBeenCalledTimes(5);
    });

    it('should respect custom maxAttempts parameter', async () => {
      // Mock: first 2 ports busy, third available
      const mockCheckPort = vi
        .fn()
        .mockResolvedValueOnce(false) // 8000
        .mockResolvedValueOnce(false) // 8001
        .mockResolvedValueOnce(true); // 8002

      // Should succeed with maxAttempts=3
      const port = await portUtils.findAvailablePort(8000, 3, mockCheckPort);
      expect(port).toBe(8002);
      expect(mockCheckPort).toHaveBeenCalledTimes(3);
    });
  });

  describe('isPortAvailable', () => {
    it('should exist and be a function', () => {
      expect(portUtils.isPortAvailable).toBeDefined();
      expect(typeof portUtils.isPortAvailable).toBe('function');
    });
  });
});
