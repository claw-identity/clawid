import { Router, Request, Response, NextFunction } from 'express';
import { agentAuth } from '../middleware/agentAuth';
import { validate } from '../middleware/validate';
import { strictRateLimit } from '../middleware/rateLimit';
import {
  RegisterAgentSchema, UpdateAgentSchema, LinkPlatformSchema, SearchSchema, RegisterAgentSchema as SearchAgentSchema
} from '../utils/validators';
import {
  registerAgent, getAgentPublicProfile, updateAgent, searchAgents
} from '../services/agentService';
import { queryOne, query } from '../config/database';
import { generateSecureToken } from '../utils/crypto';
import { AuthenticatedAgentRequest, ApiResponse } from '../types';
import { z } from 'zod';

const SearchSchemaVal = z.object({
  q: z.string().max(100).optional(),
  limit: z.coerce.number().min(1).max(50).default(10),
  offset: z.coerce.number().min(0).default(0),
});

const router = Router();

// POST /agents/register
router.post(
  '/register',
  strictRateLimit,
  validate(RegisterAgentSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await registerAgent(req.body as { name: string; description?: string; owner_email: string });
      const response: ApiResponse = { success: true, data: result };
      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  }
);

// GET /agents/search
router.get(
  '/search',
  validate(SearchSchemaVal, 'query'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { q, limit, offset } = req.query as { q?: string; limit: string; offset: string };
      const result = await searchAgents(q, parseInt(limit as string, 10), parseInt(offset as string, 10));
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// GET /agents/me
router.get(
  '/me',
  agentAuth,
  async (req: AuthenticatedAgentRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const agent = req.agent!;
      const profile = await getAgentPublicProfile(agent.claw_id);
      res.json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /agents/me
router.patch(
  '/me',
  agentAuth,
  validate(UpdateAgentSchema),
  async (req: AuthenticatedAgentRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const agent = req.agent!;
      const updated = await updateAgent(agent.id, req.body as { name?: string; description?: string; avatar_url?: string | null; public_metadata?: Record<string, unknown> });
      if (!updated) {
        res.status(400).json({ success: false, error: { code: 'NO_CHANGES', message: 'No valid fields to update' } });
        return;
      }
      res.json({ success: true, data: { claw_id: updated.claw_id, name: updated.name, updated_at: updated.updated_at } });
    } catch (err) {
      next(err);
    }
  }
);

// POST /agents/me/platforms
router.post(
  '/me/platforms',
  agentAuth,
  validate(LinkPlatformSchema),
  async (req: AuthenticatedAgentRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const agent = req.agent!;
      const { platform, platform_user_id } = req.body as { platform: string; platform_user_id: string };
      const verificationCode = `VERIFY-${generateSecureToken(3).toUpperCase()}`;

      await queryOne(
        `INSERT INTO linked_platforms (agent_id, platform, platform_user_id, verification_code)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (agent_id, platform) DO UPDATE SET platform_user_id = $3, verification_code = $4, verified = FALSE`,
        [agent.id, platform, platform_user_id, verificationCode]
      );

      res.status(201).json({
        success: true,
        data: {
          platform,
          verification_code: verificationCode,
          instructions: `Post "${verificationCode}" to verify ownership on ${platform}`,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /agents/:claw_id
router.get(
  '/:claw_id',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { claw_id } = req.params;
      if (!claw_id || !/^claw_[a-z0-9]{12}$/.test(claw_id)) {
        res.status(400).json({ success: false, error: { code: 'INVALID_CLAW_ID', message: 'Invalid claw_id format' } });
        return;
      }
      const profile = await getAgentPublicProfile(claw_id);
      if (!profile) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Agent not found' } });
        return;
      }
      res.json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
