import { useEffect, useState } from 'react';
import {
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle2,
    ArrowRight,
    Target,
    Activity
} from 'lucide-react';
import { MshnCtrlService } from '@/lib/mshnctrl/mock-service';
import { cn } from '@/lib/utils';
import type { EffectivenessGap } from '@/lib/mshnctrl/types';

export function GapAnalysisView() {
    const [gaps, setGaps] = useState<EffectivenessGap[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            const campaign = await MshnCtrlService.getActiveCampaign();
            if (campaign) {
                const data = await MshnCtrlService.getGapAnalysis(campaign.id);
                setGaps(data);
            }
            setLoading(false);
        }
        loadData();
    }, []);

    if (loading) return <div className="p-8 text-slate-500 animate-pulse font-mono text-[10px] uppercase">Calculating Effectiveness Variance...</div>;

    const criticalGaps = gaps.filter(g => g.status === 'CriticalGap');

    return (
        <div className="flex flex-col h-full bg-[#020617] text-slate-200 font-sans overflow-hidden">
            {/* Header */}
            <div className="p-8 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Activity className="text-blue-500" size={20} />
                        <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Effectiveness Gap Analysis</h1>
                    </div>
                    <p className="text-xs text-slate-400 max-w-xl font-medium leading-relaxed">
                        Comparative analysis of Planned vs. Actual progress along Campaign Lines of Operation (LOOs).
                        Negative variance indicates risk to End State achievement.
                    </p>
                </div>
                <div className="flex gap-6">
                    <div className="text-right">
                        <span className="text-[9px] font-black text-slate-500 uppercase block tracking-widest">Active LOOs</span>
                        <span className="text-xl font-black text-white">{gaps.length}</span>
                    </div>
                    <div className="text-right border-l border-slate-800 pl-6">
                        <span className="text-[9px] font-black text-slate-500 uppercase block tracking-widest">Critical Gaps</span>
                        <span className={cn(
                            "text-xl font-black",
                            criticalGaps.length > 0 ? "text-red-500" : "text-emerald-500"
                        )}>{criticalGaps.length}</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {gaps.map(gap => (
                    <div key={gap.id} className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden">
                        {/* Gap Header */}
                        <div className="p-6 border-b border-slate-800 bg-slate-950/30 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "w-10 h-10 rounded-lg flex items-center justify-center border",
                                    gap.status === 'CriticalGap' ? "bg-red-500/10 border-red-500/30 text-red-500" :
                                        gap.status === 'MinorDeviance' ? "bg-amber-500/10 border-amber-500/30 text-amber-500" :
                                            "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                                )}>
                                    {gap.status === 'CriticalGap' ? <TrendingDown size={20} /> : <TrendingUp size={20} />}
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-white uppercase tracking-tight">{gap.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono uppercase">LOO-{gap.looId.split('-')[1]}</span>
                                        {gap.rootCause && (
                                            <span className="text-[10px] text-red-400 font-bold uppercase flex items-center gap-1">
                                                <AlertTriangle size={10} /> Root Cause: {gap.rootCause}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-[9px] font-black text-slate-500 uppercase block tracking-widest mb-1">Current Variance</span>
                                <span className={cn(
                                    "text-2xl font-black font-mono",
                                    gap.currentGap < 0 ? "text-red-500" : "text-emerald-500"
                                )}>
                                    {gap.currentGap > 0 ? '+' : ''}{gap.currentGap}%
                                </span>
                            </div>
                        </div>

                        {/* Chart Area (Mock Visual) */}
                        <div className="h-48 w-full bg-slate-950/20 relative border-b border-slate-800 group">
                            {/* Grid Lines */}
                            <div className="absolute inset-0 flex flex-col justify-between p-4 opacity-10">
                                <div className="w-full h-px bg-slate-400" />
                                <div className="w-full h-px bg-slate-400" />
                                <div className="w-full h-px bg-slate-400" />
                            </div>

                            {/* Trajectories */}
                            <div className="absolute inset-0 flex items-end justify-between px-12 pb-4 pt-12">
                                {gap.plannedTrajectory.map((pt, i) => {
                                    const at = gap.actualTrajectory[i];
                                    return (
                                        <div key={i} className="flex flex-col items-center gap-2 w-8 group/bar relative">
                                            {/* Date Label */}
                                            <span className="absolute -bottom-6 text-[9px] font-mono text-slate-600">{pt.date.slice(5)}</span>

                                            {/* Bars */}
                                            <div className="w-full bg-slate-800 rounded-t relative transition-all hover:bg-slate-700" style={{ height: `${pt.value * 2}px` }}>
                                                {/* Actual Overlay */}
                                                <div
                                                    className={cn(
                                                        "absolute bottom-0 inset-x-0 rounded-t transition-all",
                                                        gap.status === 'CriticalGap' ? "bg-red-500/80" : "bg-emerald-500/80"
                                                    )}
                                                    style={{ height: `${at.value * 2}px` }}
                                                />
                                            </div>

                                            {/* Tooltip */}
                                            <div className="absolute bottom-full mb-2 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-slate-900 border border-slate-700 p-2 rounded z-10 whitespace-nowrap">
                                                <div className="text-[10px] font-mono text-slate-300">Plan: {pt.value}%</div>
                                                <div className="text-[10px] font-mono font-bold text-white">Actual: {at.value}%</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Recommendation Footer */}
                        {gap.recommendations.length > 0 && (
                            <div className="p-4 bg-red-500/5 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-[10px] font-black uppercase text-red-500 mb-2 flex items-center gap-2">
                                        <Target size={12} /> Corrective Actions Required
                                    </h4>
                                    <ul className="space-y-2">
                                        {gap.recommendations.map((rec, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-[11px] text-slate-300">
                                                <ArrowRight size={12} className="text-red-500 mt-0.5 shrink-0" />
                                                {rec}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="flex items-center justify-end">
                                    <button className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase rounded shadow-lg shadow-red-900/20 transition-all flex items-center gap-2">
                                        <CheckCircle2 size={14} /> Issue Directives
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
