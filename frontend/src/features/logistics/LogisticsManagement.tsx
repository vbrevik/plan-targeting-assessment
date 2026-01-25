import { useState, useEffect } from 'react';
import { SmartOpsService } from '@/lib/smartops/mock-service';
import {
    Package,
    Truck,
    Wrench,
    AlertOctagon,
    Activity,
    Box,
    ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function LogisticsManagement() {
    const [categories, setCategories] = useState<any[]>([]);
    const [fleet, setFleet] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);
            const [c, f] = await Promise.all([
                SmartOpsService.getSupplyStatuses(),
                SmartOpsService.getVehicleAssets()
            ]);
            setCategories(c);
            setFleet(f);
            setLoading(false);
        }
        load();
    }, []);

    if (loading) return <div className="p-8 text-slate-500 animate-pulse font-mono text-[10px] uppercase">Accessing Logistics Manifest...</div>;

    return (
        <div className="flex flex-col h-full bg-[#020617] text-slate-200 overflow-hidden font-sans border-l border-slate-900">

            {/* Header */}
            <div className="p-6 border-b border-slate-800 bg-slate-950/50">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="px-2 py-0.5 bg-yellow-500/10 text-yellow-500 text-[10px] font-black border border-yellow-500/20 rounded uppercase">J4 Logistics</div>
                            <h1 className="text-xl font-black text-white tracking-tight uppercase">Sustainment & Inventory</h1>
                        </div>
                        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                            Monitoring of Class I-IX supply levels, fleet readiness, and maintenance scheduling for Exercise Northern Shield.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 text-slate-300 text-[10px] font-bold uppercase rounded border border-slate-700 hover:text-white transition-colors">
                            Request Resupply
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase rounded transition-colors">
                            Generate Manifest
                        </button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-4">
                    {categories.map(cat => (
                        <div key={cat.id} className="p-3 bg-slate-900/40 border border-slate-800 rounded">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{cat.name}</span>
                                <span className={cn("px-1.5 py-0.5 rounded text-[8px] font-bold uppercase",
                                    cat.status === 'Optimal' ? 'bg-emerald-500/10 text-emerald-500' :
                                        cat.status === 'Critical' ? 'bg-red-500/10 text-red-500 animate-pulse' : 'bg-yellow-500/10 text-yellow-500'
                                )}>{cat.status}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div className={cn("h-full shadow-[0_0_8px_rgba(255,255,255,0.1)]",
                                        cat.level > 80 ? 'bg-emerald-500' : cat.level > 40 ? 'bg-yellow-500' : 'bg-red-500'
                                    )} style={{ width: `${cat.level}%` }} />
                                </div>
                                <span className="text-sm font-black text-white font-mono">{cat.level}%</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Fleet Readiness */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Truck size={16} className="text-blue-500" /> Fleet Readiness Status
                    </h3>
                    <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
                        <table className="w-full border-collapse">
                            <thead className="bg-slate-900/50 border-b border-slate-800">
                                <tr className="text-left">
                                    <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase">Unit ID</th>
                                    <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase">Platform</th>
                                    <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase">Status</th>
                                    <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase">Health</th>
                                    <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {fleet.map(unit => (
                                    <tr key={unit.id} className="hover:bg-slate-900/30 transition-colors group">
                                        <td className="px-4 py-3 text-[10px] font-mono font-black text-blue-400">{unit.id}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-black text-white uppercase">{unit.name}</span>
                                                <span className="text-[9px] text-slate-500 font-bold uppercase">{unit.type}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded text-[9px] font-black uppercase",
                                                unit.status === 'Ready' ? 'text-emerald-500 bg-emerald-500/10' :
                                                    unit.status === 'Maintenance' ? 'text-orange-500 bg-orange-500/10' : 'text-slate-400 bg-slate-800'
                                            )}>{unit.status}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2 w-24">
                                                <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                                                    <div className={cn("h-full", unit.health > 80 ? 'bg-emerald-500' : unit.health > 40 ? 'bg-yellow-500' : 'bg-red-500')} style={{ width: `${unit.health}%` }} />
                                                </div>
                                                <span className="text-[9px] font-mono text-slate-400">{unit.health}%</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button className="p-1.5 text-slate-500 hover:text-white transition-colors">
                                                <ChevronRight size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Logistics Radar / Notifications */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Activity size={16} className="text-red-500" /> Logistics Alerts
                    </h3>
                    <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded flex gap-3 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                            <AlertOctagon size={16} className="text-red-500 shrink-0" />
                            <div>
                                <span className="text-[10px] font-black text-red-400 uppercase block mb-0.5">Critically Low: Class III</span>
                                <p className="text-[9px] text-red-200/60 font-medium leading-tight">Forward Depot Alpha reporting &lt; 48hrs fuel at current operational tempo.</p>
                            </div>
                        </div>
                        <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded flex gap-3">
                            <Wrench size={16} className="text-yellow-500 shrink-0" />
                            <div>
                                <span className="text-[10px] font-black text-yellow-400 uppercase block mb-0.5">Scheduled Maintenance</span>
                                <p className="text-[9px] text-yellow-200/60 font-medium leading-tight">Unit V-102 (MBT) scheduled for engine diagnostics in 6 hours.</p>
                            </div>
                        </div>
                        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded flex gap-3">
                            <Package size={16} className="text-blue-500 shrink-0" />
                            <div>
                                <span className="text-[10px] font-black text-blue-400 uppercase block mb-0.5">Supply Convoy: EN ROUTE</span>
                                <p className="text-[9px] text-blue-200/60 font-medium leading-tight">Manifest M-4092 attached. ETA to AO VULCAN: 02:45.</p>
                            </div>
                        </div>
                    </div>

                    {/* Resource Health Chart Placeholder */}
                    <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-4 aspect-square flex flex-col items-center justify-center gap-4 text-center">
                        <Box size={40} className="text-slate-700 mx-auto" strokeWidth={1} />
                        <div>
                            <span className="text-[10px] font-black text-slate-500 uppercase">Projected Sustainability</span>
                            <p className="text-[11px] text-slate-400 font-bold mt-1">12.5 Days Until Depletion (Current Intensity)</p>
                        </div>
                    </div>
                </div>

            </div>

            {/* Footer */}
            <div className="h-10 border-t border-slate-800 bg-slate-950 px-6 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <div className="flex items-center gap-6">
                    <span className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> SUSTAINMENT WEB ACTIVE
                    </span>
                    <span>DATA SOURCE: HQ-LOG-S3</span>
                </div>
            </div>
        </div>
    );
}
