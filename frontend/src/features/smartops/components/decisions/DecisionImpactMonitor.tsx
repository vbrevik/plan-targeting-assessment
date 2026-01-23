import { useState } from 'react';
import {
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Activity,
    ChevronDown,
    ChevronUp,
    ChevronRight,
    Info,
    AlertOctagon,
    Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DecisionImpactMonitor } from '@/lib/smartops/types';

interface DecisionImpactMonitorProps {
    impactMonitors: DecisionImpactMonitor[];
    onViewDimension: (dimension: string) => void;
}

export function DecisionImpactMonitorComponent({ impactMonitors, onViewDimension }: DecisionImpactMonitorProps) {
    const [expandedDimension, setExpandedDimension] = useState<string | null>(null);

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'improving':
                return <TrendingUp size={12} className="text-emerald-500" />;
            case 'declining':
                return <TrendingDown size={12} className="text-amber-500" />;
            case 'critical':
                return <AlertOctagon size={12} className="text-red-500" />;
            default:
                return <Activity size={12} className="text-blue-400" />;
        }
    };

    const getTrendColor = (trend: string) => {
        switch (trend) {
            case 'improving':
                return 'text-emerald-400';
            case 'declining':
                return 'text-amber-400';
            case 'critical':
                return 'text-red-400';
            default:
                return 'text-blue-400';
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400 flex items-center gap-2">
                    <Activity size={14} />
                    Decision Impacts
                </h2>
                <span className="text-[8px] text-slate-500 uppercase">Last 30 days</span>
            </div>

            <div className="space-y-2">
                {impactMonitors.map((monitor) => {
                    const isExpanded = expandedDimension === monitor.dimension;
                    const criticalDecisions = monitor.contributingDecisions.filter(d => 
                        Math.abs(d.totalImpact) >= 5 || d.isOngoing
                    );

                    return (
                        <div
                            key={monitor.dimension}
                            className={cn(
                                "rounded-lg border transition-all",
                                monitor.trend === 'critical' && "bg-red-950/20 border-red-500/40",
                                monitor.trend === 'declining' && "bg-amber-950/20 border-amber-500/40",
                                monitor.trend === 'stable' && "bg-slate-900/40 border-slate-700",
                                monitor.trend === 'improving' && "bg-emerald-950/20 border-emerald-500/40"
                            )}
                        >
                            {/* Header */}
                            <button
                                onClick={() => setExpandedDimension(isExpanded ? null : monitor.dimension)}
                                className="w-full p-3 text-left"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        {getTrendIcon(monitor.trend)}
                                        <span className="text-xs font-bold text-white uppercase">
                                            {monitor.dimension}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={cn("text-[9px] font-black uppercase", getTrendColor(monitor.trend))}>
                                            {monitor.trend}
                                        </span>
                                        {isExpanded ? <ChevronUp size={12} className="text-slate-500" /> : <ChevronDown size={12} className="text-slate-500" />}
                                    </div>
                                </div>

                                <div className="flex items-baseline gap-2">
                                    <span className="text-slate-500 text-xs">Baseline:</span>
                                    <span className="text-sm text-slate-400 font-mono">{monitor.baseline}%</span>
                                    <span className="text-slate-600">→</span>
                                    <span className="text-lg text-white font-black font-mono">{monitor.currentScore}%</span>
                                    <span className={cn(
                                        "text-xs font-black ml-1",
                                        monitor.netImpact > 0 ? 'text-emerald-400' : 'text-red-400'
                                    )}>
                                        ({monitor.netImpact > 0 ? '+' : ''}{monitor.netImpact}%)
                                    </span>
                                </div>

                                {monitor.contributingDecisions.length > 0 && (
                                    <div className="mt-1 text-[9px] text-slate-500">
                                        {monitor.contributingDecisions.length} decision{monitor.contributingDecisions.length > 1 ? 's' : ''} affecting this dimension
                                    </div>
                                )}
                            </button>

                            {/* Expanded Details */}
                            {isExpanded && (
                                <div className="px-3 pb-3 space-y-3 border-t border-slate-800 pt-3">
                                    {/* Contributing Decisions */}
                                    {criticalDecisions.length > 0 && (
                                        <div className="space-y-2">
                                            <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                                                Contributing Decisions
                                            </h4>
                                            {criticalDecisions.map((contrib) => (
                                                <div
                                                    key={contrib.decisionId}
                                                    className="p-2 bg-slate-950/50 rounded border border-slate-800"
                                                >
                                                    <div className="flex items-start justify-between mb-1">
                                                        <span className="text-[10px] font-bold text-white">
                                                            {contrib.decisionTitle}
                                                        </span>
                                                        <span className={cn(
                                                            "text-[10px] font-black",
                                                            contrib.totalImpact > 0 ? 'text-emerald-400' : 'text-red-400'
                                                        )}>
                                                            {contrib.totalImpact > 0 ? '+' : ''}{contrib.totalImpact}%
                                                        </span>
                                                    </div>
                                                    <div className="text-[8px] text-slate-500">
                                                        {contrib.daysAgo} days ago
                                                        {contrib.isOngoing && (
                                                            <span className="ml-2 text-amber-400">• Still affecting</span>
                                                        )}
                                                    </div>

                                                    {/* Cascaded Impacts */}
                                                    {contrib.cascadedImpacts.length > 0 && (
                                                        <div className="mt-2 ml-2 border-l-2 border-amber-500/30 pl-2 space-y-1">
                                                            <span className="text-[8px] text-amber-400 font-bold">Cascaded to:</span>
                                                            {contrib.cascadedImpacts.map((cascade, idx) => (
                                                                <div key={idx} className="text-[8px] text-slate-400">
                                                                    → {cascade.description} ({cascade.impact > 0 ? '+' : ''}{cascade.impact}%)
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Forecast */}
                                    {monitor.forecast && (
                                        <div className="p-2 bg-blue-950/20 border border-blue-500/30 rounded">
                                            <div className="flex items-center gap-2 mb-1">
                                                <TrendingUp size={10} className="text-blue-400" />
                                                <span className="text-[9px] font-black uppercase text-blue-400">
                                                    7-Day Forecast
                                                </span>
                                            </div>
                                            <div className="text-[10px] text-slate-300">
                                                Projected: <span className="font-bold text-white">{monitor.forecast.projectedScore}%</span>
                                                <span className="ml-1 text-slate-500">
                                                    (Range: {monitor.forecast.confidenceInterval[0]}-{monitor.forecast.confidenceInterval[1]}%)
                                                </span>
                                            </div>
                                            {monitor.forecast.naturalDecay > 0 && (
                                                <div className="text-[8px] text-slate-500 mt-0.5">
                                                    Natural recovery: +{monitor.forecast.naturalDecay}% expected
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Alerts */}
                                    {monitor.alerts.map((alert, idx) => (
                                        <div
                                            key={idx}
                                            className={cn(
                                                "p-2 rounded border flex items-start gap-2",
                                                alert.severity === 'critical' && "bg-red-950/30 border-red-500/40",
                                                alert.severity === 'warning' && "bg-amber-950/20 border-amber-500/30",
                                                alert.severity === 'info' && "bg-blue-950/20 border-blue-500/30"
                                            )}
                                        >
                                            {alert.severity === 'critical' && <AlertOctagon size={12} className="text-red-400 mt-0.5" />}
                                            {alert.severity === 'warning' && <AlertTriangle size={12} className="text-amber-400 mt-0.5" />}
                                            {alert.severity === 'info' && <Info size={12} className="text-blue-400 mt-0.5" />}
                                            <div className="flex-1">
                                                <div className="text-[9px] text-slate-200 font-bold">
                                                    {alert.message}
                                                </div>
                                                {alert.daysToThreshold && (
                                                    <div className="text-[8px] text-slate-500 mt-0.5">
                                                        Will breach threshold ({alert.threshold}%) in {alert.daysToThreshold} days
                                                    </div>
                                                )}
                                                {alert.recommendedAction && (
                                                    <div className="mt-1 flex items-start gap-1">
                                                        <Lightbulb size={8} className="text-emerald-400 mt-0.5" />
                                                        <span className="text-[8px] text-emerald-400 font-bold">
                                                            Action: {alert.recommendedAction}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
