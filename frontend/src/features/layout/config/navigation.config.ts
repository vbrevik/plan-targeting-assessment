import {
    LayoutDashboard,
    Files,
    Map,
    Layers,
    Crosshair,
    Package,
    ShieldAlert,
    Shield,
    Network,
    Zap,
    Users,
    CalendarDays,
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
    Settings,
    ScrollText,
    BarChart3
} from 'lucide-react';


import type { Role } from '@/lib/mshnctrl/hooks/useRoleContext';
import type { LucideIcon } from 'lucide-react';


export interface NavItem {
    icon: LucideIcon;
    label: string;
    to: string;
    permission?: string;
}

export interface NavGroup {
    label: string;
    items: NavItem[];
}

// Common items most roles can access
const commonItems = {
    cop: { icon: LayoutDashboard, label: 'COP Summary', to: '/mshnctrl/cop-summary', permission: 'cop.view' },
    battleRhythm: { icon: CalendarDays, label: 'Battle Rhythm', to: '/mshnctrl/battle-rhythm', permission: 'battle_rhythm.view' },
    proposals: { icon: Files, label: 'Proposals', to: '/mshnctrl/proposals', permission: 'proposals.view' },
    rfis: { icon: Inbox, label: 'RFI Management', to: '/mshnctrl/rfis', permission: 'rfis.view' },
    orbat: { icon: Users, label: 'ORBAT', to: '/mshnctrl/orbat', permission: 'orbat.view' },
    weather: { icon: CloudSun, label: 'Environment', to: '/mshnctrl/weather', permission: 'weather.view' },
};

