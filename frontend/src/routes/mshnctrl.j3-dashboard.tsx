import { createFileRoute, Link } from '@tanstack/react-router';
import { useRoleContext } from '@/lib/mshnctrl/hooks/useRoleContext';
import {
    Activity,
    Clock,
    FileText,
    AlertTriangle,
    CheckCircle2,
    Zap,
    Radio,
    Target,
    Shield,
    Calendar,
    TrendingUp,
    Crosshair,
    Send,
    Lock,
    Edit3
} from 'lucide-react';

export const Route = createFileRoute('/mshnctrl/j3-dashboard')({
    component: J3Dashboard,
});

function J3Dashboard() {
    const { currentRole } = useRoleContext();
    const canEdit = currentRole.capabilities.canEditOperations;
    const canSubmit = currentRole.capabilities.canSubmitProposals;

    return (
        <div className="h-full overflow-y-auto bg-slate-950">
            <div className="max-w-[1800px] mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-black uppercase tracking-tight text-white">
                                J3 Operations Center
                            </h1>
                            {canEdit ? (
                                <span className="flex items-center gap-1 px-3 py-1 bg-green-950/30 border border-green-800 rounded-full text-xs font-bold text-green-400 uppercase">
                                    <Edit3 size={12} />
                                    Operations Manager
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-xs font-bold text-slate-400 uppercase">
                                    <Lock size={12} />
                                    Monitor Only
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-slate-400 mt-1">
                            Current Operations • Battle Rhythm • Tactical Execution
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-xs font-bold text-slate-500 uppercase">Operations Tempo</div>
                            <div className="text-lg font-black text-green-400">HIGH</div>
                        </div>
                        <div className="h-12 w-px bg-slate-800"></div>
                        <div className="text-right">
                            <div className="text-xs font-bold text-slate-500 uppercase">ROE State</div>
                            <div className="text-lg font-black text-amber-400">GREEN</div>
                        </div>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard
                        icon={Activity}
                        label="Active Operations"
                        value="3"
                        change="Ongoing"
                        changeType="neutral"
                        color="green"
                    />
                    <MetricCard
                        icon={FileText}
                        label="Pending Proposals"
                        value="7"
                        change="+2"
                        changeType="neutral"
                        color="amber"
                    />
                    <MetricCard
                        icon={AlertTriangle}
                        label="Open RFIs"
                        value="12"
                        change="-3"
                        changeType="positive"
                        color="blue"
                    />
                    <MetricCard
                        icon={CheckCircle2}
                        label="Tasks Completed Today"
                        value="18"
                        change="+6"
                        changeType="positive"
                        color="cyan"
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content - 2 columns */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Today's Battle Rhythm */}
                        <div className="bg-slate-900 border border-slate-800 rounded-lg">
                            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-5 h-5 text-blue-400" />
                                    <h2 className="font-black uppercase text-sm text-white tracking-tight">
                                        Today's Battle Rhythm
                                    </h2>
                                </div>
                                <span className="text-xs font-bold text-slate-500 uppercase">
                                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                                </span>
                            </div>
                            <div className="p-6 space-y-3">
                                <BattleRhythmEvent
                                    time="08:00Z"
                                    title="Morning Operations Brief"
                                    status="COMPLETED"
                                    attendees="J-Staff, Commander"
                                />
                                <BattleRhythmEvent
                                    time="12:00Z"
                                    title="Operations Sync"
                                    status="UPCOMING"
                                    attendees="J2, J3, J5"
                                />
                                <BattleRhythmEvent
                                    time="16:00Z"
                                    title="Evening Update Brief"
                                    status="SCHEDULED"
                                    attendees="Commander, Staff"
                                />
                                <BattleRhythmEvent
                                    time="20:00Z"
                                    title="Night Operations Brief"
                                    status="SCHEDULED"
                                    attendees="Night Shift Lead"
                                />
                            </div>
                        </div>

                        {/* Active Operations */}
                        <div className="bg-slate-900 border border-slate-800 rounded-lg">
                            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Target className="w-5 h-5 text-green-400" />
                                    <h2 className="font-black uppercase text-sm text-white tracking-tight">
                                        Active Operations
                                    </h2>
                                </div>
                            </div>
                            <div className="p-6 space-y-3">
                                <OperationCard
                                    name="OP Resolve"
                                    phase="PHASE 3: EXECUTION"
                                    commander="COL Johnson"
                                    status="ACTIVE"
                                    progress={75}
                                />
                                <OperationCard
                                    name="OP Guardian"
                                    phase="PHASE 2: PLANNING"
                                    commander="LTC Smith"
                                    status="ACTIVE"
                                    progress={45}
                                />
                                <OperationCard
                                    name="OP Shield"
                                    phase="PHASE 1: PREPARATION"
                                    commander="MAJ Williams"
                                    status="ACTIVE"
                                    progress={20}
                                />
                            </div>
                        </div>

                        {/* Pending Actions */}
                        <div className="bg-slate-900 border border-slate-800 rounded-lg">
                            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                                    <h2 className="font-black uppercase text-sm text-white tracking-tight">
                                        Pending Actions
                                    </h2>
                                </div>
                            </div>
                            <div className="p-6 space-y-3">
                                <ActionItem
                                    title="5 Proposals Awaiting CDR Approval"
                                    priority="HIGH"
                                    dueTime="Today"
                                />
                                <ActionItem
                                    title="3 RFIs Requiring J2 Input"
                                    priority="MEDIUM"
                                    dueTime="Tomorrow"
                                />
                                <ActionItem
                                    title="2 CCIR Notifications Pending"
                                    priority="CRITICAL"
                                    dueTime="Immediate"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - 1 column */}
                    <div className="space-y-6">
                        {/* Current Phase */}
                        <div className="bg-slate-900 border border-slate-800 rounded-lg">
                            <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-3">
                                <Shield className="w-5 h-5 text-green-400" />
                                <h2 className="font-black uppercase text-sm text-white tracking-tight">
                                    Current Phase
                                </h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <PhaseIndicator label="Phase" value="EXECUTION" color="green" />
                                <PhaseIndicator label="DEFCON" value="4" color="amber" />
                                <PhaseIndicator label="ROE" value="GREEN" color="amber" />
                                <PhaseIndicator label="FPCON" value="BRAVO" color="blue" />
                            </div>
                        </div>

                        {/* Force Status */}
                        <div className="bg-slate-900 border border-slate-800 rounded-lg">
                            <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-3">
                                <Activity className="w-5 h-5 text-emerald-400" />
                                <h2 className="font-black uppercase text-sm text-white tracking-tight">
                                    Force Status
                                </h2>
                            </div>
                            <div className="p-6 space-y-3">
                                <ForceStatusBar label="Air" percentage={100} color="green" />
                                <ForceStatusBar label="Maritime" percentage={100} color="green" />
                                <ForceStatusBar label="Ground" percentage={90} color="amber" />
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-slate-900 border border-slate-800 rounded-lg">
                            <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-3">
                                <Clock className="w-5 h-5 text-cyan-400" />
                                <h2 className="font-black uppercase text-sm text-white tracking-tight">
                                    Recent Activity
                                </h2>
                            </div>
                            <div className="p-6 space-y-3">
                                <ActivityItem time="1h ago" text="Proposal submitted: OP Resolve extension" />
                                <ActivityItem time="2h ago" text="RFI answered: Enemy force strength" />
                                <ActivityItem time="3h ago" text="CCIR triggered: Hostile air activity" />
                                <ActivityItem time="4h ago" text="Battle rhythm updated" />
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-slate-900 border border-slate-800 rounded-lg">
                            <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-3">
                                <Zap className="w-5 h-5 text-cyan-400" />
                                <h2 className="font-black uppercase text-sm text-white tracking-tight">
                                    Quick Actions
                                </h2>
                            </div>
                            <div className="p-6 space-y-2">
                                {canSubmit && <QuickActionButton icon={Send} label="Submit Proposal" to="/mshnctrl/proposals" editable />}
                                {canSubmit && <QuickActionButton icon={FileText} label="Create RFI" to="/mshnctrl/rfis" editable />}
                                {canEdit && <QuickActionButton icon={Calendar} label="Update Battle Rhythm" to="/mshnctrl/battle-rhythm" editable />}
                                <QuickActionButton icon={Calendar} label="View Battle Rhythm" to="/mshnctrl/battle-rhythm" />
                                <QuickActionButton icon={Radio} label="Combat Net Radio" to="/mshnctrl/cnr" />
                                <QuickActionButton icon={Crosshair} label="Targeting Board" to="/mshnctrl/targeting" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Components
function MetricCard({ icon: Icon, label, value, change, changeType, color }: any) {
    const colorClasses: any = {
        green: 'text-green-400 bg-green-950/50 border-green-900',
        amber: 'text-amber-400 bg-amber-950/50 border-amber-900',
        blue: 'text-blue-400 bg-blue-950/50 border-blue-900',
        cyan: 'text-cyan-400 bg-cyan-950/50 border-cyan-900',
    };

    const changeColors: any = {
        positive: 'text-green-400',
        negative: 'text-red-400',
        neutral: 'text-slate-400',
    };

    return (
        <div className={`bg-slate-900 border rounded-lg p-5 ${colorClasses[color]}`}>
            <div className="flex items-center justify-between mb-3">
                <Icon className="w-6 h-6" />
                <span className={`text-sm font-bold ${changeColors[changeType]}`}>
                    {change}
                </span>
            </div>
            <div className="text-3xl font-black mb-1">{value}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-tight">{label}</div>
        </div>
    );
}

function BattleRhythmEvent({ time, title, status, attendees }: any) {
    const statusColors: any = {
        COMPLETED: 'bg-green-950/50 text-green-400 border-green-900',
        UPCOMING: 'bg-blue-950/50 text-blue-400 border-blue-900',
        SCHEDULED: 'bg-slate-800 text-slate-400 border-slate-700',
    };

    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-black text-white">{time}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded border font-bold uppercase ${statusColors[status]}`}>
                    {status}
                </span>
            </div>
            <div className="text-sm font-bold text-slate-300 mb-1">{title}</div>
            <div className="text-xs text-slate-500">{attendees}</div>
        </div>
    );
}

function OperationCard({ name, phase, commander, status, progress }: any) {
    const statusColors: any = {
        ACTIVE: 'bg-green-950/50 text-green-400 border-green-900',
    };

    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-black text-white">{name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded border font-bold uppercase ${statusColors[status]}`}>
                            {status}
                        </span>
                    </div>
                    <div className="text-xs text-slate-400">{phase}</div>
                </div>
            </div>
            <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Progress</span>
                    <span className="font-bold text-slate-300">{progress}%</span>
                </div>
                <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-green-600 rounded-full" style={{ width: `${progress}%` }} />
                </div>
            </div>
            <div className="text-xs text-slate-500">Commander: {commander}</div>
        </div>
    );
}

function ActionItem({ title, priority, dueTime }: any) {
    const priorityColors: any = {
        CRITICAL: 'bg-red-950/50 text-red-400 border-red-900',
        HIGH: 'bg-orange-950/50 text-orange-400 border-orange-900',
        MEDIUM: 'bg-amber-950/50 text-amber-400 border-amber-900',
    };

    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                    <div className="text-sm font-bold text-slate-300 mb-2">{title}</div>
                    <div className="text-xs text-slate-500">Due: {dueTime}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded border font-bold uppercase shrink-0 ${priorityColors[priority]}`}>
                    {priority}
                </span>
            </div>
        </div>
    );
}

function PhaseIndicator({ label, value, color }: any) {
    const colorClasses: any = {
        green: 'text-green-400',
        amber: 'text-amber-400',
        blue: 'text-blue-400',
    };

    return (
        <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400 uppercase font-bold">{label}</span>
            <span className={`text-lg font-black ${colorClasses[color]} uppercase`}>{value}</span>
        </div>
    );
}

function ForceStatusBar({ label, percentage, color }: any) {
    const colorClasses: any = {
        green: 'bg-green-600',
        amber: 'bg-amber-600',
    };

    const textColor: any = {
        green: 'text-green-400',
        amber: 'text-amber-400',
    };

    return (
        <div>
            <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">{label}</span>
                <span className={`font-bold ${textColor[color]}`}>{percentage}% Ready</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full ${colorClasses[color]} rounded-full`} style={{ width: `${percentage}%` }} />
            </div>
        </div>
    );
}

function ActivityItem({ time, text }: any) {
    return (
        <div className="flex items-start gap-3 text-xs">
            <span className="text-slate-500 shrink-0">{time}</span>
            <span className="text-slate-300">{text}</span>
        </div>
    );
}

function QuickActionButton({ icon: Icon, label, to, editable = false }: any) {
    return (
        <Link
            to={to}
            className={`flex items-center gap-3 px-4 py-3 bg-slate-800/50 border rounded-lg hover:border-blue-600 hover:bg-blue-950/20 transition-colors group ${
                editable ? 'border-green-800/50 bg-green-950/10' : 'border-slate-700'
            }`}
        >
            <Icon className={`w-4 h-4 transition-colors ${
                editable ? 'text-green-400 group-hover:text-green-300' : 'text-slate-400 group-hover:text-blue-400'
            }`} />
            <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">
                {label}
            </span>
            {editable && <Edit3 size={12} className="ml-auto text-green-400" />}
        </Link>
    );
}
