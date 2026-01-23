import { useEffect, useState } from 'react';
import {
    Zap,
    Target,
    ShieldCheck,
    ShieldAlert,
    BrainCircuit,
    TrendingDown,
    TrendingUp,
    AlertOctagon,
    ChevronRight,
    Gavel
} from 'lucide-react';
import { SmartOpsService } from '@/lib/smartops/mock-service';
import { cn } from '@/lib/utils';
import type { StrikeAnalysis, Target as TargetType } from '@/lib/smartops/types';

export function StrikeOptimizer() {
    const [targets, setTargets] = useState<TargetType[]>([]);
    const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<StrikeAnalysis | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadTargets() {
            const data = await SmartOpsService.getTargets();
            setTargets(data);
            if (data.length > 0) {
                setSelectedTargetId(data[0].id);
            }
            setLoading(false);
        }
        loadTargets();
    }, []);

    useEffect(() => {
        if (selectedTargetId) {
            async function loadAnalysis() {
                const data = await SmartOpsService.getStrikeAnalysis(selectedTargetId as string);
                setAnalysis(data || null);
            }
            loadAnalysis();
        }
    }, [selectedTargetId]);

    const selectedTarget = targets.find(t => t.id === selectedTargetId);

    if (loading) return <div className="p-8 text-slate-500 animate-pulse font-mono text-[10px] uppercase">Reasoning Optimal Strike Vectors...</div>;

    return (
        <div className="flex h-full bg-[#020617] text-slate-200 overflow-hidden font-sans border-l border-slate-900">

            {/* Target Selection Rail */}
            <div className="w-80 border-r border-slate-800 flex flex-col shrink-0 bg-slate-950/30">
                <div className="p-4 border-b border-slate-800">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Nomination List</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {targets.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setSelectedTargetId(t.id)}
                            className={cn(
                                "w-full p-3 rounded text-left transition-all border flex flex-col gap-1",
                                selectedTargetId === t.id
                                    ? "bg-blue-600/10 border-blue-500/50"
                                    : "bg-transparent border-transparent hover:bg-slate-900/50 text-slate-400"
                            )}
                        >
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase text-white tracking-tight">{t.designator}</span>
                                <span className="text-[8px] font-bold text-slate-500 italic">{t.killChainPhase}</span>
                            </div>
                            <span className="text-[11px] font-bold truncate">{t.name}</span>
                            <div className="flex gap-2 mt-1">
                                <span className={cn(
                                    "text-[8px] px-1 py-0.5 rounded border border-slate-800 bg-slate-900 font-bold",
                                    t.priority === 'High' ? "text-red-500" : "text-slate-400"
                                )}>{t.priority}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Analysis Engine */}
            <div className="flex-1 overflow-y-auto flex flex-col relative">
                {selectedTarget && analysis ? (
                    <>
                        {/* Analysis Header */}
                        <div className="p-8 border-b border-slate-800 bg-slate-950/50 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <BrainCircuit size={120} className="text-blue-500" />
                            </div>

                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <Zap className="text-yellow-500" size={20} />
                                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">Strike Reasoner Output</h2>
                                    </div>
                                    <p className="text-xs text-slate-400 max-w-2xl leading-relaxed font-bold">
                                        Multi-objective optimization for Target {selectedTarget.designator}. Evaluation based on joint operational directives, RoE release, and long-term strategic gains.
                                    </p>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-black text-slate-500 uppercase mb-1">Recommendation Score</span>
                                    <div className="text-4xl font-black text-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                                        {analysis.selectionScore}<span className="text-lg">/100</span>
                                    </div>
                                </div>
                            </div>

                            {/* Key Metrics Grid */}
                            <div className="grid grid-cols-4 gap-6">
                                <div className="p-4 bg-slate-900/50 border border-slate-800 rounded relative overflow-hidden">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[9px] font-black text-slate-500 uppercase">Tactical Gain</span>
                                        <TrendingUp size={14} className="text-emerald-500" />
                                    </div>
                                    <div className="text-xl font-black text-white">{analysis.tacticalGain}%</div>
                                    <div className="w-full h-1 bg-slate-800 mt-2 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500" style={{ width: `${analysis.tacticalGain}%` }} />
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-900/50 border border-slate-800 rounded relative overflow-hidden">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[9px] font-black text-slate-500 uppercase">Strategic Impact</span>
                                        <BrainCircuit size={14} className="text-blue-500" />
                                    </div>
                                    <div className="text-xl font-black text-white">{analysis.strategicGain}%</div>
                                    <div className="w-full h-1 bg-slate-800 mt-2 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500" style={{ width: `${analysis.strategicGain}%` }} />
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-900/50 border border-slate-800 rounded relative overflow-hidden">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[9px] font-black text-slate-500 uppercase">Econ Blowback</span>
                                        <TrendingDown size={14} className="text-red-500" />
                                    </div>
                                    <div className="text-xl font-black text-red-500">{analysis.economicImpact}%</div>
                                    <div className="w-full h-1 bg-slate-800 mt-2 rounded-full overflow-hidden">
                                        <div className="h-full bg-red-500" style={{ width: `${Math.abs(analysis.economicImpact)}%` }} />
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-900/50 border border-slate-800 rounded relative overflow-hidden">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[9px] font-black text-slate-500 uppercase">RoE Alignment</span>
                                        <Gavel size={14} className="text-yellow-500" />
                                    </div>
                                    <div className={cn(
                                        "text-xl font-black uppercase",
                                        analysis.legalCompliance === 'Clear' ? "text-emerald-500" : "text-yellow-500"
                                    )}>{analysis.legalCompliance}</div>
                                </div>
                            </div>
                        </div>

                        {/* Reasoning Body */}
                        <div className="p-8 flex-1">
                            <div className="max-w-4xl space-y-8">
                                <section>
                                    <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                                        <ChevronRight className="text-blue-500" size={14} /> AI Recommendation Logic
                                    </h3>
                                    <div className="bg-slate-900/30 border border-slate-800 p-6 rounded-lg font-bold text-slate-300 leading-relaxed text-[13px]">
                                        {analysis.reasoning}
                                    </div>
                                </section>

                                <section className="grid grid-cols-2 gap-8">
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase text-slate-500 mb-4">Positive Outcomes</h4>
                                        <div className="space-y-3">
                                            <div className="flex gap-4 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded">
                                                <ShieldCheck className="text-emerald-500 shrink-0" size={16} />
                                                <span className="text-[11px] text-slate-300 font-bold uppercase">Severe degradation of Sector fuel distribution</span>
                                            </div>
                                            <div className="flex gap-4 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded">
                                                <Target className="text-emerald-500 shrink-0" size={16} />
                                                <span className="text-[11px] text-slate-300 font-bold uppercase">Denial of Redland fast-response mobility for 72h</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase text-slate-500 mb-4">Risk Factors</h4>
                                        <div className="space-y-3">
                                            <div className="flex gap-4 p-3 bg-red-500/5 border border-red-500/20 rounded">
                                                <AlertOctagon className="text-red-500 shrink-0" size={16} />
                                                <span className="text-[11px] text-slate-300 font-bold uppercase">Vendor Globex contracts at risk (High sensitivity)</span>
                                            </div>
                                            <div className="flex gap-4 p-3 bg-red-500/5 border border-red-500/20 rounded">
                                                <ShieldAlert className="text-amber-500 shrink-0" size={16} />
                                                <span className="text-[11px] text-slate-300 font-bold uppercase">Collateral damage risk to adjacent civilian rail line</span>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>

                        {/* Action Bar */}
                        <div className="sticky bottom-0 left-0 right-0 p-6 bg-slate-950/80 backdrop-blur-sm border-t border-slate-800 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-tight">Optimization Status: <span className="text-emerald-500 font-black">SOLVED</span></span>
                            </div>
                            <div className="flex gap-3">
                                <button className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black uppercase rounded border border-slate-700 transition-colors">
                                    Simulate Alternative
                                </button>
                                <button className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase rounded shadow-lg shadow-blue-900/20 transition-all">
                                    Accept Recommendation
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
                        <BrainCircuit size={48} className="mb-4 opacity-20" />
                        <span className="text-[11px] font-black uppercase tracking-widest">Select Target for Optimization Analysis</span>
                    </div>
                )}
            </div>

        </div>
    );
}
