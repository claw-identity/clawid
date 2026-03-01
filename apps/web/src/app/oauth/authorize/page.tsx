'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import ClawIcon from '@/components/ClawIcon';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

function OAuthContent() {
  const params = useSearchParams();
  const clientId = params.get('client_id') ?? '';
  const redirectUri = params.get('redirect_uri') ?? '';
  const scope = params.get('scope') ?? 'identity';
  const state = params.get('state') ?? '';
  const [appName, setAppName] = useState('');
  const [clawId, setClawId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!clientId || !redirectUri) { setError('Missing required parameters'); setLoading(false); return; }
    fetch(`${API_URL}/oauth/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`)
      .then(r => r.json()).then(data => {
        if (data.success) setAppName(data.data.app_name);
        else setError(data.error?.message ?? 'Invalid request');
      }).catch(() => setError('Failed to load')).finally(() => setLoading(false));
  }, [clientId, redirectUri, scope]);

  const decide = async (approved: boolean) => {
    if (approved && !clawId) { setError('Enter your ClawID'); return; }
    setProcessing(true);
    try {
      const res = await fetch(`${API_URL}/oauth/authorize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: clientId, redirect_uri: redirectUri, scope, state, agent_id: clawId, approved }),
      });
      const data = await res.json();
      if (data.success) window.location.href = data.data.redirect_url;
      else setError(data.error?.message ?? 'Failed');
    } catch { setError('Network error'); }
    finally { setProcessing(false); }
  };

  if (loading) return <p style={{ fontFamily: "'JetBrains Mono', monospace", color: '#525252', textAlign: 'center' }}>LOADING...</p>;

  return (
    <div className="card" style={{ width: '100%', maxWidth: '420px' }}>
      {error && !appName ? (
        <p style={{ color: '#ef4444', fontFamily: "'JetBrains Mono', monospace", textAlign: 'center' }}>⚠ {error}</p>
      ) : (
        <>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <ClawIcon size={40} />
            <h1 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', fontWeight: 700, marginTop: '0.75rem', color: '#fff' }}>AUTHORIZATION_REQUEST</h1>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', color: '#a3a3a3', marginTop: '0.5rem' }}>
              <span style={{ color: '#f97316' }}>{appName}</span> wants to access your identity
            </p>
          </div>
          <div style={{ background: '#0a0a0a', border: '1px solid #262626', borderRadius: '6px', padding: '1rem', marginBottom: '1.5rem' }}>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#525252', marginBottom: '0.5rem' }}>PERMISSIONS</p>
            {scope.split(' ').map((s) => (
              <p key={s} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', color: '#a3a3a3' }}>• {s.toUpperCase()}</p>
            ))}
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: '#737373', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '0.4rem' }}>YOUR_CLAW_ID</label>
            <input type="text" value={clawId} onChange={(e) => setClawId(e.target.value)} placeholder="claw_xxxxxxxxxxxx" />
          </div>
          {error && <p style={{ color: '#ef4444', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', marginBottom: '1rem' }}>⚠ {error}</p>}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn-secondary" onClick={() => decide(false)} disabled={processing} style={{ flex: 1, justifyContent: 'center' }}>DENY</button>
            <button className="btn-primary glow-hover" onClick={() => decide(true)} disabled={processing} style={{ flex: 1, justifyContent: 'center' }}>{processing ? 'PROCESSING...' : 'AUTHORIZE'}</button>
          </div>
        </>
      )}
    </div>
  );
}

export default function OAuthAuthorizePage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
        <Suspense fallback={<p style={{ fontFamily: "'JetBrains Mono', monospace", color: '#525252' }}>LOADING...</p>}>
          <OAuthContent />
        </Suspense>
      </main>
    </div>
  );
}
