import { queryOne } from '../config/database';
import { hashSHA256, generateOAuthCode, generateSessionToken } from '../utils/crypto';
import { OAuthApp, OAuthCode, OAuthToken, Agent } from '../types';

export async function getOAuthApp(clientId: string): Promise<OAuthApp | null> {
  return queryOne<OAuthApp>('SELECT * FROM oauth_apps WHERE client_id = $1', [clientId]);
}

export async function validateRedirectUri(app: OAuthApp, redirectUri: string): Promise<boolean> {
  return app.redirect_uris.includes(redirectUri);
}

export async function createAuthorizationCode(
  agentId: string,
  appId: string,
  redirectUri: string,
  scope: string[]
): Promise<string> {
  const code = generateOAuthCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await queryOne(
    `INSERT INTO oauth_codes (code, agent_id, app_id, redirect_uri, scope, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [code, agentId, appId, redirectUri, scope, expiresAt]
  );

  return code;
}

export async function exchangeCodeForToken(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
) {
  const app = await queryOne<OAuthApp>('SELECT * FROM oauth_apps WHERE client_id = $1', [clientId]);
  if (!app) throw Object.assign(new Error('Invalid client_id'), { code: 'INVALID_CLIENT', status: 401 });

  const secretHash = hashSHA256(clientSecret);
  if (app.client_secret_hash !== secretHash) {
    throw Object.assign(new Error('Invalid client_secret'), { code: 'INVALID_CLIENT', status: 401 });
  }

  const authCode = await queryOne<OAuthCode>(
    `SELECT * FROM oauth_codes WHERE code = $1 AND app_id = $2 AND used = FALSE AND expires_at > NOW()`,
    [code, app.id]
  );
  if (!authCode) throw Object.assign(new Error('Invalid or expired code'), { code: 'INVALID_GRANT', status: 400 });

  if (authCode.redirect_uri !== redirectUri) {
    throw Object.assign(new Error('redirect_uri mismatch'), { code: 'INVALID_GRANT', status: 400 });
  }

  // Mark code as used
  await queryOne('UPDATE oauth_codes SET used = TRUE WHERE id = $1', [authCode.id]);

  // Generate access token
  const accessToken = generateSessionToken('clawtoken');
  const tokenHash = hashSHA256(accessToken);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await queryOne(
    'INSERT INTO oauth_tokens (token_hash, agent_id, app_id, scope, expires_at) VALUES ($1, $2, $3, $4, $5)',
    [tokenHash, authCode.agent_id, app.id, authCode.scope, expiresAt]
  );

  return {
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: 3600,
    scope: authCode.scope.join(' '),
  };
}

export async function getAgentFromToken(accessToken: string) {
  const tokenHash = hashSHA256(accessToken);
  const token = await queryOne<OAuthToken>(
    'SELECT * FROM oauth_tokens WHERE token_hash = $1 AND expires_at > NOW()',
    [tokenHash]
  );
  if (!token) return null;

  return queryOne<Agent>('SELECT * FROM agents WHERE id = $1', [token.agent_id]);
}
