import crypto from 'crypto';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export function hashSHA256(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateSecureToken(length = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

export function generateApiKey(): { key: string; prefix: string; hash: string } {
  const randomPart = crypto.randomBytes(24).toString('base64url');
  const key = `clawkey_live_${randomPart}`;
  const prefix = key.substring(0, 12);
  const hash = hashSHA256(key);
  return { key, prefix, hash };
}

export function generateClawId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'claw_';
  const bytes = crypto.randomBytes(12);
  for (let i = 0; i < 12; i++) {
    result += chars[bytes[i]! % chars.length];
  }
  return result;
}

export function generateLoginCode(): string {
  const part1 = crypto.randomBytes(2).toString('hex').toUpperCase();
  const part2 = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `CLAW-${part1}-${part2}`;
}

export function generateOAuthCode(): string {
  return `auth_${crypto.randomBytes(24).toString('base64url')}`;
}

export function generateClientId(): string {
  return `app_${crypto.randomBytes(12).toString('hex')}`;
}

export function generateSessionToken(prefix = 'sess'): string {
  return `${prefix}_${crypto.randomBytes(24).toString('base64url')}`;
}
