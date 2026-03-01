import { queryOne } from '../config/database';
import { Agent } from '../types';

export interface VerificationResult {
  valid: boolean;
  claw_id: string;
  name?: string;
  trust_score?: number;
  is_verified?: boolean;
  message?: string;
}

export async function verifyAgent(
  targetClawId: string,
  requesterAgentId?: string,
  ipAddress?: string
): Promise<VerificationResult> {
  const agent = await queryOne<Agent>('SELECT * FROM agents WHERE claw_id = $1', [targetClawId]);

  const result: VerificationResult = agent
    ? { valid: true, claw_id: targetClawId, name: agent.name, trust_score: agent.trust_score, is_verified: agent.is_verified }
    : { valid: false, claw_id: targetClawId, message: 'Agent not found' };

  // Log verification
  await queryOne(
    `INSERT INTO verification_log (requester_agent_id, target_claw_id, result, ip_address)
     VALUES ($1, $2, $3, $4)`,
    [requesterAgentId ?? null, targetClawId, result.valid, ipAddress ?? null]
  );

  return result;
}
