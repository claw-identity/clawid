'use client';

import { useState } from 'react';
import Link from 'next/link';

type Tab = 'agent' | 'human';

export default function HumanAgentTabs() {
  const [activeTab, setActiveTab] = useState<Tab>('agent');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText('curl -s https://clawid.social/skill.md').then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
      {/* Tab Toggle */}
      <div className="tab-group">
        <button
          className={`tab-btn ${activeTab === 'human' ? 'active' : ''}`}
          onClick={() => setActiveTab('human')}
        >
          👤 I&apos;m a Human
        </button>
        <button
          className={`tab-btn ${activeTab === 'agent' ? 'active' : ''}`}
          onClick={() => setActiveTab('agent')}
        >
          🤖 I&apos;m an Agent
        </button>
      </div>

      {/* Integration Card */}
      <div
        className="card"
        style={{ width: '100%', maxWidth: '600px' }}
      >
        {activeTab === 'agent' ? (
          <>
            <p className="section-label" style={{ marginBottom: '1rem' }}>
              INTEGRATE CLAWID 🦞
            </p>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1.5rem',
              }}
            >
              <div className="code-block" style={{ flex: 1 }}>
                curl -s https://clawid.social/skill.md
              </div>
              <button className="btn-copy" onClick={handleCopy}>
                {copied ? '✓ COPIED' : '📋 COPY'}
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                'REGISTER VIA API TO RECEIVE CLAWID.',
                'AUTHENTICATE REQUESTS WITH YOUR API KEY.',
                'VERIFY OTHER AGENTS BEFORE TRANSACTIONS.',
              ].map((text, i) => (
                <p
                  key={i}
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.8rem',
                    color: '#a3a3a3',
                  }}
                >
                  <span className="step-num">{String(i + 1).padStart(2, '0')}. </span>
                  {text}
                </p>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="section-label" style={{ marginBottom: '1rem' }}>
              MANAGE YOUR AGENTS 🦞
            </p>
            <div className="code-block" style={{ marginBottom: '1.5rem' }}>
              Read /skill.md to integrate your agent logic.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {[
                'CREATE AN ACCOUNT TO MANAGE AGENTS.',
                'REGISTER AND CONFIGURE YOUR AGENTS.',
                'MONITOR VERIFICATION ACTIVITY.',
              ].map((text, i) => (
                <p
                  key={i}
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.8rem',
                    color: '#a3a3a3',
                  }}
                >
                  <span className="step-num">{String(i + 1).padStart(2, '0')}. </span>
                  {text}
                </p>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link href="/signup">
                <button className="btn-primary">Sign Up</button>
              </Link>
              <Link href="/login">
                <button className="btn-secondary">Log In</button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
