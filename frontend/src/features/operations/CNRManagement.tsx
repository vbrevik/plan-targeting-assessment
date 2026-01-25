import { useEffect, useState } from 'react';
import { SmartOpsService } from '@/lib/smartops/mock-service';
import type { RadioNetwork, ComsecKey } from '@/lib/smartops/types';
import { cn } from '@/lib/utils';
import {
    Radio,
    Lock,
    Unlock,
    RefreshCw,
    Wifi,
    Signal,
    Mic,
    Headphones,
    Users,
    ShieldAlert
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CNRManagement() {
    const [networks, setNetworks] = useState<RadioNetwork[]>([]);
    const [keys, setKeys] = useState<ComsecKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [rollovers, setRollovers] = useState<Record<string, boolean>>({});

    const loadData = async () => {
        setLoading(true);
        const [n, k] = await Promise.all([
            SmartOpsService.getRadioNetworks(),
            SmartOpsService.getComsecKeys()
        ]);
        setNetworks(n);
        setKeys(k);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleRollover = async (netId: string) => {
        setRollovers({ ...rollovers, [netId]: true });
        await SmartOpsService.cycleComsecKey(netId);
        await loadData(); // Refresh after cycle
        setRollovers({ ...rollovers, [netId]: false });
    };

    const getModulationColor = (mod: string) => {
        switch (mod) {
            case 'SatCom': return 'text-purple-400 border-purple-500/30 bg-purple-900/20';
            case 'Link16': return 'text-blue-400 border-blue-500/30 bg-blue-900/20';
            case 'FM': return 'text-emerald-400 border-emerald-500/30 bg-emerald-900/20';
            default: return 'text-slate-400 border-slate-500/30 bg-slate-900/20';
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#020617] text-slate-200 overflow-hidden font-sans">
            <header className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center shrink-0">
                <div>
                    <h1 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                        <Radio className="text-emerald-500" />
                        Combat Net Radio (J6)
                    </h1>
                    <p className="text-xs text-slate-500 font-mono">Spectrum Management // COMSEC // Voice Loops</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-800 rounded">
                        <Lock size={14} className="text-emerald-500" />
                        <span className="text-xs font-mono font-bold text-slate-400">MASTER KEY: <span className="text-emerald-400">ACTIVE</span></span>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* LEFT: Active Networks Matrix */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xs font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                        <Signal size={14} /> Active Frequency Matrix
                    </h2>

                    <div className="grid gap-3">
                        {networks.map(net => {
                            const activeKey = keys.find(k => k.id === net.encryptionKeyId);
                            const isRolling = rollovers[net.id];

                            return (
                                <div key={net.id} className="bg-slate-900/40 border border-slate-800 p-4 rounded flex items-center justify-between group hover:bg-slate-900/60 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={cn("px-2 py-1 rounded text-[10px] font-black uppercase border", getModulationColor(net.modulation))}>
                                            {net.modulation}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-sm font-bold text-white">{net.name}</h3>
                                                {net.status === 'Jammed' && <span className="bg-red-500 text-white text-[9px] px-1 rounded font-black animate-pulse">JAMMED</span>}
                                                {net.status === 'Silence' && <span className="bg-yellow-500 text-black text-[9px] px-1 rounded font-black">SILENCE</span>}
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-slate-500 font-mono mt-0.5">
                                                <span className="text-emerald-400">{net.frequency.toFixed(3)} MHz</span>
                                                <span className="flex items-center gap-1"><Users size={10} /> {net.participants.length} Stn</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Middle: Signal Health */}
                                    <div className="flex-1 px-8">
                                        <div className="flex justify-between text-[9px] text-slate-600 mb-1 uppercase font-bold">
                                            <span>Signal Quality</span>
                                            <span>{net.signalQuality}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className={cn("h-full rounded-full transition-all duration-1000",
                                                    net.signalQuality > 80 ? "bg-emerald-500" : net.signalQuality > 50 ? "bg-yellow-500" : "bg-red-500"
                                                )}
                                                style={{ width: `${net.signalQuality}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Right: COMSEC Controls */}
                                    <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
                                        <div className="text-right">
                                            <div className="text-[9px] font-black text-slate-500 uppercase">Crypto</div>
                                            <div className="text-xs font-mono text-emerald-400 flex items-center gap-1 justify-end">
                                                <Lock size={10} /> {activeKey?.name.substring(0, 10)}...
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-8 w-8 p-0 border-slate-700 bg-slate-900 hover:bg-slate-800 hover:text-yellow-400"
                                            onClick={() => handleRollover(net.id)}
                                            disabled={isRolling}
                                        >
                                            <RefreshCw size={14} className={cn(isRolling && "animate-spin")} />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* RIGHT: COMSEC & Keys */}
                <div className="space-y-6">
                    {/* Key Store Panel */}
                    <div className="bg-slate-900/30 border border-slate-800 rounded p-4">
                        <h2 className="text-xs font-black uppercase text-slate-500 tracking-widest flex items-center gap-2 mb-4">
                            <ShieldAlert size={14} /> COMSEC Key Material
                        </h2>

                        <div className="space-y-2">
                            {keys.map(key => (
                                <div key={key.id} className="p-2 border border-slate-800 bg-slate-950 rounded flex justify-between items-center">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className={cn(
                                                "w-1.5 h-1.5 rounded-full",
                                                key.status === 'Active' ? "bg-emerald-500" : key.status === 'Reserve' ? "bg-yellow-500" : "bg-red-500"
                                            )} />
                                            <span className="text-xs font-bold text-slate-300">{key.name}</span>
                                        </div>
                                        <div className="text-[9px] font-mono text-slate-600 pl-3.5">
                                            {key.type} // {key.algorithm}
                                        </div>
                                    </div>
                                    <div className="text-[9px] font-mono text-slate-500">
                                        EXP: {new Date(key.validUntil).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Voice Loops (Mock) */}
                    <div className="bg-slate-900/30 border border-slate-800 rounded p-4">
                        <h2 className="text-xs font-black uppercase text-slate-500 tracking-widest flex items-center gap-2 mb-4">
                            <Headphones size={14} /> Active Voice Loops
                        </h2>
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 p-2 hover:bg-slate-800 rounded cursor-pointer">
                                <div className="bg-emerald-500/20 p-1.5 rounded-full text-emerald-400 border border-emerald-500/30 animate-pulse">
                                    <Mic size={12} />
                                </div>
                                <span className="text-xs font-bold text-slate-300">JOC FLOOR (Open)</span>
                            </div>
                            <div className="flex items-center gap-3 p-2 hover:bg-slate-800 rounded cursor-pointer">
                                <div className="bg-slate-800 p-1.5 rounded-full text-slate-500 border border-slate-700">
                                    <Mic size={12} />
                                </div>
                                <span className="text-xs font-bold text-slate-400">INTEL HUDDLE</span>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
