import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import {
    Menu,
    ChevronLeft,
    Shield,
    LogOut,
    Settings
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/lib/context';
import { getFeedbackStats } from '@/features/shared/services/feedbackService';
import type { Role } from '@/lib/mshnctrl/hooks/useRoleContext';

interface DatasetItem {
    id: string;
    name: string;
}

interface ActionItem {
    id: string;
    name: string;
    datasets?: DatasetItem[];
}

interface SidebarItem {
    label: string;
    to: string;
    icon: string;
    permission?: string;
    actions?: ActionItem[];
}

interface SidebarGroup {
    label: string;
    items: SidebarItem[];
}


interface MshnCtrlSidebarProps {
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
    navGroups: SidebarGroup[];
    currentRole: Role;
}

export function MshnCtrlSidebar({
    collapsed,
    setCollapsed,
    navGroups,
    currentRole
}: MshnCtrlSidebarProps) {
    const location = useLocation();
    const { logout } = useAuth();
    const navigate = useNavigate();

    const feedbackStats = getFeedbackStats();

    const getIcon = (name: string) => {
        const Icon = (LucideIcons as any)[name] || LucideIcons.Menu;
        return <Icon size={18} />;
    };

    return (
        <aside
            className={cn(
                "bg-slate-900 text-slate-300 border-r border-slate-800 transition-all duration-300 flex flex-col z-20",
                collapsed ? "w-16" : "w-64"
            )}
        >
            {/* Sidebar Header */}
            <div className="h-14 flex items-center px-4 border-b border-slate-800 bg-slate-950 shrink-0">
                <div className="flex items-center gap-2 overflow-hidden">
                    <img src="/mshnctrl-logo.svg" alt="MshnCtrl Logo" className="h-8 w-16 object-cover" />
                    {!collapsed && <span className="font-bold text-lg tracking-tight text-white">MshnCtrl</span>}
                </div>
                <button
                    className="ml-auto p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                    onClick={() => setCollapsed(!collapsed)}
                >
                    {collapsed ? <Menu size={16} /> : <ChevronLeft size={16} />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {navGroups.map((group, groupIndex) => (
                    <div key={groupIndex} className={group.label ? "mt-4 first:mt-0" : ""}>
                        {group.label && !collapsed && (
                            <div className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-slate-500">
                                {group.label}
                            </div>
                        )}
                        {group.label && collapsed && <div className="h-px bg-slate-800 mx-2 my-2" />}
                        {group.items.map((item) => {
                            const isActive = location.pathname === item.to ||
                                (item.to !== '/mshnctrl' && location.pathname.startsWith(item.to + '/'));
                            return (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2 rounded-md transition-colors group",
                                        isActive
                                            ? "bg-blue-600 text-white shadow-md shadow-blue-900/20"
                                            : "hover:bg-slate-800 hover:text-white"
                                    )}
                                >
                                    <div className={cn("shrink-0", isActive ? "text-white" : "text-slate-400 group-hover:text-white")}>
                                        {getIcon(item.icon)}
                                    </div>
                                    {!collapsed && (
                                        <div className="flex-1 flex items-center justify-between min-w-0">
                                            <span className="font-medium text-[11px] uppercase tracking-tight truncate">{item.label}</span>
                                            {item.label === 'Feedback Loops' && feedbackStats.critical > 0 && (
                                                <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 rounded-full ml-1">
                                                    {feedbackStats.critical}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>

            {/* User / Footer */}
            <div className="border-t border-slate-800 p-3 space-y-1 shrink-0">
                <Link
                    to="/admin"
                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 transition-colors group"
                >
                    <Shield size={18} className="text-slate-400 group-hover:text-white" />
                    {!collapsed && <span className="font-medium text-[11px] uppercase text-slate-300 group-hover:text-white">Admin</span>}
                </Link>
                <button
                    onClick={() => {
                        logout();
                        navigate({ to: '/login' });
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-red-900/20 text-slate-400 hover:text-red-400 transition-colors group"
                >
                    <LogOut size={18} className="shrink-0" />
                    {!collapsed && <span className="font-medium text-[11px] uppercase transition-colors">Sign Out</span>}
                </button>
                <div className="flex items-center gap-3 px-3 py-2">
                    <Settings size={18} className="text-slate-400" />
                    {!collapsed && (
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-200 uppercase tracking-tight">{currentRole.shortName}</span>
                            <span className="text-[8px] text-slate-500 uppercase font-bold">{currentRole.name}</span>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}
