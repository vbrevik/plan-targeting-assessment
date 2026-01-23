import {
    Search,
    Crosshair,
    Target,
    TrendingUp,
    Activity,
    ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface F3EADHorizontalFunnelProps {
    counts: {
        FIND: number;
        FIX: number;
        FINISH: number;
        EXPLOIT: number;
        ANALYZE: number;
        DISSEMINATE: number;
    };
    selectedStage?: string | null;
    onStageSelect?: (stage: string | null) => void;
    className?: string;
}

export function F3EADHorizontalFunnel({
    counts,
    selectedStage,
    onStageSelect,
    className
}: F3EADHorizontalFunnelProps) {
    const stages = [
        { code: 'FIND', icon: Search, label: 'Find' },
        { code: 'FIX', icon: Crosshair, label: 'Fix' },
        { code: 'FINISH', icon: Target, label: 'Finish' },
        { code: 'EXPLOIT', icon: TrendingUp, label: 'Exploit' },
        { code: 'ANALYZE', icon: Activity, label: 'Analyze' },
        { code: 'DISSEMINATE', icon: ChevronRight, label: 'Disseminate' },
    ];

    const total = Object.values(counts).reduce((a, b) => a + b, 0);

    return (
        <div className={cn("bg-slate-900/40 border border-slate-800 rounded-lg p-3", className)}>
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">F3EAD Targeted Pipeline</h3>
                <span className="text-[10px] font-mono text-slate-400">TOTAL: {total}</span>
            </div>
            <div className="flex items-stretch gap-1 h-12">
                {stages.map((stage, index) => {
                    const count = (counts as any)[stage.code] || 0;
                    const percentage = total > 0 ? (count / total) * 100 : 0;
                    const isActive = selectedStage === stage.code;

                    return (
                        <button
                            key={stage.code}
                            onClick={() => onStageSelect?.(isActive ? null : stage.code)}
                            className={cn(
                                "group relative flex-1 flex flex-col items-center justify-center rounded transition-all overflow-hidden border",
                                isActive
                                    ? "bg-blue-600/20 border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.2)]"
                                    : "bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-slate-600"
                            )}
                            title={`${stage.label}: ${count} targets`}
                        >
                            <stage.icon className={cn(
                                "w-3 h-3 mb-0.5 transition-colors",
                                isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"
                            )} />
                            <span className={cn(
                                "text-[9px] font-black uppercase leading-none",
                                isActive ? "text-white" : "text-slate-400"
                            )}>
                                {count}
                            </span>

                            {/* Progress bar at bottom of each segment */}
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-900/50">
                                <div
                                    className={cn(
                                        "h-full transition-all duration-500",
                                        isActive ? "bg-blue-400" : "bg-blue-600/40 group-hover:bg-blue-500/60"
                                    )}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
