import { Router, Response, NextFunction } from 'express';
import { userAuth } from '../middleware/userAuth';
import { validate } from '../middleware/validate';
import { RegisterAgentAsUserSchema } from '../utils/validators';
import { getUserWithAgents, registerAgentForUser } from '../services/userService';
import { AuthenticatedUserRequest } from '../types';

const router = Router();

// GET /users/me
router.get('/me', userAuth,
  async (req: AuthenticatedUserRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user!;
      const result = await getUserWithAgents(user.id);
      if (!result) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } }); return; }
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// POST /users/me/agents
router.post('/me/agents', userAuth, validate(RegisterAgentAsUserSchema),
  async (req: AuthenticatedUserRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user!;
      const body = req.body as { name: string; description?: string };
      const result = await registerAgentForUser(user.id, { ...body, owner_email: user.email });
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
