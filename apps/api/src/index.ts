import app from './app';
import { config } from './config/env';
import { testConnection } from './config/database';
import { connectRedis } from './config/redis';

async function start() {
  try {
    await testConnection();
    await connectRedis();

    app.listen(config.port, () => {
      console.log(`🦞 ClawID API running on port ${config.port}`);
      console.log(`   Environment: ${config.nodeEnv}`);
      console.log(`   API URL: ${config.apiUrl}/api/v1`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
