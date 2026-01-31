import { Link } from '@tanstack/react-router';
import { Clock, AlertTriangle, MessageSquareWarning, ChevronRight } from 'lucide-react';
import { DecisionCard } from '../decisions/DecisionCard';
import type { Decision } from '@/lib/mshnctrl/types';


interface CriticalAttentionZoneProps {
    pendingDecisions: Decision[];
    driftingObjectives: any[];
    newInsights: any[];
    onSelectDecision: (decision: Decision) => void;
}

export function CriticalAttentionZone({
    pendingDecisions,
    driftingObjectives,
    newInsights,
    onSelectDecision
}: CriticalAttentionZoneProps) {
    const totalCriticalItems = pendingDecisions.length + (driftingObjectives.length > 0 ? 1 : 0);

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-red-400 flex items-center gap-2">
                    <Clock size={14} className="animate-pulse" />
                    Critical - TODAY
                </h2>
                <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[9px] font-black border border-red-500/30 rounded-full">
                    {totalCriticalItems}
                </span>
            </div>

            {/* Decision Cards */}
            {pendingDecisions.map((decision) => (
                <DecisionCard
                    key={decision.id}
                    decision={decision}
                    onExpand={() => onSelectDecision(decision)}
                />
            ))}

            {/* Campaign Drift Alert */}
            {driftingObjectives.length > 0 && (
                <Link
                    to="/mshnctrl/campaign"
                    className="group block p-4 rounded-lg border-2 transition-all cursor-pointer bg-amber-950/20 border-amber-500/40 hover:bg-amber-950/40 hover:border-amber-400"
                >
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <AlertTriangle size={16} className="text-amber-400" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-amber-400">
                                DRIFT
                            </span>
                        </div>
                        <span className="text-[8px] font-bold text-slate-500 uppercase">This week</span>
                    </div>
                    <h3 className="text-sm font-black text-white mb-1 leading-tight group-hover:text-blue-300 transition-colors">
                        {driftingObjectives.length} Campaign Objective{driftingObjectives.length > 1 ? 's' : ''} at DRIFT
                    </h3>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                        {driftingObjectives.map((dc: any) => dc.name).join(', ')}
                    </p>
                    <div className="flex items-center justify-end mt-2 text-[9px] text-slate-500 group-hover:text-blue-400 transition-colors font-black uppercase">
                        View Campaign <ChevronRight size={12} className="ml-1" />
                    </div>
                </Link>
            )}

            {/* Intel Insights Alert */}
            {newInsights.length > 0 && (
                <Link
                    to="/mshnctrl/advisory"
                    className="group block p-4 rounded-lg border-2 transition-all cursor-pointer bg-amber-950/20 border-amber-500/40 hover:bg-amber-950/40 hover:border-amber-400"
                >
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <MessageSquareWarning size={16} className="text-amber-400" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-amber-400">
                                INTEL
                            </span>
                        </div>
                        <span className="text-[8px] font-bold text-slate-500 uppercase">Next 24 hours</span>
                    </div>
                    <h3 className="text-sm font-black text-white mb-1 leading-tight group-hover:text-blue-300 transition-colors">
                        {newInsights.length} New Intel Insight{newInsights.length > 1 ? 's' : ''}
                    </h3>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                        Require review and assessment
                    </p>
                    <div className="flex items-center justify-end mt-2 text-[9px] text-slate-500 group-hover:text-blue-400 transition-colors font-black uppercase">
                        Review All <ChevronRight size={12} className="ml-1" />
                    </div>
                </Link>
            )}
        </div>
    );
}
