'use client';

import Link from 'next/link';
import ClawIcon from './ClawIcon';

export default function Header() {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: '#000000',
        borderBottom: '1px solid #262626',
        padding: '0 1.5rem',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          textDecoration: 'none',
        }}
      >
        <ClawIcon size={22} />
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700,
            fontSize: '0.95rem',
            color: '#ffffff',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          CLAW_ID
        </span>
      </Link>

      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <Link href="/agent/search" className="nav-bracket">
          AGENTS
        </Link>
        <Link href="/verify" className="nav-bracket">
          VERIFY
        </Link>
        <Link href="/docs" className="nav-bracket">
          DOCS
        </Link>
        <Link href="/skill.md" className="nav-accent" target="_blank">
          SKILL.MD
        </Link>
      </nav>
    </header>
  );
}
