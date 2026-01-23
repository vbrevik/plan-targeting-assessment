import { useEffect, useState } from 'react';
import {
    Search,
    Filter,
    MoreVertical,
    MapPin,
    ShieldAlert,
    Target as TargetIcon,
    FileText,
    Flame,
    Plus,
    Scale,
    Undo2,
    Gavel,
    Download
} from 'lucide-react';
import { Link, useSearch } from '@tanstack/react-router';
import { SmartOpsService } from '@/lib/smartops/mock-service';
import { cn } from '@/lib/utils';
import type { Target, TargetStatus, ROE } from '@/lib/smartops/types';
import { StrikeRequestModal } from './StrikeRequestModal';
import { useOperationalContext } from '@/lib/smartops/hooks/useOperationalContext';
import { ExportService } from '@/lib/smartops/services/ExportService';

export function TargetingManagement() {
    const { filterByContext } = useOperationalContext();
    const [targets, setTargets] = useState<Target[]>([]);
    const [roes, setRoes] = useState<ROE[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTargetForStrike, setSelectedTargetForStrike] = useState<Target | null>(null);

    // Filter States
    const [domainFilter, setDomainFilter] = useState<string>('All');
    const [statusFilter, setStatusFilter] = useState<string>('All');
    const [priorityFilter, setPriorityFilter] = useState<string>('All');

    const loadData = async () => {
        const [targetData, roeData] = await Promise.all([
            SmartOpsService.getTargets(),
            SmartOpsService.getROEs()
        ]);
        setTargets(targetData);
        setRoes(roeData);
        setLoading(false);
    };

    const search = useSearch({ from: '/smartops/targeting/' });
    const selectedTargetId = search.targetId;

    useEffect(() => {
        loadData();
    }, []);

    // Auto-scroll to selected target
    useEffect(() => {
        if (selectedTargetId && !loading && targets.length > 0) {
            setTimeout(() => {
                const el = document.getElementById(`target-${selectedTargetId}`);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 300);
        }
    }, [selectedTargetId, loading, targets]);

    const handleStatusChange = async (id: string, newStatus: TargetStatus) => {
        await SmartOpsService.updateTargetStatus(id, newStatus);
        setTargets(prev => prev.map(t => t.id === id ? { ...t, targetStatus: newStatus } : t));
    };

    const filteredTargets = targets.filter(t =>
        filterByContext(t) &&
        (domainFilter === 'All' || t.domain === domainFilter) &&
        (statusFilter === 'All' || t.targetStatus === statusFilter) &&
        (priorityFilter === 'All' || t.priority === priorityFilter) &&
        (
            t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.targetId.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    if (loading) return <div className="p-8 text-slate-500 animate-pulse uppercase font-mono tracking-widest text-xs">Accessing Target Folders...</div>;

    return (
        <div className="flex flex-col h-full bg-[#020617] text-slate-200 overflow-hidden font-sans border-l border-slate-900">

            {/* Header */}
            <div className="p-6 border-b border-slate-800 bg-slate-950/50">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="px-2 py-0.5 bg-red-500/10 text-red-500 text-[10px] font-black border border-red-500/20 rounded uppercase">Joint Targeting</div>
                            <h1 className="text-xl font-black text-white tracking-tight uppercase">Joint Target List (JTL)</h1>
                        </div>
                        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                            Management of nominated and approved targets. Ensure compliance with Rules of Engagement (ROE) and Law of Armed Conflict (LOAC).
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            to="/smartops/targeting/jtb"
                            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-black uppercase rounded border border-slate-700 transition-colors"
                        >
                            <Gavel size={14} /> Execute JTB Session
                        </Link>
                        <Link
                            to="/smartops/targeting/nominate"
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase rounded transition-colors shadow-lg shadow-red-900/20"
                        >
                            <Plus size={14} /> Nominate Target
                        </Link>
                    </div>
                </div>

                {/* Global Stats */}
                <div className="flex gap-8">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Total Targets</span>
                        <span className="text-lg font-black text-white">{targets.length}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Nominated</span>
                        <span className="text-lg font-black text-blue-400">{targets.filter(t => t.targetStatus === 'Nominated').length}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Approved</span>
                        <span className="text-lg font-black text-emerald-400">{targets.filter(t => t.targetStatus === 'Approved').length}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Engaged</span>
                        <span className="text-lg font-black text-orange-400">{targets.filter(t => t.targetStatus === 'Engaged').length}</span>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="h-12 px-6 border-b border-slate-800 bg-slate-900/30 flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                        <input
                            type="text"
                            placeholder="SEARCH JTL BY ID OR NAME..."
                            className="w-full bg-slate-950 border border-slate-800 rounded px-9 py-1.5 text-[10px] font-bold text-white focus:outline-none focus:border-red-500 transition-colors placeholder:text-slate-600"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Domain Filter */}
                    <div className="flex items-center gap-2 px-2 py-1 bg-slate-800 rounded border border-slate-700">
                        <Filter size={12} className="text-slate-400" />
                        <select
                            value={domainFilter}
                            onChange={(e) => setDomainFilter(e.target.value)}
                            className="bg-transparent text-[10px] font-bold text-slate-300 focus:outline-none cursor-pointer uppercase min-w-[60px]"
                        >
                            <option value="All">All Domains</option>
                            <option value="LAND">Land</option>
                            <option value="AIR">Air</option>
                            <option value="MARITIME">Maritime</option>
                            <option value="CYBER">Cyber</option>
                            <option value="SPACE">Space</option>
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2 px-2 py-1 bg-slate-800 rounded border border-slate-700">
                        <ShieldAlert size={12} className="text-slate-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-transparent text-[10px] font-bold text-slate-300 focus:outline-none cursor-pointer uppercase min-w-[60px]"
                        >
                            <option value="All">All Status</option>
                            <option value="Identified">Identified</option>
                            <option value="Nominated">Nominated</option>
                            <option value="Validated">Validated</option>
                            <option value="Approved">Approved</option>
                            <option value="Engaged">Engaged</option>
                        </select>
                    </div>

                    {/* Priority Filter */}
                    <div className="flex items-center gap-2 px-2 py-1 bg-slate-800 rounded border border-slate-700">
                        <Flame size={12} className="text-slate-400" />
                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            className="bg-transparent text-[10px] font-bold text-slate-300 focus:outline-none cursor-pointer uppercase min-w-[60px]"
                        >
                            <option value="All">All Priorities</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>
                    </div>

                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Sort by:</span>
                    <select className="bg-transparent text-[10px] font-black text-slate-300 focus:outline-none cursor-pointer uppercase">
                        <option>Priority (Highest)</option>
                        <option>Category</option>
                        <option>Date Added</option>
                    </select>
                </div>
            </div>

            {/* Target Table */}
            <div className="flex-1 overflow-y-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-slate-950 text-left border-b border-slate-800 sticky top-0 z-10">
                            <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Target ID</th>
                            <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Name / Category</th>
                            <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Priority</th>
                            <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Location</th>
                            <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">ROE Authority</th>
                            <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                            <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">BDA</th>
                            <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {filteredTargets.map(target => (
                            <tr
                                key={target.id}
                                id={`target-${target.id}`}
                                className={cn(
                                    "hover:bg-slate-900/40 transition-all group",
                                    target.id === selectedTargetId ? "bg-red-500/10 border-y border-red-500/30 scale-[1.01] shadow-[0_0_15px_rgba(239,68,68,0.1)]" : ""
                                )}
                            >
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-mono font-black text-red-500 group-hover:text-red-400">{target.targetId}</span>
                                        <span className="text-[9px] text-slate-600 font-bold uppercase">{target.beNumber || 'NO BE#'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-slate-800 rounded flex items-center justify-center shrink-0 border border-slate-700">
                                            <TargetIcon size={16} className="text-slate-400" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-black text-white uppercase tracking-tight">{target.name}</span>
                                            <span className="text-[10px] text-slate-500 font-bold">{target.category} / {target.catCode}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={cn(
                                        "px-2 py-1 rounded text-[9px] font-black uppercase text-center min-w-[60px] inline-block",
                                        target.priority === 'High' ? 'bg-red-500/20 text-red-500 border border-red-500/30' :
                                            target.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' :
                                                'bg-blue-500/20 text-blue-500 border border-blue-500/30'
                                    )}>
                                        {target.priority}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                                        <MapPin size={12} className="text-slate-600" />
                                        {target.location ? `${target.location.lat.toFixed(4)}, ${target.location.lng.toFixed(4)}` : 'N/A'}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {target.requiredRoeId ? (
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <Scale size={10} className={cn(
                                                    roes.find(r => r.id === target.requiredRoeId)?.status === 'Released' ? 'text-emerald-500' : 'text-yellow-500'
                                                )} />
                                                <span className="text-[10px] font-black text-white uppercase">{roes.find(r => r.id === target.requiredRoeId)?.code}</span>
                                            </div>
                                            <span className={cn(
                                                "text-[8px] font-bold uppercase",
                                                roes.find(r => r.id === target.requiredRoeId)?.status === 'Released' ? 'text-emerald-600' : 'text-yellow-600'
                                            )}>{roes.find(r => r.id === target.requiredRoeId)?.status}</span>
                                        </div>
                                    ) : (
                                        <span className="text-[9px] text-slate-600 italic">No ROE Mapping</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <select
                                        className={cn(
                                            "text-[9px] font-black uppercase rounded border p-1 bg-slate-900 transition-colors cursor-pointer focus:outline-none",
                                            target.targetStatus === 'Approved' ? 'text-emerald-400 border-emerald-900' :
                                                target.targetStatus === 'Nominated' ? 'text-blue-400 border-blue-900' :
                                                    target.targetStatus === 'Engaged' ? 'text-orange-400 border-orange-900' :
                                                        target.targetStatus === 'Neutralized' ? 'text-slate-500 border-slate-800' : 'text-white border-slate-700'
                                        )}
                                        value={target.targetStatus}
                                        onChange={(e) => handleStatusChange(target.id, e.target.value as TargetStatus)}
                                    >
                                        <option value="Identified">Identified</option>
                                        <option value="Nominated">Nominated</option>
                                        <option value="Validated">Validated</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Engaged" disabled={target.requiredRoeId ? roes.find(r => r.id === target.requiredRoeId)?.status !== 'Released' : false}>Engaged</option>
                                        <option value="Neutralized">Neutralized</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4">
                                    {target.bdaStatus === 'Re-strike' && (
                                        <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-red-950/50 border border-red-500/50 rounded text-red-400 text-[9px] font-black uppercase tracking-tight animate-pulse">
                                            <Undo2 size={10} /> Re-strike
                                        </span>
                                    )}
                                    {target.bdaStatus === 'Effect Achieved' && (
                                        <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-950/50 border border-emerald-500/50 rounded text-emerald-400 text-[9px] font-black uppercase tracking-tight">
                                            Effect Achieved
                                        </span>
                                    )}
                                    {!target.bdaStatus && <span className="text-[9px] text-slate-600 font-mono">-</span>}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link to="/smartops/targeting/$targetId" params={{ targetId: target.id }}>
                                            <button className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded border border-slate-700 transition-colors" title="Target Folder">
                                                <FileText size={14} />
                                            </button>
                                        </Link>
                                        <button
                                            disabled={target.requiredRoeId ? roes.find(r => r.id === target.requiredRoeId)?.status !== 'Released' : false}
                                            className={cn(
                                                "p-1.5 rounded border transition-colors relative",
                                                (target.requiredRoeId ? roes.find(r => r.id === target.requiredRoeId)?.status === 'Released' : true)
                                                    ? target.bdaStatus === 'Re-strike'
                                                        ? "bg-red-600 border-red-500 text-white hover:bg-red-700 animate-pulse"
                                                        : "bg-slate-800 border-slate-700 text-slate-400 hover:text-red-500 hover:bg-red-900/40"
                                                    : "bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed"
                                            )}
                                            title={target.requiredRoeId && roes.find(r => r.id === target.requiredRoeId)?.status !== 'Released' ? "ROE PENDING" : target.bdaStatus === 'Re-strike' ? "EXECUTE RE-STRIKE" : "Request Engagement"}
                                            onClick={() => setSelectedTargetForStrike(target)}
                                        >
                                            <Flame size={14} />
                                        </button>
                                        <button className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded border border-slate-700 transition-colors">
                                            <MoreVertical size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Telemetry Footer */}
            <div className="h-10 border-t border-slate-800 bg-slate-950 px-6 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <div className="flex items-center gap-6">
                    <span className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> JTL DATABASE ONLINE
                    </span>
                    <span>LAST SYNC: 1s AGO</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="font-bold text-slate-400">NATO CONFORMANT (JDPI-STD)</span>
                </div>
            </div>

            {selectedTargetForStrike && (
                <StrikeRequestModal
                    target={selectedTargetForStrike}
                    open={!!selectedTargetForStrike}
                    onOpenChange={(open) => !open && setSelectedTargetForStrike(null)}
                    onSuccess={loadData}
                />
            )}
        </div>
    );
}
