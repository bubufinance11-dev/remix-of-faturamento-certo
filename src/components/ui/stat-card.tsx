import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  variant?: 'default' | 'positive' | 'negative' | 'warning' | 'provision';
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  variant = 'default',
  className,
}: StatCardProps) {
  const variantStyles = {
    default: 'border-border',
    positive: 'border-positive/30 bg-positive/5',
    negative: 'border-negative/30 bg-negative/5',
    warning: 'border-warning/30 bg-warning/5',
    provision: 'border-provision/30 bg-provision/5',
  };

  const valueStyles = {
    default: 'text-foreground',
    positive: 'text-positive',
    negative: 'text-negative',
    warning: 'text-warning',
    provision: 'text-provision',
  };

  const iconStyles = {
    default: 'bg-primary/10 text-primary',
    positive: 'bg-positive/10 text-positive',
    negative: 'bg-negative/10 text-negative',
    warning: 'bg-warning/10 text-warning',
    provision: 'bg-provision/10 text-provision',
  };

  return (
    <div
      className={cn(
        'stat-card',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground/70 mt-0.5">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className={cn('p-2 rounded-lg', iconStyles[variant])}>
            {icon}
          </div>
        )}
      </div>
      
      <div className="flex items-end justify-between">
        <p className={cn('text-2xl font-bold tracking-tight', valueStyles[variant])}>
          {typeof value === 'number'
            ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
            : value}
        </p>
        
        {trend && trendValue && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
              trend === 'up' && 'bg-positive/10 text-positive',
              trend === 'down' && 'bg-negative/10 text-negative',
              trend === 'neutral' && 'bg-muted text-muted-foreground'
            )}
          >
            {trend === 'up' && <TrendingUp className="h-3 w-3" />}
            {trend === 'down' && <TrendingDown className="h-3 w-3" />}
            {trend === 'neutral' && <Minus className="h-3 w-3" />}
            {trendValue}
          </div>
        )}
      </div>
    </div>
  );
}
