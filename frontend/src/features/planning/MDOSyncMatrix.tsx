import {
    Zap,
    Globe,
    Shield,
    Wind,
    Radio,
    Cpu,
    Target,
    Activity,
    Lock,
    FileCheck,
    ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { MshnCtrlService } from '@/lib/mshnctrl/mock-service';
import type { ProductReport } from '@/lib/mshnctrl/types';

export function MDOSyncMatrix() {
    const [reports, setReports] = useState<ProductReport[]>([]);

    useEffect(() => {
        async function loadReports() {
            const data = await MshnCtrlService.getProductReports();
            setReports(data.filter(r => r.type === 'FRAGO' || r.type === 'JCO'));
        }
        loadReports();
    }, []);

    const domains = [
        { id: 'land', label: 'Land Domain', icon: Globe, color: 'text-amber-500' },
        { id: 'air', label: 'Air Domain', icon: Wind, color: 'text-blue-400' },
        { id: 'maritime', label: 'Maritime Domain', icon: Activity, color: 'text-teal-400' },
        { id: 'space', label: 'Space Domain', icon: Radio, color: 'text-purple-400' },
        { id: 'cyberspace', label: 'Cyberspace', icon: Cpu, color: 'text-emerald-500' },
        { id: 'info', label: 'Info Ops', icon: Zap, color: 'text-yellow-400' },
    ];

    const timeSlots = ['T-02', 'T-01', 'H-HOUR', 'T+01', 'T+02', 'T+03', 'T+04', 'T+05'];

    const effects = [
        { domain: 'land', time: 'T+02', label: 'Armor Breach', type: 'Kinetic', impact: 'CRITICAL' },
        { domain: 'air', time: 'H-HOUR', label: 'SEAD Strike', type: 'Kinetic', impact: 'HIGH' },
        { domain: 'space', time: 'T-02', label: 'EW Jamming', type: 'Non-Kinetic', impact: 'HIGH' },
        { domain: 'cyberspace', time: 'T-01', label: 'SCADA Disrupt', type: 'Non-Kinetic', impact: 'CRITICAL' },
        { domain: 'info', time: 'T-02', label: 'Narrative Seed', type: 'Non-Kinetic', impact: 'MED' },
        { domain: 'info', time: 'H-HOUR', label: 'IO Surge Alpha', type: 'Non-Kinetic', impact: 'HIGH' },
        { domain: 'info', time: 'T+02', label: 'Deterrence Msg', type: 'Non-Kinetic', impact: 'MED' },
    ];

    return (
        <div className="flex flex-col h-full bg-[#020617] text-slate-200 font-sans overflow-hidden">
            {/* Header / Stats */}
            <div className="p-8 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Lock className="text-emerald-500" size={20} />
                        <h1 className="text-2xl font-black text-white uppercase tracking-tighter">MDO Synchronization Matrix</h1>
                    </div>
                    <p className="text-xs text-slate-400 max-w-xl font-medium leading-relaxed">
                        Convergence of effects across domains to achieve operational overmatch.
                        This matrix aligns kinetic and non-kinetic actions against high-value target systems.
                    </p>
                </div>
                <div className="flex gap-6">
                    <div className="text-right">
                        <span className="text-[9px] font-black text-slate-500 uppercase block tracking-widest">Active Effects</span>
                        <span className="text-xl font-black text-white">24</span>
                    </div>
                    <div className="text-right border-l border-slate-800 pl-6">
                        <span className="text-[9px] font-black text-slate-500 uppercase block tracking-widest">Convergence Win</span>
                        <span className="text-xl font-black text-emerald-400">EXCELLENT</span>
                    </div>
                </div>
            </div>

            {/* Matrix View */}
            <div className="flex-1 overflow-auto p-8">
                <div className="min-w-[1000px] border border-slate-800 rounded-xl overflow-hidden bg-slate-900/20">
                    {/* Time Header */}
                    <div className="flex border-b border-slate-800 bg-slate-950">
                        <div className="w-48 p-4 shrink-0 border-r border-slate-800">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Operational Phase</span>
                        </div>
                        {timeSlots.map(time => (
                            <div key={time} className="flex-1 p-4 text-center border-r border-slate-800 last:border-0">
                                <span className={cn(
                                    "text-[10px] font-black uppercase tracking-widest",
                                    time === 'H-HOUR' ? "text-red-500" : "text-slate-400"
                                )}>{time}</span>
                            </div>
                        ))}
                    </div>

                    {/* Matrix Rows */}
                    <div className="divide-y divide-slate-800/50">
                        {domains.map(domain => (
                            <div key={domain.id} className="flex min-h-[80px] group transition-colors hover:bg-slate-800/20">
                                <div className="w-48 p-4 shrink-0 border-r border-slate-800 bg-slate-950/40 flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <domain.icon size={14} className={domain.color} />
                                        <span className="text-[11px] font-black text-white uppercase tracking-tight">{domain.label}</span>
                                    </div>
                                    <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter">Status: Synchronized</span>
                                </div>
                                {timeSlots.map(time => {
                                    const effect = effects.find(e => e.domain === domain.id && e.time === time);
                                    return (
                                        <div key={time} className="flex-1 p-2 border-r border-slate-800/30 last:border-0 relative">
                                            {effect && (
                                                <div className={cn(
                                                    "absolute inset-2 rounded-md p-2 flex flex-col justify-between border shadow-lg transition-transform hover:scale-105 cursor-pointer",
                                                    effect.impact === 'CRITICAL' ? "bg-red-500/10 border-red-500/40" : "bg-blue-500/10 border-blue-500/40"
                                                )}>
                                                    <div className="flex justify-between items-start">
                                                        <span className="text-[9px] font-black text-white uppercase tracking-tighter leading-none">{effect.label}</span>
                                                        <Target size={10} className={effect.impact === 'CRITICAL' ? "text-red-400" : "text-blue-400"} />
                                                    </div>
                                                    <div className="flex justify-between items-end">
                                                        <span className="text-[7px] font-bold text-slate-500 uppercase">{effect.type}</span>
                                                        <span className={cn(
                                                            "text-[7px] font-black uppercase px-1 rounded",
                                                            effect.impact === 'CRITICAL' ? "bg-red-500/20 text-red-500" : "bg-blue-500/20 text-blue-500"
                                                        )}>{effect.impact}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}

                        {/* Orders & Directives Row */}
                        <div className="flex min-h-[80px] group transition-colors bg-blue-950/20">
                            <div className="w-48 p-4 shrink-0 border-r border-slate-800 bg-blue-950/40 flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <FileCheck size={14} className="text-blue-400" />
                                    <span className="text-[11px] font-black text-white uppercase tracking-tight">Orders & JCOs</span>
                                </div>
                                <span className="text-[8px] font-bold text-blue-500 uppercase tracking-tighter">Status: Active</span>
                            </div>
                            {timeSlots.map((time, idx) => {
                                // Mock placement: place FRAGOs in H-HOUR and T+02
                                const report = (time === 'H-HOUR' || time === 'T+02') ? reports[idx % reports.length] : null;
                                return (
                                    <div key={time} className="flex-1 p-2 border-r border-slate-800/30 last:border-0 relative">
                                        {report && (
                                            <div className="absolute inset-2 bg-blue-600/20 border border-blue-500/50 rounded-md p-2 shadow-lg transition-transform hover:scale-105 cursor-pointer flex flex-col justify-between overflow-hidden">
                                                <div className="flex justify-between items-start">
                                                    <span className="text-[9px] font-black text-white uppercase tracking-tighter leading-none truncate pr-2">{report.title}</span>
                                                    <FileCheck size={10} className="text-blue-400 shrink-0" />
                                                </div>
                                                <div className="text-[7px] font-black text-blue-300 uppercase flex justify-between">
                                                    <span>SIGNED: CDR</span>
                                                    <ChevronRight size={8} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Legend & Details */}
                <div className="grid grid-cols-3 gap-8 mt-12">
                    <div className="col-span-2 space-y-4">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Target Systems Analysis (TSA) Convergence</h3>
                        <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center gap-8">
                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 rounded-full border-4 border-emerald-500 flex items-center justify-center">
                                    <span className="text-xl font-black">92%</span>
                                </div>
                                <span className="text-[8px] font-black text-slate-500 uppercase mt-2">Synchronization</span>
                            </div>
                            <div className="flex-1 space-y-3">
                                <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                                    <span className="text-emerald-400 font-bold">OPTIMAL WINDOW DETECTED</span>: Cyberspace disrupt cell at <strong>T-01</strong> creates
                                    vulnerability in Adversarial IADS, enabling Air Domain SEAD at <strong>H-HOUR</strong> with 85% reduced risk.
                                </p>
                                <div className="flex gap-2">
                                    <span className="px-2 py-0.5 bg-slate-800 rounded text-[8px] font-bold text-slate-400 uppercase">Conflict resolution: AUTO-SYNC</span>
                                    <span className="px-2 py-0.5 bg-slate-800 rounded text-[8px] font-bold text-slate-400 uppercase">Effector: MQ-9 / SIGINT-G</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Domain Conflicts</h3>
                        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-slate-600 h-32">
                            <div className="text-center italic text-[10px] font-bold uppercase opacity-20">
                                <Shield size={24} className="mx-auto mb-2" />
                                No Operational<br />Conflicts Detected
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Matrix Footer */}
            <div className="h-14 border-t border-slate-800 bg-slate-950 px-8 flex items-center justify-between">
                <div className="flex items-center gap-6 text-[10px] font-mono text-slate-500 uppercase">
                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded bg-red-500" /> Kinetic Effect</span>
                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded bg-blue-500" /> Non-Kinetic Effect</span>
                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded bg-emerald-500" /> Convergence Point</span>
                </div>
                <button className="px-6 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase rounded shadow-lg shadow-blue-900/20 transition-all">
                    Execute Sync Plan
                </button>
            </div>
        </div>
    );
}
