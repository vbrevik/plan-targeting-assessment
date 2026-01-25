import { useState, useEffect } from 'react';
import {
    Users,
    Zap,
    Building2,
    Globe,
    Info,
    BarChart3,
    ShieldAlert,
    MapPin,
    Activity,
    TrendingUp,
    TrendingDown,
    Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SmartOpsService } from '@/lib/smartops/mock-service';
import type { PMESIIData } from '@/lib/smartops/types';

export function SocialDomain() {
    const [pmesii, setPmesii] = useState<PMESIIData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedArea, setSelectedArea] = useState<string | null>(null);

    useEffect(() => {
        async function loadData() {
            const [pmData] = await Promise.all([
                SmartOpsService.getPMESIIData(),
                SmartOpsService.getRecognisedPicture('Social')
            ]);
            setPmesii(pmData);
            setSelectedArea(pmData[0]?.area || null);
            setLoading(false);
        }
        loadData();
    }, []);

    if (loading) return <div className="p-12 text-center text-slate-500 animate-pulse uppercase font-black tracking-widest text-xs">Synthesizing Human Domain Data...</div>;

    const currentArea = pmesii.find(p => p.area === selectedArea);

    const metrics = [
        { key: 'political', label: 'Political', icon: Globe, color: 'text-blue-500' },
        { key: 'military', label: 'Military', icon: ShieldAlert, color: 'text-red-500' },
        { key: 'economic', label: 'Economic', icon: TrendingUp, color: 'text-emerald-500' },
        { key: 'social', label: 'Social', icon: Users, color: 'text-purple-500' },
        { key: 'infrastructure', label: 'Infrastructure', icon: Building2, color: 'text-amber-500' },
        { key: 'information', label: 'Information', icon: Info, color: 'text-cyan-500' },
    ];

    return (
        <div className="flex flex-col h-full bg-[#020617] text-slate-200 overflow-hidden font-sans border-l border-slate-900">
            {/* Header */}
            <header className="p-8 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3 mb-1">
                        <Users className="text-purple-500" size={24} /> PMESII-PT / Social Domain Picture
                    </h1>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Comprehensive Approach: Human Environment Monitoring</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-xl border border-slate-800">
                        <Search size={14} className="text-slate-500" />
                        <span className="text-[10px] font-black uppercase text-slate-400">Search Nodes</span>
                    </div>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Area Sidebar & Metrics */}
                <div className="w-80 border-r border-slate-800 p-6 space-y-8 bg-slate-950/20">
                    <div className="space-y-3">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Area of Interest</span>
                        {pmesii.map(p => (
                            <button
                                key={p.area}
                                onClick={() => setSelectedArea(p.area)}
                                className={cn(
                                    "w-full p-4 rounded-2xl border transition-all text-left flex justify-between items-center font-black uppercase tracking-tight text-xs",
                                    selectedArea === p.area ? "bg-purple-600 border-purple-500 text-white" : "bg-slate-900/40 border-slate-800 text-slate-500"
                                )}
                            >
                                {p.area}
                                <MapPin size={14} />
                            </button>
                        ))}
                    </div>

                    {currentArea && (
                        <div className="space-y-6">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Stability Indices</span>
                            <div className="space-y-5">
                                {metrics.map(m => (
                                    <div key={m.key} className="space-y-2">
                                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                                            <span className="flex items-center gap-2">
                                                <m.icon size={12} className={m.color} /> {m.label}
                                            </span>
                                            <span className="text-white">{(currentArea[m.key as keyof PMESIIData] as number * 100).toFixed(0)}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                                            <div
                                                className={cn("h-full", m.color.replace('text-', 'bg-'))}
                                                style={{ width: `${(currentArea[m.key as keyof PMESIIData] as number) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-10 relative">
                    {/* Civil Infrastructure & Sentiment Grid */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {/* Infrastructure Health */}
                        <div className="bg-slate-950 border border-slate-900 rounded-3xl overflow-hidden shadow-2xl">
                            <div className="p-6 border-b border-slate-800 bg-slate-900/40 flex justify-between items-center">
                                <h3 className="text-xs font-black text-white uppercase tracking-widest">Critical Infrastructure Status</h3>
                                <Zap className="text-amber-500" size={16} />
                            </div>
                            <div className="p-8 space-y-6">
                                {[
                                    { name: 'Grid Alpha', status: 'Operational', stability: 0.94 },
                                    { name: 'Water Nexus Beta', status: 'Degraded', stability: 0.42 },
                                    { name: 'Comms Uplink 04', status: 'Operational', stability: 0.88 },
                                ].map((inf, k) => (
                                    <div key={k} className="flex items-center justify-between p-4 bg-slate-900/40 rounded-2xl border border-slate-800">
                                        <div className="flex items-center gap-4">
                                            <Building2 size={24} className="text-slate-600" />
                                            <div>
                                                <div className="text-sm font-black text-white uppercase">{inf.name}</div>
                                                <div className={cn("text-[9px] font-bold uppercase", inf.status === 'Operational' ? 'text-emerald-500' : 'text-red-500')}>{inf.status}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-black text-white">{(inf.stability * 100).toFixed(0)}%</div>
                                            <div className="text-[8px] font-bold text-slate-500 uppercase">Load Balance</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Social Sentiment Feed */}
                        <div className="bg-slate-950 border border-slate-900 rounded-3xl overflow-hidden shadow-2xl">
                            <div className="p-6 border-b border-slate-800 bg-slate-900/40 flex justify-between items-center">
                                <h3 className="text-xs font-black text-white uppercase tracking-widest">Sentiment Analytics (Human Domain)</h3>
                                <Activity className="text-purple-500" size={16} />
                            </div>
                            <div className="p-8 space-y-6">
                                {[
                                    { text: "Increased civil support for allied presence in Northern Corridor.", sentiment: 'Positive', trend: TrendingUp },
                                    { text: "Propaganda campaign detected in information space Beta.", sentiment: 'Negative', trend: TrendingDown },
                                    { text: "Supply chain disruptions leading to local economic friction.", sentiment: 'Concern', trend: TrendingDown },
                                ].map((s, k) => (
                                    <div key={k} className="flex gap-4">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                            s.sentiment === 'Positive' ? "bg-emerald-500/10 text-emerald-500" :
                                                s.sentiment === 'Negative' ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-500"
                                        )}>
                                            <s.trend size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-300 font-medium leading-relaxed">{s.text}</p>
                                            <div className="text-[9px] font-black uppercase text-slate-600 mt-2">Source: Open Source Intelligence (OSINT) | Confidence: 84%</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Information Domain Map (Placeholder Visual) */}
                        <div className="xl:col-span-2 bg-slate-950 border border-slate-900 rounded-3xl p-8 overflow-hidden relative min-h-[300px]">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                                <Globe size={200} />
                            </div>
                            <header className="flex justify-between items-center mb-10">
                                <div>
                                    <h3 className="text-sm font-black text-white uppercase tracking-tight">Information Maneuver Space</h3>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Cross-referencing StratCom effects with civil sentiment</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Effects</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-red-500" />
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Adversarial IO</span>
                                    </div>
                                </div>
                            </header>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                                <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between h-40">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Deterrence Resonance</span>
                                    <div className="text-4xl font-black text-blue-500">72%</div>
                                    <BarChart3 className="text-blue-500/20 absolute bottom-4 right-4" size={40} />
                                </div>
                                <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between h-40">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Narrative Stability</span>
                                    <div className="text-4xl font-black text-emerald-500">Stable</div>
                                    <ShieldAlert className="text-emerald-500/20 absolute bottom-4 right-4" size={40} />
                                </div>
                                <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between h-40">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Anti-Corruption Index</span>
                                    <div className="text-4xl font-black text-amber-500">Rising</div>
                                    <TrendingUp className="text-amber-500/20 absolute bottom-4 right-4" size={40} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
