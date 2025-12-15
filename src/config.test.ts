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
      expect(config.port).toBe(50001);
      expect(config.logLevel).toBe('info');
    });

    it('should parse PORT as integer', () => {
      process.env.PORT = '8080';

      const config = getConfig();

      expect(config.port).toBe(8080);
    });
  });

  describe('validateConfig', () => {
    it('should throw error when neither access token nor OAuth credentials are provided', () => {
      const config = getConfig();
      delete config.linkedInAccessToken;
      delete config.linkedInClientId;
      delete config.linkedInClientSecret;

      expect(() => validateConfig(config)).toThrow('Either LINKEDIN_ACCESS_TOKEN or (LINKEDIN_CLIENT_ID + LINKEDIN_CLIENT_SECRET) is required');
    });

    it('should not throw error for valid config with access token', () => {
      const config = {
        linkedInAccessToken: 'test-token',
      };

      expect(() => validateConfig(config)).not.toThrow();
    });

    it('should not throw error for valid config with OAuth credentials', () => {
      const config = {
        linkedInClientId: 'test-client-id',
        linkedInClientSecret: 'test-client-secret',
        linkedInRedirectUri: 'http://localhost:50001/callback',
      };

      expect(() => validateConfig(config)).not.toThrow();
    });

    it('should throw error if only client ID is provided', () => {
      const config = {
        linkedInClientId: 'test-client-id',
      };

      expect(() => validateConfig(config)).toThrow();
    });
  });
});

