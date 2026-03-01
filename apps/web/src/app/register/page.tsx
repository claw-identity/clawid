'use client';

import { useState, FormEvent } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ClawIcon from '@/components/ClawIcon';
import { api } from '@/lib/api';
import { RegisterResult } from '@/types';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<RegisterResult | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.registerAgent({ name, description: description || undefined, owner_email: ownerEmail });
      if (res.success && res.data) {
        setResult(res.data as RegisterResult);
      } else {
        setError(res.error?.message ?? 'Registration failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = { width: '100%' };
  const labelStyle = { display: 'block' as const, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: '#737373', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '0.4rem' };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
        <div style={{ width: '100%', maxWidth: '480px' }}>
          {!result ? (
            <div className="card">
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <ClawIcon size={40} />
                <h1 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.25rem', fontWeight: 700, marginTop: '0.75rem', color: '#ffffff' }}>REGISTER_AGENT</h1>
                <p style={{ color: '#525252', fontSize: '0.8rem', fontFamily: "'JetBrains Mono', monospace", marginTop: '0.25rem' }}>Claim your ClawID</p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Agent Name *</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="MyAwesomeAgent" required minLength={3} maxLength={100} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Description</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does your agent do?" maxLength={500} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                <div>
                  <label style={labelStyle}>Owner Email *</label>
                  <input type="email" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} placeholder="you@example.com" required style={inputStyle} />
                </div>

                {error && (
                  <p style={{ color: '#ef4444', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '4px', padding: '0.5rem 0.75rem' }}>
                    ⚠ {error}
                  </p>
                )}

                <button type="submit" className="btn-primary glow-hover" disabled={loading} style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'REGISTERING...' : 'REGISTER_AGENT →'}
                </button>
              </form>
            </div>
          ) : (
            <div className="card">
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
                <h1 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.1rem', color: '#22c55e' }}>AGENT_REGISTERED</h1>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', color: '#737373', marginTop: '0.25rem' }}>{result.name}</p>
              </div>

              <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', padding: '0.75rem 1rem', marginBottom: '1.25rem' }}>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  ⚠ SAVE YOUR API KEY — IT WON&apos;T BE SHOWN AGAIN
                </p>
              </div>

              {[
                { label: 'CLAW_ID', value: result.claw_id, key: 'id' },
                { label: 'API_KEY', value: result.api_key, key: 'key' },
              ].map(({ label, value, key }) => (
                <div key={key} style={{ marginBottom: '1rem' }}>
                  <label style={labelStyle}>{label}</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div style={{ flex: 1, background: '#0a0a0a', border: '1px solid #262626', borderRadius: '6px', padding: '0.625rem 1rem', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', color: label === 'API_KEY' ? '#dc2626' : '#a3a3a3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {value}
                    </div>
                    <button className="btn-copy" onClick={() => copy(value, key)}>
                      {copied === key ? '✓ COPIED' : '📋 COPY'}
                    </button>
                  </div>
                </div>
              ))}

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                <a href={`/agent/${result.claw_id}`}>
                  <button className="btn-primary glow-hover">VIEW_PROFILE →</button>
                </a>
                <button className="btn-secondary" onClick={() => { setResult(null); setName(''); setDescription(''); setOwnerEmail(''); }}>
                  REGISTER_ANOTHER
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
