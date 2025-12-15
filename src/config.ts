import { config as dotenvConfig } from 'dotenv';
import { ServerConfig } from './types.js';

// Load environment variables
dotenvConfig();

export function getConfig(): ServerConfig {
  return {
    linkedInAccessToken: process.env.LINKEDIN_ACCESS_TOKEN,
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
    logLevel: (process.env.LOG_LEVEL as ServerConfig['logLevel']) || 'info',
  };
}

export function validateConfig(config: ServerConfig): void {
  const errors: string[] = [];

  if (!config.linkedInAccessToken) {
    errors.push('LINKEDIN_ACCESS_TOKEN is required');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
}

