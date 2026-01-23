import { useState } from 'react';
import {
    Clock,
    CheckCircle2,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    Loader2,
    ChevronRight,
    FileText,
    XCircle,
    Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DecisionTracking } from '@/lib/smartops/types';

interface DecisionTrackerProps {
    trackedDecisions: DecisionTracking[];
    onViewDetails: (decisionId: string) => void;
}

export function DecisionTracker({ trackedDecisions, onViewDetails }: DecisionTrackerProps) {
    const [expanded, setExpanded] = useState(true);

    const statusConfig = {
        unfolding: {
            icon: Loader2,
            color: 'text-blue-400',
            bgColor: 'bg-blue-950/30',
            borderColor: 'border-blue-500/40',
            label: 'UNFOLDING'
        },
        complete: {
            icon: CheckCircle2,
            color: 'text-emerald-400',
            bgColor: 'bg-emerald-950/20',
            borderColor: 'border-emerald-500/40',
            label: 'COMPLETE'
        },
        needs_review: {
            icon: AlertTriangle,
            color: 'text-amber-400',
            bgColor: 'bg-amber-950/30',
            borderColor: 'border-amber-500/50',
            label: 'NEEDS REVIEW'
        },
        closed: {
            icon: XCircle,
            color: 'text-slate-500',
            bgColor: 'bg-slate-900/20',
            borderColor: 'border-slate-700',
            label: 'CLOSED'
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-blue-400 flex items-center gap-2">
                    <Clock size={14} />
                    Recent Decisions
                </h2>
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[9px] font-black border border-blue-500/30 rounded-full">
                    {trackedDecisions.length} TRACKING
                </span>
            </div>

            <div className="space-y-2">
                {trackedDecisions.map((tracking) => {
                    const config = statusConfig[tracking.status];
                    const StatusIcon = config.icon;
                    const accuracyPercent = Math.round(tracking.accuracy * 100);
                    
                    return (
                        <button
                            key={tracking.decisionId}
                            onClick={() => onViewDetails(tracking.decisionId)}
                            className={cn(
                                "w-full group p-3 rounded-lg border transition-all cursor-pointer text-left",
                                config.bgColor,
                                config.borderColor,
                                "hover:border-blue-400"
                            )}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <StatusIcon 
                                        size={12} 
                                        className={cn(
                                            config.color,
                                            tracking.status === 'unfolding' && 'animate-spin'
                                        )} 
                                    />
                                    <span className={cn(
                                        "text-[9px] font-black uppercase tracking-widest",
                                        config.color
                                    )}>
                                        {config.label}
                                    </span>
                                </div>
                                <span className="text-[8px] text-slate-500 uppercase">
                                    {tracking.daysElapsed}d ago
                                </span>
                            </div>

                            <h3 className="text-xs font-bold text-white mb-1 leading-tight group-hover:text-blue-300 transition-colors">
                                {tracking.decisionTitle}
                            </h3>
                            <p className="text-[9px] text-slate-400">
                                {tracking.selectedOption.label}
                            </p>

                            <div className="mt-2 flex items-center justify-between">
                                <div className="flex items-center gap-3 text-[9px]">
                                    <div>
                                        <span className="text-slate-500">Predicted:</span>
                                        <span className={cn(
                                            "ml-1 font-bold",
                                            tracking.predictedScore > 0 ? 'text-emerald-400' : 'text-red-400'
                                        )}>
                                            {tracking.predictedScore > 0 ? '+' : ''}{tracking.predictedScore}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Actual:</span>
                                        <span className={cn(
                                            "ml-1 font-bold",
                                            tracking.actualScore > 0 ? 'text-emerald-400' : 'text-red-400'
                                        )}>
                                            {tracking.actualScore > 0 ? '+' : ''}{tracking.actualScore}
                                        </span>
                                    </div>
                                    <div className={cn(
                                        "px-1.5 py-0.5 rounded text-[8px] font-black",
                                        accuracyPercent >= 80 && "bg-emerald-500/20 text-emerald-400",
                                        accuracyPercent >= 60 && accuracyPercent < 80 && "bg-blue-500/20 text-blue-400",
                                        accuracyPercent < 60 && "bg-amber-500/20 text-amber-400"
                                    )}>
                                        {accuracyPercent}% ACC
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 text-[8px] text-slate-500 group-hover:text-blue-400 transition-colors font-black uppercase">
                                    Details
                                    <ChevronRight size={10} />
                                </div>
                            </div>

                            {/* Consequence Status Indicators */}
                            {tracking.status === 'unfolding' && (
                                <div className="mt-2 flex items-center gap-2 text-[8px]">
                                    {tracking.consequenceTracking.filter(c => c.status === 'complete').length > 0 && (
                                        <div className="flex items-center gap-1">
                                            <CheckCircle2 size={8} className="text-emerald-500" />
                                            <span className="text-slate-500">
                                                {tracking.consequenceTracking.filter(c => c.status === 'complete').length} complete
                                            </span>
                                        </div>
                                    )}
                                    {tracking.consequenceTracking.filter(c => c.status === 'on_track' || c.status === 'pending').length > 0 && (
                                        <div className="flex items-center gap-1">
                                            <Loader2 size={8} className="text-blue-400 animate-spin" />
                                            <span className="text-slate-500">
                                                {tracking.consequenceTracking.filter(c => c.status === 'on_track' || c.status === 'pending').length} in progress
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Alerts for discrepancies */}
                            {tracking.discrepancies.length > 0 && (
                                <div className="mt-2 flex items-center gap-1 text-[8px] text-amber-400 font-bold">
                                    <AlertTriangle size={8} />
                                    {tracking.discrepancies.length} discrepanc{tracking.discrepancies.length > 1 ? 'ies' : 'y'} detected
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {trackedDecisions.length === 0 && (
                <div className="p-4 text-center text-xs text-slate-600 italic">
                    No recent decisions to track
                </div>
            )}
        </div>
    );
}
