import { AlertTriangle, GitPullRequest, ArrowDown, Target, ShieldAlert } from 'lucide-react';
import type { Assumption } from '@/lib/smartops/domain/assumption';

interface ImpactVisualizerProps {
    assumptions: Assumption[];
}

export function ImpactVisualizer({ assumptions }: ImpactVisualizerProps) {
    const criticalAssumptions = assumptions.filter(a => a.status === 'INVALID' || a.status === 'CHALLENGED');

    if (criticalAssumptions.length === 0) {
        return (
            <div className="p-6 text-center border border-slate-800 rounded-lg bg-slate-900/50">
                <ShieldAlert className="mx-auto text-emerald-500 mb-2" size={24} />
                <h3 className="text-sm font-bold text-white uppercase">No Critical Impact Cascades</h3>
                <p className="text-xs text-slate-500 mt-1">All operational assumptions are currently VALID.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="text-red-500" size={20} />
                <h2 className="text-lg font-black text-white uppercase tracking-tight">Impact Cascade Analysis</h2>
            </div>

            {criticalAssumptions.map(asm => (
                <div key={asm.id} className="border border-red-500/30 rounded-lg bg-red-950/10 overflow-hidden">
                    {/* Level 1: The Failed Assumption */}
                    <div className="p-4 bg-red-950/30 border-b border-red-500/20 flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-500 text-white uppercase">
                                    {asm.status}
                                </span>
                                <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Root Cause</span>
                            </div>
                            <h3 className="text-sm font-bold text-white">{asm.text}</h3>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] text-red-400 font-bold uppercase block">Impact Severity</span>
                            <span className="text-lg font-black text-white">{asm.impactIfFalse}</span>
                        </div>
                    </div>

                    {/* Connector */}
                    <div className="flex justify-center -my-2 relative z-10">
                        <div className="bg-red-900/50 p-1 rounded-full border border-red-500/30">
                            <ArrowDown size={14} className="text-red-400" />
                        </div>
                    </div>

                    {/* Level 2: Linked Decisions (Mocked for visualization if empty) */}
                    <div className="p-6 space-y-4">
                        <div className="flex items-start gap-4">
                            <GitPullRequest className="text-slate-500 mt-1" size={16} />
                            <div className="flex-1">
                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Compromised Decisions</h4>
                                <div className="p-3 bg-slate-900/80 border border-slate-700 rounded border-l-4 border-l-red-500">
                                    <div className="text-xs font-bold text-white mb-1">DEC-2024-004: Approve Strike Package Alpha</div>
                                    <div className="text-[10px] text-slate-500">Rationale based on assumption that air superiority was held.</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <div className="h-4 w-px bg-slate-700"></div>
                        </div>

                        {/* Level 3: At Risk Targets */}
                        <div className="flex items-start gap-4">
                            <Target className="text-slate-500 mt-1" size={16} />
                            <div className="flex-1">
                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Assets at Risk</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="p-2 bg-slate-900/80 border border-slate-700 rounded flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                        <div>
                                            <div className="text-xs font-bold text-white">Flight Lead 1-1</div>
                                            <div className="text-[10px] text-slate-500">High Risk of intercept</div>
                                        </div>
                                    </div>
                                    <div className="p-2 bg-slate-900/80 border border-slate-700 rounded flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                        <div>
                                            <div className="text-xs font-bold text-white">Mission Success</div>
                                            <div className="text-[10px] text-slate-500"> degraded probability &lt; 40%</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
