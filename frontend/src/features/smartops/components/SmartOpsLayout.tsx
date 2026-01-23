import { Link, Outlet, useLocation } from '@tanstack/react-router';
import {
    LayoutDashboard,
    Files,
    Map,
    Crosshair,
    Package,
    Settings,
    ShieldAlert,
    Shield,
    Menu,
    ChevronLeft,
    Network,
    Zap,
    Users,
    CalendarDays,
    Terminal,
    Sun,
    Moon,
    LogOut,
    CloudSun,
    Activity,
    Inbox,
    FileCheck,
    Divide,
    Compass,
    Flag,
    ShieldCheck,
    Globe,
    Search,
    Lightbulb,
    Scale,
    Radio,
    Factory,
    Brain,
    Target,
    ScrollText,
    BarChart3
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import Notifications from '@/components/Notifications';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/features/auth/lib/context';
import { useNavigate } from '@tanstack/react-router';
import { getFeedbackStats } from '../services/feedbackService';
import { OperationalContextProvider } from '@/lib/smartops/hooks/useOperationalContext';
import { RoleProvider, useRoleContext } from '@/lib/smartops/hooks/useRoleContext';
import { ContextSelector } from './ContextSelector';
import { RoleSelector } from './RoleSelector';

// Inner component to access role context
function SmartOpsContent() {
    const [collapsed, setCollapsed] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    const location = useLocation();
    const { logout, hasPermission } = useAuth();
    const navigate = useNavigate();
    const feedbackStats = getFeedbackStats();
    const { currentRole } = useRoleContext();

    useEffect(() => {
        const stored = localStorage.getItem('theme');
        if (stored === 'dark' || stored === 'light') {
            setTheme(stored as 'light' | 'dark');
            document.documentElement.classList.toggle('dark', stored === 'dark');
        }
    }, []);

    const toggleTheme = () => {
        const next = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        document.documentElement.classList.toggle('dark', next === 'dark');
        localStorage.setItem('theme', next);
    };

    // Generate role-specific navigation based on current role
    const getRoleSpecificNav = () => {
        const roleId = currentRole.id;

        // Common items most roles can access
        const commonItems = {
            cop: { icon: LayoutDashboard, label: 'COP Summary', to: '/smartops/cop-summary', permission: 'cop.view' },
            battleRhythm: { icon: CalendarDays, label: 'Battle Rhythm', to: '/smartops/battle-rhythm', permission: 'battle_rhythm.view' },
            proposals: { icon: Files, label: 'Proposals', to: '/smartops/proposals', permission: 'proposals.view' },
            rfis: { icon: Inbox, label: 'RFI Management', to: '/smartops/rfis', permission: 'rfis.view' },
            orbat: { icon: Users, label: 'ORBAT', to: '/smartops/orbat', permission: 'orbat.view' },
            weather: { icon: CloudSun, label: 'Environment', to: '/smartops/weather', permission: 'weather.view' },
        };

        switch (roleId) {
            case 'commander':
                return [
                    {
                        label: 'Command Suite',
                        items: [
                            { icon: LayoutDashboard, label: 'Command Dashboard', to: '/smartops/cop-summary', permission: 'cop.view' },
                            { icon: Brain, label: 'Cognitive Readiness', to: '/smartops/staff', permission: 'staff.view' },
                            { icon: ShieldCheck, label: 'Decision Board', to: '/smartops/decision-board', permission: 'decision_board.view' },
                            { icon: Flag, label: 'Strategic Direction', to: '/smartops/strategic-direction', permission: 'strategic.view' },
                            { icon: ShieldAlert, label: 'CCIR Manager', to: '/smartops/ccir', permission: 'ccir.view' },
                        ]
                    },
                    {
                        label: 'Operations & Targeting',
                        items: [
                            commonItems.battleRhythm,
                            { icon: Target, label: 'Targeting Board', to: '/smartops/targeting', permission: 'targeting.view' },
                            { icon: Shield, label: 'ROE', to: '/smartops/roe', permission: 'roe.view' },
                            { icon: Crosshair, label: 'BDA Workbench', to: '/smartops/bda', permission: 'bda.view' },
                        ]
                    },
                    {
                        label: 'Planning & Intelligence',
                        items: [
                            { icon: ScrollText, label: 'OPLAN Manager', to: '/smartops/oplan', permission: 'oplan.view' },
                            { icon: Shield, label: 'Planning Assumptions', to: '/smartops/assumptions', permission: 'assumptions.view' },
                            { icon: Search, label: 'Uncertainty', to: '/smartops/uncertainty', permission: 'uncertainty.view' },
                            { icon: Globe, label: 'Overview Picture', to: '/smartops/rxp', permission: 'rxp.view' },
                        ]
                    },
                ];

            case 'j2-intel':
                return [
                    {
                        label: 'J2 Dashboard',
                        items: [
                            { icon: Brain, label: 'J2 Operations Center', to: '/smartops/j2-dashboard', permission: 'intelligence.view' },
                        ]
                    },
                    {
                        label: 'Intelligence Management',
                        items: [
                            { icon: Search, label: 'Uncertainty Analysis', to: '/smartops/uncertainty', permission: 'uncertainty.view' },
                            { icon: Globe, label: 'RXP Overview', to: '/smartops/rxp', permission: 'rxp.view' },
                            { icon: Users, label: 'Social Domain', to: '/smartops/social-domain', permission: 'social.view' },
                            { icon: Zap, label: 'Digital Twin', to: '/smartops/digital-twin', permission: 'digital_twin.view' },
                            { icon: Radio, label: 'Sensor Triage', to: '/smartops/triage', permission: 'triage.view' },
                            commonItems.orbat,
                        ]
                    },
                    {
                        label: 'Support & Coordination',
                        items: [
                            commonItems.rfis,
                            commonItems.cop,
                            commonItems.battleRhythm,
                            commonItems.weather,
                        ]
                    },
                ];

            case 'j3-ops':
                return [
                    {
                        label: 'J3 Dashboard',
                        items: [
                            { icon: Activity, label: 'J3 Operations Center', to: '/smartops/j3-dashboard', permission: 'cop.view' },
                        ]
                    },
                    {
                        label: 'Current Operations',
                        items: [
                            commonItems.battleRhythm,
                            commonItems.proposals,
                            commonItems.rfis,
                            { icon: Radio, label: 'Combat Net Radio', to: '/smartops/cnr', permission: 'cnr.view' },
                            { icon: Target, label: 'Targeting Board', to: '/smartops/targeting', permission: 'targeting.view' },
                        ]
                    },
                    {
                        label: 'Situational Awareness',
                        items: [
                            commonItems.cop,
                            commonItems.orbat,
                            { icon: Globe, label: 'RXP Overview', to: '/smartops/rxp', permission: 'rxp.view' },
                            commonItems.weather,
                        ]
                    },
                ];

            case 'j5-plans':
                return [
                    {
                        label: 'J5 Dashboard',
                        items: [
                            { icon: ScrollText, label: 'J5 Plans Center', to: '/smartops/j5-dashboard', permission: 'oplan.view' },
                        ]
                    },
                    {
                        label: 'Strategic Planning',
                        items: [
                            { icon: ScrollText, label: 'OPLAN Manager', to: '/smartops/oplan', permission: 'oplan.view' },
                            { icon: Shield, label: 'Planning Assumptions', to: '/smartops/assumptions', permission: 'assumptions.view' },
                            { icon: Map, label: 'Campaign Design', to: '/smartops/campaign', permission: 'campaign.view' },
                            { icon: Compass, label: 'CONOPS Builder', to: '/smartops/conops', permission: 'conops.view' },
                            { icon: Divide, label: 'CoA Wargamer', to: '/smartops/coa-wargamer', permission: 'coa.view' },
                            { icon: Activity, label: 'COG Analysis', to: '/smartops/cog', permission: 'cog.view' },
                        ]
                    },
                    {
                        label: 'Coordination & Intel',
                        items: [
                            { icon: Search, label: 'Uncertainty', to: '/smartops/uncertainty', permission: 'uncertainty.view' },
                            { icon: Globe, label: 'RXP Overview', to: '/smartops/rxp', permission: 'rxp.view' },
                            commonItems.cop,
                            commonItems.battleRhythm,
                        ]
                    },
                ];

            case 'j4-log':
                return [
                    {
                        label: 'J4 Dashboard',
                        items: [
                            { icon: Package, label: 'J4 Logistics Center', to: '/smartops/j4-dashboard', permission: 'logistics.view' },
                        ]
                    },
                    {
                        label: 'Logistics Management',
                        items: [
                            { icon: Package, label: 'Supply Status', to: '/smartops/logistics', permission: 'logistics.view' },
                            { icon: Factory, label: 'Critical Infrastructure', to: '/smartops/infrastructure', permission: 'infrastructure.view' },
                            { icon: Network, label: 'Supply Network', to: '/smartops/supply-chain', permission: 'supply_chain.view' },
                        ]
                    },
                    {
                        label: 'Coordination',
                        items: [
                            commonItems.proposals,
                            commonItems.battleRhythm,
                            commonItems.cop,
                        ]
                    },
                ];

            case 'legad':
                return [
                    {
                        label: 'LEGAD Dashboard',
                        items: [
                            { icon: Scale, label: 'Legal Advisory Center', to: '/smartops/legad-dashboard', permission: 'advisory.view' },
                        ]
                    },
                    {
                        label: 'Legal Reviews',
                        items: [
                            { icon: Scale, label: 'Advisory Queue', to: '/smartops/advisory', permission: 'advisory.view' },
                            { icon: Shield, label: 'ROE Management', to: '/smartops/roe', permission: 'roe.view' },
                            { icon: ShieldCheck, label: 'Decision Board', to: '/smartops/decision-board', permission: 'decision_board.view' },
                            { icon: Target, label: 'Targeting Review', to: '/smartops/targeting', permission: 'targeting.view' },
                        ]
                    },
                    {
                        label: 'Situational Awareness',
                        items: [
                            commonItems.cop,
                            commonItems.battleRhythm,
                        ]
                    },
                ];

            case 'targeting-cell':
                return [
                    {
                        label: 'Targeting Cell HQ',
                        items: [
                            { icon: LayoutDashboard, label: 'Targeting Dashboard', to: '/smartops/targeting-cell-dashboard', permission: 'targeting.view' },
                        ]
                    },
                    {
                        label: 'Targeting Operations',
                        items: [
                            { icon: Target, label: 'Targets', to: '/smartops/targeting/targets', permission: 'targeting.view' },
                            { icon: Brain, label: 'Intelligence', to: '/smartops/targeting/intelligence', permission: 'targeting.view' },
                            { icon: BarChart3, label: 'Effects', to: '/smartops/targeting/effects', permission: 'targeting.view' },
                            { icon: Zap, label: 'Assets', to: '/smartops/targeting/assets', permission: 'targeting.view' },
                            { icon: ShieldAlert, label: 'Risk', to: '/smartops/targeting/risk', permission: 'targeting.view' },
                            { icon: Brain, label: 'Analysis', to: '/smartops/targeting/analysis', permission: 'targeting.view' },
                            { icon: Users, label: 'Collaboration', to: '/smartops/targeting/collaboration', permission: 'targeting.view' },
                            { icon: Shield, label: 'Mission Command', to: '/smartops/targeting/mission-command', permission: 'targeting.view' },
                        ]
                    },
                    {
                        label: 'Quick Actions',
                        items: [
                            { icon: ShieldAlert, label: 'Emergency Nomination', to: '/smartops/targeting/emergency', permission: 'targeting.nominate' },
                            { icon: Target, label: 'My Pending Targets', to: '/smartops/targeting/targets', permission: 'targeting.view' },
                            { icon: FileCheck, label: 'Today\'s Strike Briefing', to: '/smartops/briefing', permission: 'targeting.view' },
                            { icon: Package, label: 'Generate Target Package', to: '/smartops/targeting/targets', permission: 'targeting.manage' },
                            { icon: Activity, label: 'Request CDE Analysis', to: '/smartops/cde', permission: 'targeting.manage' },
                        ]
                    },
                    {
                        label: 'Targeting Operations',
                        items: [
                            { icon: Target, label: 'Targeting Board', to: '/smartops/targeting', permission: 'targeting.view' },
                            { icon: Crosshair, label: 'BDA Workbench', to: '/smartops/bda', permission: 'bda.view' },
                            { icon: Shield, label: 'ROE Reference', to: '/smartops/roe', permission: 'roe.view' },
                            { icon: ShieldAlert, label: 'A2/AD Analysis', to: '/smartops/a2ad', permission: 'a2ad.view' },
                            { icon: Zap, label: 'Strike Optimizer', to: '/smartops/strike-optimizer', permission: 'strike.view' },
                        ]
                    },
                    {
                        label: 'Intelligence Support',
                        items: [
                            { icon: Globe, label: 'RXP Overview', to: '/smartops/rxp', permission: 'rxp.view' },
                            commonItems.orbat,
                            { icon: Search, label: 'Uncertainty', to: '/smartops/uncertainty', permission: 'uncertainty.view' },
                            commonItems.cop,
                        ]
                    },
                ];

            case 'analyst':
                return [
                    {
                        label: 'Analyst Workspace',
                        items: [
                            { icon: Lightbulb, label: 'My Dashboard', to: '/smartops/analyst-dashboard', permission: 'cop.view' },
                        ]
                    },
                    {
                        label: 'Analysis Tools (Read-Only)',
                        items: [
                            commonItems.cop,
                            { icon: Globe, label: 'RXP Overview', to: '/smartops/rxp', permission: 'rxp.view' },
                            commonItems.orbat,
                            commonItems.weather,
                        ]
                    },
                ];

            default:
                // Fallback to commander view
                return [
                    {
                        label: 'Dashboard',
                        items: [
                            commonItems.cop,
                        ]
                    },
                ];
        }
    };

    const navGroups = getRoleSpecificNav();

    // Helper function to check if current role has permission
    const roleHasPermission = (permission: string): boolean => {
        // Check if role has wildcard permission
        if (currentRole.permissions.includes('*')) {
            return true;
        }
        // Check if role has specific permission
        return currentRole.permissions.includes(permission);
    };

    // Filter nav groups based on role permissions only
    // Since navigation is already role-specific, we use only the role's permissions
    // This allows users to switch roles and see what that role would see, regardless of their actual user permissions
    const filteredNavGroups = navGroups.map(group => ({
        ...group,
        items: group.items.filter(item => {
            if (!item.permission) return true;
            // Use only role permissions - this is the whole point of role switching
            return roleHasPermission(item.permission);
        })
    })).filter(group => group.items.length > 0); // Remove empty groups

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
            {/* Sidebar */}
            <aside
                className={cn(
                    "bg-slate-900 text-slate-300 border-r border-slate-800 transition-all duration-300 flex flex-col z-20",
                    collapsed ? "w-16" : "w-64"
                )}
            >
                {/* Sidebar Header */}
                <div className="h-14 flex items-center px-4 border-b border-slate-800 bg-slate-950 shrink-0">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <div className="h-8 w-8 rounded bg-blue-600 flex items-center justify-center shrink-0">
                            <ShieldAlert className="h-5 w-5 text-white" />
                        </div>
                        {!collapsed && <span className="font-bold text-lg tracking-tight text-white">SmartOps</span>}
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
                    {filteredNavGroups.map((group, groupIndex) => (
                        <div key={groupIndex} className={group.label ? "mt-4 first:mt-0" : ""}>
                            {group.label && !collapsed && (
                                <div className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-slate-500">
                                    {group.label}
                                </div>
                            )}
                            {group.label && collapsed && <div className="h-px bg-slate-800 mx-2 my-2" />}
                            {group.items.map((item) => {
                                // More precise active detection: exact match or starts with route + "/"
                                // This prevents /smartops/targeting-cell-dashboard from matching /smartops/targeting
                                const isActive = location.pathname === item.to ||
                                    (item.to !== '/smartops' && location.pathname.startsWith(item.to + '/'));
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
                                        <item.icon size={18} className={cn("shrink-0", isActive ? "text-white" : "text-slate-400 group-hover:text-white")} />
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

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Header / Status Bar */}
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
                                {filteredNavGroups.flatMap(g => g.items).find(i => location.pathname === i.to || (i.to !== '/smartops' && location.pathname.startsWith(i.to + '/')))?.label || 'Command Dashboard'}
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

                {/* Scrollable Content */}
                <main className="flex-1 overflow-hidden bg-slate-50 dark:bg-slate-950">
                    <div className="h-full w-full">
                        <Outlet />
                    </div>
                </main>
                <Toaster />
            </div>
        </div>
    );
}

// Outer wrapper component with providers
export function SmartOpsLayout() {
    return (
        <RoleProvider>
            <OperationalContextProvider>
                <SmartOpsContent />
            </OperationalContextProvider>
        </RoleProvider>
    );
}
