import { useState, useEffect } from 'react';
import {
    Divide,
    ShieldAlert,
    Activity,
    TrendingUp,
    TrendingDown,
    CheckCircle2,
    AlertTriangle,
    Clock,
    UserPlus,
    Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MshnCtrlService } from '@/lib/mshnctrl/mock-service';
import type { CourseOfAction, UUID } from '@/lib/mshnctrl/types';
import { Button } from '@/components/ui/button';

export function CoAWargamer() {
    const [coas, setCoas] = useState<CourseOfAction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadCoas() {
            const data = await MshnCtrlService.getCOAs();
            setCoas(data);
            setLoading(false);
        }
        loadCoas();
    }, []);

    const handleSelectCoA = async (coaId: UUID) => {
        // Deselect all, then select the chosen one
        const updatedCoas = coas.map(c => ({ ...c, selected: c.id === coaId }));
        setCoas(updatedCoas);

        await Promise.all(coas.map(c =>
            MshnCtrlService.updateCOA(c.id, { selected: c.id === coaId })
        ));
    };

    if (loading) return <div className="p-12 text-center text-slate-500 animate-pulse uppercase font-black tracking-widest text-xs">Simulating Tactical Outcomes...</div>;

    return (
        <div className="flex flex-col h-full bg-[#020617] text-slate-200 overflow-hidden font-sans">
            {/* Header */}
            <header className="p-8 border-b border-slate-900 bg-slate-950/40">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <Divide className="text-blue-500" size={24} />
                        <h1 className="text-2xl font-black text-white uppercase tracking-tighter">CoA Wargaming Framework</h1>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Monte Carlo Simulation Active</span>
                    </div>
                </div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest max-w-2xl leading-relaxed">
                    Course of Action comparison engine. Uses historical operational data and environmental variables to predict probability of success (PoS) and force degradation.
                </p>
            </header>

            {/* Comparison Grid */}
            <div className="flex-1 overflow-auto p-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
                    {coas.map((coa) => (
                        <div
                            key={coa.id}
                            className={cn(
                                "group bg-slate-950 rounded-[2.5rem] border-2 p-10 transition-all relative overflow-hidden",
                                coa.selected
                                    ? "border-blue-600 shadow-[0_0_40px_rgba(37,99,235,0.15)] ring-1 ring-blue-500/50"
                                    : "border-slate-800 hover:border-slate-700 opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
                            )}
                        >
                            {/* CoA Header */}
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{coa.name}</h3>
                                        {coa.selected && <CheckCircle2 size={24} className="text-blue-500" />}
                                    </div>
                                    <p className="text-sm font-medium text-slate-400 leading-relaxed">{coa.description}</p>
                                </div>
                                <div className={cn(
                                    "px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border",
                                    coa.riskLevel === 'Low' ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" :
                                        coa.riskLevel === 'Medium' ? "bg-amber-500/10 border-amber-500/30 text-amber-500" :
                                            "bg-red-500/10 border-red-500/30 text-red-500"
                                )}>
                                    RISK: {coa.riskLevel}
                                </div>
                            </div>

                            {/* Wargaming Metrics Card */}
                            {coa.wargamingMetrics && (
                                <div className="grid grid-cols-2 gap-6 mb-10">
                                    {/* PoS Gauge */}
                                    <div className="bg-slate-900/60 rounded-3xl p-6 border border-slate-800/50">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Prob of Success</span>
                                            <TrendingUp size={14} className="text-emerald-500" />
                                        </div>
                                        <div className="text-3xl font-black text-white mb-2">{(coa.wargamingMetrics.probabilityOfSuccess * 100).toFixed(0)}%</div>
                                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-emerald-500"
                                                style={{ width: `${coa.wargamingMetrics.probabilityOfSuccess * 100}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Risk Gauge */}
                                    <div className="bg-slate-900/60 rounded-3xl p-6 border border-slate-800/50">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tactical Risk</span>
                                            <ShieldAlert size={14} className="text-red-500" />
                                        </div>
                                        <div className="text-3xl font-black text-white mb-2">{(coa.wargamingMetrics.estimatedRisk * 100).toFixed(0)}%</div>
                                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-red-500"
                                                style={{ width: `${coa.wargamingMetrics.estimatedRisk * 100}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Resource Gauge */}
                                    <div className="bg-slate-900/60 rounded-3xl p-6 border border-slate-800/50">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Resource Drain</span>
                                            <Activity size={14} className="text-blue-500" />
                                        </div>
                                        <div className="text-3xl font-black text-white mb-2">{(coa.wargamingMetrics.resourceConsumption * 100).toFixed(0)}%</div>
                                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500"
                                                style={{ width: `${coa.wargamingMetrics.resourceConsumption * 100}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Duration Gauge */}
                                    <div className="bg-slate-900/60 rounded-3xl p-6 border border-slate-800/50">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Est. Duration</span>
                                            <Clock size={14} className="text-slate-500" />
                                        </div>
                                        <div className="text-3xl font-black text-white mb-2">{coa.wargamingMetrics.durationDays} Days</div>
                                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-tight">+ /- 12h margin</div>
                                    </div>
                                </div>
                            )}

                            {/* Advantages / Disadvantages */}
                            <div className="grid grid-cols-2 gap-8 mb-10">
                                <ul className="space-y-2">
                                    <li className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3">Key Advantages</li>
                                    {coa.advantages.map((adv, i) => (
                                        <li key={i} className="flex gap-2 text-xs text-slate-300">
                                            <CheckCircle2 size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                                            <span>{adv}</span>
                                        </li>
                                    ))}
                                </ul>
                                <ul className="space-y-2">
                                    <li className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-3">Critical Factors</li>
                                    {coa.disadvantages.map((dis, i) => (
                                        <li key={i} className="flex gap-2 text-xs text-slate-300">
                                            <AlertTriangle size={12} className="text-red-500 shrink-0 mt-0.5" />
                                            <span>{dis}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <Button
                                onClick={() => handleSelectCoA(coa.id)}
                                disabled={coa.selected}
                                className={cn(
                                    "w-full py-8 rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all",
                                    coa.selected
                                        ? "bg-slate-900 text-slate-500 border-2 border-slate-800"
                                        : "bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-900/40 hover:scale-[1.02]"
                                )}
                            >
                                {coa.selected ? "COA SELECTED" : "SELECT FOR EXECUTION"}
                            </Button>

                            {/* Background Pattern */}
                            <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
                                <Target size={240} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sticky Actions */}
            <footer className="p-8 border-t border-slate-900 bg-slate-950/80 backdrop-blur-md flex justify-between items-center">
                <div className="flex gap-8">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Simulations Ran</span>
                        <span className="text-lg font-black text-white">412,021</span>
                    </div>
                    <div className="flex flex-col border-l border-slate-800 pl-8">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Confidence Interval</span>
                        <span className="text-lg font-black text-emerald-400">94.2%</span>
                    </div>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" className="border-slate-800 bg-slate-900/40 text-xs font-black uppercase tracking-widest px-8 py-6 rounded-xl hover:bg-slate-800">
                        Export Comparison <TrendingDown size={16} className="ml-3" />
                    </Button>
                    <Button className="bg-white hover:bg-slate-100 text-slate-950 text-xs font-black uppercase tracking-widest px-8 py-6 rounded-xl shadow-xl shadow-white/5 transition-all hover:scale-105">
                        Promote to CONOPS <UserPlus size={16} className="ml-3" />
                    </Button>
                </div>
            </footer>
        </div>
    );
}
