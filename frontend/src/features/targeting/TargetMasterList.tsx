import {
    Target,
    Clock,
    Search,
    Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TargetListItem {
    id: string;
    name: string;
    priority: string;
    status: string;
    type: string;
    f3ead_stage?: string;
    is_tst?: boolean;
    be_number?: string;
    functional_type?: string;
}

interface TargetMasterListProps {
    targets: TargetListItem[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    isLoading?: boolean;
    className?: string;
    searchInputRef?: React.RefObject<HTMLInputElement | null>;
}

export function TargetMasterList({
    targets,
    selectedId,
    onSelect,
    isLoading,
    className,
    searchInputRef
}: TargetMasterListProps) {
    return (
        <div className={cn("flex flex-col bg-slate-950/50 border-r border-slate-800", className)}>
            <div className="p-4 border-b border-slate-800 bg-slate-900/20">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <Target size={14} className="text-blue-500" /> Target List
                    </h2>
                    <button className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-white transition-colors">
                        <Filter size={14} />
                    </button>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-3.5 h-3.5" />
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="FILTER TARGETS... (S)"
                        className="w-full bg-slate-900 border border-slate-800 rounded px-9 py-2 text-[10px] font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {isLoading ? (
                    <div className="p-4 space-y-2">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-16 bg-slate-900/50 rounded animate-pulse border border-slate-800/50" />
                        ))}
                    </div>
                ) : targets.length === 0 ? (
                    <div className="p-8 text-center">
                        <Target className="w-8 h-8 text-slate-800 mx-auto mb-2" />
                        <span className="text-[10px] font-black text-slate-700 uppercase">No Targets Found</span>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-800/30">
                        {targets.map((target) => {
                            const isActive = selectedId === target.id;

                            return (
                                <button
                                    key={target.id}
                                    onClick={() => onSelect(target.id)}
                                    className={cn(
                                        "w-full text-left p-4 transition-all group relative border-l-2",
                                        isActive
                                            ? "bg-blue-600/10 border-blue-500"
                                            : "border-transparent hover:bg-slate-900/50"
                                    )}
                                    data-testid="target-list-item"
                                >
                                    <div className="flex items-start justify-between mb-1.5">
                                        <div className="flex flex-col min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className={cn(
                                                    "text-[9px] font-mono font-black border px-1.5 rounded-sm",
                                                    target.is_tst ? "text-red-400 border-red-900 bg-red-950/20" : "text-slate-500 border-slate-800 bg-slate-900"
                                                )}>
                                                    {target.id.substring(0, 4)}
                                                </span>
                                                <h3 className={cn(
                                                    "text-xs font-bold truncate group-hover:text-white transition-colors",
                                                    isActive ? "text-white" : "text-slate-300"
                                                )}>
                                                    {target.name}
                                                </h3>
                                            </div>
                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter flex items-center gap-2">
                                                <span>{target.type} // {target.f3ead_stage || 'FIND'}</span>
                                                {target.be_number && (
                                                    <span className="text-blue-400/80">BE: {target.be_number}</span>
                                                )}
                                                {target.functional_type && (
                                                    <span className="text-purple-400/80">{target.functional_type}</span>
                                                )}
                                            </span>
                                        </div>
                                        {target.is_tst && <Clock size={12} className="text-red-500 animate-pulse ml-2" />}
                                    </div>

                                    <div className="flex items-center gap-2 mt-2">
                                        <span
                                            className="text-[8px] font-black px-1.5 py-0.5 rounded border uppercase"
                                            style={{
                                                backgroundColor: `var(--priority-${target.priority.toLowerCase()}-bg, transparent)`,
                                                color: `var(--color-priority-${target.priority.toLowerCase()})`,
                                                borderColor: `var(--color-priority-${target.priority.toLowerCase()})`
                                            }}
                                        >
                                            {target.priority}
                                        </span>
                                        <span
                                            className="text-[8px] font-black px-1.5 py-0.5 rounded border uppercase"
                                            style={{
                                                backgroundColor: `var(--status-${target.status.toLowerCase()}-bg, transparent)`,
                                                color: `var(--color-status-${target.status.toLowerCase()})`,
                                                borderColor: `var(--color-status-${target.status.toLowerCase()})`
                                            }}
                                        >
                                            {target.status}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
