import React from 'react';
import type { LucideIcon } from 'lucide-react';

const cardClass = 'bg-white rounded-xl border border-gray-100 p-4 shadow-sm card-glow';

export type StatCardLayout = 'valueFirst' | 'iconFirst';

export interface StatCardProps {
    value: React.ReactNode;
    label: string;
    sub?: string;
    icon: LucideIcon;
    /** 'valueFirst' = value/label left, icon right. 'iconFirst' = icon left, value/label right. */
    layout?: StatCardLayout;
    /** Optional wrapper around icon (e.g. 'p-2 rounded-lg bg-green-50'). Omit for muted icon only. */
    iconWrapperClassName?: string;
    /** Icon element class (e.g. 'w-4 h-4' or 'w-5 h-5 text-viision-600'). */
    iconClassName: string;
    /** Optional extra class for the label (e.g. 'font-medium'). */
    labelClassName?: string;
    className?: string;
}

/**
 * Card de estadística reutilizable. Mantiene la misma estética en todas las vistas.
 */
export function StatCard({
    value,
    label,
    sub,
    icon: Icon,
    layout = 'valueFirst',
    iconWrapperClassName,
    iconClassName,
    labelClassName = '',
    className = '',
}: StatCardProps) {
    const iconEl = <Icon className={iconClassName} />;
    const iconBlock = iconWrapperClassName ? (
        <div className={iconWrapperClassName}>{iconEl}</div>
    ) : (
        iconEl
    );

    return (
        <div className={`${cardClass} ${className}`.trim()}>
            {layout === 'valueFirst' ? (
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-2xl font-bold text-gray-800">{value}</p>
                        <p className={`text-xs text-gray-500 mt-1 ${labelClassName}`.trim()}>{label}</p>
                        {sub != null && <p className="text-[10px] text-gray-400">{sub}</p>}
                    </div>
                    {iconBlock}
                </div>
            ) : (
                <div className="flex items-center gap-3">
                    {iconBlock}
                    <div>
                        <p className="text-2xl font-bold text-gray-800">{value}</p>
                        <p className="text-xs text-gray-500">{label}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
