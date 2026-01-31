import type { Entity } from '@/lib/mshnctrl/services/ontology.service';
import { X, ArrowRight, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InterruptNotifierProps {
    urgentItems: Entity[];
    onDismiss: (id: string) => void;
    onView: (id: string) => void;
    onAcknowledgeAll: () => void;
}

export function InterruptNotifier({
    urgentItems,
    onDismiss,
    onView,
    onAcknowledgeAll
}: InterruptNotifierProps) {
    if (urgentItems.length === 0) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-md w-full animate-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between bg-slate-900/95 backdrop-blur border border-red-500/50 p-3 rounded-t-lg shadow-2xl">
                <div className="flex items-center gap-2 text-red-400">
                    <Bell className="animate-pulse" size={18} />
                    <span className="font-bold text-sm tracking-wide">
                        URGENT INTERRUPTS ({urgentItems.length})
                    </span>
                </div>
                <button
                    onClick={onAcknowledgeAll}
                    className="text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 px-2 py-1 rounded transition-colors"
                >
                    Dismiss All
                </button>
            </div>

            <div className="flex flex-col gap-1 max-h-[60vh] overflow-y-auto">
                {urgentItems.map(item => (
                    <div
                        key={item.id}
                        className="bg-slate-900/90 backdrop-blur border-l-4 border-l-red-500 border-t border-b border-r border-slate-700 p-4 shadow-lg text-slate-200 relative group"
                    >
                        <button
                            onClick={() => onDismiss(item.id)}
                            className="absolute top-2 right-2 text-slate-500 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X size={14} />
                        </button>

                        <div className="flex justify-between items-start gap-3">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={cn(
                                        "text-[10px] font-black px-1.5 py-0.5 rounded uppercase",
                                        item.type === 'RFI' ? "bg-blue-500/20 text-blue-400" : "bg-green-500/20 text-green-400"
                                    )}>
                                        {item.type}
                                    </span>
                                    <span className="text-[10px] text-red-400 font-bold uppercase border border-red-900/50 bg-red-950/30 px-1.5 py-0.5 rounded">
                                        CRITICAL
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        Just now
                                    </span>
                                </div>
                                <h4 className="font-semibold text-sm leading-tight mb-2">
                                    {item.properties?.title || 'Untitled Critical Item'}
                                </h4>
                                <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                                    {item.properties?.description || 'No description provided.'}
                                </p>

                                <button
                                    onClick={() => onView(item.id)}
                                    className="flex items-center gap-1.5 text-xs font-medium text-red-400 hover:text-red-300 transition-colors"
                                >
                                    Review Immediately <ArrowRight size={12} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
