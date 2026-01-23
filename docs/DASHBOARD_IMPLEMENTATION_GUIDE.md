# Role Dashboard Implementation Guide

## Building Your First Role Dashboard (J3 Operations Example)

This guide walks through implementing the J3 Operations dashboard as a reference implementation. Once built, other role dashboards follow the same pattern.

---

## Step 1: Create Shared Components

### 1.1 Top Bar Component

**File:** `/frontend/src/features/smartops/components/layout/TopBar.tsx`

```typescript
import { Bell, Settings, User, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/lib/context';
import { useOperationContext } from '@/lib/smartops/hooks/useOperationContext';

interface AlertSummary {
    critical: number;
    warnings: number;
    updates: number;
}

interface TopBarProps {
    alerts?: AlertSummary;
}

export function TopBar({ alerts = { critical: 0, warnings: 0, updates: 0 } }: TopBarProps) {
    const { user } = useAuth();
    const { currentOperation, currentPhase } = useOperationContext();
    
    const zuluTime = new Date().toISOString().slice(11, 19) + ' Z';
    const dateStr = new Date().toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }).toUpperCase();

    return (
        <div className="h-20 bg-slate-900 border-b-2 border-slate-800 px-8 flex items-center justify-between">
            {/* Left: Logo */}
            <div className="flex items-center gap-4">
                <div className="text-xl font-black text-white uppercase tracking-tight">
                    SmartOps
                </div>
            </div>

            {/* Center: Operation & Phase */}
            <div className="text-center">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                    {currentOperation || 'OPERATION RESOLUTE SHIELD'}
                </div>
                <div className="text-sm font-black text-white uppercase">
                    {currentPhase || 'Phase 2: Stabilization'}
                </div>
            </div>

            {/* Right: User, Time, Alerts, Utilities */}
            <div className="flex items-center gap-6">
                {/* User Identity */}
                <div className="text-right">
                    <div className="text-sm font-bold text-white">
                        {user?.rank} {user?.name}
                    </div>
                    <div className="text-xs text-slate-400">
                        {user?.roleName}
                    </div>
                </div>

                {/* Time */}
                <div className="text-right">
                    <div className="text-xs font-bold text-slate-500 uppercase">
                        {dateStr}
                    </div>
                    <div className="text-sm font-black text-white">
                        {zuluTime}
                    </div>
                </div>

                {/* Alert Summary */}
                <div className="flex items-center gap-3 text-xs font-bold">
                    {alerts.critical > 0 && (
                        <div className="flex items-center gap-1 text-red-400">
                            <AlertTriangle size={14} />
                            <span>{alerts.critical} CRITICAL</span>
                        </div>
                    )}
                    {alerts.warnings > 0 && (
                        <div className="flex items-center gap-1 text-amber-400">
                            <span>🟡 {alerts.warnings} WARNINGS</span>
                        </div>
                    )}
                    {alerts.updates > 0 && (
                        <div className="flex items-center gap-1 text-blue-400">
                            <span>🔵 {alerts.updates} UPDATES</span>
                        </div>
                    )}
                </div>

                {/* Utilities */}
                <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-slate-800 rounded transition-colors text-slate-400 hover:text-white">
                        <Bell size={18} />
                    </button>
                    <button className="p-2 hover:bg-slate-800 rounded transition-colors text-slate-400 hover:text-white">
                        <Settings size={18} />
                    </button>
                    <button className="p-2 hover:bg-slate-800 rounded transition-colors text-slate-400 hover:text-white">
                        <User size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
```

---

### 1.2 Right Rail Component

**File:** `/frontend/src/features/smartops/components/layout/RightRail.tsx`

