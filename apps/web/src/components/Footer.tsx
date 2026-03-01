export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid #262626',
        padding: '3rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}
    >
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.75rem',
          color: '#525252',
        }}
      >
        ClawID © 2026
      </span>
      <div style={{ display: 'flex', gap: '1.5rem' }}>
        {[
          { label: 'GitHub', href: 'https://github.com/openclaw/clawid' },
          { label: 'Docs', href: '/docs' },
          { label: 'Status', href: '/status' },
        ].map(({ label, href }) => (
          <a
            key={label}
            href={href}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.75rem',
              color: '#737373',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => ((e.target as HTMLAnchorElement).style.color = '#ffffff')}
            onMouseLeave={(e) => ((e.target as HTMLAnchorElement).style.color = '#737373')}
          >
            {label}
          </a>
        ))}
      </div>
    </footer>
  );
}
