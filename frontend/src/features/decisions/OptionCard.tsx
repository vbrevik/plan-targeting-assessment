import { useState } from 'react';
import {
    CheckCircle,
    XCircle,
    AlertTriangle,
    Clock,
    Package,
    TrendingUp,
    ChevronRight,
    Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DecisionOption, Consequence, TradeOffAnalysis } from '@/lib/mshnctrl/types';

interface OptionCardProps {
    analyzedOption: {
        option: DecisionOption;
        immediateConsequences: Consequence[];
        secondaryConsequences: Consequence[];
        tradeOffAnalysis: TradeOffAnalysis;
        resourceAvailability: any[];
        overallScore: number;
    };
    recommended: boolean;
    selected: boolean;
    onSelect: () => void;
    showCascades: boolean;
    optionNumber: number;
}

export function OptionCard({
    analyzedOption,
    recommended,
    selected,
    onSelect,
    showCascades,
    optionNumber
}: OptionCardProps) {
    const [expanded, setExpanded] = useState(false);
    const { option, immediateConsequences, secondaryConsequences, tradeOffAnalysis, overallScore } = analyzedOption;

    const positiveImmediate = immediateConsequences.filter(c => c.type === 'positive');
    const negativeImmediate = immediateConsequences.filter(c => c.type === 'negative');

    return (
        <div className={cn(
            "rounded-lg border-2 transition-all",
            recommended && "border-blue-500 bg-blue-950/30 shadow-lg shadow-blue-900/20",
            !recommended && selected && "border-blue-400 bg-slate-900/60",
            !recommended && !selected && "border-slate-700 bg-slate-900/40 hover:border-slate-600"
        )}>
            <div className="p-6">
                {/* Option Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center text-lg font-black",
                            recommended ? "bg-blue-500 text-white" : "bg-slate-800 text-slate-400"
                        )}>
                            {optionNumber}
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white uppercase tracking-tight">
                                {option.label}
                            </h3>
                            <p className="text-sm text-slate-400 mt-1">{option.description}</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        {recommended && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full">
                                <Sparkles size={14} />
                                <span className="text-xs font-black uppercase">Recommended</span>
                            </div>
                        )}
                        <div className={cn(
                            "text-3xl font-black",
                            overallScore > 10 && "text-emerald-400",
                            overallScore > 0 && overallScore <= 10 && "text-blue-400",
                            overallScore < 0 && overallScore >= -10 && "text-amber-400",
                            overallScore < -10 && "text-red-400"
                        )}>
                            {overallScore > 0 ? '+' : ''}{overallScore}
                        </div>
                        <span className="text-xs text-slate-500 uppercase">Overall Score</span>
                    </div>
                </div>

                {/* Immediate Consequences */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                    {/* Positive */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                            <CheckCircle size={14} />
                            Positive Consequences
                        </h4>
                        {positiveImmediate.length > 0 ? (
                            <ul className="space-y-2">
                                {positiveImmediate.map((c, idx) => (
                                    <li key={idx} className="text-sm">
                                        <div className="flex items-start gap-2">
                                            <span className="text-emerald-500 mt-0.5">•</span>
                                            <div className="flex-1">
                                                <span className="text-slate-200">{c.description}</span>
                                                {c.likelihood < 1.0 && (
                                                    <span className="text-slate-500 text-xs ml-2">
                                                        ({Math.round(c.likelihood * 100)}% likely)
                                                    </span>
                                                )}
                                                <div className="text-emerald-400 text-xs mt-1 font-bold">
                                                    Impact: +{c.impactScore} {c.domain}
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-slate-600 italic">No positive consequences identified</p>
                        )}
                    </div>

                    {/* Negative */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-black uppercase tracking-widest text-red-400 flex items-center gap-2">
                            <XCircle size={14} />
                            Negative Consequences
                        </h4>
                        {negativeImmediate.length > 0 ? (
                            <ul className="space-y-2">
                                {negativeImmediate.map((c, idx) => (
                                    <li key={idx} className="text-sm">
                                        <div className="flex items-start gap-2">
                                            <span className="text-red-500 mt-0.5">•</span>
                                            <div className="flex-1">
                                                <span className="text-slate-200">{c.description}</span>
                                                {c.likelihood < 1.0 && (
                                                    <span className="text-slate-500 text-xs ml-2">
                                                        ({Math.round(c.likelihood * 100)}% likely)
                                                    </span>
                                                )}
                                                <div className="text-red-400 text-xs mt-1 font-bold">
                                                    Impact: {c.impactScore} {c.domain}
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-slate-600 italic">No negative consequences identified</p>
                        )}
                    </div>
                </div>

                {/* Secondary Consequences (Cascading) */}
                {showCascades && secondaryConsequences.length > 0 && (
                    <div className="mb-6 p-4 bg-amber-950/20 border border-amber-500/30 rounded-lg">
                        <h4 className="text-xs font-black uppercase tracking-widest text-amber-400 flex items-center gap-2 mb-3">
                            <AlertTriangle size={14} />
                            Secondary Consequences (24-72h)
                        </h4>
                        <ul className="space-y-3">
                            {secondaryConsequences.map((c, idx) => (
                                <li key={idx} className="text-sm">
                                    <div className="flex items-start gap-2">
                                        <span className="text-amber-500 mt-0.5">•</span>
                                        <div className="flex-1">
                                            <span className="text-slate-200">{c.description}</span>
                                            {c.likelihood < 1.0 && (
                                                <span className="text-slate-500 text-xs ml-2">
                                                    ({Math.round(c.likelihood * 100)}% likely)
                                                </span>
                                            )}
                                            <div className={cn(
                                                "text-xs mt-1 font-bold",
                                                c.type === 'positive' ? 'text-emerald-400' : 'text-amber-400'
                                            )}>
                                                Impact: {c.impactScore > 0 ? '+' : ''}{c.impactScore} {c.domain}
                                            </div>

                                            {/* Cascades */}
                                            {c.cascades && c.cascades.length > 0 && (
                                                <div className="ml-4 mt-2 border-l-2 border-amber-500/30 pl-3">
                                                    <span className="text-xs text-amber-400 font-bold">Cascades to:</span>
                                                    <ul className="space-y-1 mt-1">
                                                        {c.cascades.map((cascade, cidx) => (
                                                            <li key={cidx} className="text-xs text-slate-400">
                                                                → {cascade.description} ({cascade.impactScore > 0 ? '+' : ''}{cascade.impactScore} {cascade.domain})
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Trade-Off Analysis */}
                <div className="mb-6 p-4 bg-slate-950/80 rounded-lg border border-slate-700">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                        <TrendingUp size={14} />
                        Trade-Off Analysis
                    </h4>
                    <div className="space-y-2">
                        {Object.entries(tradeOffAnalysis.dimensions).map(([dimension, impact]) => (
                            <div key={dimension} className="flex items-center gap-3">
                                <div className="w-28 text-xs text-slate-400 font-bold uppercase">
                                    {dimension}:
                                </div>
                                <div className="flex-1 flex items-center gap-2">
                                    <span className="text-sm text-slate-400 font-mono">
                                        {impact.currentScore}%
                                    </span>
                                    <span className="text-slate-600">→</span>
                                    <span className={cn(
                                        "text-sm font-bold font-mono",
                                        impact.projectedImpact > 0 ? 'text-emerald-400' : 'text-red-400'
                                    )}>
                                        {impact.newScore}% 
                                        ({impact.projectedImpact > 0 ? '+' : ''}{impact.projectedImpact}%)
                                    </span>
                                    <div className="ml-auto flex items-center gap-2">
                                        {impact.breachesThreshold ? (
                                            <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-black border border-red-500/30 rounded flex items-center gap-1">
                                                🔴 BREACHES threshold ({impact.threshold}%)
                                            </span>
                                        ) : (
                                            <span className="text-xs text-emerald-500 flex items-center gap-1">
                                                🟢 Above threshold
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Timeline & Resources */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-3 bg-slate-950/50 rounded border border-slate-800">
                        <h5 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-2">
                            <Clock size={12} />
                            Timeline
                        </h5>
                        <div className="space-y-1 text-xs text-slate-300">
                            <div>• Execution: {option.timeline.executionDuration}</div>
                            <div>• First impact: {option.timeline.firstImpactTime}</div>
                            <div>• Full impact: {option.timeline.fullImpactTime}</div>
                            {option.timeline.reversibilityWindow && (
                                <div className="text-amber-400">
                                    • Reversibility: {option.timeline.reversibilityWindow}
                                </div>
                            )}
                        </div>
                    </div>

                    {option.resourceRequirements && option.resourceRequirements.length > 0 && (
                        <div className="p-3 bg-slate-950/50 rounded border border-slate-800">
                            <h5 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-2">
                                <Package size={12} />
                                Resources Required
                            </h5>
                            <div className="space-y-1 text-xs text-slate-300">
                                {option.resourceRequirements.map((req, idx) => (
                                    <div key={idx} className="flex items-center justify-between">
                                        <span>• {req.quantity} {req.unit} {req.resourceType}</span>
                                        <span className={cn(
                                            "text-xs font-bold",
                                            req.availability === 'available' && "text-emerald-500",
                                            req.availability === 'constrained' && "text-amber-500",
                                            req.availability === 'unavailable' && "text-red-500"
                                        )}>
                                            {req.availability === 'available' ? '✅' : '⚠️'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* System Recommendation */}
                <div className={cn(
                    "p-3 rounded border flex items-center gap-3 mb-4",
                    recommended 
                        ? "bg-blue-500/10 border-blue-500/30"
                        : overallScore > 0 
                            ? "bg-emerald-500/10 border-emerald-500/30"
                            : "bg-red-500/10 border-red-500/30"
                )}>
                    <div className={cn(
                        "text-2xl",
                        recommended ? "text-blue-400" : overallScore > 0 ? "text-emerald-400" : "text-red-400"
                    )}>
                        {recommended ? '✅' : overallScore > 0 ? '⚠️' : '❌'}
                    </div>
                    <div className="flex-1">
                        <div className={cn(
                            "text-xs font-black uppercase tracking-widest",
                            recommended ? "text-blue-400" : overallScore > 0 ? "text-emerald-400" : "text-red-400"
                        )}>
                            SYSTEM RECOMMENDATION: {recommended ? 'RECOMMENDED' : overallScore > 0 ? 'ACCEPTABLE ALTERNATIVE' : 'NOT RECOMMENDED'}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                            {option.confidence && (
                                <>
                                    Confidence: {Math.round(option.confidence * 100)}% | 
                                </>
                            )}
                            {' '}Based on {immediateConsequences.length} immediate + {secondaryConsequences.length} secondary consequences
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <button
                    onClick={onSelect}
                    className={cn(
                        "w-full py-3 rounded-lg font-black uppercase text-sm transition-all flex items-center justify-center gap-2",
                        recommended && "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/30",
                        !recommended && overallScore > 0 && "bg-emerald-600 hover:bg-emerald-700 text-white",
                        !recommended && overallScore <= 0 && "bg-slate-700 hover:bg-slate-600 text-slate-300",
                        selected && "ring-2 ring-blue-400"
                    )}
                >
                    {selected ? 'Selected' : 'Select'} {option.label}
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
}
