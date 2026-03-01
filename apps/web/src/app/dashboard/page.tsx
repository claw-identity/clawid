'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import ClawIcon from '@/components/ClawIcon';
import { api } from '@/lib/api';
import { getSessionToken, clearSession } from '@/lib/auth';
import { User, AgentSummary } from '@/types';
import { getTrustLevel } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AgentSummary | null>(null);

  useEffect(() => {
    const token = getSessionToken();
    if (!token) { router.push('/login'); return; }
    api.getMe(token).then((res) => {
      if (res.success && res.data) setUser(res.data as User);
      else { clearSession(); router.push('/login'); }
    }).catch(() => router.push('/login')).finally(() => setLoading(false));
  }, [router]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#525252' }}>LOADING_DASHBOARD...</span>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#000' }}>
      <Header />
      <div style={{ display: 'flex', flex: 1 }}>
        <aside style={{ width: '200px', borderRight: '1px solid #262626', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', flexShrink: 0 }}>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#525252', marginBottom: '0.75rem' }}>NAVIGATION</p>
          <button onClick={() => setSelected(null)} style={{ background: !selected ? '#1a1a1a' : 'transparent', border: 'none', color: !selected ? '#fff' : '#737373', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', padding: '0.5rem 0.75rem', borderRadius: '4px', textAlign: 'left', cursor: 'pointer' }}>
            [ MY_AGENTS ]
          </button>
          <div style={{ marginTop: 'auto' }}>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', color: '#525252', padding: '0.5rem 0.75rem', wordBreak: 'break-all', marginBottom: '0.25rem' }}>{user?.email}</p>
            <button onClick={() => { clearSession(); router.push('/'); }} style={{ background: 'transparent', border: 'none', color: '#525252', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', padding: '0.5rem 0.75rem', borderRadius: '4px', textAlign: 'left', cursor: 'pointer', width: '100%' }}
              onMouseEnter={(e) => ((e.target as HTMLButtonElement).style.color = '#ef4444')}
              onMouseLeave={(e) => ((e.target as HTMLButtonElement).style.color = '#525252')}>
              [ LOGOUT ]
            </button>
          </div>
        </aside>
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          {selected ? <AgentDetail agent={selected} onBack={() => setSelected(null)} /> : <AgentList user={user} onSelect={setSelected} />}
        </main>
      </div>
    </div>
  );
}

function AgentList({ user, onSelect }: { user: User | null; onSelect: (a: AgentSummary) => void }) {
  const agents = user?.agents ?? [];
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.1rem', color: '#fff' }}>MY_AGENTS</h1>
        <Link href="/register"><button className="btn-primary glow-hover"><ClawIcon size={16} /> REGISTER_NEW</button></Link>
      </div>
      {agents.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <ClawIcon size={48} />
          <p style={{ fontFamily: "'JetBrains Mono', monospace", color: '#525252', margin: '1rem 0' }}>NO_AGENTS_REGISTERED</p>
          <Link href="/register"><button className="btn-primary glow-hover">REGISTER_AGENT →</button></Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
          {agents.map((agent) => {
            const trust = getTrustLevel(agent.trust_score);
            return (
              <div key={agent.claw_id} className="card" onClick={() => onSelect(agent)} style={{ cursor: 'pointer', transition: 'border-color 0.2s' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = '#dc2626')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = '#262626')}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>{agent.name}</span>
                  {agent.is_verified && <span style={{ fontSize: '0.6rem', fontFamily: "'JetBrains Mono', monospace", background: 'rgba(220,38,38,0.1)', color: '#dc2626', border: '1px solid #dc2626', padding: '0.1rem 0.4rem', borderRadius: '3px' }}>VERIFIED</span>}
                </div>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', color: '#525252', marginBottom: '0.75rem' }}>{agent.claw_id}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ height: '3px', flex: 1, background: '#262626', borderRadius: '2px' }}><div style={{ height: '100%', width: `${agent.trust_score}%`, background: trust.color, borderRadius: '2px' }} /></div>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', color: trust.color }}>{agent.trust_score}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

function AgentDetail({ agent, onBack }: { agent: AgentSummary; onBack: () => void }) {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (text: string, key: string) => { navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(null), 2000); };
  const trust = getTrustLevel(agent.trust_score);
  return (
    <>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#737373', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', cursor: 'pointer', marginBottom: '1.5rem', padding: 0 }}>← BACK</button>
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.1rem', color: '#fff' }}>{agent.name}</h2>
          {agent.is_verified && <span style={{ fontSize: '0.65rem', fontFamily: "'JetBrains Mono', monospace", background: 'rgba(220,38,38,0.1)', color: '#dc2626', border: '1px solid #dc2626', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>VERIFIED</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', color: '#525252', width: '100px', flexShrink: 0 }}>CLAW_ID</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', color: '#a3a3a3', flex: 1 }}>{agent.claw_id}</span>
          <button className="btn-copy" onClick={() => copy(agent.claw_id, 'id')}>{copied === 'id' ? '✓ COPIED' : '📋 COPY'}</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', color: '#525252', width: '100px', flexShrink: 0 }}>TRUST</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
            <div style={{ height: '4px', width: '120px', background: '#262626', borderRadius: '2px' }}><div style={{ height: '100%', width: `${agent.trust_score}%`, background: trust.color, borderRadius: '2px' }} /></div>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', color: trust.color }}>{agent.trust_score} — {trust.label}</span>
          </div>
        </div>
      </div>
      <div className="card">
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: '#525252', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>VERIFY_SNIPPET</p>
        <pre style={{ fontSize: '0.75rem', color: '#dc2626', lineHeight: 1.6, overflowX: 'auto' }}>{`curl -X POST https://clawid.social/api/v1/verify \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{"claw_id": "${agent.claw_id}"}'`}</pre>
      </div>
    </>
  );
}
