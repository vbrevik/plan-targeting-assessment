import {
    LayoutDashboard,
    Shield,
    Crosshair,
    Map as MapIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DashboardMode } from '../types/dashboard';
import { motion } from 'framer-motion';

interface DashboardModeSwitcherProps {
    currentMode: DashboardMode;
    onModeChange: (mode: DashboardMode) => void;
    isAuto?: boolean;
    onAutoChange?: (isAuto: boolean) => void;
    className?: string;
}

const MODES = [
    { id: DashboardMode.OVERVIEW, label: 'Overview', icon: LayoutDashboard, color: 'text-blue-400' },
    { id: DashboardMode.OPERATION, label: 'Operation', icon: Shield, color: 'text-emerald-400' },
    { id: DashboardMode.ENGAGEMENT, label: 'Engagement', icon: Crosshair, color: 'text-red-400' },
    { id: DashboardMode.PLANNING, label: 'Planning', icon: MapIcon, color: 'text-amber-400' },
];

export function DashboardModeSwitcher({
    currentMode,
    onModeChange,
    isAuto = false,
    onAutoChange,
    className
}: DashboardModeSwitcherProps) {
    return (
        <div className={cn("flex items-center gap-1 bg-slate-900/80 border border-slate-800 p-1 rounded-lg backdrop-blur-sm", className)}>
            {MODES.map((mode) => {
                const isActive = currentMode === mode.id;
                const Icon = mode.icon;

                return (
                    <button
                        key={mode.id}
                        onClick={() => onModeChange(mode.id)}
                        className={cn(
                            "relative flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-200 group",
                            isActive ? "text-white" : "text-slate-500 hover:text-slate-300"
                        )}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="mode-pill"
                                className="absolute inset-0 bg-slate-800 border border-slate-700 rounded-md shadow-lg"
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                            />
                        )}

                        <div className="relative z-10 flex items-center gap-2">
                            <Icon size={14} className={cn(
                                "transition-colors",
                                isActive ? mode.color : "text-slate-600 group-hover:text-slate-400"
                            )} />
                            <span className="text-[10px] font-black uppercase tracking-wider">
                                {mode.label}
                            </span>
                        </div>
                    </button>
                );
            })}

            <div className="mx-2 h-4 w-px bg-slate-800" />

            <div className="px-2 flex items-center gap-1">
                <span className={cn(
                    "text-[8px] font-mono uppercase transition-colors",
                    isAuto ? "text-blue-400 font-bold" : "text-slate-600"
                )}>Auto</span>
                <button
                    onClick={() => onAutoChange?.(!isAuto)}
                    className={cn(
                        "w-6 h-3 rounded-full cursor-pointer border transition-all relative overflow-hidden group",
                        isAuto ? "bg-blue-600/20 border-blue-500/50" : "bg-slate-800 border-slate-700"
                    )}
                >
                    <div className={cn(
                        "absolute top-0.5 w-2 h-2 rounded-full transition-all",
                        isAuto
                            ? "right-0.5 bg-blue-400 shadow-[0_0_5px_rgba(96,165,250,0.5)]"
                            : "left-0.5 bg-slate-600 group-hover:bg-slate-400"
                    )} />
                </button>
            </div>
        </div>
    );
}
