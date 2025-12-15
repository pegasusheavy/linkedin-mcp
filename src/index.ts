#!/usr/bin/env node

import { LinkedInMCPServer } from './server.js';
import { getConfig, validateConfig, needsOAuth } from './config.js';
import { OAuthManager } from './oauth-manager.js';
import { Logger } from './logger.js';

async function main() {
  try {
    const config = getConfig();
    validateConfig(config);

    // Check if we need to run OAuth flow
    if (needsOAuth(config)) {
      const logger = new Logger(config.logLevel);
      logger.info('No access token found. Starting OAuth authentication flow...');
      logger.info('');

      const oauthManager = new OAuthManager({
        clientId: config.linkedInClientId!,
        clientSecret: config.linkedInClientSecret!,
        redirectUri: config.linkedInRedirectUri!,
      }, logger);

      // Run OAuth flow and get access token
      const accessToken = await oauthManager.getAccessToken();

      // Update config with the new token
      config.linkedInAccessToken = accessToken;

      logger.info('💡 Tip: Save this token to your .env file to skip OAuth next time:');
      logger.info(`   LINKEDIN_ACCESS_TOKEN=${accessToken}`);
      logger.info('');
    }

    const server = new LinkedInMCPServer(config);
    await server.start();

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      await server.stop();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await server.stop();
      process.exit(0);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();

