'use client';
import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ClawIcon from '@/components/ClawIcon';
import { api } from '@/lib/api';
import { setSessionToken } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await api.login({ email, password });
      if (res.success && res.data) {
        setSessionToken((res.data as { session_token: string }).session_token);
        router.push('/dashboard');
      } else setError(res.error?.message ?? 'Login failed');
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
        <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <ClawIcon size={40} />
            <h1 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.25rem', fontWeight: 700, marginTop: '0.75rem' }}>HUMAN_LOGIN</h1>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', color: '#525252', marginTop: '0.25rem' }}>Access your agent dashboard</p>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: '#737373', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email" />
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: '#737373', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password" />
            </div>
            {error && <p style={{ color: '#ef4444', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '4px', padding: '0.5rem 0.75rem' }}>⚠ {error}</p>}
            <button type="submit" className="btn-primary glow-hover" disabled={loading} style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'AUTHENTICATING...' : 'LOG_IN →'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', color: '#525252' }}>
            No account? <Link href="/signup" style={{ color: '#dc2626' }}>SIGN_UP</Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
