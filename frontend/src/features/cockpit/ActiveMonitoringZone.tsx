import { Link } from '@tanstack/react-router';
import { Activity, Shield, TrendingUp, TrendingDown, Crosshair, AlertTriangle, MessageSquareWarning, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DecisionTracker } from '../decisions/DecisionTracker';
import { DecisionImpactMonitorComponent } from '../decisions/DecisionImpactMonitor';
import type { DecisionTracking, DecisionImpactMonitor } from '@/lib/mshnctrl/types';

interface ActiveMonitoringZoneProps {
    readinessTrend: number;
    targetingEfficacy: number;
    stats: any;
    newInsights: any[]; // Or sum of length? used for "NEW" badge
    externalFactors: {
        disinfo: any[];
        political: any[];
        disasters: any[];
    };
    trackedDecisions: DecisionTracking[];
    impactMonitors: DecisionImpactMonitor[];
    onViewTrackingDetails: (decisionId: string) => void;
    onViewImpactDimension: (dimension: string) => void;
}

export function ActiveMonitoringZone({
    readinessTrend,
    targetingEfficacy,
    stats,
    newInsights,
    externalFactors,
    trackedDecisions,
    impactMonitors,
    onViewTrackingDetails,
    onViewImpactDimension
}: ActiveMonitoringZoneProps) {
    return (
        <div className="space-y-3 mt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-blue-400 flex items-center gap-2">
                    <Activity size={14} />
                    Active Monitoring
                </h2>
            </div>

            {/* Force Readiness Card */}
            <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-700 hover:border-blue-500/40 transition-all">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Shield size={14} className="text-blue-400" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Force Readiness</span>
                    </div>
                    <div className="flex items-center gap-1">
                        {readinessTrend > 0 ? (
                            <TrendingUp size={12} className="text-emerald-500" />
                        ) : (
                            <TrendingDown size={12} className="text-red-500" />
                        )}
                        <span className={cn(
                            "text-[10px] font-bold",
                            readinessTrend > 0 ? 'text-emerald-500' : 'text-red-500'
                        )}>
                            {readinessTrend > 0 ? '+' : ''}{readinessTrend}%
                        </span>
                    </div>
                </div>
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white">{stats.readiness}</span>
                    <span className="text-lg text-slate-600 font-black">%</span>
                </div>
                <div className="mt-2 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${stats.readiness}%` }}
                    />
                </div>
            </div>

            {/* Targeting Efficacy Card */}
            <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-700 hover:border-blue-500/40 transition-all">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Crosshair size={14} className="text-cyan-400" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Targeting Efficacy</span>
                    </div>
                    <span className="text-[9px] text-slate-500 uppercase">Phase II</span>
                </div>
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-300">{targetingEfficacy}</span>
                    <span className="text-lg text-slate-600 font-black">%</span>
                </div>
                <div className="mt-2 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                        style={{ width: `${targetingEfficacy}%` }}
                    />
                </div>
                {targetingEfficacy < 70 && (
                    <div className="mt-2 flex items-center gap-1 text-[9px] text-amber-400 font-bold">
                        <AlertTriangle size={10} />
                        Below optimal threshold
                    </div>
                )}
            </div>

            {/* Intel Insights Summary */}
            <Link
                to="/mshnctrl/advisory"
                className="block p-4 rounded-lg bg-slate-900/60 border border-slate-700 hover:border-purple-500/40 transition-all cursor-pointer group"
            >
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <MessageSquareWarning size={14} className="text-purple-400" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Intel Insights</span>
                    </div>
                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-[9px] font-black border border-purple-500/30 rounded-full">
                        {newInsights.length} NEW
                    </span>
                </div>
                <div className="space-y-1.5">
                    {externalFactors.disinfo.slice(0, 1).map(event => (
                        <div key={event.id} className="flex items-center gap-2 text-[10px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-red-400 font-black uppercase">DISINFO</span>
                            <span className="text-slate-400 truncate">{event.name}</span>
                        </div>
                    ))}
                    {externalFactors.political.slice(0, 1).map(st => (
                        <div key={st.id} className="flex items-center gap-2 text-[10px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            <span className="text-blue-400 font-black uppercase">POLITICAL</span>
                            <span className="text-slate-400 truncate">{st.name}</span>
                        </div>
                    ))}
                    {externalFactors.disasters.slice(0, 1).map(d => (
                        <div key={d.id} className="flex items-center gap-2 text-[10px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            <span className="text-amber-400 font-black uppercase">ENV</span>
                            <span className="text-slate-400 truncate">{d.name}</span>
                        </div>
                    ))}
                </div>
                <div className="flex items-center justify-end mt-3 text-[9px] text-slate-500 group-hover:text-purple-400 transition-colors font-black uppercase">
                    Review All <ChevronRight size={12} className="ml-1" />
                </div>
            </Link>

            {/* Decision Tracking */}
            {trackedDecisions.length > 0 && (
                <div className="mt-6">
                    <DecisionTracker
                        trackedDecisions={trackedDecisions}
                        onViewDetails={onViewTrackingDetails}
                    />
                </div>
            )}

            {/* Decision Impacts */}
            {impactMonitors.length > 0 && (
                <div className="mt-6">
                    <DecisionImpactMonitorComponent
                        impactMonitors={impactMonitors}
                        onViewDimension={onViewImpactDimension}
                    />
                </div>
            )}
        </div>
    );
}
