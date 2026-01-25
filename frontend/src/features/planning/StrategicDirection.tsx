import { useState, useEffect } from 'react';
import {
    Flag,
    Target,
    ChevronRight,
    ShieldCheck,
    AlertCircle,
    CheckCircle2,
    Compass,
    Activity,
    History
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from '@tanstack/react-router';
import { useToast } from '@/components/ui/use-toast';
import { SmartOpsService } from '@/lib/smartops/mock-service';
import type { StrategicGuidance } from '@/lib/smartops/types';
import { useOperationalContext } from '@/lib/smartops/hooks/useOperationalContext';
import { Button } from '@/components/ui/button';

export function StrategicDirection() {
    const { filterByContext } = useOperationalContext();
    const { toast } = useToast();
    const [guidance, setGuidance] = useState<StrategicGuidance | null>(null);
    const [roes, setRoes] = useState<any[]>([]); // We'll fetch full ROE objects
    const [loading, setLoading] = useState(true);
    const [selectedObjectiveId, setSelectedObjectiveId] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        async function loadGuidance() {
            const [guidanceData, roeData] = await Promise.all([
                SmartOpsService.getStrategicGuidance(),
                SmartOpsService.getROEs()
            ]);

            if (guidanceData && filterByContext(guidanceData)) {
                setGuidance(guidanceData);
                setSelectedObjectiveId(guidanceData.objectives[0]?.id || null);
            } else {
                setGuidance(null);
            }
            setRoes(roeData);
            setLoading(false);
        }
        loadGuidance();
    }, []);

    if (loading || !guidance) return <div className="p-12 text-center text-slate-500 animate-pulse uppercase font-black tracking-widest text-xs">Parsing Strategic Intelligence...</div>;

    const selectedObjective = guidance.objectives.find(o => o.id === selectedObjectiveId);

    return (
        <div className="flex flex-col h-full bg-[#020617] text-slate-200 overflow-hidden font-sans border-l border-slate-900">
            {/* Header */}
            <header className="p-10 border-b border-slate-800 bg-slate-950/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                    <Compass size={140} />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="px-3 py-1 bg-blue-600/10 border border-blue-500/20 rounded-full">
                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Source: {guidance.source}</span>
                        </div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Last Updated: {new Date(guidance.lastUpdated).toLocaleString()}</span>
                    </div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter">{guidance.title}</h1>
                    <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-2 max-w-4xl leading-relaxed italic">
                        "{guidance.intent}"
                    </p>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Objectives Sidebar */}
                <div className="w-[450px] border-r border-slate-800 flex flex-col shrink-0 bg-slate-950/20">
                    <div className="p-8 border-b border-slate-800">
                        <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                            <Target size={16} /> Strategic Objectives
                        </h3>
                        <div className="space-y-4">
                            {guidance.objectives.map((obj) => (
                                <button
                                    key={obj.id}
                                    onClick={() => setSelectedObjectiveId(obj.id)}
                                    className={cn(
                                        "w-full p-6 rounded-2xl border transition-all text-left relative overflow-hidden group",
                                        selectedObjectiveId === obj.id
                                            ? "bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-900/20"
                                            : "bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={cn(
                                            "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                                            obj.status === 'On track' ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                                                obj.status === 'At risk' ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                        )}>
                                            {obj.status}
                                        </div>
                                        <ChevronRight size={16} className={cn("transition-transform", selectedObjectiveId === obj.id && "rotate-90")} />
                                    </div>
                                    <p className="text-sm font-black uppercase tracking-tight leading-snug">{obj.text}</p>
                                    <div className="mt-4 flex gap-1 h-1 bg-black/20 rounded-full overflow-hidden">
                                        <div className={cn("h-full", obj.status === 'On track' ? "bg-emerald-400 w-3/4" : "bg-red-400 w-1/4")} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Drill-down / Task Alignment */}
                <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                    {selectedObjective ? (
                        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
                            {/* Objective Detail */}
                            <div className="space-y-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 border-2 border-blue-500/20">
                                        <Flag size={32} />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Operational Tasking Alignment</h2>
                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1">Verification of intent flow through execution</p>
                                    </div>
                                </div>
                            </div>

                            {/* Linkage: Strategy -> ROE */}
                            {guidance.recommendedRoeIds && guidance.recommendedRoeIds.length > 0 && (
                                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <ShieldCheck className="text-amber-500" size={20} />
                                        <h3 className="text-sm font-black text-white uppercase tracking-widest">
                                            ROE Recommendations
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {guidance.recommendedRoeIds.map(roeId => {
                                            const roe = roes.find(r => r.id === roeId);
                                            if (!roe) return null;
                                            return (
                                                <div key={roeId} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col gap-2">
                                                    <div className="flex justify-between items-start">
                                                        <span className="text-xs font-black text-amber-500 uppercase">{roe.code}</span>
                                                        <span className="px-1.5 py-0.5 bg-slate-800 rounded text-[9px] text-slate-400 uppercase font-bold">{roe.status}</span>
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-200">{roe.name}</p>
                                                    <p className="text-[10px] text-slate-500 leading-snug">{roe.description}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {selectedObjective.tasks.map((task, idx) => (
                                    <div key={idx} className="bg-slate-950 border-2 border-slate-900 rounded-3xl p-8 relative group hover:border-blue-500/30 transition-all">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="p-3 bg-slate-900 rounded-xl text-blue-500">
                                                <Activity size={20} />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Linked Task</span>
                                                <ShieldCheck size={14} className="text-emerald-500" />
                                            </div>
                                        </div>
                                        <h4 className="text-xl font-black text-white uppercase tracking-tight mb-2">{task}</h4>
                                        <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">Currently active in MD Synchronization matrix. Achieving 84% effectiveness metrics.</p>
                                        <Button
                                            variant="ghost"
                                            onClick={() => navigate({ to: '/smartops/mdo' })}
                                            className="w-full justify-between border-t border-slate-800 pt-6 rounded-none text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white group"
                                        >
                                            View Operational Data <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </div>
                                ))}
                                <div
                                    onClick={() => {
                                        toast({
                                            title: 'Parsing SACEUR Guidance...',
                                            description: 'Initiating deep-scan of strategic directives.'
                                        });
                                        setTimeout(() => {
                                            toast({
                                                title: 'Alignment Proposal Generated',
                                                description: 'New strategic synchronization options ready for review.'
                                            });
                                        }, 1500);
                                    }}
                                    className="bg-slate-900/10 border-2 border-dashed border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-slate-700 transition-all"
                                >
                                    <div className="w-12 h-12 rounded-full border-2 border-slate-800 flex items-center justify-center text-slate-600 mb-4 group-hover:text-white group-hover:border-white transition-all">
                                        <Target size={20} />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-white transition-all">Propose New Alignment</span>
                                </div>
                            </div>


                            {/* Audit Trail */}
                            <div className="bg-slate-950/40 border border-slate-800 rounded-[2.5rem] p-10">
                                <h3 className="text-sm font-black text-white uppercase tracking-tight mb-8 flex items-center gap-3">
                                    <History size={18} className="text-blue-500" /> Strategic Audit Journal
                                </h3>
                                <div className="space-y-8">
                                    {[1, 2].map((i) => (
                                        <div key={i} className="flex gap-6 relative">
                                            {i === 1 && <div className="absolute top-8 bottom-0 left-[11px] w-0.5 bg-slate-800" />}
                                            <div className="w-6 h-6 rounded-full bg-slate-900 border-2 border-slate-800 flex items-center justify-center shrink-0 mt-1">
                                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="text-[10px] font-black text-white uppercase">SACEUR Direct Revision</span>
                                                    <span className="text-[8px] font-mono text-slate-500 uppercase">2026-01-05 14:20Z</span>
                                                </div>
                                                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">Re-prioritised SLOC security over corridor neutralization following increased sub-surface activity.</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-800 p-20 text-center animate-in fade-in duration-700">
                            <div className="w-24 h-24 rounded-full border-2 border-slate-900 flex items-center justify-center mb-8">
                                <Target size={40} className="text-slate-800 opacity-20" />
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-[0.4em]">Operational Vacuum</h3>
                            <p className="text-sm font-bold uppercase text-slate-600 mt-2 max-w-sm">Select a strategic objective to view its operational downstream impacts</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer / Guidance Status */}
            <footer className="h-16 border-t border-slate-800 bg-slate-950 px-10 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-500" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Operational Consistency: 92%</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <AlertCircle size={14} className="text-amber-500" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Alignment Gaps: 2 Detected</span>
                    </div>
                </div>
                <div className="flex gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => {
                            toast({
                                description: 'Tactical state reconciled with Strategic Guidance.'
                            });
                        }}
                        className="text-[10px] font-black uppercase tracking-widest text-blue-500"
                    >
                        Manual Sync Override
                    </Button>
                </div>
            </footer>
        </div>
    );
}
