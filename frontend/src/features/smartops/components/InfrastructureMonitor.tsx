import { useEffect, useState } from 'react';
import { SmartOpsService } from '@/lib/smartops/mock-service';
import type { InfrastructureNode, CivilAgency, CivilDependency } from '@/lib/smartops/types';
import { cn } from '@/lib/utils';
import {
    Factory,
    Zap,
    Truck,
    Wifi,
    Ambulance,
    Droplet,
    AlertTriangle,
    ShieldCheck,
    Map,
    Network,
    ArrowUpRight
} from 'lucide-react';

export function InfrastructureMonitor() {
    const [nodes, setNodes] = useState<InfrastructureNode[]>([]);
    const [agencies, setAgencies] = useState<CivilAgency[]>([]);
    const [dependencies, setDependencies] = useState<CivilDependency[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);
            const [n, a, d] = await Promise.all([
                SmartOpsService.getInfrastructure(),
                SmartOpsService.getCivilAgencies(),
                SmartOpsService.getCivilDependencies()
            ]);
            setNodes(n);
            setAgencies(a);
            setDependencies(d);
            setLoading(false);
        }
        load();
    }, []);

    const getTypeIcon = (type: string) => {
        if (type.includes('Power') || type.includes('Substation')) return <Zap className="text-yellow-400" size={16} />;
        if (type.includes('Bridge') || type.includes('Highway') || type.includes('Port')) return <Truck className="text-blue-400" size={16} />;
        if (type.includes('Data') || type.includes('Fiber')) return <Wifi className="text-purple-400" size={16} />;
        if (type.includes('Hospital')) return <Ambulance className="text-red-400" size={16} />;
        if (type.includes('Water')) return <Droplet className="text-cyan-400" size={16} />;
        return <Factory className="text-slate-400" size={16} />;
    };

    if (loading) return <div className="p-8 text-slate-500 animate-pulse font-mono text-xs uppercase">Connecting to Civil Sector Grid...</div>;

    const criticalDeps = dependencies.filter(d => d.impactIfLost === 'Critical' || d.impactIfLost === 'Severe');

    return (
        <div className="h-full flex flex-col bg-[#020617] text-slate-200 overflow-hidden font-sans">
            {/* Header */}
            <header className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center shrink-0">
                <div>
                    <h1 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                        <Factory className="text-orange-500" />
                        Critical Infrastructure Monitor
                    </h1>
                    <p className="text-xs text-slate-500 font-mono">Total Defence // Civil-Military Integration</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                    <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" /> GRID STABLE
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-yellow-500" /> MSR CAPACITY: 82%
                    </span>
                </div>
            </header>

            <div className="flex-1 overflow-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* LEFT: Nodes List */}
                    <div className="space-y-4">
                        <h2 className="text-xs font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                            <Map size={14} /> National Assets (Sector North)
                        </h2>
                        <div className="grid gap-3">
                            {nodes.map(node => (
                                <div key={node.id} className="bg-slate-900/40 border border-slate-800 p-4 rounded hover:bg-slate-800 transition-colors group">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded bg-slate-950 border border-slate-800 group-hover:border-slate-700">
                                                {getTypeIcon(node.type)}
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-200">{node.name}</h3>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] uppercase font-bold text-slate-500">{node.type}</span>
                                                    <span className="text-[10px] text-slate-600 font-mono">| Load: {node.currentLoad}/{node.capacity}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {node.status === 'Operational' ? (
                                            <ShieldCheck size={16} className="text-emerald-500" />
                                        ) : (
                                            <AlertTriangle size={16} className="text-red-500 animate-pulse" />
                                        )}
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-slate-800/50 flex justify-between items-center">
                                        <span className="text-[10px] uppercase font-bold text-slate-500">
                                            Owner: {agencies.find(a => a.id === node.ownerId)?.name || 'Unknown'}
                                        </span>
                                        <span className={cn(
                                            "px-1.5 py-0.5 rounded text-[9px] font-black uppercase border",
                                            node.criticality === 'Strategic' ? "bg-purple-900/20 text-purple-400 border-purple-500/20" : "bg-slate-800 text-slate-400 border-slate-700"
                                        )}>
                                            {node.criticality}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* MIDDLE: Dependencies & Kill Chains */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Supply Chain / Dependency Net */}
                        <div className="bg-slate-900/20 border border-slate-800 rounded p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xs font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                                    <Network size={14} /> Critical Kill-Chain Dependencies
                                </h2>
                                <span className="bg-red-900/20 text-red-400 border border-red-500/20 px-2 py-0.5 rounded text-[10px] font-black uppercase">
                                    {criticalDeps.length} High Impact Links
                                </span>
                            </div>

                            <div className="space-y-4">
                                {dependencies.map(dep => {
                                    const civNode = nodes.find(n => n.id === dep.civilEntityId);
                                    return (
                                        <div key={dep.id} className="flex items-center gap-4 group">
                                            {/* Military Entity (Left) */}
                                            <div className="flex-1 p-3 bg-slate-950 border border-slate-800 rounded flex items-center justify-between">
                                                <span className="text-xs font-bold text-blue-400 uppercase">Unit / Operation {dep.militaryEntityId.replace('u-blue-', '')}</span>
                                                <ArrowUpRight size={12} className="text-slate-600 rotate-90" />
                                            </div>

                                            {/* Link */}
                                            <div className="flex-1 flex flex-col items-center px-4 relative">
                                                <div className={cn("w-full h-0.5 absolute top-1/2 -translate-y-1/2", dep.impactIfLost === 'Critical' ? "bg-red-500/50" : "bg-slate-700")} />
                                                <span className={cn(
                                                    "relative z-10 px-2 py-0.5 bg-slate-900 text-[9px] font-black uppercase border rounded",
                                                    dep.impactIfLost === 'Critical' ? "text-red-400 border-red-500/30" : "text-slate-500 border-slate-700"
                                                )}>
                                                    Requires {dep.resourceType || dep.dependencyType}
                                                </span>
                                            </div>

                                            {/* Civil Entity (Right) */}
                                            <div className="flex-1 p-3 bg-slate-900/50 border border-slate-800 rounded flex items-center gap-3">
                                                <div className="p-1.5 bg-slate-950 rounded border border-slate-800">
                                                    {civNode && getTypeIcon(civNode.type)}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-xs font-bold text-slate-300 truncate">{civNode?.name || 'Unknown Asset'}</div>
                                                    <div className="text-[9px] text-slate-500 uppercase font-mono">
                                                        Status: <span className={civNode?.status === 'Operational' ? "text-emerald-500" : "text-red-500"}>{civNode?.status}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                        </div>

                        {/* Agency Contact Card */}
                        <div className="grid grid-cols-2 gap-4">
                            {agencies.map(agency => (
                                <div key={agency.id} className="p-4 bg-slate-950 border border-slate-900 rounded flex flex-col justify-between h-24">
                                    <div className="flex justify-between items-start">
                                        <h4 className="text-xs font-black uppercase text-slate-400">{agency.name}</h4>
                                        <span className="text-[9px] text-slate-600 bg-slate-900 px-1.5 py-0.5 rounded uppercase">{agency.type}</span>
                                    </div>
                                    <div className="mt-2 text-[10px] font-mono text-slate-500">
                                        <div className="flex justify-between">
                                            <span>JURISDICTION:</span>
                                            <span className="text-white">{agency.jurisdiction}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>LIAISON:</span>
                                            <span className="text-blue-400 underline cursor-pointer">{agency.contactInfo}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
