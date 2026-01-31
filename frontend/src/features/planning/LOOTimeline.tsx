import { TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LineOfOperation, DecisiveCondition } from '@/lib/mshnctrl/types';

interface LOOTimelineProps {
    loos: LineOfOperation[];
    decisiveConditions: DecisiveCondition[];
}

export function LOOTimeline({ loos, decisiveConditions }: LOOTimelineProps) {
    return (
        <div className="w-full h-full bg-[#0a0f1e] flex flex-col font-sans border-t border-slate-800">
            {/* Time Axis Header */}
            <div className="h-10 border-b border-slate-800 bg-slate-950 flex shadow-lg">
                <div className="w-[220px] shrink-0 border-r border-slate-800 flex items-center px-4">
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Campaign LOOs</span>
                </div>
                <div className="flex-1 flex justify-around items-center px-12 text-[10px] font-black font-mono text-slate-600">
                    <span>D-30</span>
                    <span>D-15</span>
                    <div className="flex flex-col items-center">
                        <span className="text-red-500 underline text-[10px]">TIME-NOW (D+04)</span>
                    </div>
                    <span>D+15</span>
                    <span>D+30</span>
                    <span>D+45</span>
                </div>
            </div>

            {/* Main Tracks Grid */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {loos.map((loo) => {
                    const looConditions = decisiveConditions.filter(dc => dc.looId === loo.id);

                    return (
                        <div key={loo.id} className="relative h-24 flex items-center group">
                            {/* LOO Label Label */}
                            <div className="w-[180px] shrink-0 pr-6 flex flex-col justify-center">
                                <div className={cn("inline-block px-3 py-1.5 rounded-md text-[10px] font-black text-white shadow-xl uppercase tracking-tighter", loo.color)}>
                                    {loo.name}
                                </div>
                            </div>

                            {/* Horizontal Track Line */}
                            <div className="flex-1 relative h-2 bg-slate-800 rounded-full shadow-inner">
                                <div className={cn("absolute top-0 bottom-0 left-0 w-[45%] rounded-full opacity-30 shadow-[0_0_15px_rgba(255,255,255,0.1)]", loo.color)} />

                                {/* DC Markers (Enlarged) */}
                                <div className="absolute inset-0 flex h-full items-center justify-around px-10">
                                    {looConditions.map((dc) => (
                                        <div key={dc.id} className="relative group/dc flex flex-col items-center">
                                            {/* Decision Point Shape */}
                                            <div className={cn(
                                                "w-6 h-6 rotate-45 border-2 border-white shadow-2xl transition-all scale-100 hover:scale-125 cursor-pointer flex items-center justify-center",
                                                dc.status === 'Achieved' ? 'bg-green-600' :
                                                    dc.status === 'AtRisk' ? 'bg-red-600 animate-pulse' :
                                                        dc.status === 'InProgress' ? 'bg-blue-600' : 'bg-slate-700'
                                            )}>
                                                {dc.status === 'AtRisk' && <TriangleAlert size={12} className="-rotate-45 text-white" />}
                                            </div>

                                            {/* Label - CLEAR AND READABLE */}
                                            <div className="absolute top-10 whitespace-normal w-[120px] text-center">
                                                <span className={cn(
                                                    "text-[10px] font-black uppercase leading-[1] tracking-tighter",
                                                    dc.status === 'AtRisk' ? 'text-red-400 underline underline-offset-4' : 'text-slate-300'
                                                )}>
                                                    {dc.name}
                                                </span>
                                                <div className="text-[10px] text-slate-500 font-bold leading-tight mt-1 opacity-80">
                                                    {dc.targetDate || 'TBD'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Current Phase Marker Line */}
                            <div className="absolute top-[-10px] bottom-[-10px] left-[357.5px] w-1 bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)] z-20 pointer-events-none" />
                        </div>
                    );
                })}
            </div>

            {/* Legend Footer */}
            <div className="h-8 border-t border-slate-800 bg-slate-950 px-6 flex items-center justify-end gap-6 text-[11px] font-black text-slate-500">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rotate-45 bg-green-600 border border-white" /> ACHIEVED
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rotate-45 bg-red-600 border border-white" /> AT RISK / DRIFT
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rotate-45 bg-slate-700 border border-white" /> PENDING
                </div>
            </div>
        </div>
    );
}

