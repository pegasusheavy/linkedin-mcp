import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Logger } from './logger.js';

describe('Logger', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create logger with default log level info', () => {
      const logger = new Logger();
      logger.info('test');
      expect(console.info).toHaveBeenCalled();
    });

    it('should create logger with specified log level', () => {
      const logger = new Logger('debug');
      logger.debug('test');
      expect(console.debug).toHaveBeenCalled();
    });
  });

  describe('debug', () => {
    it('should log debug messages when log level is debug', () => {
      const logger = new Logger('debug');
      logger.debug('test message', { data: 'test' });
      expect(console.debug).toHaveBeenCalledWith('[DEBUG] test message', { data: 'test' });
    });

    it('should not log debug messages when log level is info', () => {
      const logger = new Logger('info');
      logger.debug('test message');
      expect(console.debug).not.toHaveBeenCalled();
    });

    it('should not log debug messages when log level is warn', () => {
      const logger = new Logger('warn');
      logger.debug('test message');
      expect(console.debug).not.toHaveBeenCalled();
    });
  });

  describe('info', () => {
    it('should log info messages when log level is info', () => {
      const logger = new Logger('info');
      logger.info('test message', { data: 'test' });
      expect(console.info).toHaveBeenCalledWith('[INFO] test message', { data: 'test' });
    });

    it('should log info messages when log level is debug', () => {
      const logger = new Logger('debug');
      logger.info('test message');
      expect(console.info).toHaveBeenCalled();
    });

    it('should not log info messages when log level is warn', () => {
      const logger = new Logger('warn');
      logger.info('test message');
      expect(console.info).not.toHaveBeenCalled();
    });
  });

  describe('warn', () => {
    it('should log warn messages when log level is warn', () => {
      const logger = new Logger('warn');
      logger.warn('test message', { data: 'test' });
      expect(console.warn).toHaveBeenCalledWith('[WARN] test message', { data: 'test' });
    });

    it('should log warn messages when log level is info', () => {
      const logger = new Logger('info');
      logger.warn('test message');
      expect(console.warn).toHaveBeenCalled();
    });

    it('should not log warn messages when log level is error', () => {
      const logger = new Logger('error');
      logger.warn('test message');
      expect(console.warn).not.toHaveBeenCalled();
    });
  });

  describe('error', () => {
    it('should log error messages at all log levels', () => {
      const levels: Array<'debug' | 'info' | 'warn' | 'error'> = ['debug', 'info', 'warn', 'error'];

      levels.forEach((level) => {
        vi.clearAllMocks();
        const logger = new Logger(level);
        logger.error('test message', { data: 'test' });
        expect(console.error).toHaveBeenCalledWith('[ERROR] test message', { data: 'test' });
      });
    });
  });
});

