import { useState, useEffect } from 'react';
import {
    Plane,
    Ship,
    Truck,
    Circle,
    Navigation,
    Crosshair,
    Filter,
    Search,
    ChevronRight,
    ArrowUpRight,
    MapPin,
    Zap,
    Wind,
    Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MshnCtrlService } from '@/lib/mshnctrl/mock-service';
import type { Track, UUID } from '@/lib/mshnctrl/types';
import { Button } from '@/components/ui/button';

export function RecognisedPicture() {
    const [tracks, setTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDomain, setSelectedDomain] = useState<Track['domain']>('Air');
    const [selectedTrackId, setSelectedTrackId] = useState<UUID | null>(null);

    useEffect(() => {
        loadPicture();
    }, [selectedDomain]);

    async function loadPicture() {
        setLoading(true);
        const data = await MshnCtrlService.getRecognisedPicture(selectedDomain);
        setTracks(data);
        setLoading(false);
    }

    const selectedTrack = tracks.find(t => t.id === selectedTrackId);

    const domains: { id: Track['domain']; icon: any; label: string; sub: string }[] = [
        { id: 'Air', icon: Plane, label: 'RAP', sub: 'Recognised Air Picture' },
        { id: 'Maritime', icon: Ship, label: 'RSP', sub: 'Recognised Maritime Picture' },
        { id: 'Ground', icon: Truck, label: 'RGP', sub: 'Recognised Ground Picture' },
    ];

    return (
        <div className="flex h-full bg-[#020617] text-slate-200 overflow-hidden font-sans border-l border-slate-900">
            {/* Domain Sidebar */}
            <div className="w-80 border-r border-slate-800 flex flex-col shrink-0 bg-slate-950/40">
                <div className="p-6 border-b border-slate-800 bg-slate-950/40">
                    <h1 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3 mb-6">
                        <MapPin className="text-blue-500" size={24} /> RxP Suite
                    </h1>

                    <div className="space-y-3">
                        {domains.map((domain) => (
                            <button
                                key={domain.id}
                                onClick={() => {
                                    setSelectedDomain(domain.id);
                                    setSelectedTrackId(null);
                                }}
                                className={cn(
                                    "w-full p-4 rounded-2xl border transition-all flex items-center gap-4 group text-left",
                                    selectedDomain === domain.id
                                        ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20"
                                        : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
                                )}
                            >
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                    selectedDomain === domain.id ? "bg-white/20" : "bg-slate-800 group-hover:bg-slate-700"
                                )}>
                                    <domain.icon size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-black uppercase tracking-tight leading-tight">{domain.label}</div>
                                    <div className={cn(
                                        "text-[9px] font-bold uppercase tracking-widest truncate opacity-60",
                                        selectedDomain === domain.id ? "text-blue-100" : "text-slate-500"
                                    )}>
                                        {domain.sub}
                                    </div>
                                </div>
                                <ChevronRight size={16} className={cn("transition-transform", selectedDomain === domain.id && "rotate-90")} />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    <div className="flex items-center justify-between px-2">
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Active Tracks</span>
                        <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] font-mono text-blue-400">{tracks.length}</span>
                    </div>

                    <div className="space-y-2">
                        {loading ? (
                            <div className="p-8 text-center text-slate-600 animate-pulse text-[10px] uppercase font-bold tracking-widest">Fusing Sensor Data...</div>
                        ) : (
                            tracks.map((track) => (
                                <div
                                    key={track.id}
                                    onClick={() => setSelectedTrackId(track.id)}
                                    className={cn(
                                        "p-3 rounded-xl border cursor-pointer transition-all group relative overflow-hidden",
                                        selectedTrackId === track.id
                                            ? "bg-blue-600/10 border-blue-500"
                                            : "bg-slate-900/40 border-slate-800/60 hover:border-slate-700"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "w-1.5 h-1.5 rounded-full animate-pulse",
                                                track.side === 'Blue' ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" :
                                                    track.side === 'Red' ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "bg-slate-500"
                                            )} />
                                            <span className="text-[11px] font-black text-white tracking-widest">{track.callsign}</span>
                                        </div>
                                        <span className={cn(
                                            "text-[8px] font-black px-1.5 py-0.5 rounded uppercase",
                                            track.classification === 'HOSTILE' ? "bg-red-500/20 text-red-500" :
                                                track.classification === 'FRIENDLY' ? "bg-blue-500/20 text-blue-500" : "bg-slate-800 text-slate-400"
                                        )}>
                                            {track.classification}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-[9px] font-mono text-slate-500 uppercase">
                                        <span>SPD: {track.vector.speed} kts</span>
                                        <span>HDG: {track.vector.heading}°</span>
                                    </div>
                                    {selectedTrackId === track.id && (
                                        <div className="absolute top-0 right-0 w-12 h-12 bg-blue-500/5 -rotate-45 translate-x-4 -translate-y-4 rounded-full border border-blue-500/10" />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Main Display Area */}
            <div className="flex-1 flex flex-col bg-[#020617] relative">
                {/* Visual Background (Circuitry/Grid Pattern) */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] overflow-hidden">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
                </div>

                <header className="h-20 border-b border-slate-900 bg-slate-950/20 flex items-center justify-between px-10 z-10">
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">Domain Environment</span>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight">{selectedDomain} Picture</h2>
                        </div>
                        <div className="h-8 w-px bg-slate-800" />
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <Wind size={14} className="text-slate-600" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SEA STATE 3</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Zap size={14} className="text-slate-600" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">EMI: LOW</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" className="bg-slate-900/40 border-slate-800 text-[10px] font-black uppercase tracking-widest px-6 hover:bg-slate-800 h-10">
                            Filer Tracks <Filter size={14} className="ml-2" />
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest px-6 h-10 shadow-lg shadow-blue-900/20">
                            Broadcast COMMS <ArrowUpRight size={14} className="ml-2" />
                        </Button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-12 custom-scrollbar relative z-10">
                    {selectedTrack ? (
                        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Track Identity Header */}
                            <div className="bg-slate-950 border-2 border-slate-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    {selectedTrack.domain === 'Air' ? <Plane size={160} /> : <Ship size={160} />}
                                </div>

                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                                    <div className="flex gap-6 items-center">
                                        <div className={cn(
                                            "w-20 h-20 rounded-2xl flex items-center justify-center border-4 shadow-xl",
                                            selectedTrack.side === 'Blue' ? "bg-blue-600/10 border-blue-500/30 text-blue-500 shadow-blue-500/10" :
                                                selectedTrack.side === 'Red' ? "bg-red-600/10 border-red-500/30 text-red-500 shadow-red-500/10" : "bg-slate-900 border-slate-800 text-slate-500"
                                        )}>
                                            {selectedTrack.domain === 'Air' ? <Plane size={40} /> :
                                                selectedTrack.domain === 'Maritime' ? <Ship size={40} /> : <Truck size={40} />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">{selectedTrack.callsign}</h3>
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded text-[10px] font-black uppercase",
                                                    selectedTrack.classification === 'HOSTILE' ? "bg-red-500 text-white" : "bg-blue-600 text-white"
                                                )}>
                                                    ID: {selectedTrack.classification}
                                                </span>
                                            </div>
                                            <p className="text-slate-500 text-sm font-bold uppercase tracking-[0.2em]">{selectedTrack.type}</p>
                                        </div>
                                    </div>
                                    <div className="shrink-0 flex gap-3">
                                        <Button className="bg-red-600 hover:bg-red-500 text-white font-black uppercase text-[11px] tracking-widest px-8 py-6 rounded-xl shadow-xl shadow-red-900/30 transition-all hover:scale-105">
                                            Engage Node <Crosshair size={18} className="ml-2" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Telemetry Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Position Data</h4>
                                    <div className="space-y-4 font-mono text-xs">
                                        <div className="flex justify-between border-b border-slate-800/50 pb-2">
                                            <span className="text-slate-600">LATITUDE:</span>
                                            <span className="text-white">{selectedTrack.position.lat.toFixed(4)}°N</span>
                                        </div>
                                        <div className="flex justify-between border-b border-slate-800/50 pb-2">
                                            <span className="text-slate-600">LONGITUDE:</span>
                                            <span className="text-white">{selectedTrack.position.lng.toFixed(4)}°E</span>
                                        </div>
                                        {selectedTrack.position.alt && (
                                            <div className="flex justify-between border-b border-slate-800/50 pb-2">
                                                <span className="text-slate-600">ALTITUDE:</span>
                                                <span className="text-white">{selectedTrack.position.alt.toLocaleString()} FT</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Vector Analysis</h4>
                                    <div className="space-y-4 font-mono text-xs">
                                        <div className="flex justify-between border-b border-slate-800/50 pb-2">
                                            <span className="text-slate-600">HEADING:</span>
                                            <span className="text-white">{selectedTrack.vector.heading}° TRUE</span>
                                        </div>
                                        <div className="flex justify-between border-b border-slate-800/50 pb-2">
                                            <span className="text-slate-600">SPEED:</span>
                                            <span className="text-white">{selectedTrack.vector.speed} KTS</span>
                                        </div>
                                        <div className="flex justify-between border-b border-slate-800/50 pb-2">
                                            <span className="text-slate-600">VECTOR:</span>
                                            <Navigation size={12} className="text-blue-500" style={{ transform: `rotate(${selectedTrack.vector.heading}deg)` }} />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Assessment</h4>
                                    <div className="space-y-4 text-[11px] font-medium leading-relaxed text-slate-400">
                                        {selectedTrack.description}
                                    </div>
                                </div>
                            </div>

                            {/* Threat Evaluation / Allied Units */}
                            <div className="bg-slate-900/20 border border-slate-800 rounded-2xl p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <Shield size={18} className="text-blue-500" />
                                    <h4 className="text-[11px] font-black text-white uppercase tracking-widest text-blue-500">Allied Proximity & Engagement</h4>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-slate-900/60 rounded-xl border border-slate-800 group hover:border-slate-700 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                            <div>
                                                <div className="text-[11px] font-black text-white uppercase">HMS Defender</div>
                                                <div className="text-[9px] font-bold text-slate-500 uppercase">Distance: 12.4 NM | Time to intercept: 15m</div>
                                            </div>
                                        </div>
                                        <Button variant="ghost" className="text-[10px] font-black uppercase text-slate-600 hover:text-white">Relink <ArrowUpRight size={14} className="ml-2" /></Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-800 p-20 text-center animate-in fade-in duration-700">
                            <div className="relative mb-8">
                                <Circle size={120} className="text-slate-900 animate-[spin_10s_linear_infinite]" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Search size={40} className="text-slate-700 opacity-20" />
                                </div>
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-[0.4em]">Acquiring Signal</h3>
                            <p className="text-sm font-bold uppercase text-slate-600 mt-2 max-w-sm">Fused common operational picture across multiple sensor networks</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