// Generate role-specific navigation based on permissions
export const getRoleSpecificNav = (role: Role): NavGroup[] => {
    // Helper to check permission
    const hasPermission = (perm: string) => role.permissions.includes('*') || role.permissions.includes(perm);

    // Menu Definitions
    const menus: Record<string, NavGroup[]> = {
        commander: [
            {
                label: 'Command Suite',
                items: [
                    { icon: LayoutDashboard, label: 'Command Dashboard', to: '/mshnctrl/cop-summary', permission: 'cop.view' },
                    { icon: Brain, label: 'Cognitive Readiness', to: '/mshnctrl/staff', permission: 'staff.view' },
                    { icon: ShieldCheck, label: 'Decision Board', to: '/mshnctrl/decision-board', permission: 'decision_board.view' },
                    { icon: Flag, label: 'Strategic Direction', to: '/mshnctrl/strategic-direction', permission: 'strategic.view' },
                    { icon: ShieldAlert, label: 'CCIR Manager', to: '/mshnctrl/ccir', permission: 'ccir.view' },
                ]
            },
            {
                label: 'Operations & Targeting',
                items: [
                    commonItems.battleRhythm,
                    { icon: Target, label: 'Targeting Board', to: '/mshnctrl/targeting', permission: 'targeting.view' },
                    { icon: Shield, label: 'ROE', to: '/mshnctrl/roe', permission: 'roe.view' },
                    { icon: Crosshair, label: 'BDA Workbench', to: '/mshnctrl/bda', permission: 'bda.view' },
                ]
            },
            {
                label: 'Planning & Intelligence',
                items: [
                    { icon: ScrollText, label: 'OPLAN Manager', to: '/mshnctrl/oplan', permission: 'oplan.view' },
                    { icon: Shield, label: 'Planning Assumptions', to: '/mshnctrl/assumptions', permission: 'assumptions.view' },
                    { icon: Search, label: 'Uncertainty', to: '/mshnctrl/uncertainty', permission: 'uncertainty.view' },
                    { icon: Globe, label: 'Overview Picture', to: '/mshnctrl/rxp', permission: 'rxp.view' },
                    { icon: Layers, label: 'Ontology Matrix', to: '/mshnctrl/ontology', permission: 'ontology.view' },
                ]
            },
        ],
        j2: [
            {
                label: 'J2 Dashboard',
                items: [
                    { icon: Brain, label: 'J2 Operations Center', to: '/mshnctrl/j2-dashboard', permission: 'intelligence.view' },
                ]
            },
            {
                label: 'Intelligence Management',
                items: [
                    { icon: Search, label: 'Uncertainty Analysis', to: '/mshnctrl/uncertainty', permission: 'uncertainty.view' },
                    { icon: Globe, label: 'RXP Overview', to: '/mshnctrl/rxp', permission: 'rxp.view' },
                    { icon: Users, label: 'Social Domain', to: '/mshnctrl/social-domain', permission: 'social.view' },
                    { icon: Zap, label: 'Digital Twin', to: '/mshnctrl/digital-twin', permission: 'digital_twin.view' },
                    { icon: Radio, label: 'Sensor Triage', to: '/mshnctrl/triage', permission: 'triage.view' },
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
        ],
        j3: [
            {
                label: 'J3 Dashboard',
                items: [
                    { icon: Activity, label: 'J3 Operations Center', to: '/mshnctrl/j3-dashboard', permission: 'cop.view' },
                ]
            },
            {
                label: 'Current Operations',
                items: [
                    commonItems.battleRhythm,
                    commonItems.proposals,
                    commonItems.rfis,
                    { icon: Radio, label: 'Combat Net Radio', to: '/mshnctrl/cnr', permission: 'cnr.view' },
                    { icon: Target, label: 'Targeting Board', to: '/mshnctrl/targeting', permission: 'targeting.view' },
                ]
            },
            {
                label: 'Situational Awareness',
                items: [
                    commonItems.cop,
                    commonItems.orbat,
                    { icon: Globe, label: 'RXP Overview', to: '/mshnctrl/rxp', permission: 'rxp.view' },
                    commonItems.weather,
                ]
            },
        ],
        j4: [
            {
                label: 'J4 Dashboard',
                items: [
                    { icon: Package, label: 'J4 Logistics Center', to: '/mshnctrl/j4-dashboard', permission: 'logistics.view' },
                ]
            },
            {
                label: 'Logistics Management',
                items: [
                    { icon: Package, label: 'Supply Status', to: '/mshnctrl/logistics', permission: 'logistics.view' },
                    { icon: Factory, label: 'Critical Infrastructure', to: '/mshnctrl/infrastructure', permission: 'infrastructure.view' },
                    { icon: Network, label: 'Supply Network', to: '/mshnctrl/supply-chain', permission: 'supply_chain.view' },
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
        ],
        j5: [
            {
                label: 'J5 Dashboard',
                items: [
                    { icon: ScrollText, label: 'J5 Plans Center', to: '/mshnctrl/j5-dashboard', permission: 'oplan.view' },
                    { icon: Layers, label: 'Ontology Matrix', to: '/mshnctrl/ontology', permission: 'ontology.view' },
                ]
            },
            {
                label: 'Strategic Planning',
                items: [
                    { icon: ScrollText, label: 'OPLAN Manager', to: '/mshnctrl/oplan', permission: 'oplan.view' },
                    { icon: Shield, label: 'Planning Assumptions', to: '/mshnctrl/assumptions', permission: 'assumptions.view' },
                    { icon: Map, label: 'Campaign Design', to: '/mshnctrl/campaign', permission: 'campaign.view' },
                    { icon: Compass, label: 'CONOPS Builder', to: '/mshnctrl/conops', permission: 'conops.view' },
                    { icon: Divide, label: 'CoA Wargamer', to: '/mshnctrl/coa-wargamer', permission: 'coa.view' },
                    { icon: Activity, label: 'COG Analysis', to: '/mshnctrl/cog', permission: 'cog.view' },
                ]
            },
            {
                label: 'Coordination & Intel',
                items: [
                    { icon: Search, label: 'Uncertainty', to: '/mshnctrl/uncertainty', permission: 'uncertainty.view' },
                    { icon: Globe, label: 'RXP Overview', to: '/mshnctrl/rxp', permission: 'rxp.view' },
                    commonItems.cop,
                    commonItems.battleRhythm,
                ]
            },
        ],
        legad: [
            {
                label: 'LEGAD Dashboard',
                items: [
                    { icon: Scale, label: 'Legal Advisory Center', to: '/mshnctrl/legad-dashboard', permission: 'advisory.view' },
                ]
            },
            {
                label: 'Legal Reviews',
                items: [
                    { icon: Scale, label: 'Advisory Queue', to: '/mshnctrl/advisory', permission: 'advisory.view' },
                    { icon: Shield, label: 'ROE Management', to: '/mshnctrl/roe', permission: 'roe.view' },
                    { icon: ShieldCheck, label: 'Decision Board', to: '/mshnctrl/decision-board', permission: 'decision_board.view' },
                    { icon: Target, label: 'Targeting Review', to: '/mshnctrl/targeting', permission: 'targeting.view' },
                ]
            },
            {
                label: 'Situational Awareness',
                items: [
                    commonItems.cop,
                    commonItems.battleRhythm,
                ]
            },
        ],
        targeting: [
            {
                label: 'Targeting Cell HQ',
                items: [
                    { icon: LayoutDashboard, label: 'Targeting Dashboard', to: '/mshnctrl/targeting-cell-dashboard', permission: 'targeting.view' },
                ]
            },
            {
                label: 'Targeting Operations',
                items: [
                    { icon: Target, label: 'Targets', to: '/mshnctrl/targeting/targets', permission: 'targeting.view' },
                    { icon: Brain, label: 'Intelligence', to: '/mshnctrl/targeting/intelligence', permission: 'targeting.view' },
                    { icon: BarChart3, label: 'Effects', to: '/mshnctrl/targeting/effects', permission: 'targeting.view' },
                    { icon: Zap, label: 'Assets', to: '/mshnctrl/targeting/assets', permission: 'targeting.view' },
                    { icon: ShieldAlert, label: 'Risk', to: '/mshnctrl/targeting/risk', permission: 'targeting.view' },
                    { icon: Brain, label: 'Analysis', to: '/mshnctrl/targeting/analysis', permission: 'targeting.view' },
                    { icon: Users, label: 'Collaboration', to: '/mshnctrl/targeting/collaboration', permission: 'targeting.view' },
                    { icon: Shield, label: 'Mission Command', to: '/mshnctrl/targeting/mission-command', permission: 'targeting.view' },
                ]
            },
            {
                label: 'Quick Actions',
                items: [
                    { icon: ShieldAlert, label: 'Emergency Nomination', to: '/mshnctrl/targeting/emergency', permission: 'targeting.nominate' },
                    { icon: Target, label: 'My Pending Targets', to: '/mshnctrl/targeting/targets', permission: 'targeting.view' },
                    { icon: FileCheck, label: 'Today\'s Strike Briefing', to: '/mshnctrl/briefing', permission: 'targeting.view' },
                    { icon: Package, label: 'Generate Target Package', to: '/mshnctrl/targeting/targets', permission: 'targeting.manage' },
                    { icon: Activity, label: 'Request CDE Analysis', to: '/mshnctrl/cde', permission: 'targeting.manage' },
                ]
            },
            {
                label: 'Targeting Operations',
                items: [
                    { icon: Target, label: 'Targeting Board', to: '/mshnctrl/targeting', permission: 'targeting.view' },
                    { icon: Crosshair, label: 'BDA Workbench', to: '/mshnctrl/bda', permission: 'bda.view' },
                    { icon: Shield, label: 'ROE Reference', to: '/mshnctrl/roe', permission: 'roe.view' },
                    { icon: ShieldAlert, label: 'A2/AD Analysis', to: '/mshnctrl/a2ad', permission: 'a2ad.view' },
                    { icon: Zap, label: 'Strike Optimizer', to: '/mshnctrl/strike-optimizer', permission: 'strike.view' },
                ]
            },
            {
                label: 'Intelligence Support',
                items: [
                    { icon: Globe, label: 'RXP Overview', to: '/mshnctrl/rxp', permission: 'rxp.view' },
                    commonItems.orbat,
                    { icon: Search, label: 'Uncertainty', to: '/mshnctrl/uncertainty', permission: 'uncertainty.view' },
                    commonItems.cop,
                ]
            },
        ],
        analyst: [
            {
                label: 'Analyst Workspace',
                items: [
                    { icon: Lightbulb, label: 'My Dashboard', to: '/mshnctrl/analyst-dashboard', permission: 'cop.view' },
                ]
            },
            {
                label: 'Analysis Tools (Read-Only)',
                items: [
                    commonItems.cop,
                    { icon: Globe, label: 'RXP Overview', to: '/mshnctrl/rxp', permission: 'rxp.view' },
                    commonItems.orbat,
                    commonItems.weather,
                ]
            },
        ],
        im: [
            {
                label: 'Info Management',
                items: [
                    { icon: LayoutDashboard, label: 'IM Dashboard', to: '/mshnctrl/information-management', permission: 'cop.view' },
                    { icon: Settings, label: 'Menu Builder', to: '/mshnctrl/menu-builder', permission: 'menu.manage' },
                    { icon: Inbox, label: 'RFI Manager', to: '/mshnctrl/rfis', permission: 'rfis.view' },
                ]
            },
            {
                label: 'Knowledge Base',
                items: [
                    { icon: Layers, label: 'Ontology Manager', to: '/mshnctrl/ontology', permission: 'ontology.view' },
                    { icon: ScrollText, label: 'TOR Manager', to: '/mshnctrl/tor-manager', permission: 'tor.manage' },
                    { icon: Zap, label: 'Digital Twin', to: '/mshnctrl/digital-twin', permission: 'digital_twin.view' },
                    { icon: Files, label: 'Document Library', to: '/mshnctrl/documents', permission: 'documents.view' },
                    { icon: Globe, label: 'RXP Overview', to: '/mshnctrl/rxp', permission: 'rxp.view' },
                ]
            },
            {
                label: 'Coordination',
                items: [
                    commonItems.cop,
                    commonItems.battleRhythm,
                ]
            },
        ]
    };

    // Permission-based selection logic
    // We check permissions in order of priority or specificity

    if (hasPermission('commander.dashboard.view')) return menus['commander'];
    if (hasPermission('j3.dashboard.view')) return menus['j3'];
    if (hasPermission('j2.dashboard.view')) return menus['j2'];
    if (hasPermission('j4.dashboard.view')) return menus['j4'];
    if (hasPermission('j5.dashboard.view')) return menus['j5'];
    if (hasPermission('targeting.dashboard.view')) return menus['targeting'];
    if (hasPermission('legad.dashboard.view')) return menus['legad'];
    if (hasPermission('im.dashboard.view')) return menus['im'];
    if (hasPermission('analyst.dashboard.view')) return menus['analyst'];

    // Fallback: Empty or Basic
    return [];
};


// Helper function to check if current role has permission
export const roleHasPermission = (role: Role, permission: string): boolean => {
    // Check if role has wildcard permission
    if (role.permissions.includes('*')) {
        return true;
    }
    // Check if role has specific permission
    return role.permissions.includes(permission);
};

// Filter nav groups based on role permissions
export const getFilteredNavGroups = (role: Role): NavGroup[] => {
    const navGroups = getRoleSpecificNav(role);

    return navGroups.map(group => ({
        ...group,
        items: group.items.filter(item => {
            if (!item.permission) return true;
            return roleHasPermission(role, item.permission);
        })
    })).filter(group => group.items.length > 0);
};
