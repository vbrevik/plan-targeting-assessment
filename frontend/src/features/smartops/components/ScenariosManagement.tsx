import { useEffect, useState } from 'react';
import {
    ShieldAlert,
    Map as MapIcon,
    Globe,
    Settings2,
    Plus,
    Flag,
    Lock,
    Unlock,
    Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SmartOpsService } from '@/lib/smartops/mock-service';
import type { Scenario } from '@/lib/smartops/types';

export function ScenariosManagement() {
    const [scenarios, setScenarios] = useState<Scenario[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadScenarios() {
            const data = await SmartOpsService.getScenarios();
            setScenarios(data);
            setLoading(false);
        }
        loadScenarios();
    }, []);

    if (loading) return <div className="p-8 text-slate-500 animate-pulse font-mono text-[10px] uppercase">Booting Simulation Engine...</div>;

    return (
        <div className="flex flex-col h-full bg-[#020617] text-slate-200 overflow-hidden font-sans border-l border-slate-900">

            {/* Header */}
            <div className="p-6 border-b border-slate-800 bg-slate-950/50">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="px-2 py-0.5 bg-purple-500/10 text-purple-500 text-[10px] font-black border border-purple-500/20 rounded uppercase">Simulation & Wargaming</div>
                            <h1 className="text-xl font-black text-white tracking-tight uppercase">Operational Scenarios</h1>
                        </div>
                        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                            Environment configuration for exercises and contingency planning. Define national caveats, geographic boundaries, and hybrid threats.
                        </p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-black uppercase rounded transition-colors shadow-lg shadow-purple-900/20">
                        <Plus size={14} /> New Scenario
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">

                {/* Active Scenarios List */}
                <section>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-emerald-500" /> Active Environments
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {scenarios.map(scenario => (
                            <div key={scenario.id} className={cn(
                                "p-5 rounded-lg border transition-all cursor-pointer group",
                                scenario.isActive
                                    ? "bg-slate-900/60 border-emerald-500/30 shadow-[0_4px_20px_rgba(16,185,129,0.05)]"
                                    : "bg-slate-900/20 border-slate-800 opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
                            )}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-10 h-10 rounded flex items-center justify-center border",
                                            scenario.isActive ? "bg-emerald-500/20 border-emerald-500/30" : "bg-slate-800 border-slate-700"
                                        )}>
                                            {scenario.type === 'Defensive' ? <Lock className="text-emerald-500" size={20} /> : <Unlock className="text-blue-500" size={20} />}
                                        </div>
                                        <div>
                                            <h4 className="text-[13px] font-black text-white uppercase tracking-tight">{scenario.name}</h4>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase">{scenario.type} ENVIRONMENT</span>
                                        </div>
                                    </div>
                                    {scenario.isActive && (
                                        <span className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[9px] font-black border border-emerald-500/20 rounded uppercase">
                                            <Activity size={10} className="animate-pulse" /> Live Now
                                        </span>
                                    )}
                                </div>
                                <p className="text-[11px] text-slate-400 font-bold mb-6 leading-relaxed italic border-l-2 border-slate-800 pl-3">
                                    "{scenario.description}"
                                </p>
                                <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-500">
                                    <div className="flex items-center gap-4">
                                        <span className="flex items-center gap-1.5"><Flag size={12} /> 12 Nations</span>
                                        <span className="flex items-center gap-1.5"><MapIcon size={12} /> AO NORTH</span>
                                    </div>
                                    <span className="text-blue-400 group-hover:text-white transition-colors">Config & Caveats →</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Configuration Tools */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-lg group hover:border-purple-500/30 transition-colors">
                        <div className="w-10 h-10 bg-purple-500/10 rounded flex items-center justify-center mb-4">
                            <ShieldAlert className="text-purple-500" size={20} />
                        </div>
                        <h4 className="text-[12px] font-black text-white uppercase mb-2">Caveat Management</h4>
                        <p className="text-[10px] text-slate-500 font-bold leading-relaxed mb-4">Define operational and geographic restrictions for combined task forces.</p>
                        <button className="text-[10px] font-black text-purple-400 uppercase tracking-widest hover:text-white transition-colors">Open Registry →</button>
                    </div>
                    <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-lg group hover:border-blue-500/30 transition-colors">
                        <div className="w-10 h-10 bg-blue-500/10 rounded flex items-center justify-center mb-4">
                            <Globe className="text-blue-500" size={20} />
                        </div>
                        <h4 className="text-[12px] font-black text-white uppercase mb-2">Geographic Bounds</h4>
                        <p className="text-[10px] text-slate-500 font-bold leading-relaxed mb-4">Edit AO boundaries, restricted areas, and coordination zones on the tactical HUD.</p>
                        <button className="text-[10px] font-black text-blue-400 uppercase tracking-widest hover:text-white transition-colors">Launch Map Edits →</button>
                    </div>
                    <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-lg group hover:border-orange-500/30 transition-colors">
                        <div className="w-10 h-10 bg-orange-500/10 rounded flex items-center justify-center mb-4">
                            <Settings2 className="text-orange-500" size={20} />
                        </div>
                        <h4 className="text-[12px] font-black text-white uppercase mb-2">Entity Simulation</h4>
                        <p className="text-[10px] text-slate-500 font-bold leading-relaxed mb-4">Modify entity behavior and hybrid threat levels across the theatre.</p>
                        <button className="text-[10px] font-black text-orange-400 uppercase tracking-widest hover:text-white transition-colors">Configure Engine →</button>
                    </div>
                </section>

            </div>

            {/* Footer */}
            <div className="h-10 border-t border-slate-800 bg-slate-950 px-6 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <div className="flex items-center gap-6">
                    <span className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_5px_rgba(168,85,247,0.5)]" /> SIMULATION CLOUD: STABLE
                    </span>
                    <span>HYBRID THREAT LEVEL: MODERATE</span>
                </div>
            </div>
        </div>
    );
}
