import { Zap, ZapOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FocusModeToggleProps {
    enabled: boolean;
    onToggle: (enabled: boolean) => void;
}

export function FocusModeToggle({ enabled, onToggle }: FocusModeToggleProps) {
    return (
        <button
            onClick={() => onToggle(!enabled)}
            className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded transition-all border",
                enabled
                    ? "bg-amber-500/10 border-amber-500/50 text-amber-500 shadow-[0_0_15px_-3px_rgba(245,158,11,0.3)]"
                    : "bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200"
            )}
            title="Focus Mode: Show only critical and high priority items"
        >
            {enabled ? <Zap size={14} className="fill-amber-500/50" /> : <ZapOff size={14} />}
            <span className="text-[10px] font-black uppercase tracking-wider">
                {enabled ? 'Focus Active' : 'Focus Mode'}
            </span>
        </button>
    );
}
