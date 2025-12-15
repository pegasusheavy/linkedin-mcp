#!/usr/bin/env node

import { LinkedInMCPServer } from './server.js';
import { getConfig, validateConfig } from './config.js';

async function main() {
  try {
    const config = getConfig();
    validateConfig(config);

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

