import React from 'react';
import { Activity, TrendingUp, Target, Lightbulb } from 'lucide-react';
import { SecurityBadge, type ClassificationLevel } from '@/components/SecurityBadge';
import { Link } from '@tanstack/react-router';

/**
 * Strike Result Interface
 */
export interface StrikeResult {
    id: string;
    targetId: string;
    targetName: string;
    classification: ClassificationLevel;
    bda: 'DESTROYED' | 'DAMAGED' | 'MISS' | 'ASSESSED';
    effectiveness: number; // percentage
    timestamp: string;
}

/**
 * Pattern Analysis Interface
 */
export interface PatternAnalysis {
    insight: string;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    impact: string;
}

/**
 * RecentBDAPanel Component
 * 
 * Displays 24-hour Battle Damage Assessment summary with pattern analysis.
 * 
 * Purpose:
 * - Backward-looking (lowest priority in layout)
 * - But actionable (lessons learned inform future targeting)
 * - Pattern detection helps identify issues
 * 
 * Key Features:
 * - Overall effectiveness metric
 * - Outcome visualization (Destroyed/Damaged/Miss)
 * - Pattern analysis with confidence levels
 * - Link to full BDA workbench
 * 
 * Classification:
 * - Panel: SECRET
 * - Individual strikes: SECRET or higher
 * - Imagery: Often TS/SCI (not shown here)
 * 
 * @example
 * <RecentBDAPanel />
 */
