import { useEffect, useState } from 'react';
import {
    Flag,
    Layers,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Plus,
    ArrowUpRight
} from 'lucide-react';
import { MshnCtrlService } from '@/lib/mshnctrl/mock-service';
import { cn } from '@/lib/utils';
import type {
    Campaign,
    LineOfOperation,
    DecisiveCondition,
    Operation,
    DCStatus
} from '@/lib/mshnctrl/types';

export function CampaignManagement() {
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [loos, setLoos] = useState<LineOfOperation[]>([]);
    const [dcs, setDcs] = useState<DecisiveCondition[]>([]);
    const [operations, setOperations] = useState<Operation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            const activeCampaign = await MshnCtrlService.getActiveCampaign();
            if (activeCampaign) {
                setCampaign(activeCampaign);
                const [loosData, dcsData, opsData] = await Promise.all([
                    MshnCtrlService.getCampaignLOOs(activeCampaign.id),
                    MshnCtrlService.getLOODecisiveConditions(activeCampaign.id),
                    MshnCtrlService.getOperations(activeCampaign.id)
                ]);
                setLoos(loosData);
                setDcs(dcsData);
                setOperations(opsData);
            }
            setLoading(false);
        }
        loadData();
    }, []);

    const handleStatusChange = async (dcId: string, newStatus: DCStatus) => {
        await MshnCtrlService.updateDCStatus(dcId, newStatus);
        const updatedDcs = dcs.map(dc => dc.id === dcId ? { ...dc, status: newStatus } : dc);
        setDcs(updatedDcs);
    };

    if (loading) return <div className="p-8 text-slate-500 animate-pulse">Loading Campaign Data...</div>;
    if (!campaign) return <div className="p-8 text-red-500">No active campaign found.</div>;

    return (
        <div className="flex flex-col h-full bg-[#020617] text-slate-200 overflow-hidden font-sans border-l border-slate-900">

            {/* Header */}
            <div className="p-6 border-b border-slate-800 bg-slate-950/50">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-black border border-blue-500/20 rounded uppercase">Active Campaign</div>
                            <h1 className="text-xl font-black text-white tracking-tight uppercase">{campaign.name}</h1>
                        </div>
                        <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
                            {campaign.objective}
                        </p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase rounded transition-colors">
                        <Plus size={14} /> New FRAGO
                    </button>
                </div>

                <div className="grid grid-cols-4 gap-4 mt-6">
                    <div className="p-3 bg-slate-900/50 border border-slate-800 rounded">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Start Date</span>
                        <span className="text-sm font-black font-mono">{campaign.startDate}</span>
                    </div>
                    <div className="p-3 bg-slate-900/50 border border-slate-800 rounded col-span-3">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">End State Conditions</span>
                        <span className="text-xs font-bold text-slate-300">{campaign.endState}</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">

                {/* Operations Section */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <Flag size={16} className="text-blue-500" /> Planned Operations
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {operations.map(op => (
                            <div key={op.id} className="p-4 bg-slate-900/40 border border-slate-800 rounded hover:border-slate-700 transition-colors group">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-[10px] font-bold text-blue-400 px-2 py-0.5 bg-blue-500/10 rounded uppercase">{op.phase}</span>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-white transition-colors cursor-pointer flex items-center gap-1">
                                        Details <ArrowUpRight size={10} />
                                    </span>
                                </div>
                                <h3 className="text-sm font-black text-white mb-2 uppercase">{op.name}</h3>
                                <div className="space-y-2 text-[10px]">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 uppercase">Commander</span>
                                        <span className="text-slate-300 font-bold">{op.commander}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 uppercase">Forces</span>
                                        <span className="text-slate-300 font-bold">1st BDE (MECH+)</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 uppercase">Status</span>
                                        <span className="text-emerald-500 font-black">{op.status}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div className="border border-dashed border-slate-800 rounded flex items-center justify-center p-8 cursor-pointer hover:bg-slate-900/30 transition-colors group">
                            <div className="flex flex-col items-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                                <Plus size={24} className="text-slate-500" />
                                <span className="text-[10px] font-black uppercase text-slate-400">Add Operation</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Operational Design Section (LOOs & DCs) */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <Layers size={16} className="text-purple-500" /> Operational Design
                        </h2>
                    </div>

                    <div className="space-y-2">
                        {loos.map(loo => {
                            const looDcs = dcs.filter(dc => dc.looId === loo.id);
                            return (
                                <div key={loo.id} className="border border-slate-800 rounded-lg overflow-hidden flex bg-slate-900/20">
                                    <div className={cn("w-1.5 shrink-0", loo.color)} />
                                    <div className="flex-1 flex flex-col">
                                        <div className="px-4 py-2 bg-slate-950/50 border-b border-slate-800 flex items-center justify-between">
                                            <h3 className="text-[11px] font-black text-white uppercase tracking-tight">{loo.name} <span className="text-slate-500 ml-2 font-mono">[{loo.type}]</span></h3>
                                            <span className="text-[10px] text-slate-500 italic">{loo.description}</span>
                                        </div>
                                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {looDcs.map(dc => (
                                                <div key={dc.id} className="p-3 bg-slate-950 border border-slate-800 rounded flex flex-col justify-between">
                                                    <div>
                                                        <div className="flex justify-between items-start mb-2">
                                                            <span className="text-[10px] font-black text-slate-200 uppercase tracking-tight">{dc.name}</span>
                                                            {dc.status === 'Achieved' ? (
                                                                <CheckCircle2 size={14} className="text-green-500" />
                                                            ) : dc.status === 'AtRisk' ? (
                                                                <AlertTriangle size={14} className="text-red-500 animate-pulse" />
                                                            ) : (
                                                                <Clock size={14} className="text-slate-600" />
                                                            )}
                                                        </div>
                                                        <p className="text-[10px] text-slate-400 mb-3 leading-tight">{dc.description}</p>
                                                    </div>

                                                    <div className="flex items-center gap-1">
                                                        <select
                                                            className={cn(
                                                                "text-[9px] font-black uppercase rounded border p-1 bg-slate-900 transition-colors cursor-pointer focus:outline-none",
                                                                dc.status === 'Achieved' ? 'text-green-500 border-green-900' :
                                                                    dc.status === 'AtRisk' ? 'text-red-500 border-red-900' :
                                                                        dc.status === 'InProgress' ? 'text-blue-500 border-blue-900' : 'text-slate-500 border-slate-800'
                                                            )}
                                                            value={dc.status}
                                                            onChange={(e) => handleStatusChange(dc.id, e.target.value as DCStatus)}
                                                        >
                                                            <option value="Pending">Pending</option>
                                                            <option value="InProgress">In Progress</option>
                                                            <option value="Achieved">Achieved</option>
                                                            <option value="AtRisk">At Risk</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

            </div>

            {/* Sync Matrix Footer (Minimal Version) */}
            <div className="h-12 border-t border-slate-800 bg-slate-950/80 px-6 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-500 uppercase">JCO Cycle:</span>
                        <span className="text-[10px] font-black text-blue-400">24-03 ACTIVE</span>
                    </div>
                    <div className="h-4 w-px bg-slate-800" />
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-500 uppercase">Assessment:</span>
                        <span className="text-[10px] font-black text-yellow-500">PENDING BOARD</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-mono text-slate-600">STATION: HQ-NORTH-C2</span>
                </div>
            </div>
        </div>
    );
}
