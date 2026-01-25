import { useEffect, useState } from 'react';
import {
    Network,
    Container,
    TrendingUp,
    AlertTriangle,
    Building2,
    ArrowRight,
    ShieldAlert
} from 'lucide-react';
import { SmartOpsService } from '@/lib/smartops/mock-service';
import { cn } from '@/lib/utils';
import type { SupplyNode, Vendor } from '@/lib/smartops/types';

export function SupplyChainManagement() {
    const [nodes, setNodes] = useState<SupplyNode[]>([]);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [healthBlue, setHealthBlue] = useState(0);
    const [healthRed, setHealthRed] = useState(0);

    useEffect(() => {
        async function loadData() {
            const { nodes, vendors } = await SmartOpsService.getLibraryData() as { nodes: SupplyNode[], vendors: Vendor[] };
            const hBlue = await SmartOpsService.getOverallSupplyHealth('Blue') as number;
            const hRed = await SmartOpsService.getOverallSupplyHealth('Red') as number;

            setNodes(nodes);
            setVendors(vendors);
            setHealthBlue(hBlue);
            setHealthRed(hRed);
            setLoading(false);
        }
        loadData();
    }, []);

    if (loading) return <div className="p-8 text-slate-500 animate-pulse font-mono text-[10px] uppercase">Mapping Global Supply Lines...</div>;

    return (
        <div className="flex flex-col h-full bg-[#020617] text-slate-200 overflow-hidden font-sans border-l border-slate-900">

            {/* Header */}
            <div className="p-6 border-b border-slate-800 bg-slate-950/50">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="px-2 py-0.5 bg-blue-500/10 text-blue-500 text-[10px] font-black border border-blue-500/20 rounded uppercase">Logistics Intel</div>
                            <h1 className="text-xl font-black text-white tracking-tight uppercase">Supply Chain & Network Analysis</h1>
                        </div>
                        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                            Global logistics topology. Analyze adversarial supply chains, monitor dual-side vendor dependencies, and predict economic blowback from kinetic operations.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <div className="p-3 bg-slate-900/50 border border-slate-800 rounded flex flex-col items-center min-w-[100px]">
                            <span className="text-[8px] font-black text-blue-500 uppercase">Blue Network</span>
                            <span className="text-lg font-black text-white">{healthBlue}%</span>
                        </div>
                        <div className="p-3 bg-slate-900/50 border border-slate-800 rounded flex flex-col items-center min-w-[100px]">
                            <span className="text-[8px] font-black text-red-500 uppercase">Red Network</span>
                            <span className="text-lg font-black text-white">{healthRed}%</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">

                {/* Network Nodes */}
                <section>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                        <Network className="h-4 w-4 text-blue-500" /> Strategic Supply Nodes
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {nodes.map(node => (
                            <div key={node.id} className={cn(
                                "p-4 rounded-lg border bg-slate-900/40 border-slate-800 hover:border-blue-500/30 transition-all group cursor-pointer",
                                node.owner === 'Red' && "hover:border-red-500/30"
                            )}>
                                <div className="flex justify-between items-start mb-3">
                                    <div className={cn(
                                        "w-8 h-8 rounded flex items-center justify-center shrink-0",
                                        node.owner === 'Blue' ? "bg-blue-500/10 text-blue-400" : "bg-red-500/10 text-red-400"
                                    )}>
                                        <Container size={18} />
                                    </div>
                                    <span className={cn(
                                        "text-[9px] font-black px-1.5 py-0.5 rounded border uppercase",
                                        node.owner === 'Blue' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                                    )}>
                                        {node.owner} Force
                                    </span>
                                </div>
                                <h4 className="text-[11px] font-black text-white uppercase mb-1">{node.name}</h4>
                                <p className="text-[9px] text-slate-500 font-bold uppercase mb-4">{node.type} | {node.location}</p>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-[9px]">
                                        <span className="text-slate-500 font-bold">CRITICALITY</span>
                                        <span className="text-white font-black">{node.criticality * 100}%</span>
                                    </div>
                                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500" style={{ width: `${node.criticality * 100}%` }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Vendor Profiling */}
                <section>
                    <div className="flex justify-between items-end mb-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-emerald-500" /> Vendor Intelligence (Grey Market)
                        </h3>
                        <span className="text-[9px] font-mono text-amber-500 flex items-center gap-1">
                            <ShieldAlert size={12} /> DUAL-SIDE EXPOSURE DETECTED
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {vendors.map(vendor => (
                            <div key={vendor.id} className="p-5 rounded-lg border bg-slate-900/60 border-slate-800 flex gap-6 overflow-hidden relative group">
                                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <TrendingUp size={64} />
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h4 className="text-[12px] font-black text-white uppercase">{vendor.name}</h4>
                                        {vendor.conflictInterestLevel === 'High' && (
                                            <span className="bg-red-500/10 text-red-500 text-[8px] px-1.5 py-0.5 border border-red-500/20 rounded font-black uppercase">Conflict High</span>
                                        )}
                                    </div>
                                    <div className="flex gap-4 mb-4">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] text-slate-500 font-bold uppercase">Alignment</span>
                                            <span className="text-[10px] text-slate-300 font-black">{vendor.alignment}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[8px] text-slate-500 font-bold uppercase">War Profit</span>
                                            <span className="text-[10px] text-emerald-400 font-black">{vendor.revenueFromWar}%</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <span className="text-[8px] text-slate-500 font-black uppercase block">Active Contracts</span>
                                        {vendor.contracts.map((c, i) => (
                                            <div key={i} className="flex items-center justify-between p-1.5 bg-slate-950/50 rounded border border-slate-800">
                                                <div className="flex items-center gap-2">
                                                    <div className={cn(
                                                        "w-1.5 h-1.5 rounded-full",
                                                        c.side === 'Blue' ? "bg-blue-500" : "bg-red-500"
                                                    )} />
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase">{c.unitId}</span>
                                                </div>
                                                <ArrowRight size={10} className="text-slate-700" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Global Impact Alert */}
                <section className="p-5 bg-amber-500/5 border border-amber-500/20 rounded-lg flex gap-4">
                    <AlertTriangle className="text-amber-500 shrink-0" size={24} />
                    <div>
                        <h4 className="text-[11px] font-black text-amber-500 uppercase mb-1">Economic Synchronization Warning</h4>
                        <p className="text-[10px] text-slate-400 font-bold leading-relaxed max-w-3xl">
                            Targeting logic in Sector Red-Alpha identifies **Volga Production Plant** as a Tier 1 supply node. However, striking this node will result in a 32% drop in Globex Defence stock, potentially impacting the delivery of Blue-Phase IV equipment. Proceed with multi-criteria objective analysis.
                        </p>
                    </div>
                </section>

            </div>

            {/* Footer */}
            <div className="h-10 border-t border-slate-800 bg-slate-950 px-6 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <div className="flex items-center gap-6">
                    <span className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)]" /> NETWORK GRAPH: LIVE
                    </span>
                    <span>VENDORS TRACKED: {vendors.length}</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-slate-400 font-bold">ORBITAL LOGISTICS OVERWATCH ENABLED</span>
                </div>
            </div>
        </div>
    );
}