```typescript
import { Calendar, MapPin, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TacticalMap } from '../map/TacticalMap';
import { BattleRhythmWidget } from '../battle-rhythm/BattleRhythmWidget';
import { PhaseWidget } from '../phase/PhaseWidget';
import { ActivityFeed } from '../activity/ActivityFeed';

interface RightRailProps {
    role: string;  // For role-specific map overlays
}

export function RightRail({ role }: RightRailProps) {
    return (
        <div className="w-[400px] bg-slate-900 border-l-2 border-slate-800 p-4 space-y-4 overflow-y-auto">
            {/* Tactical Map */}
            <div className="bg-slate-950/50 rounded-lg border border-slate-800 p-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                    <MapPin size={12} />
                    Situation Map
                </h3>
                <TacticalMap role={role} height={280} />
            </div>

            {/* Battle Rhythm */}
            <div className="bg-slate-950/50 rounded-lg border border-slate-800 p-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                    <Calendar size={12} />
                    Today's Battle Rhythm
                </h3>
                <BattleRhythmWidget />
            </div>

            {/* Current Phase */}
            <div className="bg-slate-950/50 rounded-lg border border-slate-800 p-4">
                <PhaseWidget />
            </div>

            {/* Activity Feed */}
            <div className="bg-slate-950/50 rounded-lg border border-slate-800 p-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                    <Activity size={12} />
                    Recent Activity
                </h3>
                <ActivityFeed />
            </div>

            {/* Quick Comms */}
            <div className="bg-slate-950/50 rounded-lg border border-slate-800 p-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">
                    Quick Comms
                </h3>
                <div className="space-y-2 text-xs">
                    <button className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold transition-colors">
                        💬 3 Unread Messages
                    </button>
                    <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded font-bold transition-colors">
                        📞 Call Watch Floor
                    </button>
                </div>
            </div>
        </div>
    );
}
```

---

### 1.3 Left Rail Component

**File:** `/frontend/src/features/smartops/components/layout/LeftRail.tsx`

```typescript
import { Home, BarChart3, Target, CheckSquare, Calendar, FileText, Users } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import { useRoleContext } from '@/lib/smartops/hooks/useRoleContext';

interface QuickAction {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
}

interface LeftRailProps {
    currentRole: string;
    quickActions: QuickAction[];
}

export function LeftRail({ currentRole, quickActions }: LeftRailProps) {
    const { availableRoles } = useRoleContext();

    return (
        <div className="w-60 bg-slate-900 border-r-2 border-slate-800 p-4 space-y-6 overflow-y-auto">
            {/* Navigation */}
            <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">
                    Navigation
                </h3>
                <nav className="space-y-1">
                    <NavLink to="/smartops" icon={<Home size={16} />} label="My Dashboard" />
                    <NavLink to="/smartops/cop" icon={<BarChart3 size={16} />} label="Full COP" />
                    <NavLink to="/smartops/decisions" icon={<Target size={16} />} label="Decisions" />
                    <NavLink to="/smartops/tasks" icon={<CheckSquare size={16} />} label="My Tasks" />
                    <NavLink to="/smartops/meetings" icon={<Calendar size={16} />} label="Meetings" />
                    <NavLink to="/smartops/documents" icon={<FileText size={16} />} label="Documents" />
                </nav>
            </div>

            {/* Quick Actions */}
            <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">
                    Quick Actions
                </h3>
                <div className="space-y-2">
                    {quickActions.map((action, idx) => (
                        <button
                            key={idx}
                            onClick={action.onClick}
                            className="w-full flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded transition-colors"
                        >
                            {action.icon}
                            <span>{action.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Workload */}
            <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">
                    My Workload
                </h3>
                <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 bg-red-950/30 border border-red-500/30 rounded">
                        <span className="text-red-400 font-bold">🔴 Critical</span>
                        <span className="text-white font-black">3</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-amber-950/20 border border-amber-500/30 rounded">
                        <span className="text-amber-400 font-bold">🟡 This Week</span>
                        <span className="text-white font-black">8</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-800 border border-slate-700 rounded">
                        <span className="text-slate-400 font-bold">🟢 Future</span>
                        <span className="text-white font-black">12</span>
                    </div>
                </div>
                <button className="w-full mt-2 py-2 text-xs font-bold text-blue-400 hover:text-blue-300 uppercase transition-colors">
                    View All Tasks →
                </button>
            </div>

            {/* Role Dashboards */}
            <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">
                    Role Dashboards
                </h3>
                <div className="space-y-1">
                    {availableRoles.map(role => (
                        <Link
                            key={role.id}
                            to={role.dashboardPath}
                            className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded text-xs font-bold transition-colors",
                                currentRole === role.id
                                    ? "bg-blue-600 text-white"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            )}
                        >
                            {currentRole === role.id && <span>▶</span>}
                            <span>{role.name}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

function NavLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
    return (
        <Link
            to={to}
            className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:bg-slate-800 hover:text-white rounded text-sm font-medium transition-colors"
        >
            {icon}
            <span>{label}</span>
        </Link>
    );
}
```

