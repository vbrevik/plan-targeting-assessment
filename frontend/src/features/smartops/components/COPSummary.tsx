import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
    LayoutDashboard,
    Target,
    Activity,
    Shield,
    ShieldCheck,
    AlertTriangle,
    Plane,
    Ship,
    Truck,
    TrendingUp,
    Clock,
    Crosshair
} from 'lucide-react';
import { SmartOpsService } from '@/lib/smartops/mock-service';
import type { Track, CenterOfGravity } from '@/lib/smartops/types';
import { useOperationalContext } from '@/lib/smartops/hooks/useOperationalContext';

export function COPSummary() {
    const navigate = useNavigate();
    const { filterByContext } = useOperationalContext();
    const [tracks, setTracks] = useState<Track[]>([]);
    const [cogs, setCogs] = useState<CenterOfGravity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            const [air, sea, land, blueCogs] = await Promise.all([
                SmartOpsService.getRecognisedPicture('Air'),
                SmartOpsService.getRecognisedPicture('Maritime'),
                SmartOpsService.getRecognisedPicture('Ground'),
                SmartOpsService.getCOGs('Blue')
            ]);
            setTracks([...air, ...sea, ...land].filter(filterByContext));
            setCogs(blueCogs.filter(filterByContext));
            setLoading(false);
        }
        loadData();
    }, []);

    const hostileTracks = tracks.filter(t => t.classification === 'HOSTILE');
    const airTracks = tracks.filter(t => t.domain === 'Air');
    const seaTracks = tracks.filter(t => t.domain === 'Maritime');
    const landTracks = tracks.filter(t => t.domain === 'Ground');

    if (loading) return <div className="p-12 text-center text-slate-500 animate-pulse uppercase font-black tracking-widest text-xs">Fusing Multi-Domain Intelligence...</div>;

    return (
        <div className="flex flex-col h-full bg-[#020617] text-slate-200 overflow-hidden font-sans">
            {/* Header */}
            <header className="p-10 border-b border-slate-900 bg-slate-950/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                    <LayoutDashboard size={140} />
                </div>
                <div className="relative z-10 flex justify-between items-end">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em]">Operational Status: Active</span>
                        </div>
                        <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Executive COP Summary</h1>
                        <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-2">Combined Strategic Command View | HQ North | Force Generation Alpha</p>
                    </div>
                    <div className="flex gap-10">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Zulu Time</span>
                            <span className="text-2xl font-mono font-bold text-white uppercase">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })} Z</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Threat Level</span>
                            <span className="text-2xl font-bold text-red-500 uppercase">Severe</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-10 space-y-12">
                {/* Critical Indicators Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <button
                        onClick={() => navigate({ to: '/smartops/targeting/assets' })}
                        className="bg-slate-950 border-2 border-slate-900 rounded-[2rem] p-8 transition-all hover:border-blue-500/50 hover:bg-slate-900/50 cursor-pointer text-left"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                                <Activity size={24} />
                            </div>
                            <TrendingUp size={16} className="text-emerald-500" />
                        </div>
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Forces Ready</div>
                        <div className="text-4xl font-black text-white">94.2%</div>
                        <div className="mt-4 flex gap-1 h-1">
                            <div className="flex-[0.94] bg-blue-600 rounded-full" />
                            <div className="flex-[0.06] bg-slate-800 rounded-full" />
                        </div>
                    </button>

                    <button
                        onClick={() => navigate({ to: '/smartops/targeting' })}
                        className="bg-slate-950 border-2 border-slate-900 rounded-[2rem] p-8 transition-all hover:border-red-500/50 hover:bg-slate-900/50 cursor-pointer text-left"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-red-600/10 flex items-center justify-center text-red-500 border border-red-500/20">
                                <Target size={24} />
                            </div>
                            <Clock size={16} className="text-slate-500" />
                        </div>
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Hostile Tracks</div>
                        <div className="text-4xl font-black text-white">{hostileTracks.length}</div>
                        <div className="text-[10px] font-bold text-red-400 uppercase mt-2">Active Surveillance</div>
                    </button>

                    <button
                        onClick={() => navigate({ to: '/smartops/roe' })}
                        className="bg-slate-950 border-2 border-slate-900 rounded-[2rem] p-8 transition-all hover:border-amber-500/50 hover:bg-slate-900/50 cursor-pointer text-left"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-amber-600/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                                <Shield size={24} />
                            </div>
                            <AlertTriangle size={16} className="text-amber-500" />
                        </div>
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">ROE State</div>
                        <div className="text-4xl font-black text-white uppercase">Green</div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase mt-2">Restricted Action</div>
                    </button>

                    <div className="bg-slate-950 border-2 border-slate-900 rounded-[2rem] p-8 transition-all hover:border-slate-800">
                        <div className="flex justify-between items-center mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                                <Crosshair size={24} />
                            </div>
                            <Activity size={16} className="text-emerald-500" />
                        </div>
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Target Neutralization</div>
                        <div className="text-4xl font-black text-white">12</div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase mt-2">Cycle 04 Successes</div>
                    </div>
                </div>

                {/* Main Dashboard Body */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Multi-Domain Awareness */}
                    <div className="lg:col-span-2 space-y-10">
                        <div className="bg-slate-950 border border-slate-900 rounded-3xl overflow-hidden">
                            <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/40">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-600/10 rounded-xl text-blue-500 border border-blue-500/20">
                                        <Activity size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-white uppercase tracking-tight leading-none">Multi-Domain Picture</h3>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Real-time fusion across RAP, RSP, and RGP</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-10">
                                <div className="grid grid-cols-3 gap-8 text-center">
                                    <div className="space-y-4">
                                        <div className="w-20 h-20 rounded-full border-4 border-slate-900 bg-slate-900/40 flex items-center justify-center mx-auto transition-all hover:scale-110">
                                            <Plane className="text-blue-400" size={32} />
                                        </div>
                                        <div>
                                            <div className="text-3xl font-black text-white">{airTracks.length}</div>
                                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Air Assets</div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="w-20 h-20 rounded-full border-4 border-slate-900 bg-slate-900/40 flex items-center justify-center mx-auto transition-all hover:scale-110">
                                            <Ship className="text-blue-400" size={32} />
                                        </div>
                                        <div>
                                            <div className="text-3xl font-black text-white">{seaTracks.length}</div>
                                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Maritime Units</div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="w-20 h-20 rounded-full border-4 border-slate-900 bg-slate-900/40 flex items-center justify-center mx-auto transition-all hover:scale-110">
                                            <Truck className="text-blue-400" size={32} />
                                        </div>
                                        <div>
                                            <div className="text-3xl font-black text-white">{landTracks.length}</div>
                                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Ground Force</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Hostile Activity */}
                        <div className="bg-slate-950 border border-slate-900 rounded-3xl overflow-hidden">
                            <div className="p-8 border-b border-slate-800 bg-red-600/5 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-red-600/10 rounded-xl text-red-500 border border-red-500/20">
                                        <AlertTriangle size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-white uppercase tracking-tight leading-none">Hostile Maneuver Warnings</h3>
                                        <p className="text-[10px] text-red-500/50 font-bold uppercase tracking-widest mt-1">High priority threat detections</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 divide-y divide-slate-900">
                                {hostileTracks.slice(0, 3).map((track) => (
                                    <div key={track.id} className="py-6 flex justify-between items-center">
                                        <div className="flex gap-6 items-center">
                                            <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-red-500">
                                                {track.domain === 'Air' ? <Plane size={24} /> : <Ship size={24} />}
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-white uppercase">{track.callsign}</div>
                                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">TYPE: {track.type} | HDG: {track.vector.heading}°</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-black text-slate-400 uppercase">CPA: 14.2 NM</div>
                                            <div className="text-[10px] text-red-500 font-bold uppercase">Critical Intersection</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Operational Governance */}
                    <div className="space-y-10">
                        <div className="bg-slate-950 border border-slate-900 rounded-3xl overflow-hidden">
                            <div className="p-8 border-b border-slate-800 bg-slate-900/40">
                                <h3 className="text-lg font-black text-white uppercase tracking-tight leading-none">Operational Centers (COG)</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Asset protection status</p>
                            </div>
                            <div className="p-8 space-y-6">
                                {cogs.map((cog) => (
                                    <div key={cog.id} className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[11px] font-black text-white uppercase">{cog.name}</span>
                                            <span className="text-[9px] font-black text-blue-500 uppercase bg-blue-500/10 px-2 py-0.5 rounded">INTACT</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-600" style={{ width: '92%' }} />
                                        </div>
                                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{cog.description.substring(0, 100)}...</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-emerald-600/5 border-2 border-emerald-950 rounded-[2.5rem] p-10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                                <ShieldCheck size={120} />
                            </div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-4 relative z-10">Legal & ROE Sync</h3>
                            <p className="text-xs text-slate-400 font-medium leading-relaxed mb-8 relative z-10">
                                All current operations are aligned with ROE Phase 2 implementation. Target authorization is verified at JTC Level 4.
                            </p>
                            <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl relative z-10">
                                <ShieldCheck size={20} className="text-emerald-500" />
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Compliance Confirmed</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
