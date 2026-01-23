import { useEffect, useState } from 'react';
import {
    Share2,
    Database,
    CheckCircle2,
    Clock,
    ArrowRightLeft,
    Plus,
    ArrowUpRight,
    Filter,
    Users
} from 'lucide-react';
import { SmartOpsService } from '@/lib/smartops/mock-service';
import { cn } from '@/lib/utils';
import type { InformationRequirement, InformationFlow } from '@/lib/smartops/types';

export function InformationManagement() {
    const [requirements, setRequirements] = useState<InformationRequirement[]>([]);
    const [flows, setFlows] = useState<InformationFlow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            const [reqData, flowData] = await Promise.all([
                SmartOpsService.getInformationRequirements() as Promise<InformationRequirement[]>,
                SmartOpsService.getInformationFlows() as Promise<InformationFlow[]>
            ]);
            setRequirements(reqData);
            setFlows(flowData);
            setLoading(false);
        }
        loadData();
    }, []);

    if (loading) return <div className="p-8 text-slate-500 animate-pulse font-mono text-[10px] uppercase">Synchronizing Command Knowledge...</div>;

    return (
        <div className="flex flex-col h-full bg-[#020617] text-slate-200 overflow-hidden font-sans border-l border-slate-900">

            {/* Header */}
            <div className="p-6 border-b border-slate-800 bg-slate-950/50">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="px-2 py-0.5 bg-purple-500/10 text-purple-500 text-[10px] font-black border border-purple-500/20 rounded uppercase">Knowledge Bridge</div>
                            <h1 className="text-xl font-black text-white tracking-tight uppercase">Information Management (IM)</h1>
                        </div>
                        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                            Ensuring information superiority by routing critical intelligence to the right functions at the right time. Monitoring J2-J4-LEGAD knowledge synchronization.
                        </p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-black uppercase rounded transition-colors shadow-lg shadow-purple-900/20">
                        <Plus size={14} /> New Requirement
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden flex">

                {/* Left Col: Requirements */}
                <div className="flex-1 border-r border-slate-800 overflow-y-auto p-6 space-y-8">
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Database className="h-4 w-4 text-purple-500" /> Intelligence Requirements (PIR/FFIR)
                            </h3>
                            <div className="flex gap-2">
                                <button className="p-1.5 bg-slate-900 border border-slate-800 rounded text-slate-500 hover:text-white transition-colors">
                                    <Filter size={12} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {requirements.map(req => (
                                <div key={req.id} className="p-4 rounded border bg-slate-900/30 border-slate-800 hover:border-purple-500/30 transition-all flex gap-4">
                                    <div className={cn(
                                        "w-10 h-10 rounded flex flex-col items-center justify-center shrink-0 border",
                                        req.type === 'PIR' ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-blue-500/10 border-blue-500/20 text-blue-500"
                                    )}>
                                        <span className="text-[10px] font-black">{req.type}</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-tight">{req.assignedCell}</span>
                                            <span className={cn(
                                                "text-[8px] font-black px-1.5 py-0.5 rounded uppercase border",
                                                req.priority === 'Critical' ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-slate-800 text-slate-400 border-slate-700"
                                            )}>{req.priority}</span>
                                        </div>
                                        <p className="text-[12px] text-white font-bold leading-relaxed mb-3">{req.description}</p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 text-[9px] font-mono text-slate-500">
                                                <span className="flex items-center gap-1"><Clock size={10} /> DEADLINE: {new Date(req.deadline).toLocaleTimeString()}</span>
                                                <span className="flex items-center gap-1 uppercase"><CheckCircle2 size={10} className="text-emerald-500" /> STATUS: {req.status}</span>
                                            </div>
                                            <button className="text-[9px] font-black text-purple-400 hover:text-purple-300 uppercase flex items-center gap-1">
                                                View Tasking <ArrowUpRight size={10} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right Col: Flow Monitor */}
                <div className="w-96 overflow-y-auto p-6 bg-slate-950/30">
                    <section>
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                            <Share2 className="h-4 w-4 text-purple-500" /> Information Flow Monitor
                        </h3>

                        <div className="space-y-4">
                            {flows.map(flow => (
                                <div key={flow.id} className="relative pl-6 py-2">
                                    <div className="absolute left-0 top-0 bottom-0 w-px bg-slate-800">
                                        <div className={cn(
                                            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full",
                                            flow.status === 'Delivered' ? "bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" : "bg-purple-500 animate-pulse"
                                        )} />
                                    </div>
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="text-[10px] font-black text-white uppercase tracking-tight">{flow.dataType}</span>
                                        <span className="text-[8px] font-mono text-slate-600">{new Date(flow.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 p-2 bg-slate-900/50 rounded border border-slate-800/50 text-[9px] font-bold">
                                        <span className="text-slate-400 uppercase">{flow.source}</span>
                                        <ArrowRightLeft size={10} className="text-slate-600" />
                                        <span className="text-blue-400 uppercase">{flow.destination}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 p-4 bg-purple-500/5 border border-purple-500/20 rounded space-y-3">
                            <div className="flex items-center gap-2 mb-2">
                                <Users size={14} className="text-purple-400" />
                                <span className="text-[9px] font-black text-white uppercase">Active Subscribers</span>
                            </div>
                            <div className="text-[9px] text-slate-500 font-bold leading-relaxed uppercase">
                                J3-LOGISTICS is currently subscribed to ALL REDLAND FUEL DEPOT updates from J2-INTEL via Knowledge Junction.
                            </div>
                        </div>
                    </section>
                </div>

            </div>

            {/* Footer */}
            <div className="h-10 border-t border-slate-800 bg-slate-950 px-6 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <div className="flex items-center gap-6">
                    <span className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> IM BROKER SYNCHRONIZED
                    </span>
                    <span>LATENCY: 12ms</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-slate-600 uppercase font-bold">INFO OPS OVERWATCH ACTIVE</span>
                </div>
            </div>
        </div>
    );
}
