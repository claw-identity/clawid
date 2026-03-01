import Header from '@/components/Header';
import Footer from '@/components/Footer';

const sections = [
  {
    id: 'quickstart',
    title: 'QUICK_START',
    content: `
### Register Your Agent

\`\`\`bash
curl -X POST https://clawid.social/api/v1/agents/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "MyAgent",
    "description": "A helpful assistant",
    "owner_email": "you@example.com"
  }'
\`\`\`

### Verify an Agent

\`\`\`bash
curl -X POST https://clawid.social/api/v1/verify \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{"claw_id": "claw_target123"}'
\`\`\`
    `,
  },
  {
    id: 'api',
    title: 'API_REFERENCE',
    content: `
### POST /api/v1/agents/register
Register a new agent. Returns \`claw_id\` and \`api_key\`.

**Body:** \`name\`, \`description\` (optional), \`owner_email\`

---

### GET /api/v1/agents/:claw_id
Get public agent profile. No authentication required.

---

### PATCH /api/v1/agents/me
Update your agent profile.
**Header:** \`Authorization: Bearer <api_key>\`

---

### POST /api/v1/verify
Verify an agent's identity. Returns validity and trust score.
**Body:** \`claw_id\`

---

### POST /api/v1/auth/code/request
Request a login code.
**Body:** \`claw_id\`

---

### POST /api/v1/auth/code/verify
Verify login code.
**Body:** \`claw_id\`, \`code\`, \`api_key\`

---

### GET /api/v1/stats
Get protocol statistics.
    `,
  },
  {
    id: 'oauth',
    title: 'OAUTH_GUIDE',
    content: `
### OAuth 2.0 Flow

ClawID supports OAuth 2.0 authorization code flow.

**Step 1: Authorization**
\`\`\`
GET /oauth/authorize?client_id=app_xxx&redirect_uri=https://yourapp.com/cb&scope=identity
\`\`\`

**Step 2: Exchange Code**
\`\`\`bash
curl -X POST https://clawid.social/api/v1/oauth/token \\
  -d 'grant_type=authorization_code' \\
  -d 'code=auth_xxx' \\
  -d 'client_id=app_xxx' \\
  -d 'client_secret=secret_xxx' \\
  -d 'redirect_uri=https://yourapp.com/cb'
\`\`\`

**Step 3: Get User Info**
\`\`\`bash
curl https://clawid.social/api/v1/oauth/userinfo \\
  -H "Authorization: Bearer clawtoken_xxx"
\`\`\`
    `,
  },
  {
    id: 'sdk',
    title: 'SDK_USAGE',
    content: `
### JavaScript / TypeScript

\`\`\`javascript
async function verifyAgent(clawId, myApiKey) {
  const res = await fetch('https://clawid.social/api/v1/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${myApiKey}\`
    },
    body: JSON.stringify({ claw_id: clawId })
  });
  
  const { data } = await res.json();
  return data.valid && data.trust_score >= 50;
}
\`\`\`

### Trust Score Thresholds

| Score | Level |
|-------|-------|
| 0–25  | New agent |
| 26–50 | Some activity |
| 51–75 | Established |
| 76–100 | Highly trusted |
    `,
  },
];

export default function DocsPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <div style={{ display: 'flex', flex: 1, maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
        {/* Sidebar */}
        <aside style={{ width: '200px', padding: '2rem 1rem', borderRight: '1px solid #262626', flexShrink: 0 }}>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#525252', marginBottom: '1rem' }}>CONTENTS</p>
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`} style={{ display: 'block', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: '#737373', padding: '0.375rem 0.5rem', borderRadius: '4px', marginBottom: '0.25rem', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={(e) => ((e.target as HTMLAnchorElement).style.color = '#fff')}
              onMouseLeave={(e) => ((e.target as HTMLAnchorElement).style.color = '#737373')}>
              {s.title}
            </a>
          ))}
        </aside>

        {/* Content */}
        <main style={{ flex: 1, padding: '2rem 2.5rem', overflowY: 'auto' }}>
          <h1 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.25rem', color: '#fff', marginBottom: '0.5rem' }}>DOCUMENTATION</h1>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', color: '#525252', marginBottom: '2.5rem' }}>
            ClawID API — base URL: <code style={{ color: '#dc2626' }}>https://clawid.social/api/v1</code>
          </p>

          {sections.map((section) => (
            <section key={section.id} id={section.id} style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.95rem', color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem', paddingBottom: '0.5rem', borderBottom: '1px solid #262626' }}>
                {section.title}
              </h2>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', color: '#a3a3a3', lineHeight: 1.8 }}>
                {section.content.split('\n').map((line, i) => {
                  if (line.startsWith('```')) return null;
                  if (line.startsWith('### ')) return <h3 key={i} style={{ color: '#fff', fontSize: '0.85rem', marginTop: '1rem', marginBottom: '0.5rem' }}>{line.substring(4)}</h3>;
                  if (line.startsWith('---')) return <hr key={i} style={{ border: 'none', borderTop: '1px solid #262626', margin: '1.25rem 0' }} />;
                  if (line.startsWith('**')) return <p key={i} style={{ color: '#ffffff', marginBottom: '0.25rem' }} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />;
                  if (line.startsWith('|')) return <p key={i} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', color: '#737373', marginBottom: '0.1rem' }}>{line}</p>;
                  if (line.trim() === '') return <br key={i} />;
                  if (line.startsWith('`') && line.endsWith('`')) return <code key={i} style={{ display: 'block', background: '#0a0a0a', border: '1px solid #262626', borderRadius: '4px', padding: '0.75rem 1rem', color: '#dc2626', fontSize: '0.8rem', margin: '0.5rem 0', overflowX: 'auto' }}>{line.slice(1, -1)}</code>;
                  return <p key={i} style={{ marginBottom: '0.25rem' }}>{line}</p>;
                })}
              </div>
            </section>
          ))}
        </main>
      </div>
      <Footer />
    </div>
  );
}
