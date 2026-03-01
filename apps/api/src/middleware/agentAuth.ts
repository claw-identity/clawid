import { Response, NextFunction } from 'express';
import { hashSHA256 } from '../utils/crypto';
import { queryOne } from '../config/database';
import { Agent, ApiKey, AuthenticatedAgentRequest, ApiResponse } from '../types';

export async function agentAuth(
  req: AuthenticatedAgentRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Missing or invalid Authorization header. Expected: Bearer <api_key>',
      },
    };
    res.status(401).json(response);
    return;
  }

  const apiKey = authHeader.substring(7);

  if (!apiKey.startsWith('clawkey_live_')) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid API key format',
      },
    };
    res.status(401).json(response);
    return;
  }

  try {
    const keyHash = hashSHA256(apiKey);
    const keyPrefix = apiKey.substring(0, 12);

    const apiKeyRecord = await queryOne<ApiKey>(
      `SELECT * FROM api_keys WHERE key_hash = $1 AND key_prefix = $2
       AND (expires_at IS NULL OR expires_at > NOW())`,
      [keyHash, keyPrefix]
    );

    if (!apiKeyRecord) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired API key',
        },
      };
      res.status(401).json(response);
      return;
    }

    const agent = await queryOne<Agent>(
      'SELECT * FROM agents WHERE id = $1',
      [apiKeyRecord.agent_id]
    );

    if (!agent) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Agent not found',
        },
      };
      res.status(401).json(response);
      return;
    }

    // Update last_used_at
    await queryOne(
      'UPDATE api_keys SET last_used_at = NOW() WHERE id = $1',
      [apiKeyRecord.id]
    );

    req.agent = agent;
    req.apiKey = apiKeyRecord;
    next();
  } catch (err) {
    next(err);
  }
}

export async function optionalAgentAuth(
  req: AuthenticatedAgentRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next();
    return;
  }

  const apiKey = authHeader.substring(7);

  if (!apiKey.startsWith('clawkey_live_')) {
    next();
    return;
  }

  try {
    const keyHash = hashSHA256(apiKey);
    const keyPrefix = apiKey.substring(0, 12);

    const apiKeyRecord = await queryOne<ApiKey>(
      `SELECT * FROM api_keys WHERE key_hash = $1 AND key_prefix = $2
       AND (expires_at IS NULL OR expires_at > NOW())`,
      [keyHash, keyPrefix]
    );

    if (apiKeyRecord) {
      const agent = await queryOne<Agent>(
        'SELECT * FROM agents WHERE id = $1',
        [apiKeyRecord.agent_id]
      );
      if (agent) {
        req.agent = agent;
        req.apiKey = apiKeyRecord;
      }
    }

    next();
  } catch {
    next();
  }
}
