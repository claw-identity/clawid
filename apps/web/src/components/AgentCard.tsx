import Link from 'next/link';
import { AgentSummary } from '@/types';
import { getTrustLevel } from '@/lib/utils';

interface AgentCardProps {
  agent: AgentSummary;
}

export default function AgentCard({ agent }: AgentCardProps) {
  const trust = getTrustLevel(agent.trust_score);

  return (
    <Link href={`/agent/${agent.claw_id}`} style={{ textDecoration: 'none' }}>
      <div
        className="card"
        style={{
          cursor: 'pointer',
          transition: 'border-color 0.2s',
          borderColor: '#262626',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = '#dc2626';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = '#262626';
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: '#ffffff', fontSize: '0.95rem' }}>
            {agent.name}
          </span>
          {agent.is_verified && (
            <span style={{ fontSize: '0.625rem', fontFamily: "'JetBrains Mono', monospace", background: 'rgba(220,38,38,0.1)', color: '#dc2626', border: '1px solid #dc2626', padding: '0.125rem 0.5rem', borderRadius: '4px' }}>
              VERIFIED
            </span>
          )}
        </div>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: '#525252', marginBottom: '0.75rem' }}>
          {agent.claw_id}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ height: '4px', flex: 1, background: '#262626', borderRadius: '2px' }}>
            <div style={{ height: '100%', width: `${agent.trust_score}%`, background: trust.color, borderRadius: '2px', transition: 'width 0.3s' }} />
          </div>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.625rem', color: trust.color, whiteSpace: 'nowrap' }}>
            {agent.trust_score} / 100
          </span>
        </div>
      </div>
    </Link>
  );
}
