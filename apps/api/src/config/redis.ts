import { createClient } from 'redis';
import { config } from './env';

export const redis = createClient({
  url: config.redis.url,
});

redis.on('error', (err) => {
  console.error('Redis client error:', err);
});

redis.on('connect', () => {
  console.log('✅ Redis connected');
});

export async function connectRedis(): Promise<void> {
  await redis.connect();
}

export async function setSession(
  token: string,
  data: Record<string, unknown>,
  ttlSeconds: number
): Promise<void> {
  await redis.setEx(`session:${token}`, ttlSeconds, JSON.stringify(data));
}

export async function getSession(token: string): Promise<Record<string, unknown> | null> {
  const raw = await redis.get(`session:${token}`);
  if (!raw) return null;
  return JSON.parse(raw) as Record<string, unknown>;
}

export async function deleteSession(token: string): Promise<void> {
  await redis.del(`session:${token}`);
}
