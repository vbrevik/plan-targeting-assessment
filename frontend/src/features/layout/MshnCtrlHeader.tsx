import { Link, useLocation } from '@tanstack/react-router';
import {
    Terminal,
    Sun,
    Moon
} from 'lucide-react';
import Notifications from '@/components/Notifications';
import { Button } from '@/components/ui/button';
import { ContextSelector } from '../shared/ContextSelector';
import { RoleSelector } from '../shared/RoleSelector';



interface MshnCtrlHeaderProps {
    collapsed: boolean;
    toggleTheme: () => void;
    theme: 'light' | 'dark';
    navGroups: any[];
}

export function MshnCtrlHeader({
    collapsed,
    toggleTheme,
    theme,
    navGroups
}: MshnCtrlHeaderProps) {
    const location = useLocation();

    const activeItem = navGroups.flatMap(g => g.items).find(i =>
        location.pathname === i.to || (i.to !== '/mshnctrl' && location.pathname.startsWith(i.to + '/'))
    );

    return (
        <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center px-6 justify-between shrink-0 z-10">
            <div className="flex items-center gap-6">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm transition-all group-hover:scale-105">
                        <Terminal size={14} />
                    </div>
                    {!collapsed && (
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-tighter text-slate-800 dark:text-white leading-tight">Platform</span>
                        </div>
                    )}
                </Link>

                <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />

                <div className="flex items-center gap-4 text-slate-800 dark:text-slate-100">
                    <h2 className="text-sm font-black uppercase tracking-tight whitespace-nowrap">
                        {activeItem?.label || 'Command Dashboard'}
                    </h2>
                    <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-2" />
                    <ContextSelector />
                    <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-2" />
                    <RoleSelector />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500 dark:text-slate-400 shrink-0">
                    <span>DEFCON: <strong className="text-slate-900 dark:text-slate-100">4</strong></span>
                    <span>PHASE: <strong className="text-slate-900 dark:text-slate-100">Deterrence</strong></span>
                </div>

                <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />

                <div className="flex items-center gap-3">
                    <Notifications />
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleTheme}
                        className="rounded-full w-8 h-8 text-slate-500 hover:text-white hover:bg-slate-800"
                    >
                        {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                    </Button>
                </div>
            </div>
        </header>
    );
}
