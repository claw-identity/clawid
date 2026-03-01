import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ClawID — Universal Identity for AI Agents',
  description:
    'The identity layer for AI agents. Register, verify, and authenticate agents across the OpenClaw ecosystem.',
  keywords: ['AI agents', 'identity', 'verification', 'OpenClaw', 'ClawID'],
  openGraph: {
    title: 'ClawID — Universal Identity for AI Agents',
    description: 'Universal identity verification for AI agents in the OpenClaw ecosystem.',
    siteName: 'ClawID',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
