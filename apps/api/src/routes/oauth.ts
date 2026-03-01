import { Router, Request, Response, NextFunction } from 'express';
import { validate } from '../middleware/validate';
import { OAuthTokenSchema } from '../utils/validators';
import {
  getOAuthApp, validateRedirectUri, createAuthorizationCode,
  exchangeCodeForToken, getAgentFromToken
} from '../services/oauthService';

const router = Router();

// GET /oauth/authorize
router.get('/authorize', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { client_id, redirect_uri, scope, state, response_type } = req.query as Record<string, string>;

    if (!client_id || !redirect_uri) {
      res.status(400).json({ success: false, error: { code: 'MISSING_PARAMS', message: 'client_id and redirect_uri are required' } });
      return;
    }

    const app = await getOAuthApp(client_id);
    if (!app) {
      res.status(400).json({ success: false, error: { code: 'INVALID_CLIENT', message: 'Unknown client_id' } });
      return;
    }

    const validRedirect = await validateRedirectUri(app, redirect_uri);
    if (!validRedirect) {
      res.status(400).json({ success: false, error: { code: 'INVALID_REDIRECT', message: 'redirect_uri not registered' } });
      return;
    }

    // Return authorization info for frontend to display
    res.json({
      success: true,
      data: {
        app_name: app.name,
        client_id,
        redirect_uri,
        scope: scope ?? 'identity',
        state: state ?? null,
        response_type: response_type ?? 'code',
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /oauth/authorize (approve)
router.post('/authorize', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { client_id, redirect_uri, scope, state, agent_id, approved } =
      req.body as { client_id: string; redirect_uri: string; scope?: string; state?: string; agent_id: string; approved: boolean };

    if (!approved) {
      const url = new URL(redirect_uri);
      url.searchParams.set('error', 'access_denied');
      if (state) url.searchParams.set('state', state);
      res.json({ success: true, data: { redirect_url: url.toString() } });
      return;
    }

    const app = await getOAuthApp(client_id);
    if (!app) { res.status(400).json({ success: false, error: { code: 'INVALID_CLIENT', message: 'Unknown client_id' } }); return; }

    const scopeArr = (scope ?? 'identity').split(' ');
    const code = await createAuthorizationCode(agent_id, app.id, redirect_uri, scopeArr);

    const url = new URL(redirect_uri);
    url.searchParams.set('code', code);
    if (state) url.searchParams.set('state', state);

    res.json({ success: true, data: { redirect_url: url.toString() } });
  } catch (err) {
    next(err);
  }
});

// POST /oauth/token
router.post('/token', validate(OAuthTokenSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { code, client_id, client_secret, redirect_uri } =
        req.body as { grant_type: string; code: string; client_id: string; client_secret: string; redirect_uri: string };
      const result = await exchangeCodeForToken(code, client_id, client_secret, redirect_uri);
      res.json(result);
    } catch (err) {
      const e = err as Error & { code?: string; status?: number };
      if (e.code) { res.status(e.status ?? 400).json({ error: e.code, error_description: e.message }); return; }
      next(err);
    }
  }
);

// GET /oauth/userinfo
router.get('/userinfo', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'unauthorized', error_description: 'Missing Authorization header' });
      return;
    }
    const token = authHeader.substring(7);
    const agent = await getAgentFromToken(token);
    if (!agent) { res.status(401).json({ error: 'invalid_token', error_description: 'Token is invalid or expired' }); return; }

    res.json({ claw_id: agent.claw_id, name: agent.name, trust_score: agent.trust_score, is_verified: agent.is_verified });
  } catch (err) {
    next(err);
  }
});

export default router;
