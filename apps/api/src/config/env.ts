import dotenv from 'dotenv';

dotenv.config();

function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const config = {
  port: parseInt(process.env['API_PORT'] ?? '3001', 10),
  nodeEnv: process.env['NODE_ENV'] ?? 'development',
  apiUrl: process.env['API_URL'] ?? 'http://localhost:3001',

  database: {
    url: requireEnv('DATABASE_URL', 'postgresql://postgres:password@localhost:5432/clawid'),
  },

  redis: {
    url: process.env['REDIS_URL'] ?? 'redis://localhost:6379',
  },

  security: {
    apiSecret: requireEnv('API_SECRET', 'dev-api-secret-change-in-production-64-chars-long-string'),
    jwtSecret: requireEnv('JWT_SECRET', 'dev-jwt-secret-change-in-production-64-chars-long-string'),
  },

  rateLimit: {
    windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] ?? '60000', 10),
    maxRequests: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] ?? '100', 10),
  },

  cors: {
    origins: (process.env['CORS_ORIGINS'] ?? 'http://localhost:3000').split(','),
  },
};
