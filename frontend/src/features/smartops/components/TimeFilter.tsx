import { useState } from 'react';
import { Clock, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TimeWindow = '4H' | '12H' | '24H' | '72H' | 'CUSTOM';

interface TimeFilterProps {
    currentWindow: TimeWindow;
    onWindowChange: (window: TimeWindow) => void;
    className?: string;
}

const WINDOWS: { id: TimeWindow; label: string }[] = [
    { id: '4H', label: 'Last 4h' },
    { id: '12H', label: 'Last 12h' },
    { id: '24H', label: 'Last 24h' },
    { id: '72H', label: 'Last 72h' },
    { id: 'CUSTOM', label: 'Custom' },
];

export function TimeFilter({ currentWindow, onWindowChange, className }: TimeFilterProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={cn("relative", className)}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-md text-slate-400 hover:text-white hover:border-slate-700 transition-all group"
            >
                <Clock size={14} className="group-hover:text-blue-400 transition-colors" />
                <span className="text-[10px] font-black uppercase tracking-wider">
                    {WINDOWS.find(w => w.id === currentWindow)?.label}
                </span>
                <ChevronDown size={12} className={cn("transition-transform duration-200", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full right-0 mt-1 w-40 bg-slate-900 border border-slate-800 rounded-md shadow-2xl z-50 overflow-hidden backdrop-blur-xl bg-opacity-90">
                        {WINDOWS.map((window) => (
                            <button
                                key={window.id}
                                onClick={() => {
                                    onWindowChange(window.id);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "w-full px-4 py-2 text-left text-[10px] font-bold uppercase tracking-tight transition-colors",
                                    currentWindow === window.id
                                        ? "bg-blue-600/10 text-blue-400"
                                        : "text-slate-500 hover:bg-slate-800 hover:text-slate-300"
                                )}
                            >
                                {window.label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
