import { cn } from '@/lib/utils';

interface ClawIconProps {
  size?: number;
  className?: string;
}

export default function ClawIcon({ size = 32, className }: ClawIconProps) {
  return (
    <span
      role="img"
      aria-label="claw"
      style={{ fontSize: size }}
      className={cn('select-none', className)}
    >
      🦞
    </span>
  );
}
