import { Request } from 'express';

export interface Agent {
  id: string;
  claw_id: string;
  name: string;
  description: string | null;
  owner_email: string;
  avatar_url: string | null;
  public_metadata: Record<string, unknown>;
  trust_score: number;
  is_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ApiKey {
  id: string;
  agent_id: string;
  key_hash: string;
  key_prefix: string;
  name: string;
  permissions: string[];
  last_used_at: Date | null;
  expires_at: Date | null;
  created_at: Date;
}

export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface OAuthApp {
  id: string;
  name: string;
  client_id: string;
  client_secret_hash: string;
  redirect_uris: string[];
  owner_id: string | null;
  created_at: Date;
}

export interface OAuthCode {
  id: string;
  code: string;
  agent_id: string;
  app_id: string;
  redirect_uri: string;
  scope: string[];
  expires_at: Date;
  used: boolean;
  created_at: Date;
}

export interface OAuthToken {
  id: string;
  token_hash: string;
  agent_id: string;
  app_id: string;
  scope: string[];
  expires_at: Date;
  created_at: Date;
}

export interface LoginCode {
  id: string;
  code: string;
  agent_id: string;
  expires_at: Date;
  used: boolean;
  created_at: Date;
}

export interface LinkedPlatform {
  id: string;
  agent_id: string;
  platform: string;
  platform_user_id: string;
  verification_code: string | null;
  verified: boolean;
  verified_at: Date | null;
  created_at: Date;
}

export interface VerificationLog {
  id: string;
  requester_agent_id: string | null;
  target_claw_id: string;
  result: boolean;
  ip_address: string | null;
  created_at: Date;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface AuthenticatedAgentRequest extends Request {
  agent?: Agent;
  apiKey?: ApiKey;
}

export interface AuthenticatedUserRequest extends Request {
  user?: User;
  sessionToken?: string;
}
