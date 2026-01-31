// NATO MDO Component: Cyber Operations Cockpit
// High-fidelity management of logical targets, access status, and digital effects
// Ontology-first design: Focus on Network nodes, Entry points, and Multi-hop lateral movement

import { useState, useMemo } from 'react';
import { Globe, Shield, Terminal, Zap, Activity, Server, Share2, Lock, ZapOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SecurityBadge } from '@/components/SecurityBadge';
import type { Domain } from '@/lib/mshnctrl/api/targeting.api';

interface NetworkNode {
    id: string;
    label: string;
    type: 'SERVER' | 'ROUTER' | 'WORKSTATION' | 'ICS' | 'CLOUD';
    status: 'COMPROMISED' | 'INITIAL_ACCESS' | 'SECURE' | 'DISRUPTED';
    vulnerabilities: number;
    connections: string[]; // IDs of connected nodes
}

export function CyberOperationsCockpit() {
    const [selectedDomain, setSelectedDomain] = useState<Domain>('CYBER');
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    console.log('Hovered Node:', hoveredNode); // Resolve warning for now

    // Data-driven Network Topology (Ontology-First)
    const networkNodes: NetworkNode[] = useMemo(() => [
        { id: 'NODE-01', label: 'External Gateway', type: 'ROUTER', status: 'COMPROMISED', vulnerabilities: 3, connections: ['NODE-02', 'NODE-05'] },
        { id: 'NODE-02', label: 'Primary Domain Controller', type: 'SERVER', status: 'INITIAL_ACCESS', vulnerabilities: 1, connections: ['NODE-01', 'NODE-03', 'NODE-04'] },
        { id: 'NODE-03', label: 'HR Database Server', type: 'SERVER', status: 'SECURE', vulnerabilities: 4, connections: ['NODE-02'] },
        { id: 'NODE-04', label: 'Engineering Workstation', type: 'WORKSTATION', status: 'SECURE', vulnerabilities: 2, connections: ['NODE-02'] },
        { id: 'NODE-05', label: 'ICS Scada Network', type: 'ICS', status: 'SECURE', vulnerabilities: 7, connections: ['NODE-01', 'NODE-06'] },
        { id: 'NODE-06', label: 'Plumbing/HVAC Control', type: 'ICS', status: 'DISRUPTED', vulnerabilities: 0, connections: ['NODE-05'] },
    ], []);

    // Summary Metrics
    const metrics = {
        activeExploits: 2,
        persistentAgents: 5,
        targetResonance: 82,
        accessLevel: 'USER_LEVEL'
    };

    return (
        <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden flex flex-col h-[600px]">
            {/* Header Area */}
            <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
                        <Terminal size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tighter">Cyber Operations Cockpit</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Active Offensive Campaign: "QUANTUM VELOCITY"</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700">
                        {['CYBER', 'COGNITIVE', 'EMS'].map((d) => (
                            <button
                                key={d}
                                onClick={() => setSelectedDomain(d as Domain)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                    selectedDomain === d ? "bg-purple-600 text-white shadow-lg shadow-purple-900/40" : "text-slate-500 hover:text-slate-300"
                                )}
                            >
                                {d}
                            </button>
                        ))}
                    </div>
                    <SecurityBadge level="TOP_SECRET" caveats={['FISA', 'SI']} size="md" />
                </div>
            </div>

            {/* Main Operational Area */}
            <div className="flex-1 flex min-h-0">
                {/* Left: Network Topology (Visual Intelligence) */}
                <div className="flex-[1.5] border-r border-slate-800 p-6 relative overflow-hidden bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900/50 via-slate-950 to-slate-950">
                    <div className="absolute inset-0 opacity-10 pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #4f46e5 1px, transparent 0)', backgroundSize: '40px 40px' }} />

                    <div className="relative z-10 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Activity size={12} />
                                Logical Topology Map
                            </h3>
                            <div className="flex gap-2">
                                <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors">
                                    <Share2 size={14} />
                                </button>
                                <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors">
                                    <Globe size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Interactive Node Graph Placeholder (High-Fidelity Mock) */}
                        <div className="flex-1 flex items-center justify-center relative">
                            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                {/* Connection lines would go here dynamically */}
                                {networkNodes.flatMap(node =>
                                    node.connections.map(targetId => {
                                        const target = networkNodes.find(n => n.id === targetId);
                                        if (!target) return null;
                                        // This is a simplification; in real SVG we'd need calculated coords
                                        return null;
                                    })
                                )}
                            </svg>

                            <div className="grid grid-cols-3 gap-8 relative z-20">
                                {networkNodes.map((node) => (
                                    <div
                                        key={node.id}
                                        onMouseEnter={() => setHoveredNode(node.id)}
                                        onMouseLeave={() => setHoveredNode(null)}
                                        className={cn(
                                            "relative p-4 rounded-2xl border-2 transition-all cursor-pointer group w-32",
                                            node.status === 'COMPROMISED' ? "bg-red-950/20 border-red-500/30 hover:border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.1)]" :
                                                node.status === 'INITIAL_ACCESS' ? "bg-amber-950/20 border-amber-500/30 hover:border-amber-400" :
                                                    node.status === 'DISRUPTED' ? "bg-slate-900/50 border-slate-700 grayscale" :
                                                        "bg-slate-800/10 border-slate-700 hover:border-purple-500/50"
                                        )}
                                    >
                                        <div className="flex flex-col items-center text-center gap-2">
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center border",
                                                node.status === 'COMPROMISED' ? "bg-red-500/20 text-red-500 border-red-500/20" :
                                                    "bg-slate-700/50 text-slate-400 border-slate-600"
                                            )}>
                                                {node.type === 'SERVER' ? <Server size={20} /> :
                                                    node.type === 'ROUTER' ? <Globe size={20} /> :
                                                        node.type === 'ICS' ? <Shield size={20} /> :
                                                            <Terminal size={20} />}
                                            </div>
                                            <div className="text-[10px] font-black text-white uppercase leading-none truncate w-full">{node.label}</div>
                                            <div className="text-[8px] font-mono text-slate-500">{node.id}</div>
                                        </div>

                                        {/* Status Pips */}
                                        <div className="absolute -top-1 -right-1 flex gap-0.5">
                                            {node.status === 'COMPROMISED' && <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />}
                                            {node.vulnerabilities > 0 && <div className="px-1 bg-amber-500 rounded-sm text-[6px] font-black text-black">{node.vulnerabilities} VULN</div>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="mt-6 flex gap-4 p-4 bg-slate-900/30 border border-slate-800 rounded-2xl">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-500" />
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Compromised</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-amber-500" />
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Infiltration</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-slate-600" />
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Secured</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Asset & Effect Control (Data-Driven) */}
                <div className="flex-1 p-6 flex flex-col gap-6 bg-slate-900/20">
                    {/* Active Campaign Status */}
                    <div className="p-5 bg-gradient-to-br from-purple-900/20 to-slate-900/40 border border-purple-500/20 rounded-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Campaign Metrics</div>
                            <Activity size={14} className="text-purple-500" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-[8px] font-black text-slate-500 uppercase mb-1">Impact Level</div>
                                <div className="text-xl font-black text-white italic">CRITICAL</div>
                            </div>
                            <div>
                                <div className="text-[8px] font-black text-slate-500 uppercase mb-1">Persistence</div>
                                <div className="text-xl font-black text-white">{metrics.targetResonance}%</div>
                            </div>
                        </div>
                        <div className="mt-4 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" style={{ width: '82%' }} />
                        </div>
                    </div>

                    {/* Digital Multi-Tool (Available Effects) */}
                    <div className="flex-1 flex flex-col min-h-0">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Zap size={12} />
                            Deployable Effects (The 5Ds)
                        </h3>
                        <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                            {[
                                { name: 'Network Denial', desc: 'Saturate gateway bandwidth to block C2 egress.', domain: 'CYBER', cooldown: 0, severity: 'HIGH', icon: <ZapOff /> },
                                { name: 'Logic Disruption', desc: 'Inject corrupt microcode into ICS controllers.', domain: 'CYBER', cooldown: 15, severity: 'MED', icon: <Activity /> },
                                { name: 'Cognitive Manipulation', desc: 'Sync narrative burst with kinetic strike arrival.', domain: 'COGNITIVE', cooldown: 45, severity: 'STRAT', icon: <Share2 /> },
                                { name: 'Data Degradation', desc: 'Introduce latency into targeting databases.', domain: 'INFO', cooldown: 5, severity: 'LOW', icon: <Server /> },
                            ].map((effect, idx) => (
                                <button
                                    key={idx}
                                    className="w-full p-4 bg-slate-900/50 border border-slate-800 rounded-2xl hover:border-purple-500/50 hover:bg-slate-800/50 transition-all text-left group"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-purple-600/20 text-slate-400 group-hover:text-purple-400 transition-colors">
                                                {effect.icon}
                                            </div>
                                            <div>
                                                <div className="text-xs font-black text-white uppercase">{effect.name}</div>
                                                <div className="text-[8px] font-black text-slate-500 uppercase">{effect.severity} IMPACT • {effect.domain}</div>
                                            </div>
                                        </div>
                                        {effect.cooldown > 0 && (
                                            <div className="text-[10px] font-mono text-amber-500 font-bold">CD: {effect.cooldown}m</div>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-slate-400 leading-relaxed italic">{effect.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="pt-4 border-t border-slate-800 flex gap-3">
                        <button className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-red-900/20 flex items-center justify-center gap-2">
                            <Lock size={14} />
                            Execute Neutralization
                        </button>
                        <button className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all">
                            Details
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
