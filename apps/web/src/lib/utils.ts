import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M+`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K+`;
  return n.toLocaleString();
}

export function getTrustLevel(score: number): { label: string; color: string } {
  if (score >= 76) return { label: 'HIGHLY TRUSTED', color: '#22c55e' };
  if (score >= 51) return { label: 'ESTABLISHED', color: '#86efac' };
  if (score >= 26) return { label: 'MODERATE', color: '#f97316' };
  return { label: 'NEW AGENT', color: '#737373' };
}

export async function copyToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}
