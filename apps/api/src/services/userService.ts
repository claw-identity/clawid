import { query, queryOne } from '../config/database';
import { hashPassword, verifyPassword, generateSessionToken } from '../utils/crypto';
import { setSession } from '../config/redis';
import { User } from '../types';

const SESSION_TTL = 7 * 24 * 60 * 60; // 7 days

export interface SignupInput {
  email: string;
  password: string;
  name?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export async function signupUser(input: SignupInput) {
  const existing = await queryOne<User>('SELECT id FROM users WHERE email = $1', [input.email]);
  if (existing) {
    throw Object.assign(new Error('Email already registered'), { code: 'EMAIL_EXISTS', status: 409 });
  }

  const passwordHash = await hashPassword(input.password);
  const user = await queryOne<User>(
    `INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING *`,
    [input.email, passwordHash, input.name ?? null]
  );
  if (!user) throw new Error('Failed to create user');

  const sessionToken = generateSessionToken('sess_human');
  await setSession(sessionToken, { userId: user.id, email: user.email }, SESSION_TTL);

  return {
    user: { id: user.id, email: user.email, name: user.name },
    session_token: sessionToken,
  };
}

export async function loginUser(input: LoginInput) {
  const user = await queryOne<User>('SELECT * FROM users WHERE email = $1', [input.email]);
  if (!user) {
    throw Object.assign(new Error('Invalid email or password'), { code: 'INVALID_CREDENTIALS', status: 401 });
  }

  const valid = await verifyPassword(input.password, user.password_hash);
  if (!valid) {
    throw Object.assign(new Error('Invalid email or password'), { code: 'INVALID_CREDENTIALS', status: 401 });
  }

  const sessionToken = generateSessionToken('sess_human');
  await setSession(sessionToken, { userId: user.id, email: user.email }, SESSION_TTL);

  return {
    user: { id: user.id, email: user.email, name: user.name },
    session_token: sessionToken,
  };
}

export async function getUserWithAgents(userId: string) {
  const user = await queryOne<User>('SELECT * FROM users WHERE id = $1', [userId]);
  if (!user) return null;

  const agents = await query<{ claw_id: string; name: string; trust_score: number; is_verified: boolean }>(
    `SELECT a.claw_id, a.name, a.trust_score, a.is_verified
     FROM agents a
     JOIN user_agents ua ON ua.agent_id = a.id
     WHERE ua.user_id = $1
     ORDER BY ua.created_at DESC`,
    [userId]
  );

  return { id: user.id, email: user.email, name: user.name, agents };
}

export async function registerAgentForUser(
  userId: string,
  input: { name: string; description?: string; owner_email: string }
) {
  const { registerAgent } = await import('./agentService');
  const result = await registerAgent(input);

  // Link agent to user
  const agent = await queryOne<{ id: string }>('SELECT id FROM agents WHERE claw_id = $1', [result.claw_id]);
  if (agent) {
    await queryOne(
      'INSERT INTO user_agents (user_id, agent_id, role) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
      [userId, agent.id, 'owner']
    );
  }

  return result;
}
