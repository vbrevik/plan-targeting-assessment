import { Gavel, AlertTriangle, Clock, ChevronRight, Shield, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Decision, ROEStatus } from '@/lib/mshnctrl/types';

interface DecisionCardProps {
    decision: Decision;
    onExpand: () => void;
}

function getROEStatusInfo(roeStatus: ROEStatus) {
    const statusMap = {
        within_approved_roe: {
            label: 'WITHIN ROE',
            description: 'Approved under current ROE',
            color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
            icon: Shield,
            iconColor: 'text-emerald-400'
        },
        requires_roe_release: {
            label: 'ROE REQUIRED',
            description: 'Requires new ROE authorization',
            color: 'bg-red-500/20 text-red-400 border-red-500/40',
            icon: ShieldAlert,
            iconColor: 'text-red-400'
        },
        roe_pending_approval: {
            label: 'ROE PENDING',
            description: 'ROE release request submitted',
            color: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
            icon: ShieldAlert,
            iconColor: 'text-amber-400'
        },
        roe_approved: {
            label: 'ROE APPROVED',
            description: 'New ROE approved, can proceed',
            color: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
            icon: Shield,
            iconColor: 'text-blue-400'
        },
        roe_rejected: {
            label: 'ROE REJECTED',
            description: 'ROE request rejected',
            color: 'bg-red-500/20 text-red-400 border-red-500/40',
            icon: ShieldAlert,
            iconColor: 'text-red-400'
        }
    };
    return statusMap[roeStatus];
}

export function DecisionCard({ decision, onExpand }: DecisionCardProps) {
    const urgencyColors = {
        critical: 'bg-red-950/30 border-red-500/70 hover:bg-red-950/50 hover:border-red-400',
        high: 'bg-amber-950/20 border-amber-500/50 hover:bg-amber-950/40 hover:border-amber-400',
        medium: 'bg-blue-950/20 border-blue-500/40 hover:bg-blue-950/30 hover:border-blue-400',
        low: 'bg-slate-900/40 border-slate-600 hover:bg-slate-900/60 hover:border-slate-500'
    };

    const urgencyTextColors = {
        critical: 'text-red-400',
        high: 'text-amber-400',
        medium: 'text-blue-400',
        low: 'text-slate-400'
    };

    const deadlineText = decision.deadline 
        ? new Date(decision.deadline).getTime() - new Date().getTime() < 6 * 60 * 60 * 1000
            ? 'Next 6 hours'
            : 'This week'
        : 'No deadline';

    return (
        <button
            onClick={onExpand}
            className={cn(
                "w-full group p-4 rounded-lg border-2 transition-all cursor-pointer text-left",
                urgencyColors[decision.urgency],
                decision.urgency === 'critical' && 'shadow-lg shadow-red-900/20'
            )}
        >
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Gavel size={16} className={urgencyTextColors[decision.urgency]} />
                    <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest",
                        urgencyTextColors[decision.urgency]
                    )}>
                        DECISION
                    </span>
                </div>
                {decision.deadline && (
                    <span className="text-[8px] font-bold text-slate-500 uppercase">
                        {deadlineText}
                    </span>
                )}
            </div>

            <h3 className="text-sm font-black text-white mb-2 leading-tight group-hover:text-blue-300 transition-colors">
                {decision.title}
            </h3>

            {/* ROE Status Badge */}
            {decision.roeStatus && (() => {
                const roeInfo = getROEStatusInfo(decision.roeStatus);
                const ROEIcon = roeInfo.icon;
                return (
                    <div className={cn(
                        "inline-flex items-center gap-1.5 px-2 py-1 rounded border mb-2",
                        roeInfo.color
                    )}>
                        <ROEIcon size={11} className={roeInfo.iconColor} />
                        <span className="text-[9px] font-black uppercase tracking-wide">
                            {roeInfo.label}
                        </span>
                    </div>
                );
            })()}

            {/* Routing Blocked Status */}
            {decision.routing && !decision.routing.can_proceed && (
                <div className="mt-2 pt-2 border-t border-red-500/50">
                    <div className="flex items-center gap-2 text-[9px]">
                        <AlertTriangle size={10} className="text-red-400" />
                        <span className="text-red-400 font-bold uppercase">
                            BLOCKED: {decision.routing.routing_reason || 'Cannot proceed to meeting'}
                        </span>
                    </div>
                    {decision.roeStatus === 'requires_roe_release' && (
                        <div className="mt-1 text-[8px] text-slate-400">
                            ROE authorization required before routing
                        </div>
                    )}
                </div>
            )}

            <p className="text-[10px] text-slate-400 leading-relaxed mb-3">
                {decision.description}
            </p>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-[10px]">
                    <div className="flex items-center gap-1">
                        <span className={cn(
                            "px-2 py-0.5 rounded-full font-black",
                            decision.options.length > 0 
                                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                : "bg-slate-700 text-slate-500"
                        )}>
                            {decision.options.length}
                        </span>
                        <span className="text-slate-500 font-bold uppercase">option{decision.options.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className={cn(
                            "px-2 py-0.5 rounded-full font-black",
                            decision.riskFactors.length > 0 
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                : "bg-slate-700 text-slate-500"
                        )}>
                            {decision.riskFactors.length}
                        </span>
                        <span className="text-slate-500 font-bold uppercase">risk{decision.riskFactors.length !== 1 ? 's' : ''}</span>
                    </div>
                </div>

                <div className="flex items-center gap-1 text-[9px] text-slate-500 group-hover:text-blue-400 transition-colors font-black uppercase">
                    View Analysis
                    <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </div>
            </div>
        </button>
    );
}
