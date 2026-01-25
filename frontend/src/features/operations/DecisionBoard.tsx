import { useEffect, useState } from 'react';
import {
    Gavel,
    Clock,
    User,
    CheckCircle,
    XCircle,
    AlertTriangle,
    FileText,
    Users,
    Calendar,
    ChevronRight,
    ShieldCheck
} from 'lucide-react';
import { SmartOpsService } from '@/lib/smartops/mock-service';
import { cn } from '@/lib/utils';
import type { DecisionBoard } from '@/lib/smartops/types';

export function DecisionBoardView() {
    const [boards, setBoards] = useState<DecisionBoard[]>([]);
    const [selectedBoard, setSelectedBoard] = useState<DecisionBoard | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            const data = await SmartOpsService.getDecisionBoards() as DecisionBoard[];
            setBoards(data);
            if (data.length > 0) {
                setSelectedBoard(data[0]);
            }
            setLoading(false);
        }
        loadData();
    }, []);

    if (loading) return <div className="p-8 text-slate-500 animate-pulse font-mono text-[10px] uppercase">Convening Decision Board...</div>;

    return (
        <div className="flex h-full bg-[#020617] text-slate-200 overflow-hidden font-sans border-l border-slate-900">

            {/* Board List */}
            <div className="w-80 border-r border-slate-800 flex flex-col shrink-0 bg-slate-950/30">
                <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Governance Schedule</h3>
                    <Calendar size={14} className="text-slate-600" />
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {boards.map(b => (
                        <button
                            key={b.id}
                            onClick={() => setSelectedBoard(b)}
                            className={cn(
                                "w-full p-4 rounded text-left transition-all border flex flex-col gap-2",
                                selectedBoard?.id === b.id
                                    ? "bg-blue-600/10 border-blue-500/50"
                                    : "bg-transparent border-transparent hover:bg-slate-900/50 text-slate-400"
                            )}
                        >
                            <div className="flex items-center gap-2">
                                <Gavel size={12} className={selectedBoard?.id === b.id ? "text-blue-400" : "text-slate-600"} />
                                <span className="text-[11px] font-black uppercase text-white tracking-tight">{b.title}</span>
                            </div>
                            <div className="flex items-center gap-3 text-[9px] font-bold text-slate-500">
                                <span className="flex items-center gap-1 uppercase"><Clock size={10} /> {new Date(b.dateTime).toLocaleTimeString()}</span>
                                <span className="flex items-center gap-1 uppercase"><User size={10} /> {b.chair}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Board Area */}
            <div className="flex-1 overflow-y-auto bg-slate-950/20 px-12 py-8 relative">
                {selectedBoard ? (
                    <div className="max-w-5xl mx-auto space-y-8">

                        {/* Board Header */}
                        <div className="flex justify-between items-start border-b border-slate-800 pb-8">
                            <div>
                                <div className="flex items-center gap-4 mb-2">
                                    <span className="px-2 py-0.5 bg-blue-600 text-white text-[9px] font-black uppercase rounded tracking-widest">Formal Session</span>
                                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter">{selectedBoard.title}</h2>
                                </div>
                                <p className="text-sm text-slate-400 font-bold max-w-2xl leading-relaxed">
                                    Governance forum for statutory decision-making. Chair: <span className="text-slate-200">{selectedBoard.chair}</span>.
                                    Confirming target nominations, tactical maneuvers, and supply prioritization briefings.
                                </p>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Session Protocol</span>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded">
                                    <ShieldCheck size={14} className="text-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-tight">Quorum Verified</span>
                                </div>
                            </div>
                        </div>

                        {/* Content Split */}
                        <div className="grid grid-cols-3 gap-12">

                            {/* Left: Pending Decisions */}
                            <div className="col-span-2 space-y-6">
                                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                    <AlertTriangle className="text-yellow-500" size={14} /> Decisions Awaiting Action
                                </h3>
                                <div className="space-y-3">
                                    {selectedBoard.pendingDecisions.map((decision, i) => (
                                        <div key={i} className="p-6 bg-slate-900/60 border border-slate-800 rounded-lg group hover:border-blue-500/30 transition-all flex justify-between items-center">
                                            <div className="flex gap-4 items-start">
                                                <div className="w-10 h-10 rounded border border-slate-800 bg-slate-950 flex items-center justify-center text-blue-500 shrink-0">
                                                    <FileText size={18} />
                                                </div>
                                                <div>
                                                    <h4 className="text-[13px] font-black text-white uppercase tracking-tight mb-1">{decision}</h4>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase">Cross-referenced with Brief: B-TRAINING-01</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button className="p-2 rounded bg-red-600/10 text-red-500 border border-red-500/20 hover:bg-red-600 hover:text-white transition-all shadow-lg shadow-red-950/20">
                                                    <XCircle size={18} />
                                                </button>
                                                <button className="p-2 rounded bg-emerald-600/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-600 hover:text-white transition-all shadow-lg shadow-emerald-950/20">
                                                    <CheckCircle size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Supporting Docs */}
                                <div className="p-5 border border-slate-800/50 bg-slate-900/20 rounded-lg flex gap-4 items-center">
                                    <Users className="text-slate-600" size={24} />
                                    <div className="flex-1">
                                        <span className="text-[10px] font-black text-slate-500 uppercase block mb-1">Authenticated Attendees</span>
                                        <div className="flex gap-2">
                                            <span className="text-[9px] font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded uppercase">LEGAD-North</span>
                                            <span className="text-[9px] font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded uppercase">Chief of Staff</span>
                                            <span className="text-[9px] font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded uppercase">J2 Director</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Outcomes / Log */}
                            <div className="space-y-6">
                                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                    <Clock size={14} /> Recorded Outcomes
                                </h3>
                                <div className="space-y-4">
                                    {selectedBoard.outcomes.length > 0 ? (
                                        selectedBoard.outcomes.map((outcome, i) => (
                                            <div key={i} className="p-4 bg-slate-950 border border-slate-800 rounded">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-[10px] font-black text-white uppercase">{outcome.decision}</span>
                                                    <span className={cn(
                                                        "text-[8px] font-black px-1.5 py-0.5 rounded border uppercase",
                                                        outcome.status === 'Approved' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                                                    )}>{outcome.status}</span>
                                                </div>
                                                <p className="text-[10px] text-slate-500 italic">"{outcome.rationale}"</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 border border-dashed border-slate-800 rounded flex flex-col items-center justify-center text-slate-600 text-center">
                                            <FileText size={32} className="mb-2 opacity-10" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">No Decisions<br />Recorded Yet</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>

                        {/* Action Bar */}
                        <div className="pt-12 flex justify-between items-center text-[10px] font-mono text-slate-600">
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-blue-500" /> DIGITAL SIGNATURES ENFORCED</span>
                            </div>
                            <button className="text-slate-400 hover:text-white uppercase font-black flex items-center gap-1.5 transition-colors">
                                Close Board Session <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-600 h-full">
                        <Gavel size={48} className="mb-4 opacity-20" />
                        <span className="text-[11px] font-black uppercase tracking-widest">Select Board Calendar to Begin Session</span>
                    </div>
                )}
            </div>

        </div>
    );
}
