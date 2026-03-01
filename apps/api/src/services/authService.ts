import { query, queryOne } from '../config/database';
import { generateLoginCode, hashSHA256 } from '../utils/crypto';
import { Agent, LoginCode } from '../types';

export async function requestLoginCode(clawId: string): Promise<{ code: string; expires_in: number }> {
  const agent = await queryOne<Agent>('SELECT * FROM agents WHERE claw_id = $1', [clawId]);
  if (!agent) {
    throw Object.assign(new Error('Agent not found'), { code: 'NOT_FOUND', status: 404 });
  }

  // Invalidate previous codes
  await query('UPDATE login_codes SET used = TRUE WHERE agent_id = $1 AND used = FALSE', [agent.id]);

  const code = generateLoginCode();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  await queryOne(
    'INSERT INTO login_codes (code, agent_id, expires_at) VALUES ($1, $2, $3)',
    [code, agent.id, expiresAt]
  );

  return { code, expires_in: 300 };
}

export async function verifyLoginCode(
  clawId: string,
  code: string,
  apiKey: string
): Promise<{ session_token: string; expires_at: string }> {
  const agent = await queryOne<Agent>('SELECT * FROM agents WHERE claw_id = $1', [clawId]);
  if (!agent) {
    throw Object.assign(new Error('Agent not found'), { code: 'NOT_FOUND', status: 404 });
  }

  // Verify code
  const loginCode = await queryOne<LoginCode>(
    `SELECT * FROM login_codes
     WHERE code = $1 AND agent_id = $2 AND used = FALSE AND expires_at > NOW()`,
    [code, agent.id]
  );

  if (!loginCode) {
    throw Object.assign(new Error('Invalid or expired code'), { code: 'INVALID_CODE', status: 401 });
  }

  // Verify API key
  const keyHash = hashSHA256(apiKey);
  const keyPrefix = apiKey.substring(0, 12);
  const keyRecord = await queryOne(
    'SELECT id FROM api_keys WHERE agent_id = $1 AND key_hash = $2 AND key_prefix = $3',
    [agent.id, keyHash, keyPrefix]
  );

  if (!keyRecord) {
    throw Object.assign(new Error('Invalid API key'), { code: 'INVALID_API_KEY', status: 401 });
  }

  // Mark code as used
  await queryOne('UPDATE login_codes SET used = TRUE WHERE id = $1', [loginCode.id]);

  // Generate session token
  const { generateSessionToken } = await import('../utils/crypto');
  const { setSession } = await import('../config/redis');

  const sessionToken = generateSessionToken('sess_agent');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await setSession(sessionToken, { agentId: agent.id, clawId: agent.claw_id }, 3600);

  return { session_token: sessionToken, expires_at: expiresAt.toISOString() };
}
