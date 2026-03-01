import { Router, Request, Response, NextFunction } from 'express';
import { validate } from '../middleware/validate';
import { VerifyAgentSchema } from '../utils/validators';
import { verifyAgent } from '../services/verificationService';
import { optionalAgentAuth } from '../middleware/agentAuth';
import { AuthenticatedAgentRequest } from '../types';

const router = Router();

// POST /verify
router.post('/', optionalAgentAuth, validate(VerifyAgentSchema),
  async (req: AuthenticatedAgentRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { claw_id } = req.body as { claw_id: string };
      const requesterAgentId = req.agent?.id;
      const ipAddress = req.ip;
      const result = await verifyAgent(claw_id, requesterAgentId, ipAddress);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
