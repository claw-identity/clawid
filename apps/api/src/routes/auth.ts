import { Router, Request, Response, NextFunction } from 'express';
import { validate } from '../middleware/validate';
import { authRateLimit } from '../middleware/rateLimit';
import { SignupSchema, LoginSchema, RequestLoginCodeSchema, VerifyLoginCodeSchema } from '../utils/validators';
import { signupUser, loginUser } from '../services/userService';
import { requestLoginCode, verifyLoginCode } from '../services/authService';

const router = Router();

// POST /auth/signup
router.post('/signup', authRateLimit, validate(SignupSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await signupUser(req.body as { email: string; password: string; name?: string });
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      const e = err as Error & { code?: string };
      if (e.code === 'EMAIL_EXISTS') { res.status(409).json({ success: false, error: { code: 'EMAIL_EXISTS', message: e.message } }); return; }
      next(err);
    }
  }
);

// POST /auth/login
router.post('/login', authRateLimit, validate(LoginSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await loginUser(req.body as { email: string; password: string });
      res.json({ success: true, data: result });
    } catch (err) {
      const e = err as Error & { code?: string };
      if (e.code === 'INVALID_CREDENTIALS') { res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: e.message } }); return; }
      next(err);
    }
  }
);

// POST /auth/code/request
router.post('/code/request', authRateLimit, validate(RequestLoginCodeSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { claw_id } = req.body as { claw_id: string };
      const result = await requestLoginCode(claw_id);
      res.json({ success: true, data: result });
    } catch (err) {
      const e = err as Error & { code?: string; status?: number };
      if (e.code === 'NOT_FOUND') { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: e.message } }); return; }
      next(err);
    }
  }
);

// POST /auth/code/verify
router.post('/code/verify', authRateLimit, validate(VerifyLoginCodeSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { claw_id, code, api_key } = req.body as { claw_id: string; code: string; api_key: string };
      const result = await verifyLoginCode(claw_id, code, api_key);
      res.json({ success: true, data: result });
    } catch (err) {
      const e = err as Error & { code?: string; status?: number };
      if (e.code) { res.status(e.status ?? 400).json({ success: false, error: { code: e.code, message: e.message } }); return; }
      next(err);
    }
  }
);

export default router;
