import { useState } from 'react';
import { ChevronDown, Globe, Target, ArrowUp } from 'lucide-react';
import { useOperationalContext, getPhaseColor } from '@/lib/mshnctrl/hooks/useOperationalContext';
import { MshnCtrlService } from '@/lib/mshnctrl/mock-service';
import type { Operation } from '@/lib/mshnctrl/types';
import { cn } from '@/lib/utils';

export function ContextSelector() {
    const { context, isStrategic, setOperationalFocus, returnToStrategic } = useOperationalContext();
    const [isOpen, setIsOpen] = useState(false);
    const [operations, setOperations] = useState<Operation[]>([]);

    const loadOperations = async () => {
        const ops = await MshnCtrlService.getOperations('c-001');
        setOperations(ops);
    };

    const handleOpen = () => {
        loadOperations();
        setIsOpen(!isOpen);
    };

    const handleSelectOperation = (op: Operation) => {
        setOperationalFocus(op.id, op.name, op.phase, op.campaignId, op.oplanId);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            {/* Current Context Display */}
            <button
                onClick={handleOpen}
                className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all",
                    isStrategic
                        ? "bg-slate-800 border-slate-700 hover:border-slate-500"
                        : "bg-blue-900/30 border-blue-500/50 hover:border-blue-400"
                )}
            >
                {isStrategic ? (
                    <Globe size={14} className="text-slate-400" />
                ) : (
                    <Target size={14} className="text-blue-400" />
                )}

                <div className="flex flex-col items-start">
                    <span className="text-[8px] uppercase font-bold tracking-widest text-slate-500">
                        {isStrategic ? 'Strategic View' : 'Operational Focus'}
                    </span>
                    <span className="text-xs font-bold text-white truncate max-w-[200px]">
                        {context.name}
                    </span>
                </div>

                {context.phase && (
                    <span className={cn(
                        "px-2 py-0.5 rounded text-[8px] font-black uppercase",
                        getPhaseColor(context.phase)
                    )}>
                        {context.phase}
                    </span>
                )}

                <ChevronDown size={14} className={cn(
                    "text-slate-400 transition-transform",
                    isOpen && "rotate-180"
                )} />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                    {/* Strategic Option */}
                    <button
                        onClick={() => { returnToStrategic(); setIsOpen(false); }}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 transition-colors border-b border-slate-800",
                            isStrategic && "bg-blue-900/20"
                        )}
                    >
                        <Globe size={16} className="text-slate-400" />
                        <div className="text-left">
                            <div className="text-xs font-bold text-white">Strategic Overview</div>
                            <div className="text-[10px] text-slate-500">View all operations and OPLANs</div>
                        </div>
                        {isStrategic && <span className="ml-auto text-[8px] font-bold text-blue-400 uppercase">Active</span>}
                    </button>

                    {/* Operations List */}
                    <div className="max-h-64 overflow-y-auto">
                        <div className="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-slate-500 bg-slate-950">
                            Operations
                        </div>
                        {operations.map(op => (
                            <button
                                key={op.id}
                                onClick={() => handleSelectOperation(op)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 transition-colors",
                                    context.operationId === op.id && "bg-blue-900/20"
                                )}
                            >
                                <Target size={14} className="text-blue-400" />
                                <div className="text-left flex-1 min-w-0">
                                    <div className="text-xs font-bold text-white truncate">{op.name}</div>
                                    <div className="text-[10px] text-slate-500">{op.commander}</div>
                                </div>
                                <span className={cn(
                                    "px-2 py-0.5 rounded text-[8px] font-black uppercase shrink-0",
                                    getPhaseColor(op.phase)
                                )}>
                                    {op.phase}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Return to Strategic (if focused) */}
                    {!isStrategic && (
                        <button
                            onClick={() => { returnToStrategic(); setIsOpen(false); }}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-950 text-slate-400 hover:text-white text-[10px] font-bold uppercase border-t border-slate-800"
                        >
                            <ArrowUp size={12} />
                            Back to Strategic View
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
