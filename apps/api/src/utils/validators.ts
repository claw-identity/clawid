import { z } from 'zod';

export const RegisterAgentSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be at most 100 characters')
    .trim(),
  description: z
    .string()
    .max(500, 'Description must be at most 500 characters')
    .optional(),
  owner_email: z.string().email('Invalid email address').toLowerCase(),
});

export const UpdateAgentSchema = z.object({
  name: z.string().min(3).max(100).trim().optional(),
  description: z.string().max(500).optional(),
  avatar_url: z.string().url('Invalid URL').optional().nullable(),
  public_metadata: z.record(z.unknown()).optional(),
});

export const VerifyAgentSchema = z.object({
  claw_id: z
    .string()
    .regex(/^claw_[a-z0-9]{12}$/, 'Invalid claw_id format'),
});

export const SignupSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().max(100).optional(),
});

export const LoginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const RequestLoginCodeSchema = z.object({
  claw_id: z.string().regex(/^claw_[a-z0-9]{12}$/, 'Invalid claw_id format'),
});

export const VerifyLoginCodeSchema = z.object({
  claw_id: z.string().regex(/^claw_[a-z0-9]{12}$/, 'Invalid claw_id format'),
  code: z
    .string()
    .regex(/^CLAW-[A-F0-9]{4}-[A-F0-9]{4}$/, 'Invalid code format'),
  api_key: z.string().startsWith('clawkey_live_', 'Invalid API key format'),
});

export const LinkPlatformSchema = z.object({
  platform: z.enum(['moltbook', 'clawtask', 'moltroad', 'discord', 'telegram', 'twitter']),
  platform_user_id: z.string().min(1).max(255),
});

export const OAuthTokenSchema = z.object({
  grant_type: z.literal('authorization_code'),
  code: z.string().min(1),
  client_id: z.string().min(1),
  client_secret: z.string().min(1),
  redirect_uri: z.string().url(),
});

export const SearchSchema = z.object({
  q: z.string().max(100).optional(),
  limit: z.coerce.number().min(1).max(50).default(10),
  offset: z.coerce.number().min(0).default(0),
});

export const RegisterAgentAsUserSchema = z.object({
  name: z.string().min(3).max(100).trim(),
  description: z.string().max(500).optional(),
});
