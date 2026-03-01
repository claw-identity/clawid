'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ClawIcon from '@/components/ClawIcon';
import { api } from '@/lib/api';
import { setSessionToken } from '@/lib/auth';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await api.signup({ email, password, name: name || undefined });
      if (res.success && res.data) {
        const { session_token } = res.data as { session_token: string };
        setSessionToken(session_token);
        router.push('/dashboard');
      } else {
        setError(res.error?.message ?? 'Signup failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    background: '#0a0a0a',
    border: '1px solid #262626',
    borderRadius: '6px',
    padding: '0.75rem 1rem',
    color: '#ffffff',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.875rem',
    width: '100%',
  };

  const labelStyle = {
    display: 'block',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.7rem',
    color: '#737373',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: '0.4rem',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
        <div className="card" style={{ width: '100%', maxWidth: '420px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <ClawIcon size={40} />
            <h1 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.25rem', fontWeight: 700, marginTop: '0.75rem', color: '#ffffff' }}>
              CREATE_ACCOUNT
            </h1>
            <p style={{ color: '#525252', fontSize: '0.8rem', fontFamily: "'JetBrains Mono', monospace", marginTop: '0.25rem' }}>
              Manage your AI agents
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Name (optional)</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters" required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Confirm Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat password" required style={inputStyle} />
            </div>

            {error && (
              <p style={{ color: '#ef4444', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '4px', padding: '0.5rem 0.75rem' }}>
                ⚠ {error}
              </p>
            )}

            <button type="submit" className="btn-primary glow-hover" disabled={loading} style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'CREATING...' : 'CREATE_ACCOUNT →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', color: '#525252' }}>
            Have an account?{' '}
            <Link href="/login" style={{ color: '#dc2626' }}>LOG_IN</Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
