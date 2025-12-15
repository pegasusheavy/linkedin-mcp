import { ServerConfig } from './types.js';

// Get configuration from environment variables (set by MCP client)
export function getConfig(): ServerConfig {
  return {
    linkedInAccessToken: process.env.LINKEDIN_ACCESS_TOKEN,
    linkedInClientId: process.env.LINKEDIN_CLIENT_ID,
    linkedInClientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    linkedInRedirectUri: process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:50001/callback',
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 50001,
    logLevel: (process.env.LOG_LEVEL as ServerConfig['logLevel']) || 'info',
  };
}

export function validateConfig(config: ServerConfig): void {
  const errors: string[] = [];

  // Check if we have either an access token OR OAuth credentials
  const hasAccessToken = !!config.linkedInAccessToken;
  const hasOAuthCreds = !!(config.linkedInClientId && config.linkedInClientSecret);

  if (!hasAccessToken && !hasOAuthCreds) {
    errors.push('Either LINKEDIN_ACCESS_TOKEN or (LINKEDIN_CLIENT_ID + LINKEDIN_CLIENT_SECRET) is required');
    errors.push('');
    errors.push('Option 1: Provide an existing access token');
    errors.push('  LINKEDIN_ACCESS_TOKEN=your_token_here');
    errors.push('');
    errors.push('Option 2: Provide OAuth credentials for automatic authentication');
    errors.push('  LINKEDIN_CLIENT_ID=your_client_id');
    errors.push('  LINKEDIN_CLIENT_SECRET=your_client_secret');
    errors.push('  LINKEDIN_REDIRECT_URI=http://localhost:3000/callback (optional)');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
}

export function needsOAuth(config: ServerConfig): boolean {
  return !config.linkedInAccessToken && !!(config.linkedInClientId && config.linkedInClientSecret);
}

