import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { SecurityBadge } from '@/components/SecurityBadge';

/**
 * Quick Stats Panel Component
 * 
 * Compressed metrics display - provides operational context without clutter.
 * Replaces the large metric cards at top with a more compact format.
 * 
 * Follows minimalist design:
 * - Single panel, not 4-5 separate cards
 * - Bullet points, not large numbers
 * - Trend indicators, not change values
 * - Scannable, not decorative
 * 
 * @example
 * <QuickStatsPanel />
 */
export function QuickStatsPanel() {
    const stats = [
        { 
            label: '8 nominations in draft', 
            trend: 'up' as const, 
            trendValue: '+2',
            important: false,
        },
        { 
            label: '15 targets in planning', 
            trend: 'neutral' as const, 
            trendValue: '±0',
            important: false,
        },
        { 
            label: '23 targets active', 
            trend: 'up' as const, 
            trendValue: '+3',
            important: true,
        },
        { 
            label: '12 strikes this week', 
            trend: 'up' as const, 
            trendValue: '+4 from plan',
            important: true,
        },
        {
            label: '87% target efficacy',
            trend: 'up' as const,
            trendValue: '+5%',
            important: true,
        },
    ];

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-lg">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-cyan-400" />
                    <h2 className="font-black uppercase text-sm text-white tracking-tight">
                        Targeting Pipeline
                    </h2>
                </div>
                <SecurityBadge level="SECRET" size="sm" />
            </div>
            <div className="p-6">
                <div className="space-y-3">
                    {stats.map((stat, index) => (
                        <StatItem key={index} {...stat} />
                    ))}
                </div>
            </div>
        </div>
    );
}

/**
 * Individual Stat Item
 */
function StatItem({
    label,
    trend,
    trendValue,
    important,
}: {
    label: string;
    trend: 'up' | 'down' | 'neutral';
    trendValue: string;
    important: boolean;
}) {
    const trendConfig = {
        up: {
            icon: TrendingUp,
            color: 'text-green-400',
        },
        down: {
            icon: TrendingDown,
            color: 'text-red-400',
        },
        neutral: {
            icon: Minus,
            color: 'text-slate-400',
        },
    };

    const config = trendConfig[trend];
    const Icon = config.icon;

    return (
        <div className="flex items-center justify-between group hover:bg-slate-800/30 rounded px-2 py-1 -mx-2 transition-colors">
            <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${
                    important ? 'bg-blue-500' : 'bg-slate-700'
                }`}></div>
                <span className={`text-sm ${
                    important ? 'text-slate-200 font-semibold' : 'text-slate-400'
                }`}>
                    {label}
                </span>
            </div>
            <div className="flex items-center gap-1.5">
                <Icon className={`w-3 h-3 ${config.color}`} />
                <span className={`text-xs font-bold ${config.color}`}>
                    {trendValue}
                </span>
            </div>
        </div>
    );
}

/**
 * Compact variant for sidebar or small spaces
 */
export function QuickStatsCompact() {
    const stats = [
        { label: 'Nominations', value: '8', trend: 'up' as const },
        { label: 'Planning', value: '15', trend: 'neutral' as const },
        { label: 'Active', value: '23', trend: 'up' as const },
        { label: 'Strikes', value: '12', trend: 'up' as const },
    ];

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-tight">
                    Quick Stats
                </h3>
                <SecurityBadge level="SECRET" size="sm" showIcon={false} />
            </div>
            <div className="grid grid-cols-2 gap-3">
                {stats.map((stat, index) => (
                    <div key={index} className="text-center">
                        <div className="text-lg font-black text-white mb-0.5">
                            {stat.value}
                        </div>
                        <div className="text-xs text-slate-500 uppercase">
                            {stat.label}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
