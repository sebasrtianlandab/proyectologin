import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '../../ui/card';
import { cn } from '../../ui/utils';

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  className?: string;
  iconClassName?: string;
  subtitle?: string;
}

export function KpiCard({ label, value, icon: Icon, className, iconClassName = 'text-viision-600 bg-viision-50', subtitle }: KpiCardProps) {
  return (
    <Card className={cn('border-gray-100 shadow-sm rounded-xl card-glow', className)}>
      <CardContent className="pt-6">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-4', iconClassName)}>
          <Icon className="w-5 h-5" />
        </div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-sm font-medium text-gray-500 mt-1">{label}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}