---

## Step 2: Create J3 Operations Dashboard

### 2.1 Main Dashboard Component

**File:** `/frontend/src/features/smartops/components/role-dashboards/J3OperationsDashboard.tsx`

```typescript
import { useState } from 'react';
import { Target, AlertTriangle, MapPin, Clock } from 'lucide-react';
import { TopBar } from '../layout/TopBar';
import { LeftRail } from '../layout/LeftRail';
import { RightRail } from '../layout/RightRail';
import { CurrentOperationsStatus } from './j3/CurrentOperationsStatus';
import { ActiveOperationsPanel } from './j3/ActiveOperationsPanel';
import { PendingDecisionsPanel } from './j3/PendingDecisionsPanel';
import { ContactsPanel } from './j3/ContactsPanel';
import { ExecutionTimeline } from './j3/ExecutionTimeline';

export function J3OperationsDashboard() {
    // Quick actions for J3 role
    const quickActions = [
        {
            icon: <Target size={14} />,
            label: 'Create OPORD',
            onClick: () => console.log('Create OPORD')
        },
        {
            icon: <MapPin size={14} />,
            label: 'Update Unit Position',
            onClick: () => console.log('Update position')
        },
        {
            icon: <AlertTriangle size={14} />,
            label: 'Report Contact',
            onClick: () => console.log('Report contact')
        },
        {
            icon: <Clock size={14} />,
            label: 'Submit SITREP',
            onClick: () => console.log('Submit SITREP')
        }
    ];

    return (
        <div className="h-screen bg-slate-950 flex flex-col">
            <TopBar alerts={{ critical: 2, warnings: 5, updates: 12 }} />
            
            <div className="flex-1 flex overflow-hidden">
                <LeftRail currentRole="j3-ops" quickActions={quickActions} />
                
                {/* Main Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {/* Header */}
                        <div className="mb-6">
                            <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
                                J3 Operations Center
                            </h1>
                            <p className="text-sm text-slate-400">
                                Current operations execution and tactical control
                            </p>
                        </div>

                        {/* Primary Workspace - Current Operations Status */}
                        <div className="bg-slate-900/60 rounded-lg border-2 border-slate-800 p-6">
                            <CurrentOperationsStatus />
                        </div>

                        {/* Secondary Panels */}
                        <div className="grid grid-cols-3 gap-6">
                            <ActiveOperationsPanel />
                            <PendingDecisionsPanel />
                            <ContactsPanel />
                        </div>

                        {/* Execution Timeline */}
                        <div className="bg-slate-900/60 rounded-lg border-2 border-slate-800 p-6">
                            <ExecutionTimeline />
                        </div>
                    </div>
                </div>
                
                <RightRail role="j3-ops" />
            </div>
        </div>
    );
}
```

---

### 2.2 Primary Workspace - Current Operations Status

**File:** `/frontend/src/features/smartops/components/role-dashboards/j3/CurrentOperationsStatus.tsx`

