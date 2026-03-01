import { Router, Request, Response } from 'express';
import agentsRouter from './agents';
import authRouter from './auth';
import verifyRouter from './verify';
import usersRouter from './users';
import statsRouter from './stats';
import oauthRouter from './oauth';

const router = Router();

// Health check
router.get('/health', (_req: Request, res: Response) => {
  res.json({ success: true, data: { status: 'ok', version: '1.0.0', timestamp: new Date().toISOString() } });
});

router.use('/agents', agentsRouter);
router.use('/auth', authRouter);
router.use('/verify', verifyRouter);
router.use('/users', usersRouter);
router.use('/stats', statsRouter);
router.use('/oauth', oauthRouter);

export default router;
