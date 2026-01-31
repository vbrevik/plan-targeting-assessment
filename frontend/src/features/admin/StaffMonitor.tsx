import { useEffect, useState } from 'react';
import { MshnCtrlService } from '@/lib/mshnctrl/mock-service';
import type { StaffMember, BiometricReading } from '@/lib/mshnctrl/types';
import { cn } from '@/lib/utils';
import {
    Users,
    Activity,
    Heart,
    Zap,
    Moon,
    Mic,
    Brain,
    ShieldAlert,
    Clock
} from 'lucide-react';

export function StaffMonitor() {
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [biometrics, setBiometrics] = useState<BiometricReading[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);
            const [s, b] = await Promise.all([
                MshnCtrlService.getStaffMembers(),
                MshnCtrlService.getBiometrics()
            ]);
            setStaff(s);
            setBiometrics(b);
            setLoading(false);
        }
        load();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Optimal': return 'text-emerald-400 border-emerald-500/30 bg-emerald-900/20';
            case 'Degraded': return 'text-yellow-400 border-yellow-500/30 bg-yellow-900/20';
            case 'Critical': return 'text-red-400 border-red-500/30 bg-red-900/20';
            default: return 'text-slate-400';
        }
    };

    const getFatigueColor = (score: number) => {
        if (score < 30) return 'bg-emerald-500';
        if (score < 70) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    if (loading) return <div className="p-8 text-slate-500 animate-pulse font-mono text-xs uppercase">Analyzing Human Terrain...</div>;

    return (
        <div className="h-full flex flex-col bg-[#020617] text-slate-200 overflow-hidden font-sans">
            <header className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center shrink-0">
                <div>
                    <h1 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                        <Brain className="text-pink-500" />
                        Cognitive Readiness (J1)
                    </h1>
                    <p className="text-xs text-slate-500 font-mono">Bio-Surveillance // Fatigue Management // Human Terrain</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-800 rounded">
                        <Activity size={14} className="text-emerald-500 animate-pulse" />
                        <span className="text-xs font-mono font-bold text-slate-400">BIO-SENSORS: <span className="text-emerald-400">ONLINE</span></span>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {staff.map(member => {
                        const memberBios = biometrics.filter(b => b.staffId === member.id);
                        const sortedBios = memberBios.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                        const shiftDuration = Math.floor((Date.now() - new Date(member.shiftStartedAt).getTime()) / (1000 * 60 * 60));

                        return (
                            <div key={member.id} className="bg-slate-900/40 border border-slate-800 rounded-lg p-5 hover:bg-slate-900/60 transition-all group flex flex-col gap-4 relative overflow-hidden">
                                {member.cognitiveStatus === 'Critical' && (
                                    <div className="absolute top-0 right-0 p-1.5 bg-red-500/20 backdrop-blur rounded-bl-lg border-b border-l border-red-500/30 text-red-400">
                                        <ShieldAlert size={14} />
                                    </div>
                                )}

                                {/* Header */}
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                                            <Users size={18} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-white">{member.name}</h3>
                                            <div className="text-[10px] uppercase font-mono text-slate-500">{member.role}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Status Badge */}
                                <div className="flex justify-between items-center">
                                    <span className={cn("px-2 py-0.5 rounded text-[10px] font-black uppercase border", getStatusColor(member.cognitiveStatus))}>
                                        {member.cognitiveStatus} Readiness
                                    </span>
                                    <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                                        <Clock size={10} /> Shift: {shiftDuration}h
                                    </span>
                                </div>

                                {/* Fatigue Bar */}
                                <div>
                                    <div className="flex justify-between text-[10px] text-slate-500 mb-1 font-bold uppercase">
                                        <span>Fatigue Index</span>
                                        <span className={member.fatigueScore > 70 ? "text-red-400" : "text-emerald-400"}>{member.fatigueScore}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                                        <div
                                            className={cn("h-full rounded-full transition-all duration-1000", getFatigueColor(member.fatigueScore))}
                                            style={{ width: `${member.fatigueScore}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Biometrics Grid */}
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    {sortedBios.slice(0, 4).map(bio => (
                                        <div key={bio.id} className="bg-slate-950 p-2 rounded border border-slate-800/50 flex flex-col gap-1">
                                            <div className="flex items-center gap-1.5 text-[9px] uppercase font-bold text-slate-500">
                                                {bio.type === 'HeartRate' && <Heart size={10} />}
                                                {bio.type === 'HRV' && <Activity size={10} />}
                                                {bio.type === 'SleepQuality' && <Moon size={10} />}
                                                {bio.type === 'VoiceStress' && <Mic size={10} />}
                                                {bio.type}
                                            </div>
                                            <div className="text-xs font-mono font-bold text-slate-300">
                                                {bio.value}
                                                {bio.type === 'HeartRate' && <span className="text-[9px] text-slate-600 ml-0.5">BPM</span>}
                                                {bio.type === 'HRV' && <span className="text-[9px] text-slate-600 ml-0.5">ms</span>}
                                                {bio.type === 'SleepQuality' && <span className="text-[9px] text-slate-600 ml-0.5">%</span>}
                                            </div>
                                        </div>
                                    ))}
                                    {sortedBios.length === 0 && (
                                        <div className="col-span-2 text-[10px] text-slate-600 text-center py-2 italic">
                                            No recent biometric data
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