```typescript
import { Shield, AlertCircle, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskForce {
    name: string;
    sector: string;
    mission: string;
    status: 'defensive' | 'offensive' | 'repositioning' | 'reserve';
    strength: number;
    units: Array<{
        name: string;
        location: string;
        mission: string;
    }>;
    lastUpdate: string;
    alerts?: string[];
}

export function CurrentOperationsStatus() {
    const taskForces: TaskForce[] = [
        {
            name: 'ALPHA TF',
            sector: 'Sector A',
            mission: 'Defensive',
            status: 'defensive',
            strength: 87,
            units: [
                { name: '1 MECH BDE', location: 'Grid 1234 5678', mission: 'Hold Phase Line' },
                { name: '2 INF BN', location: 'Grid 1235 5680', mission: 'Screen east flank' }
            ],
            lastUpdate: '5m ago'
        },
        {
            name: 'BRAVO TF',
            sector: 'Sector B',
            mission: 'Repositioning',
            status: 'repositioning',
            strength: 92,
            units: [
                { name: '3 MECH BDE', location: 'Moving to Grid 1250 5690', mission: 'Reposition' }
            ],
            lastUpdate: '2m ago',
            alerts: ['🔴 Decision pending - Move authorization']
        },
        {
            name: 'CHARLIE TF',
            sector: 'Reserve',
            mission: 'Ready',
            status: 'reserve',
            strength: 95,
            units: [
                { name: '4 ARM BDE', location: 'Assembly area', mission: 'Be prepared to reinforce' }
            ],
            lastUpdate: '10m ago'
        }
    ];

    const getStatusColor = (status: TaskForce['status']) => {
        switch (status) {
            case 'defensive': return 'bg-blue-950/30 border-blue-500/50';
            case 'offensive': return 'bg-red-950/30 border-red-500/50';
            case 'repositioning': return 'bg-amber-950/30 border-amber-500/50';
            case 'reserve': return 'bg-emerald-950/30 border-emerald-500/50';
        }
    };

    const getStrengthColor = (strength: number) => {
        if (strength >= 90) return 'text-emerald-400';
        if (strength >= 75) return 'text-blue-400';
        if (strength >= 60) return 'text-amber-400';
        return 'text-red-400';
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-white uppercase tracking-wide flex items-center gap-3">
                    <Shield size={20} className="text-blue-400" />
                    Current Operations Status
                </h2>
                <div className="text-sm text-slate-400">
                    Last update: <span className="text-white font-bold">2m ago</span>
                </div>
            </div>

            <div className="space-y-4">
                {taskForces.map(tf => (
                    <div
                        key={tf.name}
                        className={cn(
                            "p-4 rounded-lg border-2 transition-all",
                            getStatusColor(tf.status)
                        )}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-lg font-black text-white uppercase">
                                        {tf.name}
                                    </h3>
                                    <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-xs font-bold rounded">
                                        {tf.sector}
                                    </span>
                                    <span className="text-sm text-slate-400">
                                        {tf.mission}
                                    </span>
                                </div>
                                {tf.alerts && tf.alerts.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        {tf.alerts.map((alert, idx) => (
                                            <div key={idx} className="flex items-center gap-1 text-xs text-red-400 font-bold">
                                                <AlertCircle size={12} />
                                                <span>{alert}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="text-right">
                                <div className="text-xs font-bold text-slate-500 uppercase mb-1">
                                    Strength
                                </div>
                                <div className={cn("text-2xl font-black", getStrengthColor(tf.strength))}>
                                    {tf.strength}%
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {tf.units.map((unit, idx) => (
                                <div key={idx} className="pl-4 border-l-2 border-slate-700">
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="font-bold text-white">{unit.name}</span>
                                        <span className="text-slate-500">•</span>
                                        <span className="text-slate-400">{unit.location}</span>
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        Mission: {unit.mission}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-3 pt-3 border-t border-slate-700 text-xs text-slate-500">
                            Last update: {tf.lastUpdate}
                        </div>
                    </div>
                ))}
            </div>

            {/* Overall Status */}
            <div className="mt-6 p-4 bg-slate-950/50 rounded-lg border border-slate-700">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-xs font-bold text-slate-500 uppercase mb-1">
                            Overall Combat Power
                        </div>
                        <div className="text-2xl font-black text-emerald-400">
                            91%
                        </div>
                    </div>
                    <div>
                        <div className="text-xs font-bold text-slate-500 uppercase mb-1">
                            Operational Tempo
                        </div>
                        <div className="text-lg font-black text-blue-400 uppercase">
                            Moderate
                        </div>
                    </div>
                    <div>
                        <div className="text-xs font-bold text-slate-500 uppercase mb-1">
                            Active Contacts
                        </div>
                        <div className="text-2xl font-black text-amber-400">
                            12
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
```

---

### 2.3 Secondary Panel - Pending Decisions

**File:** `/frontend/src/features/smartops/components/role-dashboards/j3/PendingDecisionsPanel.tsx`

