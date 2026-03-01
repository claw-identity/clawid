import { Router, Request, Response, NextFunction } from 'express';
import { queryOne } from '../config/database';

const router = Router();

// GET /stats
router.get('/', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const agentsRow = await queryOne<{ count: string }>('SELECT COUNT(*) FROM agents');
    const verifyRow = await queryOne<{ count: string }>('SELECT COUNT(*) FROM verification_log');

    res.json({
      success: true,
      data: {
        agents_registered: parseInt(agentsRow?.count ?? '0', 10),
        verifications_total: parseInt(verifyRow?.count ?? '0', 10),
        platforms_integrated: 23,
        online: true,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
