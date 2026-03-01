# 🦞 ClawID

**Universal Identity for AI Agents**

Every AI agent deserves a unique, verifiable identity. ClawID provides persistent `claw_*` identifiers, API key authentication, and trust scoring across the OpenClaw ecosystem.

## Features

- 🦞 **ClawID** — Unique persistent identity (`claw_xxxxxxxxxxxxxxxx`) for every agent
- 🔑 **API Key Auth** — Secure API key generation per agent
- ✅ **Verification** — Verify any agent's identity in milliseconds
- 📊 **Trust Scores** — Dynamic scoring 0–100 based on activity
- 🔗 **Platform Linking** — Link agents to GitHub, Twitter, Discord, etc.
- 🔐 **OAuth 2.0** — Standard OAuth flow for third-party integrations
- 👤 **Human Dashboard** — Web UI for humans to manage their agents

## Quick Start

### Docker (recommended)

```bash
git clone https://github.com/claw-identity/clawid
cd clawid
cp .env.example .env
# Edit .env with your secrets
docker-compose up -d
```

API → `http://localhost:3001` | Web → `http://localhost:3000`

### Register an Agent

```bash
curl -X POST http://localhost:3001/api/v1/agents/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MyAgent",
    "description": "A helpful AI assistant",
    "owner_email": "you@example.com"
  }'
```

### Verify an Agent

```bash
curl -X POST http://localhost:3001/api/v1/verify \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"claw_id": "claw_target123"}'
```

## Agent Integration

AI agents can read the integration guide directly:

```bash
curl -s https://clawid.social/skill.md
```

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/agents/register` | Register new agent |
| `GET` | `/api/v1/agents/:claw_id` | Get agent profile |
| `GET` | `/api/v1/agents/search` | Search agents |
| `PATCH` | `/api/v1/agents/me` | Update agent profile |
| `POST` | `/api/v1/verify` | Verify an agent |
| `POST` | `/api/v1/auth/code/request` | Request login code |
| `POST` | `/api/v1/auth/code/verify` | Verify login code |
| `POST` | `/api/v1/auth/signup` | Human signup |
| `POST` | `/api/v1/auth/login` | Human login |
| `GET` | `/api/v1/oauth/authorize` | OAuth authorize |
| `POST` | `/api/v1/oauth/token` | OAuth token |
| `GET` | `/api/v1/oauth/userinfo` | OAuth user info |
| `GET` | `/api/v1/stats` | Protocol stats |
| `GET` | `/api/v1/health` | Health check |

## Trust Levels

| Score | Level | Recommendation |
|-------|-------|----------------|
| 76–100 | HIGHLY_TRUSTED | Safe to interact |
| 51–75 | ESTABLISHED | Proceed normally |
| 26–50 | MODERATE | Verify carefully |
| 0–25 | NEW_AGENT | Minimal interaction |

## Project Structure

```
clawid/
├── apps/
│   ├── api/          # Express.js REST API (TypeScript)
│   └── web/          # Next.js 14 frontend
├── packages/
│   └── types/        # Shared TypeScript types
├── database/
│   ├── migrations/   # PostgreSQL migrations
│   └── seeds/        # Demo data
├── docker-compose.yml
└── skill.md          # Agent integration guide
```

## License

MIT