```typescript
import { Target, ChevronRight } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { cn } from '@/lib/utils';

export function PendingDecisionsPanel() {
    const decisions = [
        {
            id: 'decision-strike-t1002',
            title: 'Strike T-1002',
            urgency: 'critical',
            deadline: '6h deadline',
            roeStatus: 'requires_roe_release'
        },
        {
            id: 'decision-move-mech',
            title: 'Move MECH BDE',
            urgency: 'high',
            deadline: '5d deadline',
            roeStatus: 'within_approved_roe'
        }
    ];

    return (
        <div className="bg-slate-900/60 rounded-lg border-2 border-slate-800 p-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wide mb-4 flex items-center gap-2">
                <Target size={16} className="text-blue-400" />
                Pending Decisions
            </h3>

            <div className="space-y-3">
                {decisions.map(decision => (
                    <Link
                        key={decision.id}
                        to={`/smartops/decisions/${decision.id}`}
                        className={cn(
                            "block p-3 rounded border-2 transition-all hover:scale-[1.02]",
                            decision.urgency === 'critical' && 'bg-red-950/20 border-red-500/50 hover:bg-red-950/30',
                            decision.urgency === 'high' && 'bg-amber-950/20 border-amber-500/40 hover:bg-amber-950/30'
                        )}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className={cn(
                                "text-xs font-bold uppercase",
                                decision.urgency === 'critical' && 'text-red-400',
                                decision.urgency === 'high' && 'text-amber-400'
                            )}>
                                {decision.urgency}
                            </span>
                            <span className="text-xs text-slate-500">
                                {decision.deadline}
                            </span>
                        </div>
                        <div className="text-sm font-bold text-white mb-2">
                            {decision.title}
                        </div>
                        <div className="flex items-center justify-between">
                            <span className={cn(
                                "text-[9px] font-bold uppercase px-2 py-0.5 rounded",
                                decision.roeStatus === 'requires_roe_release'
                                    ? 'bg-red-500/20 text-red-400'
                                    : 'bg-emerald-500/20 text-emerald-400'
                            )}>
                                {decision.roeStatus === 'requires_roe_release' ? '🔴 ROE REQ' : '✅ ROE OK'}
                            </span>
                            <ChevronRight size={14} className="text-slate-500" />
                        </div>
                    </Link>
                ))}
            </div>

            <button className="w-full mt-3 py-2 text-xs font-bold text-blue-400 hover:text-blue-300 uppercase transition-colors">
                View All Decisions →
            </button>
        </div>
    );
}
```

---

## Step 3: Create the Route

**File:** `/frontend/src/routes/smartops/j3-dashboard.tsx`

```typescript
import { createFileRoute } from '@tanstack/react-router';
import { J3OperationsDashboard } from '@/features/smartops/components/role-dashboards/J3OperationsDashboard';

export const Route = createFileRoute('/smartops/j3-dashboard')({
    component: J3OperationsDashboard,
});
```

---

## Step 4: Test the Dashboard

### 4.1 Start Development Server

```bash
cd frontend
npm run dev
```

### 4.2 Navigate to Dashboard

```
http://localhost:5173/smartops/j3-dashboard
```

### 4.3 Verify Layout

**Checklist:**
- [ ] Top bar displays correctly with operation, user, time
- [ ] Left rail shows navigation and J3 quick actions
- [ ] Right rail shows map, battle rhythm, phase, activity feed
- [ ] Main content shows current operations status
- [ ] Secondary panels display pending decisions, contacts, etc.
- [ ] All sections are responsive and scrollable

---

## Step 5: Replicate for Other Roles

Once J3 is working, other roles follow the same pattern:

### 5.1 Create Role Dashboard Component

```typescript
// Example: J2 Intelligence Dashboard
export function J2IntelligenceDashboard() {
    const quickActions = [
        // J2-specific actions
    ];

    return (
        <div className="h-screen bg-slate-950 flex flex-col">
            <TopBar />
            <div className="flex-1 flex overflow-hidden">
                <LeftRail currentRole="j2-intel" quickActions={quickActions} />
                
                <div className="flex-1 overflow-y-auto p-8">
                    {/* J2-specific content */}
                </div>
                
                <RightRail role="j2-intel" />  {/* Same component, different map layers */}
            </div>
        </div>
    );
}
```

### 5.2 Create Role-Specific Panels

