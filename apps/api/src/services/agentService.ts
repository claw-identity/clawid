import { query, queryOne } from '../config/database';
import { generateApiKey, generateClawId } from '../utils/crypto';
import { Agent, ApiKey } from '../types';

export interface RegisterAgentInput {
  name: string;
  description?: string;
  owner_email: string;
}

export interface RegisterAgentResult {
  claw_id: string;
  name: string;
  api_key: string;
  message: string;
}

export async function registerAgent(input: RegisterAgentInput): Promise<RegisterAgentResult> {
  let clawId = generateClawId();
  let attempts = 0;
  while (attempts < 5) {
    const existing = await queryOne('SELECT id FROM agents WHERE claw_id = $1', [clawId]);
    if (!existing) break;
    clawId = generateClawId();
    attempts++;
  }

  const agent = await queryOne<Agent>(
    `INSERT INTO agents (claw_id, name, description, owner_email)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [clawId, input.name, input.description ?? null, input.owner_email]
  );
  if (!agent) throw new Error('Failed to create agent');

  const { key, prefix, hash } = generateApiKey();
  await queryOne(
    `INSERT INTO api_keys (agent_id, key_hash, key_prefix, name) VALUES ($1, $2, $3, 'default')`,
    [agent.id, hash, prefix]
  );

  return {
    claw_id: agent.claw_id,
    name: agent.name,
    api_key: key,
    message: "Save your API key securely. It won't be shown again.",
  };
}

export async function getAgentByClawId(clawId: string): Promise<Agent | null> {
  return queryOne<Agent>('SELECT * FROM agents WHERE claw_id = $1', [clawId]);
}

export async function updateAgent(
  agentId: string,
  updates: Partial<Pick<Agent, 'name' | 'description' | 'avatar_url' | 'public_metadata'>>
): Promise<Agent | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let i = 1;
  if (updates.name !== undefined) { fields.push(`name = $${i++}`); values.push(updates.name); }
  if (updates.description !== undefined) { fields.push(`description = $${i++}`); values.push(updates.description); }
  if (updates.avatar_url !== undefined) { fields.push(`avatar_url = $${i++}`); values.push(updates.avatar_url); }
  if (updates.public_metadata !== undefined) { fields.push(`public_metadata = $${i++}`); values.push(JSON.stringify(updates.public_metadata)); }
  if (fields.length === 0) return null;
  values.push(agentId);
  return queryOne<Agent>(`UPDATE agents SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`, values);
}

export async function getAgentPublicProfile(clawId: string) {
  const agent = await queryOne<Agent>('SELECT * FROM agents WHERE claw_id = $1', [clawId]);
  if (!agent) return null;
  const platforms = await query<{ platform: string }>(
    'SELECT platform FROM linked_platforms WHERE agent_id = $1 AND verified = TRUE', [agent.id]
  );
  return {
    claw_id: agent.claw_id, name: agent.name, description: agent.description,
    avatar_url: agent.avatar_url, trust_score: agent.trust_score, is_verified: agent.is_verified,
    linked_platforms: platforms.map((p) => p.platform),
    public_metadata: agent.public_metadata, created_at: agent.created_at,
  };
}

export async function searchAgents(q?: string, limit = 10, offset = 0) {
  let agents: Agent[];
  let totalRows: { count: string }[];
  if (q) {
    const like = `%${q}%`;
    agents = await query<Agent>(
      `SELECT * FROM agents WHERE name ILIKE $1 OR claw_id ILIKE $1 OR description ILIKE $1
       ORDER BY trust_score DESC LIMIT $2 OFFSET $3`, [like, limit, offset]);
    totalRows = await query<{ count: string }>(
      'SELECT COUNT(*) FROM agents WHERE name ILIKE $1 OR claw_id ILIKE $1 OR description ILIKE $1', [like]);
  } else {
    agents = await query<Agent>('SELECT * FROM agents ORDER BY trust_score DESC LIMIT $1 OFFSET $2', [limit, offset]);
    totalRows = await query<{ count: string }>('SELECT COUNT(*) FROM agents');
  }
  return {
    agents: agents.map((a) => ({ claw_id: a.claw_id, name: a.name, description: a.description, trust_score: a.trust_score, is_verified: a.is_verified })),
    total: parseInt(totalRows[0]?.count ?? '0', 10), limit, offset,
  };
}

export async function getAgentApiKeys(agentId: string): Promise<ApiKey[]> {
  return query<ApiKey>('SELECT * FROM api_keys WHERE agent_id = $1 ORDER BY created_at DESC', [agentId]);
}
