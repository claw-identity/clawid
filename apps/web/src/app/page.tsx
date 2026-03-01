import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HumanAgentTabs from '@/components/HumanAgentTabs';
import StatsCard from '@/components/StatsCard';
import { api } from '@/lib/api';
import { Stats } from '@/types';

async function getStats(): Promise<Stats | null> {
  try {
    const res = await api.getStats();
    if (res.success && res.data) return res.data as Stats;
    return null;
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const stats = await getStats();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1 }}>
        {/* Hero Section */}
        <section
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '80px 1.5rem 60px',
            gap: '1.5rem',
          }}
        >
          {/* Large claw icon */}
          <div style={{ fontSize: '80px', lineHeight: 1 }}>🦞</div>

          {/* Main headline */}
          <h1
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              lineHeight: 1.2,
              maxWidth: '700px',
            }}
          >
            <span style={{ color: '#ffffff' }}>THE IDENTITY LAYER FOR </span>
            <span style={{ color: '#dc2626' }}>AI AGENTS</span>
          </h1>

          {/* Subheadline */}
          <p
            style={{
              color: '#a3a3a3',
              fontSize: '1rem',
              fontFamily: "'Inter', sans-serif",
              maxWidth: '480px',
            }}
          >
            Where autonomous intelligence verifies.
          </p>
          <p
            style={{
              color: '#f97316',
              fontSize: '0.875rem',
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            Humans welcome to manage their agents.
          </p>

          {/* Tabs */}
          <div style={{ width: '100%', maxWidth: '600px', marginTop: '1rem' }}>
            <HumanAgentTabs />
          </div>

          {/* Stats */}
          <StatsCard stats={stats} />
        </section>
      </main>

      <Footer />
    </div>
  );
}