```
/frontend/src/features/smartops/components/role-dashboards/
├── J3OperationsDashboard.tsx
├── J2IntelligenceDashboard.tsx
├── CommanderDashboard.tsx
├── TargetingCellDashboard.tsx
├── j3/
│   ├── CurrentOperationsStatus.tsx
│   ├── ActiveOperationsPanel.tsx
│   ├── PendingDecisionsPanel.tsx
│   └── ExecutionTimeline.tsx
├── j2/
│   ├── IntelligencePicture.tsx
│   ├── CCIRStatus.tsx
│   ├── CollectionManagement.tsx
│   └── TargetNominations.tsx
├── commander/
│   ├── CommandOverview.tsx
│   ├── DecisionsRequiringAuthority.tsx
│   └── OperationHealth.tsx
└── targeting/
    ├── TargetList.tsx
    ├── TargetingCycle.tsx
    └── StrikeStatus.tsx
```

---

## Best Practices

### 1. Component Reuse
- **Shared components:** TopBar, LeftRail, RightRail (same everywhere)
- **Role-specific:** Only main content area changes
- **Sub-components:** Reuse patterns (status panels, lists, cards)

### 2. Data Fetching
```typescript
// Create role-specific hooks
export function useJ3Operations() {
    const { data: taskForces } = useQuery({
        queryKey: ['j3', 'task-forces'],
        queryFn: () => fetchTaskForces()
    });
    
    const { data: decisions } = useQuery({
        queryKey: ['j3', 'decisions'],
        queryFn: () => fetchPendingDecisions('j3')
    });
    
    return { taskForces, decisions };
}
```

### 3. Consistent Styling
```typescript
// Use consistent color classes
const statusColors = {
    critical: 'bg-red-950/30 border-red-500/50 text-red-400',
    warning: 'bg-amber-950/20 border-amber-500/40 text-amber-400',
    good: 'bg-emerald-950/20 border-emerald-500/40 text-emerald-400',
    info: 'bg-blue-950/20 border-blue-500/40 text-blue-400'
};
```

### 4. Loading States
```typescript
export function J3OperationsDashboard() {
    const { taskForces, isLoading } = useJ3Operations();
    
    if (isLoading) {
        return <DashboardSkeleton />;
    }
    
    return (
        // Dashboard content
    );
}
```

---

## Testing Checklist

### Visual Testing
- [ ] Layout matches design (240px-1280px-400px grid)
- [ ] All text readable (contrast, size)
- [ ] Icons display correctly
- [ ] Colors match design system
- [ ] Responsive at different resolutions

### Functional Testing
- [ ] Navigation works (all links)
- [ ] Quick actions trigger correctly
- [ ] Data updates in real-time
- [ ] Map displays with correct overlays
- [ ] Battle rhythm shows today's events
- [ ] Activity feed updates

### Accessibility Testing
- [ ] Keyboard navigation works
- [ ] Screen reader announces correctly
- [ ] Focus indicators visible
- [ ] Color contrast sufficient

### Performance Testing
- [ ] Initial load < 2 seconds
- [ ] Smooth scrolling (60fps)
- [ ] No memory leaks
- [ ] Data fetching efficient

---

## Troubleshooting

### Layout Issues

**Problem:** Right rail overlapping main content  
**Solution:** Check grid-cols-[240px_1fr_400px] is set correctly

**Problem:** Content overflowing  
**Solution:** Ensure overflow-y-auto on scrollable containers

### Data Issues

**Problem:** Data not loading  
**Solution:** Check API endpoints, verify data shape matches interfaces

**Problem:** Real-time updates not working  
**Solution:** Verify websocket connection, check query invalidation

### Styling Issues

**Problem:** Colors not showing correctly  
**Solution:** Check Tailwind config includes all color variants

**Problem:** Fonts not consistent  
**Solution:** Verify font-family in global CSS

---

## Next Steps

1. **Build J3 dashboard** (reference implementation)
2. **Get feedback** from actual J3 operations officer
3. **Refine** based on feedback
4. **Build Commander dashboard** (executive view)
5. **Build remaining dashboards** using same pattern
6. **Polish** animations, transitions, micro-interactions
7. **Performance optimize** lazy loading, caching, etc.

---

**Remember:** Build shared components first, then one role dashboard as reference, then replicate the pattern for all other roles.

_Version: 1.0_  
_Date: 2026-01-22_  
_Status: Ready for implementation_
