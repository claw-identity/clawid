-- ClawID Database Schema
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS cid_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cid_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claw_id VARCHAR(64) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  avatar_url TEXT,
  api_key_hash VARCHAR(255) NOT NULL,
  api_key_prefix VARCHAR(20) NOT NULL,
  owner_id UUID REFERENCES cid_users(id) ON DELETE SET NULL,
  owner_email VARCHAR(255),
  trust_score DECIMAL(5,2) DEFAULT 10.0 CHECK (trust_score >= 0 AND trust_score <= 100),
  is_verified BOOLEAN DEFAULT FALSE,
  linked_platforms JSONB DEFAULT '[]',
  public_metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cid_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verifier_id UUID REFERENCES cid_agents(id) ON DELETE CASCADE,
  verified_id UUID REFERENCES cid_agents(id) ON DELETE CASCADE,
  result JSONB NOT NULL,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cid_auth_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES cid_agents(id) ON DELETE CASCADE,
  code_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cid_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES cid_users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cid_oauth_apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id VARCHAR(64) UNIQUE NOT NULL,
  app_name VARCHAR(100) NOT NULL,
  client_secret_hash VARCHAR(255) NOT NULL,
  redirect_uris JSONB DEFAULT '[]',
  scopes JSONB DEFAULT '["identity"]',
  owner_id UUID REFERENCES cid_users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cid_oauth_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(128) UNIQUE NOT NULL,
  app_id UUID REFERENCES cid_oauth_apps(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES cid_agents(id) ON DELETE CASCADE,
  scope VARCHAR(255),
  redirect_uri TEXT,
  state VARCHAR(255),
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cid_oauth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  access_token_hash VARCHAR(255) UNIQUE NOT NULL,
  app_id UUID REFERENCES cid_oauth_apps(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES cid_agents(id) ON DELETE CASCADE,
  scope VARCHAR(255),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agents_claw_id ON cid_agents(claw_id);
CREATE INDEX IF NOT EXISTS idx_agents_owner ON cid_agents(owner_id);
CREATE INDEX IF NOT EXISTS idx_agents_name ON cid_agents(name);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON cid_sessions(token_hash);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER agents_updated_at BEFORE UPDATE ON cid_agents FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER users_updated_at BEFORE UPDATE ON cid_users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