export function RecentBDAPanel() {
    const bdaData = {
        totalStrikes: 12,
        avgEffectiveness: 91,
        outcomes: {
            destroyed: 9,
            damaged: 2,
            miss: 1,
        },
        strikes: [
            {
                id: 'S-1823',
                targetId: 'T-2387',
                targetName: 'Radar Installation',
                classification: 'SECRET' as ClassificationLevel,
                bda: 'DESTROYED' as const,
                effectiveness: 95,
                timestamp: '6 hours ago',
            },
            {
                id: 'S-1821',
                targetId: 'T-2385',
                targetName: 'Logistics Hub',
                classification: 'SECRET' as ClassificationLevel,
                bda: 'DAMAGED' as const,
                effectiveness: 72,
                timestamp: '14 hours ago',
            },
            {
                id: 'S-1819',
                targetId: 'T-2382',
                targetName: 'Communication Node',
                classification: 'TOP_SECRET' as ClassificationLevel,
                bda: 'DESTROYED' as const,
                effectiveness: 98,
                timestamp: '1 day ago',
            },
        ],
        patterns: [
            {
                insight: 'SAM sites proving harder than expected - consider SEAD escorts',
                confidence: 'HIGH' as const,
                impact: 'Tactical adjustment recommended',
            },
            {
                insight: 'Night strikes show 15% better effectiveness',
                confidence: 'MEDIUM' as const,
                impact: 'Consider shifting TOT preferences',
            },
        ],
    };

    const bdaColors = {
        DESTROYED: { bg: 'bg-green-950/50', text: 'text-green-400', border: 'border-green-900' },
        DAMAGED: { bg: 'bg-amber-950/50', text: 'text-amber-400', border: 'border-amber-900' },
        MISS: { bg: 'bg-red-950/50', text: 'text-red-400', border: 'border-red-900' },
        ASSESSED: { bg: 'bg-blue-950/50', text: 'text-blue-400', border: 'border-blue-900' },
    };

    const confidenceColors = {
        HIGH: 'text-green-400',
        MEDIUM: 'text-amber-400',
        LOW: 'text-slate-400',
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-lg">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-green-400" />
                    <h2 className="font-black uppercase text-sm text-white tracking-tight">
                        Last 24H Effectiveness
                    </h2>
                </div>
                <SecurityBadge level="SECRET" size="sm" />
            </div>

            <div className="p-6 space-y-4">
                {/* Summary Stats */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <div className="text-xs text-slate-500 uppercase font-bold mb-1">
                                Strikes
                            </div>
                            <div className="text-2xl font-black text-white">
                                {bdaData.totalStrikes}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-slate-500 uppercase font-bold mb-1">
                                Avg Effectiveness
                            </div>
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-green-400" />
                                <div className="text-2xl font-black text-green-400">
                                    {bdaData.avgEffectiveness}%
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Outcome Breakdown */}
                    <div className="space-y-2">
                        <OutcomeBar 
                            label="DESTROYED"
                            count={bdaData.outcomes.destroyed}
                            total={bdaData.totalStrikes}
                            color="green"
                        />
                        <OutcomeBar 
                            label="DAMAGED"
                            count={bdaData.outcomes.damaged}
                            total={bdaData.totalStrikes}
                            color="amber"
                        />
                        <OutcomeBar 
                            label="MISS"
                            count={bdaData.outcomes.miss}
                            total={bdaData.totalStrikes}
                            color="red"
                        />
                    </div>
                </div>

                {/* Pattern Analysis - Lessons Learned */}
                <div className="border-t border-slate-800 pt-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs font-bold text-slate-400 uppercase">
                            Pattern Analysis
                        </span>
                    </div>
                    
                    <div className="space-y-2">
                        {bdaData.patterns.map((pattern, index) => (
                            <div 
                                key={index}
                                className="bg-slate-800/50 border border-slate-700 rounded p-3"
                            >
                                <div className="flex items-start gap-2 mb-1">
                                    <span className={`text-xs font-bold uppercase ${confidenceColors[pattern.confidence]}`}>
                                        {pattern.confidence}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-300 mb-2">
                                    💡 {pattern.insight}
                                </p>
                                <p className="text-xs text-slate-500 italic">
                                    {pattern.impact}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Strikes Preview */}
                <div className="border-t border-slate-800 pt-4">
                    <span className="text-xs font-bold text-slate-400 uppercase mb-3 block">
                        Recent Strikes
                    </span>
                    <div className="space-y-2">
                        {bdaData.strikes.slice(0, 3).map(strike => {
                            const config = bdaColors[strike.bda];
                            return (
                                <div 
                                    key={strike.id}
                                    className="flex items-center justify-between bg-slate-800/30 border border-slate-700 rounded p-2 text-xs"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-500 font-mono">{strike.targetId}</span>
                                        <span className="text-slate-400">•</span>
                                        <span className={`px-1.5 py-0.5 rounded text-xs font-bold uppercase border ${config.bg} ${config.text} ${config.border}`}>
                                            {strike.bda}
                                        </span>
                                    </div>
                                    <span className={`font-bold ${strike.effectiveness >= 90 ? 'text-green-400' : strike.effectiveness >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
                                        {strike.effectiveness}%
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Link to Full BDA Workbench */}
                <div className="border-t border-slate-800 pt-4">
                    <Link
                        to="/mshnctrl/bda"
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded hover:border-green-600 hover:bg-green-950/20 transition-colors group"
                    >
                        <Activity className="w-3 h-3 text-slate-400 group-hover:text-green-400" />
                        <span className="text-xs font-bold text-slate-300 group-hover:text-white uppercase">
                            Full BDA Workbench
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    );
}

/**
 * Outcome Bar Component
 * 
 * Visual bar showing count and percentage of outcome type
 */
function OutcomeBar({
    label,
    count,
    total,
    color,
}: {
    label: string;
    count: number;
    total: number;
    color: 'green' | 'amber' | 'red';
}) {
    const percentage = Math.round((count / total) * 100);
    
    const colorClasses = {
        green: { bg: 'bg-green-600', text: 'text-green-400' },
        amber: { bg: 'bg-amber-600', text: 'text-amber-400' },
        red: { bg: 'bg-red-600', text: 'text-red-400' },
    };

    const config = colorClasses[color];

    return (
        <div>
            <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-400 font-bold uppercase">{label}</span>
                <span className={`font-black ${config.text}`}>
                    {count} ({percentage}%)
                </span>
            </div>
            <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div 
                    className={`h-full ${config.bg} rounded-full transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
