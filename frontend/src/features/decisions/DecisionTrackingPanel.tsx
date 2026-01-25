import {
    X,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Loader2,
    TrendingUp,
    Target,
    Clock,
    FileCheck,
    AlertOctagon,
    Lightbulb,
    BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DecisionTracking } from '@/lib/smartops/types';

interface DecisionTrackingPanelProps {
    tracking: DecisionTracking;
    onClose: () => void;
}

export function DecisionTrackingPanel({ tracking, onClose }: DecisionTrackingPanelProps) {
    const statusConfig = {
        unfolding: {
            icon: Loader2,
            color: 'text-blue-400',
            bgColor: 'bg-blue-950/30',
            label: 'UNFOLDING',
            description: 'Consequences still manifesting'
        },
        complete: {
            icon: CheckCircle2,
            color: 'text-emerald-400',
            bgColor: 'bg-emerald-950/20',
            label: 'COMPLETE',
            description: 'All consequences tracked'
        },
        needs_review: {
            icon: AlertTriangle,
            color: 'text-amber-400',
            bgColor: 'bg-amber-950/30',
            label: 'NEEDS REVIEW',
            description: 'Discrepancies require attention'
        },
        closed: {
            icon: XCircle,
            color: 'text-slate-500',
            bgColor: 'bg-slate-900/20',
            label: 'CLOSED',
            description: 'Tracking completed'
        }
    };

    const config = statusConfig[tracking.status];
    const StatusIcon = config.icon;
    const accuracyPercent = Math.round(tracking.accuracy * 100);

    const completeConsequences = tracking.consequenceTracking.filter(c => c.status === 'complete');
    const onTrackConsequences = tracking.consequenceTracking.filter(c => c.status === 'on_track' || c.status === 'pending');
    const unexpectedConsequences = tracking.consequenceTracking.filter(c => c.status === 'unexpected');
    const avoidedRisks = tracking.consequenceTracking.filter(c => c.status === 'risk_avoided');

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/98 overflow-y-auto backdrop-blur-sm">
            <div className="min-h-screen p-8">
                <div className="max-w-6xl mx-auto">
                    
                    {/* Header */}
                    <div className={cn(
                        "p-8 rounded-t-2xl border-2",
                        config.bgColor,
                        `border-${config.color.replace('text-', '')}-500`
                    )}>
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <button
                                        onClick={onClose}
                                        className="p-1 hover:bg-slate-800 rounded transition-colors text-slate-400 hover:text-white"
                                    >
                                        <X size={20} />
                                    </button>
                                    <StatusIcon 
                                        size={16} 
                                        className={cn(
                                            config.color,
                                            tracking.status === 'unfolding' && 'animate-spin'
                                        )} 
                                    />
                                    <span className={cn(
                                        "px-3 py-1 text-xs font-black uppercase rounded-full border",
                                        config.color,
                                        config.bgColor
                                    )}>
                                        {config.label}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        {config.description}
                                    </span>
                                </div>
                                <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
                                    {tracking.decisionTitle}
                                </h1>
                                <p className="text-sm text-slate-400">
                                    Selected Option: <span className="text-white font-bold">{tracking.selectedOption.label}</span>
                                </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <div className="text-xs text-slate-500">Approved {tracking.daysElapsed} days ago</div>
                                <div className="text-xs text-slate-500">
                                    Day {tracking.daysElapsed} of {tracking.expectedDuration} expected
                                </div>
                            </div>
                        </div>

                        {/* Accuracy Indicator */}
                        <div className="flex items-center gap-4 p-4 bg-slate-950/50 rounded-lg">
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                                        Prediction Accuracy
                                    </span>
                                    <span className={cn(
                                        "text-2xl font-black",
                                        accuracyPercent >= 80 && "text-emerald-400",
                                        accuracyPercent >= 60 && accuracyPercent < 80 && "text-blue-400",
                                        accuracyPercent < 60 && "text-amber-400"
                                    )}>
                                        {accuracyPercent}%
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm">
                                    <div>
                                        <span className="text-slate-500">Predicted:</span>
                                        <span className={cn(
                                            "ml-2 font-black",
                                            tracking.predictedScore > 0 ? 'text-emerald-400' : 'text-red-400'
                                        )}>
                                            {tracking.predictedScore > 0 ? '+' : ''}{tracking.predictedScore}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Actual (so far):</span>
                                        <span className={cn(
                                            "ml-2 font-black",
                                            tracking.actualScore > 0 ? 'text-emerald-400' : 'text-red-400'
                                        )}>
                                            {tracking.actualScore > 0 ? '+' : ''}{tracking.actualScore}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Consequence Tracking */}
                    <div className="border-x-2 border-slate-800 bg-slate-950/80 p-8">
                        <h2 className="text-sm font-black uppercase tracking-widest text-white mb-6 flex items-center gap-2">
                            <Target size={16} className="text-blue-400" />
                            Consequence Tracking
                        </h2>

                        {/* Complete Consequences */}
                        {completeConsequences.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-3 flex items-center gap-2">
                                    <CheckCircle2 size={12} />
                                    Completed ({completeConsequences.length})
                                </h3>
                                <div className="space-y-2">
                                    {completeConsequences.map((outcome) => (
                                        <div
                                            key={outcome.consequenceId}
                                            className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded"
                                        >
                                            <div className="flex items-start justify-between mb-1">
                                                <span className="text-sm text-white font-bold flex-1">
                                                    {outcome.description}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    {outcome.actual.impactScore && (
                                                        <span className={cn(
                                                            "text-sm font-black",
                                                            outcome.actual.impactScore > 0 ? 'text-emerald-400' : 'text-red-400'
                                                        )}>
                                                            {outcome.actual.impactScore > 0 ? '+' : ''}{outcome.actual.impactScore}
                                                        </span>
                                                    )}
                                                    {Math.abs(outcome.variance) <= 5 && (
                                                        <CheckCircle2 size={14} className="text-emerald-500" />
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-slate-400">
                                                <div>
                                                    Predicted: {outcome.predicted.impactScore > 0 ? '+' : ''}{outcome.predicted.impactScore}
                                                </div>
                                                <div>
                                                    Actual: {outcome.actual.impactScore ? (outcome.actual.impactScore > 0 ? '+' : '') + outcome.actual.impactScore : 'N/A'}
                                                </div>
                                                {outcome.actual.impactScore && (
                                                    <div className={cn(
                                                        "font-bold",
                                                        Math.abs(outcome.variance) <= 5 ? 'text-emerald-400' : 'text-amber-400'
                                                    )}>
                                                        Variance: {outcome.variance > 0 ? '+' : ''}{outcome.variance}
                                                        {' '}({Math.round((Math.abs(outcome.actual.impactScore) / Math.abs(outcome.predicted.impactScore)) * 100)}% of prediction)
                                                    </div>
                                                )}
                                            </div>
                                            {outcome.actual.notes && (
                                                <div className="mt-2 text-xs text-slate-400 italic">
                                                    Note: {outcome.actual.notes}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* In Progress Consequences */}
                        {onTrackConsequences.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-xs font-black uppercase tracking-widest text-blue-400 mb-3 flex items-center gap-2">
                                    <Loader2 size={12} className="animate-spin" />
                                    In Progress ({onTrackConsequences.length})
                                </h3>
                                <div className="space-y-2">
                                    {onTrackConsequences.map((outcome) => (
                                        <div
                                            key={outcome.consequenceId}
                                            className="p-3 bg-blue-950/20 border border-blue-500/30 rounded"
                                        >
                                            <div className="flex items-start justify-between">
                                                <span className="text-sm text-white font-bold flex-1">
                                                    {outcome.description}
                                                </span>
                                                <span className="text-xs text-blue-400 font-black uppercase">
                                                    {outcome.status === 'on_track' ? 'ON TRACK' : 'PENDING'}
                                                </span>
                                            </div>
                                            <div className="text-xs text-slate-400 mt-1">
                                                Expected impact: {outcome.predicted.impactScore > 0 ? '+' : ''}{outcome.predicted.impactScore}
                                                {' '}({outcome.predicted.likelihood * 100}% likely)
                                            </div>
                                            <div className="text-xs text-slate-500 mt-1">
                                                Timeframe: {outcome.predicted.timeframe}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Avoided Risks */}
                        {avoidedRisks.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-3 flex items-center gap-2">
                                    <CheckCircle2 size={12} />
                                    Risks Avoided ({avoidedRisks.length})
                                </h3>
                                <div className="space-y-2">
                                    {avoidedRisks.map((outcome) => (
                                        <div
                                            key={outcome.consequenceId}
                                            className="p-3 bg-emerald-950/10 border border-emerald-500/20 rounded"
                                        >
                                            <div className="flex items-start gap-2">
                                                <CheckCircle2 size={14} className="text-emerald-500 mt-0.5" />
                                                <div className="flex-1">
                                                    <span className="text-sm text-slate-200 line-through">
                                                        {outcome.description}
                                                    </span>
                                                    <div className="text-xs text-emerald-400 mt-1 font-bold">
                                                        ✓ Risk did not materialize (was {Math.round(outcome.predicted.likelihood * 100)}% likely)
                                                    </div>
                                                    {outcome.actual.notes && (
                                                        <div className="text-xs text-slate-500 mt-1 italic">
                                                            {outcome.actual.notes}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Unexpected Consequences */}
                        {unexpectedConsequences.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-xs font-black uppercase tracking-widest text-amber-400 mb-3 flex items-center gap-2">
                                    <AlertTriangle size={12} />
                                    Unexpected ({unexpectedConsequences.length})
                                </h3>
                                <div className="space-y-2">
                                    {unexpectedConsequences.map((outcome) => (
                                        <div
                                            key={outcome.consequenceId}
                                            className="p-3 bg-amber-950/20 border border-amber-500/40 rounded"
                                        >
                                            <div className="flex items-start gap-2">
                                                <AlertTriangle size={14} className="text-amber-500 mt-0.5" />
                                                <div className="flex-1">
                                                    <span className="text-sm text-white font-bold">
                                                        {outcome.description}
                                                    </span>
                                                    <div className="text-xs text-amber-400 mt-1">
                                                        This consequence was NOT predicted by the model
                                                    </div>
                                                    {outcome.actual.impactScore && (
                                                        <div className="text-xs text-slate-400 mt-1">
                                                            Actual impact: {outcome.actual.impactScore > 0 ? '+' : ''}{outcome.actual.impactScore}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Discrepancies */}
                    {tracking.discrepancies.length > 0 && (
                        <div className="border-x-2 border-slate-800 bg-slate-900/40 p-8">
                            <h2 className="text-sm font-black uppercase tracking-widest text-amber-400 mb-6 flex items-center gap-2">
                                <AlertOctagon size={16} />
                                Discrepancies Detected ({tracking.discrepancies.length})
                            </h2>
                            <div className="space-y-4">
                                {tracking.discrepancies.map((discrepancy, idx) => (
                                    <div
                                        key={idx}
                                        className="p-4 bg-amber-950/20 border border-amber-500/40 rounded-lg"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="text-sm font-bold text-white">
                                                {discrepancy.description}
                                            </h3>
                                            <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-[9px] font-black uppercase rounded">
                                                {discrepancy.type.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-xs mb-3">
                                            <div>
                                                <span className="text-slate-500">Predicted Impact:</span>
                                                <span className="ml-2 font-bold text-white">
                                                    {discrepancy.predictedImpact > 0 ? '+' : ''}{discrepancy.predictedImpact}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-500">Actual Impact:</span>
                                                <span className="ml-2 font-bold text-white">
                                                    {discrepancy.actualImpact > 0 ? '+' : ''}{discrepancy.actualImpact}
                                                </span>
                                            </div>
                                        </div>
                                        {discrepancy.rootCause && (
                                            <div className="mb-2 p-2 bg-slate-950/50 rounded border border-slate-800">
                                                <span className="text-xs text-amber-400 font-bold">Root Cause: </span>
                                                <span className="text-xs text-slate-300">{discrepancy.rootCause}</span>
                                            </div>
                                        )}
                                        {discrepancy.recommendation && (
                                            <div className="flex items-start gap-2 p-2 bg-blue-950/20 border border-blue-500/30 rounded">
                                                <Lightbulb size={12} className="text-blue-400 mt-0.5" />
                                                <span className="text-xs text-blue-300">{discrepancy.recommendation}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Learnings */}
                    {tracking.learnings.length > 0 && (
                        <div className="border-x-2 border-slate-800 bg-slate-950/60 p-8">
                            <h2 className="text-sm font-black uppercase tracking-widest text-blue-400 mb-6 flex items-center gap-2">
                                <Lightbulb size={16} />
                                Learnings & Model Updates ({tracking.learnings.length})
                            </h2>
                            <div className="space-y-3">
                                {tracking.learnings.map((learning, idx) => (
                                    <div
                                        key={idx}
                                        className="p-4 bg-blue-950/20 border border-blue-500/30 rounded-lg"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-blue-500/20 rounded">
                                                <Lightbulb size={14} className="text-blue-400" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-xs text-blue-400 font-black uppercase mb-1">
                                                    {learning.category.replace('_', ' ')}
                                                </div>
                                                <p className="text-sm text-white font-bold mb-2">
                                                    {learning.insight}
                                                </p>
                                                <div className="p-2 bg-slate-950/50 rounded border border-slate-800">
                                                    <span className="text-xs text-emerald-400 font-bold">Actionable: </span>
                                                    <span className="text-xs text-slate-300">{learning.actionable}</span>
                                                </div>
                                                {learning.modelUpdate && (
                                                    <div className="mt-2 text-xs text-blue-400 flex items-center gap-1">
                                                        <BarChart3 size={10} />
                                                        <span>ML model update scheduled</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Timeline Visualization */}
                    <div className="border-x-2 border-b-2 border-slate-800 bg-slate-900/40 p-8 rounded-b-2xl">
                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                            <Clock size={16} />
                            Timeline
                        </h2>
                        <div className="relative">
                            {/* Timeline bar */}
                            <div className="h-1 bg-slate-800 rounded-full mb-8 relative">
                                <div 
                                    className="h-full bg-blue-500 rounded-full transition-all"
                                    style={{ width: `${(tracking.daysElapsed / tracking.expectedDuration) * 100}%` }}
                                />
                                <div 
                                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full border-2 border-slate-950"
                                    style={{ left: `${(tracking.daysElapsed / tracking.expectedDuration) * 100}%` }}
                                />
                            </div>

                            {/* Timeline labels */}
                            <div className="flex justify-between text-xs text-slate-500">
                                <div className="flex flex-col items-center">
                                    <span className="text-emerald-400 font-bold">D+0</span>
                                    <span className="text-[9px]">Approved</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-blue-400 font-bold">D+{tracking.daysElapsed}</span>
                                    <span className="text-[9px]">NOW</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-slate-600 font-bold">D+{tracking.expectedDuration}</span>
                                    <span className="text-[9px]">Expected Complete</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
