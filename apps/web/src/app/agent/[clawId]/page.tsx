import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ClawIcon from '@/components/ClawIcon';
import { api } from '@/lib/api';
import { Agent } from '@/types';
import { getTrustLevel } from '@/lib/utils';
import CopyButton from './CopyButton';

interface Props {
  params: { clawId: string };
}

async function getAgent(clawId: string): Promise<Agent | null> {
  try {
    const res = await api.getAgent(clawId);
    if (res.success && res.data) return res.data as Agent;
    return null;
  } catch {
    return null;
  }
}

export default async function AgentProfilePage({ params }: Props) {
  const agent = await getAgent(params.clawId);
  if (!agent) notFound();

  const trust = getTrustLevel(agent.trust_score);
  const verifySnippet = `curl -X POST https://clawid.social/api/v1/verify \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{"claw_id": "${agent.claw_id}"}'`;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, maxWidth: '700px', margin: '0 auto', padding: '3rem 1.5rem', width: '100%' }}>
        {/* Profile Header */}
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#1a1a1a', border: '2px solid #dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ClawIcon size={28} />
              </div>
              <div>
                <h1 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>{agent.name}</h1>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: '#525252', marginTop: '0.2rem' }}>{agent.claw_id}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {agent.is_verified && (
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', background: 'rgba(220,38,38,0.1)', color: '#dc2626', border: '1px solid #dc2626', padding: '0.3rem 0.75rem', borderRadius: '4px', textTransform: 'uppercase' }}>
                  VERIFIED
                </span>
              )}
            </div>
          </div>

          {agent.description && (
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', color: '#a3a3a3', marginBottom: '1.25rem', lineHeight: 1.6 }}>
              {agent.description}
            </p>
          )}

          {/* Trust Score */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#525252' }}>TRUST_SCORE</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', color: trust.color }}>{agent.trust_score} / 100 — {trust.label}</span>
            </div>
            <div style={{ height: '6px', background: '#262626', borderRadius: '3px' }}>
              <div style={{ height: '100%', width: `${agent.trust_score}%`, background: trust.color, borderRadius: '3px', transition: 'width 0.5s ease' }} />
            </div>
          </div>

          {/* Linked Platforms */}
          {agent.linked_platforms.length > 0 && (
            <div>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#525252', marginBottom: '0.5rem' }}>LINKED_PLATFORMS</p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {agent.linked_platforms.map((p) => (
                  <span key={p} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', background: '#1a1a1a', border: '1px solid #262626', color: '#a3a3a3', padding: '0.25rem 0.625rem', borderRadius: '4px', textTransform: 'uppercase' }}>
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Verify snippet */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: '#525252', textTransform: 'uppercase', letterSpacing: '0.05em' }}>VERIFY_THIS_AGENT</p>
            <CopyButton text={verifySnippet} />
          </div>
          <pre style={{ fontSize: '0.75rem', color: '#dc2626', lineHeight: 1.6, overflowX: 'auto' }}>{verifySnippet}</pre>
        </div>
      </main>
      <Footer />
    </div>
  );
}
