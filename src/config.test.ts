import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getConfig, validateConfig } from './config.js';

describe('Config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('getConfig', () => {
    it('should return config from environment variables', () => {
      process.env.LINKEDIN_ACCESS_TOKEN = 'test-token';
      process.env.PORT = '3001';
      process.env.LOG_LEVEL = 'debug';

      const config = getConfig();

      expect(config.linkedInAccessToken).toBe('test-token');
      expect(config.port).toBe(3001);
      expect(config.logLevel).toBe('debug');
    });

    it('should use default values when env vars are not set', () => {
      delete process.env.LINKEDIN_ACCESS_TOKEN;
      delete process.env.PORT;
      delete process.env.LOG_LEVEL;

      const config = getConfig();

      expect(config.linkedInAccessToken).toBeUndefined();
      expect(config.port).toBe(3000);
      expect(config.logLevel).toBe('info');
    });

    it('should parse PORT as integer', () => {
      process.env.PORT = '8080';

      const config = getConfig();

      expect(config.port).toBe(8080);
    });
  });

  describe('validateConfig', () => {
    it('should throw error when LINKEDIN_ACCESS_TOKEN is missing', () => {
      const config = getConfig();
      delete config.linkedInAccessToken;

      expect(() => validateConfig(config)).toThrow('LINKEDIN_ACCESS_TOKEN is required');
    });

    it('should not throw error for valid config', () => {
      const config = {
        linkedInAccessToken: 'test-token',
      };

      expect(() => validateConfig(config)).not.toThrow();
    });
  });
});

