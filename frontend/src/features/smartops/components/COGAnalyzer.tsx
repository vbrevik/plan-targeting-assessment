import { useState, useEffect } from 'react';
import { useSearch } from '@tanstack/react-router';
import {
    Activity,
    Target,
    Zap,
    ChevronDown,
    ChevronRight,
    Search,
    ArrowRight,
    AlertCircle,
    Crosshair,
    Network,
    Plus,
    Shield,
    ShieldCheck,
    Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SmartOpsService } from '@/lib/smartops/mock-service';
import type { CenterOfGravity, UUID } from '@/lib/smartops/types';
import { Button } from '@/components/ui/button';

export function COGAnalyzer() {
    const [cogs, setCogs] = useState<CenterOfGravity[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'Red' | 'Blue'>('Red'); // Default to Red (Attack)
    const [expandedNodes, setExpandedNodes] = useState<Set<UUID>>(new Set());

    const search = useSearch({ from: '/smartops/cog' });
    const selectedCogId = search.cogId;

    useEffect(() => {
        loadData();
    }, []);

    // Auto-scroll to selected COG
    useEffect(() => {
        if (selectedCogId && !loading && cogs.length > 0) {
            const cog = cogs.find(c => c.id === selectedCogId);
            if (cog) {
                setViewMode(cog.side as 'Red' | 'Blue');
                setTimeout(() => {
                    const el = document.getElementById(`cog-${selectedCogId}`);
                    if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 300);
            }
        }
    }, [selectedCogId, loading, cogs]);

    const loadData = async () => {
        setLoading(true);
        const data = await SmartOpsService.getCOGs();
        setCogs(data);
        setLoading(false);
    };

    const toggleNode = (id: UUID) => {
        const next = new Set(expandedNodes);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setExpandedNodes(next);
    };

    // --- Red Actions ---
    const handlePromoteToTarget = async (cvId: UUID) => {
        await SmartOpsService.updateCVStatus(cvId, 'Targeted');
        loadData();
    };

    // --- Blue Actions ---
    const handleFortify = async (cvId: UUID) => {
        await SmartOpsService.updateCVProtection(cvId, 'Fortified', 100);
        loadData();
    };

    const handleAssignGuard = async (cvId: UUID) => {
        await SmartOpsService.updateCVProtection(cvId, 'Guarded', 75);
        loadData();
    };

    const filteredCogs = cogs.filter(c => c.side === viewMode);

    return (
        <div className="flex h-full bg-[#020617] text-slate-200 overflow-hidden font-sans border-l border-slate-900">
            {/* Control Sidebar */}
            <div className="w-80 border-r border-slate-800 flex flex-col shrink-0 bg-slate-950/40">
                <div className="p-6 border-b border-slate-800 bg-slate-950/40">
                    <h1 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3 mb-6">
                        <Activity className={viewMode === 'Blue' ? 'text-blue-500' : 'text-red-500'} size={24} />
                        COG Analyzer
                    </h1>

                    {/* Strict View Toggle */}
                    <div className="flex gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800 mb-6">
                        <button
                            onClick={() => setViewMode('Red')}
                            className={cn(
                                "flex-1 py-3 text-[10px] font-black uppercase rounded-lg transition-all tracking-widest flex items-center justify-center gap-2",
                                viewMode === 'Red' ? "bg-red-600 text-white shadow-lg shadow-red-900/40" : "text-slate-500 hover:text-slate-300"
                            )}
                        >
                            <Target size={14} /> Red Force
                        </button>
                        <button
                            onClick={() => setViewMode('Blue')}
                            className={cn(
                                "flex-1 py-3 text-[10px] font-black uppercase rounded-lg transition-all tracking-widest flex items-center justify-center gap-2",
                                viewMode === 'Blue' ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" : "text-slate-500 hover:text-slate-300"
                            )}
                        >
                            <Shield size={14} /> Blue Force
                        </button>
                    </div>

                    <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                        <h4 className="text-[10px] font-black uppercase tracking-widest mb-2 text-slate-400">Operational Context</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            {viewMode === 'Red'
                                ? "Identify and target Critical Vulnerabilities in the adversary's Center of Gravity to degrade their operational capability."
                                : "Analyze Critical Vulnerabilities in friendly forces. Assign protections and fortify capabilities to ensure mission resilience."}
                        </p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {/* Stats based on view */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                            <div className="text-xl font-black text-white">{filteredCogs.length}</div>
                            <div className="text-[9px] font-bold text-slate-500 uppercase">Active COGs</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Analysis Grid */}
            <div className="flex-1 overflow-y-auto bg-[#020617] p-8 space-y-8 custom-scrollbar relative">
                {/* Background FX */}
                <div className={cn(
                    "absolute top-0 right-0 w-[600px] h-[600px] blur-[120px] rounded-full pointer-events-none opacity-20",
                    viewMode === 'Blue' ? "bg-blue-600" : "bg-red-600"
                )} />

                {loading ? (
                    <div className="flex items-center justify-center h-full text-slate-600 font-black uppercase text-[10px] tracking-[0.3em] animate-pulse">
                        Synchronizing Operational Design...
                    </div>
                ) : filteredCogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-600">
                        <Activity size={48} className="mb-4 opacity-20" />
                        <span className="font-black uppercase text-xs tracking-widest">No Centers of Gravity identified for {viewMode} Force</span>
                    </div>
                ) : (
                    <div className="space-y-12 relative z-10">
                        {filteredCogs.map((cog) => (
                            <section
                                key={cog.id}
                                id={`cog-${cog.id}`}
                                className={cn(
                                    "space-y-6 transition-all duration-500 rounded-2xl p-4",
                                    cog.id === selectedCogId ? (cog.side === 'Blue' ? "bg-blue-600/5 shadow-[0_0_40px_rgba(59,130,246,0.1)] border border-blue-500/20" : "bg-red-600/5 shadow-[0_0_40px_rgba(239,68,68,0.1)] border border-red-500/20") : ""
                                )}
                            >
                                <div className="flex items-end justify-between border-b border-slate-900 pb-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                                                viewMode === 'Blue' ? "bg-blue-600 text-white" : "bg-red-600 text-white"
                                            )}>
                                                {cog.side} Force
                                            </span>
                                        </div>
                                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter">{cog.name}</h2>
                                        <p className="text-sm text-slate-500 font-medium">{cog.description}</p>
                                    </div>
                                    <Button variant="ghost" className="text-slate-600 hover:text-white uppercase text-[10px] font-black tracking-widest gap-2">
                                        Graph View <Network size={14} />
                                    </Button>
                                </div>

                                <div className="grid gap-4">
                                    {cog.capabilities.map((cc) => (
                                        <div key={cc.id} className="group">
                                            <div
                                                onClick={() => toggleNode(cc.id)}
                                                className={cn(
                                                    "bg-slate-900/40 border rounded-2xl p-6 cursor-pointer transition-all hover:border-slate-600",
                                                    expandedNodes.has(cc.id)
                                                        ? (viewMode === 'Blue' ? "bg-slate-900/80 border-blue-500/50" : "bg-slate-900/80 border-red-500/50")
                                                        : "border-slate-800"
                                                )}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn(
                                                            "w-10 h-10 rounded-xl flex items-center justify-center border",
                                                            viewMode === 'Blue' ? "bg-blue-600/10 text-blue-500 border-blue-500/20" : "bg-red-600/10 text-red-500 border-red-500/20"
                                                        )}>
                                                            <Zap size={20} />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-sm font-black text-white uppercase tracking-tight">{cc.name}</h3>
                                                            <p className="text-xs text-slate-500 font-medium">{cc.description}</p>
                                                        </div>
                                                    </div>
                                                    {expandedNodes.has(cc.id) ? <ChevronDown size={20} className="text-slate-500" /> : <ChevronRight size={20} className="text-slate-500" />}
                                                </div>

                                                {expandedNodes.has(cc.id) && (
                                                    <div className="mt-8 space-y-4 border-t border-slate-800 pt-6 animate-in slide-in-from-top-2 duration-300">
                                                        <div className="text-[10px] font-black uppercase text-slate-600 tracking-widest mb-4">
                                                            {viewMode === 'Blue' ? "Defense Gaps & Resilience" : "Critical Requirements & Vulnerabilities"}
                                                        </div>
                                                        <div className="grid gap-4">
                                                            {cc.requirements.map((cr) => (
                                                                <div key={cr.id} className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-5">
                                                                    <div className="flex items-center gap-3 mb-4">
                                                                        <div className="w-1.5 h-4 bg-slate-700 rounded-full" />
                                                                        <h4 className="text-[13px] font-black text-slate-200 uppercase tracking-tight">{cr.name}</h4>
                                                                    </div>
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                        {cr.vulnerabilities.map((cv) => (
                                                                            <div key={cv.id} className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 relative overflow-hidden group/cv transition-all hover:bg-slate-900">
                                                                                {/* Header Badges */}
                                                                                <div className="flex justify-between items-start mb-2">
                                                                                    {viewMode === 'Red' ? (
                                                                                        // RED INDICATORS
                                                                                        <div className={cn(
                                                                                            "px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                                                                                            cv.status === 'Targeted' ? "bg-red-500/20 text-red-500" :
                                                                                                cv.status === 'Neutralized' ? "bg-emerald-500/20 text-emerald-500" : "bg-slate-800 text-slate-500"
                                                                                        )}>
                                                                                            {cv.status}
                                                                                        </div>
                                                                                    ) : (
                                                                                        // BLUE INDICATORS
                                                                                        <div className={cn(
                                                                                            "px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest flex items-center gap-1",
                                                                                            cv.protectionStatus === 'Fortified' ? "bg-emerald-500/20 text-emerald-500" :
                                                                                                cv.protectionStatus === 'Guarded' ? "bg-blue-500/20 text-blue-500" : "bg-red-500/10 text-red-400"
                                                                                        )}>
                                                                                            {cv.protectionStatus === 'Fortified' && <ShieldCheck size={8} />}
                                                                                            {cv.protectionStatus || 'Unprotected'}
                                                                                        </div>
                                                                                    )}
                                                                                </div>

                                                                                <h5 className="text-[11px] font-black text-white uppercase tracking-tight mb-2">{cv.name}</h5>
                                                                                <p className="text-[10px] text-slate-500 leading-relaxed italic mb-4">"{cv.description}"</p>

                                                                                {/* Conditional Actions */}
                                                                                <div className="pt-2 border-t border-slate-800/50 flex gap-2">
                                                                                    {viewMode === 'Red' && cv.status !== 'Targeted' && cv.status !== 'Neutralized' && (
                                                                                        <Button
                                                                                            onClick={(e) => { e.stopPropagation(); handlePromoteToTarget(cv.id); }}
                                                                                            className="flex-1 bg-red-900/20 hover:bg-red-600 text-red-400 hover:text-white text-[9px] font-black uppercase h-8"
                                                                                        >
                                                                                            <Crosshair size={12} className="mr-2" /> Target
                                                                                        </Button>
                                                                                    )}

                                                                                    {viewMode === 'Blue' && (
                                                                                        <>
                                                                                            <Button
                                                                                                disabled={cv.protectionStatus === 'Guarded' || cv.protectionStatus === 'Fortified'}
                                                                                                onClick={(e) => { e.stopPropagation(); handleAssignGuard(cv.id); }}
                                                                                                className="flex-1 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white text-[9px] font-black uppercase h-8"
                                                                                            >
                                                                                                <Lock size={12} className="mr-2" /> Guard
                                                                                            </Button>
                                                                                            <Button
                                                                                                disabled={cv.protectionStatus === 'Fortified'}
                                                                                                onClick={(e) => { e.stopPropagation(); handleFortify(cv.id); }}
                                                                                                className="flex-1 bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white text-[9px] font-black uppercase h-8"
                                                                                            >
                                                                                                <ShieldCheck size={12} className="mr-2" /> Fortify
                                                                                            </Button>
                                                                                        </>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
