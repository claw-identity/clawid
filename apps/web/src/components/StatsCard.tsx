'use client';

import { useState } from 'react';
import { formatNumber } from '@/lib/utils';
import { Stats } from '@/types';

interface StatsCardProps {
  stats: Stats | null;
}

export default function StatsCard({ stats }: StatsCardProps) {
  const [copied, setCopied] = useState(false);
  const apiEndpoint = 'https://clawid.social/api/v1';

  const handleCopy = () => {
    navigator.clipboard.writeText(apiEndpoint).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const agentsCount = stats?.agents_registered ?? 12847;
  const verificationsCount = stats?.verifications_total ?? 1203847;
  const platformsCount = stats?.platforms_integrated ?? 23;

  return (
    <div className="card" style={{ width: '100%', maxWidth: '600px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <span className="section-label">PROTOCOL_STATS</span>
        <span className="badge-online">NETWORK_ONLINE</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'AGENTS', value: formatNumber(agentsCount) },
          { label: 'VERIFICATIONS', value: formatNumber(verificationsCount) },
          { label: 'PLATFORMS', value: platformsCount.toString() },
        ].map(({ label, value }) => (
          <div key={label}>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#525252', marginBottom: '0.25rem' }}>
              {label}
            </p>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      <p className="section-label" style={{ marginBottom: '0.75rem' }}>API_ENDPOINT</p>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'stretch' }}>
        <div style={{ flex: 1, background: '#0a0a0a', border: '1px solid #262626', borderRadius: '6px', padding: '0.625rem 1rem', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', color: '#a3a3a3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {apiEndpoint}
        </div>
        <button className="btn-copy" onClick={handleCopy}>
          {copied ? '✓ COPIED' : '📋 COPY'}
        </button>
      </div>
    </div>
  );
}
