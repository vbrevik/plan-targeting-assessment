import { useEffect, useState } from 'react';
import { useSearch } from '@tanstack/react-router';
import {
    Users,
    Shield,
    Zap,
    ChevronRight,
    ChevronDown,
    Truck,
    Plane,
    Sword,
    Search,
    Activity,
    ShieldAlert
} from 'lucide-react';
import { MshnCtrlService } from '@/lib/mshnctrl/mock-service';
import { cn } from '@/lib/utils';
import type { Unit } from '@/lib/mshnctrl/types';

export function OrbatManagement() {
    const search = useSearch({ from: '/mshnctrl/orbat' });
    const selectedUnitId = search.unitId;

    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterSide, setFilterSide] = useState<'Blue' | 'Red'>('Blue');
    const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set(['u-shq', 'u-blue-hq', 'u-red-hq']));

    // Auto-expand hierarchy if unitId is present
    useEffect(() => {
        if (selectedUnitId && units.length > 0) {
            const unit = units.find(u => u.id === selectedUnitId);
            if (unit) {
                setFilterSide(unit.affiliation as 'Blue' | 'Red');
                const path = new Set(expandedUnits);
                let current = unit;
                while (current.parentId) {
                    path.add(current.parentId);
                    const parent = units.find(u => u.id === current.parentId);
                    if (!parent) break;
                    current = parent;
                }
                setExpandedUnits(path);

                // Scroll into view after rendering
                setTimeout(() => {
                    const el = document.getElementById(`unit-${selectedUnitId}`);
                    if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 300);
            }
        }
    }, [selectedUnitId, units]);

    useEffect(() => {
        async function loadData() {
            const data = await MshnCtrlService.getOrbat() as Unit[];
            setUnits(data);
            setLoading(false);
        }
        loadData();
    }, []);

    const toggleExpand = (id: string) => {
        const next = new Set(expandedUnits);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setExpandedUnits(next);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'C2': return <Shield size={14} />;
            case 'Armor': return <Sword size={14} />;
            case 'Logistics': return <Truck size={14} />;
            case 'Air': return <Plane size={14} />;
            case 'SOF': return <Zap size={14} />;
            default: return <Users size={14} />;
        }
    };

    const renderUnit = (unit: Unit, level = 0) => {
        const children = units.filter(u => u.parentId === unit.id);
        const isExpanded = expandedUnits.has(unit.id);
        const hasChildren = children.length > 0;

        return (
            <div key={unit.id} className="select-none">
                <div
                    className={cn(
                        "flex items-center gap-2 p-2 rounded-md hover:bg-slate-800 transition-all cursor-pointer group border",
                        level === 0 && "bg-slate-900/50 border-slate-800 mb-1",
                        unit.id === selectedUnitId ? "bg-blue-500/20 border-blue-500/50 scale-[1.02] shadow-[0_0_15px_rgba(59,130,246,0.2)]" : "border-transparent"
                    )}
                    style={{ marginLeft: `${level * 20}px` }}
                    onClick={() => toggleExpand(unit.id)}
                    id={`unit-${unit.id}`}
                >
                    {hasChildren ? (
                        isExpanded ? <ChevronDown size={14} className="text-slate-500" /> : <ChevronRight size={14} className="text-slate-500" />
                    ) : (
                        <div className="w-3.5" />
                    )}

                    <div className={cn(
                        "w-6 h-6 rounded flex items-center justify-center shrink-0",
                        unit.affiliation === 'Blue' ? "bg-blue-500/10 text-blue-400" : "bg-red-500/10 text-red-400"
                    )}>
                        {getIcon(unit.unitType)}
                    </div>

                    <div className="flex-1 flex items-center justify-between overflow-hidden">
                        <div className="flex flex-col overflow-hidden">
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-black text-white uppercase tracking-tight truncate">{unit.name}</span>
                                <span className="text-[8px] font-mono text-slate-500">{unit.designator}</span>
                            </div>
                            <span className="text-[8px] font-bold text-slate-500 uppercase">
                                {unit.echelon} | {unit.location ? `${unit.location.lat.toFixed(2)}, ${unit.location.lng.toFixed(2)}` : 'N/A'}
                            </span>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                            <div className="flex flex-col items-end">
                                <span className="text-[8px] text-slate-600 font-black uppercase">Readiness</span>
                                <div className="flex items-center gap-1">
                                    <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className={cn("h-full transition-all", unit.readiness > 80 ? "bg-emerald-500" : "bg-yellow-500")}
                                            style={{ width: `${unit.readiness}%` }}
                                        />
                                    </div>
                                    <span className="text-[9px] font-mono text-slate-300">{unit.readiness}%</span>
                                </div>
                            </div>
                            <div className={cn(
                                "px-2 py-0.5 rounded text-[8px] font-black uppercase border",
                                unit.combatEffectiveness === 'Effective' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                            )}>
                                {unit.combatEffectiveness}
                            </div>
                        </div>
                    </div>
                </div>

                {isExpanded && (
                    <div className="mt-1 ml-6 space-y-2 pb-2">
                        {/* Unit Details Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pr-2">
                            {unit.capabilities.length > 0 && (
                                <div className="p-2 bg-slate-900/30 border border-slate-800/50 rounded text-[9px] font-bold">
                                    <div className="flex items-center gap-1.5 text-blue-400 uppercase mb-1">
                                        <Activity size={10} /> Capabilities
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {unit.capabilities.map((cap, i) => (
                                            <span key={i} className="px-1.5 py-0.5 bg-blue-500/10 text-blue-300 rounded border border-blue-500/20">{cap}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {(unit.caveats.length > 0 || unit.restrictions.length > 0) && (
                                <div className="p-2 bg-slate-900/30 border border-slate-800/50 rounded text-[9px] font-bold">
                                    <div className="flex items-center gap-1.5 text-yellow-500 uppercase mb-1">
                                        <ShieldAlert size={10} /> Operational Constraints
                                    </div>
                                    <div className="space-y-1">
                                        {unit.caveats.map((c, i) => (
                                            <div key={i} className="flex items-start gap-1 text-slate-400 italic">
                                                <span className="text-yellow-600 font-black">CAVEAT:</span> {c}
                                            </div>
                                        ))}
                                        {unit.restrictions.map((r, i) => (
                                            <div key={i} className="flex items-start gap-1 text-slate-400 italic">
                                                <span className="text-red-500 font-black">RESTRICTION:</span> {r}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Children Units */}
                        {hasChildren && (
                            <div className="mt-2 space-y-1">
                                {children.map(child => renderUnit(child, level + 1))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const topLevelUnits = units.filter(u => !u.parentId && u.affiliation === filterSide);

    if (loading) return <div className="p-8 text-slate-500 animate-pulse font-mono text-[10px] uppercase">Marshalling Forces...</div>;

    return (
        <div className="flex flex-col h-full bg-[#020617] text-slate-200 overflow-hidden font-sans border-l border-slate-900">

            {/* Header */}
            <div className="p-6 border-b border-slate-800 bg-slate-950/50">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="px-2 py-0.5 bg-slate-500/10 text-slate-500 text-[10px] font-black border border-slate-500/20 rounded uppercase">Battle Management</div>
                            <h1 className="text-xl font-black text-white tracking-tight uppercase">Order of Battle (ORBAT)</h1>
                        </div>
                        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                            Real-time force composition and status. Monitor command hierarchy, combat effectiveness, and capability distribution across the JOA.
                        </p>
                    </div>

                    <div className="flex bg-slate-900 p-1 rounded border border-slate-800">
                        <button
                            onClick={() => setFilterSide('Blue')}
                            className={cn(
                                "px-4 py-1.5 text-[10px] font-black uppercase rounded transition-all",
                                filterSide === 'Blue' ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                            )}
                        >Blue Forces</button>
                        <button
                            onClick={() => setFilterSide('Red')}
                            className={cn(
                                "px-4 py-1.5 text-[10px] font-black uppercase rounded transition-all",
                                filterSide === 'Red' ? "bg-red-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                            )}
                        >Red Forces</button>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                    <div className="bg-slate-900/40 border border-slate-800 p-3 rounded flex flex-col items-center">
                        <span className="text-[8px] font-black text-slate-500 uppercase">Total Echelons</span>
                        <span className="text-xl font-black text-white">{units.filter(u => u.affiliation === filterSide).length}</span>
                    </div>
                    <div className="bg-slate-900/40 border border-slate-800 p-3 rounded flex flex-col items-center">
                        <span className="text-[8px] font-black text-slate-500 uppercase">Avg Readiness</span>
                        <span className="text-xl font-black text-emerald-500">
                            {Math.round(units.filter(u => u.affiliation === filterSide).reduce((acc, u) => acc + u.readiness, 0) / (units.filter(u => u.affiliation === filterSide).length || 1))}%
                        </span>
                    </div>
                    <div className="bg-slate-900/40 border border-slate-800 p-3 rounded flex flex-col items-center">
                        <span className="text-[8px] font-black text-slate-500 uppercase">Effective Ratio</span>
                        <span className="text-xl font-black text-blue-500">
                            {Math.round((units.filter(u => u.affiliation === filterSide && u.combatEffectiveness === 'Effective').length / (units.filter(u => u.affiliation === filterSide).length || 1)) * 100)}%
                        </span>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                        <input
                            type="text"
                            placeholder="SEARCH DESIGNATOR..."
                            className="w-full h-full bg-slate-950 border border-slate-800 rounded px-10 text-[10px] font-black text-white uppercase placeholder:text-slate-700 focus:outline-none focus:border-blue-500/50"
                        />
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-2">
                {topLevelUnits.map(unit => renderUnit(unit))}
            </div>

            {/* Footer */}
            <div className="h-10 border-t border-slate-800 bg-slate-950 px-6 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <div className="flex items-center gap-6">
                    <span className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> BLUE FEED: ACTIVE
                    </span>
                    <span className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> RED FEED: NOMINAL
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-slate-400 font-bold uppercase">Joint Doctrine Hierarchy Enforcement Active</span>
                </div>
            </div>
        </div>
    );
}
