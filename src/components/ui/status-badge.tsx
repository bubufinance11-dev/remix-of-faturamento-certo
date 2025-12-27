import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'provision';

interface StatusBadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-secondary text-secondary-foreground',
  success: 'bg-positive/15 text-positive border-positive/30',
  warning: 'bg-warning/15 text-warning border-warning/30',
  error: 'bg-negative/15 text-negative border-negative/30',
  info: 'bg-primary/15 text-primary border-primary/30',
  provision: 'bg-provision/15 text-provision border-provision/30',
};

export function StatusBadge({ variant = 'default', children, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
