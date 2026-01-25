import { createFileRoute, Link } from '@tanstack/react-router';
import { useRoleContext } from '@/lib/smartops/hooks/useRoleContext';
import {
    ScrollText,
    Map,
    Shield,
    AlertTriangle,
    TrendingUp,
    Calendar,
    Activity,
    Zap,
    Compass,
    Divide,
    Flag,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Edit3,
    Lock
} from 'lucide-react';

export const Route = createFileRoute('/smartops/j5-dashboard')({
    component: J5Dashboard,
});

function J5Dashboard() {
    const { currentRole } = useRoleContext();
    const canEditPlans = currentRole.capabilities.canEditPlans;
    const canEditAssumptions = currentRole.capabilities.canEditAssumptions;

    return (
        <div className="h-full overflow-y-auto bg-slate-950">
            <div className="max-w-[1800px] mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-black uppercase tracking-tight text-white">
                                J5 Strategic Plans Center
                            </h1>
                            {canEditPlans ? (
                                <span className="flex items-center gap-1 px-3 py-1 bg-purple-950/30 border border-purple-800 rounded-full text-xs font-bold text-purple-400 uppercase">
                                    <Edit3 size={12} />
                                    Planning Authority
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-xs font-bold text-slate-400 uppercase">
                                    <Lock size={12} />
                                    View Only
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-slate-400 mt-1">
                            Strategic Planning • OPLAN Development • Campaign Design
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-xs font-bold text-slate-500 uppercase">Active OPLANs</div>
                            <div className="text-lg font-black text-purple-400">2</div>
                        </div>
                        <div className="h-12 w-px bg-slate-800"></div>
                        <div className="text-right">
                            <div className="text-xs font-bold text-slate-500 uppercase">Planning Horizon</div>
                            <div className="text-lg font-black text-cyan-400">180d</div>
                        </div>
                    </div>
                </div>

                {/* Critical Alert */}
                <div className="bg-red-950/20 border-2 border-red-900 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="w-6 h-6 text-red-400 animate-pulse" />
                        <div className="flex-1">
                            <div className="font-black text-red-400 uppercase text-sm">Critical Planning Alerts</div>
                            <div className="text-slate-300 text-sm mt-1">
                                3 broken planning assumptions require immediate review • OPLAN 5027 approaching decision point
                            </div>
                        </div>
                        <Link
                            to="/smartops/assumptions"
                            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold text-sm uppercase transition-colors"
                        >
                            Review Now
                        </Link>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard
                        icon={ScrollText}
                        label="Active OPLANs"
                        value="2"
                        change="In Development"
                        changeType="neutral"
                        color="purple"
                    />
                    <MetricCard
                        icon={AlertTriangle}
                        label="Broken Assumptions"
                        value="3"
                        change="Critical"
                        changeType="negative"
                        color="red"
                    />
                    <MetricCard
                        icon={Map}
                        label="Campaign Phases"
                        value="5"
                        change="+1"
                        changeType="positive"
                        color="blue"
                    />
                    <MetricCard
                        icon={Divide}
                        label="CoA Under Review"
                        value="4"
                        change="Analysis"
                        changeType="neutral"
                        color="amber"
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content - 2 columns */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Active Planning Efforts */}
                        <div className="bg-slate-900 border border-slate-800 rounded-lg">
                            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Activity className="w-5 h-5 text-purple-400" />
                                    <h2 className="font-black uppercase text-sm text-white tracking-tight">
                                        Active Planning Efforts
                                    </h2>
                                </div>
                            </div>
                            <div className="p-6 space-y-3">
                                <PlanningEffortCard
                                    title="OPLAN 5027 Development"
                                    phase="Phase 3: Detailed Planning"
                                    priority="HIGH"
                                    progress={65}
                                    lead="COL Anderson"
                                    deadline="CDR in 3 days"
                                />
                                <PlanningEffortCard
                                    title="Campaign Design: Northern Axis"
                                    phase="Approved - Implementation"
                                    priority="MEDIUM"
                                    progress={100}
                                    lead="LTC Martinez"
                                    deadline="Complete"
                                />
                                <PlanningEffortCard
                                    title="CoA Wargaming: Blue vs Red"
                                    phase="In Progress"
                                    priority="HIGH"
                                    progress={40}
                                    lead="MAJ Thompson"
                                    deadline="Results due tomorrow"
                                />
                            </div>
                        </div>

                        {/* Upcoming Milestones */}
                        <div className="bg-slate-900 border border-slate-800 rounded-lg">
                            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-5 h-5 text-cyan-400" />
                                    <h2 className="font-black uppercase text-sm text-white tracking-tight">
                                        Upcoming Milestones
                                    </h2>
                                </div>
                            </div>
                            <div className="p-6 space-y-3">
                                <MilestoneCard
                                    title="OPLAN 5027 CDR"
                                    daysOut={3}
                                    status="ON TRACK"
                                    participants="J-Staff, CDR"
                                />
                                <MilestoneCard
                                    title="Campaign Design Approval"
                                    daysOut={7}
                                    status="ON TRACK"
                                    participants="Strategic Board"
                                />
                                <MilestoneCard
                                    title="Strategic Direction Review"
                                    daysOut={14}
                                    status="PENDING"
                                    participants="Commander, J5"
                                />
                                <MilestoneCard
                                    title="CONOPS Brief to HQ"
                                    daysOut={21}
                                    status="SCHEDULED"
                                    participants="HQ North, J5"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - 1 column */}
                    <div className="space-y-6">
                        {/* Planning Assumptions Status */}
                        <div className="bg-slate-900 border border-slate-800 rounded-lg">
                            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Shield className="w-5 h-5 text-amber-400" />
                                    <h2 className="font-black uppercase text-sm text-white tracking-tight">
                                        Planning Assumptions
                                    </h2>
                                </div>
                                <Link
                                    to="/smartops/assumptions"
                                    className="text-xs text-blue-400 hover:text-blue-300 font-bold uppercase"
                                >
                                    View All
                                </Link>
                            </div>
                            <div className="p-6 space-y-3">
                                <AssumptionStatusRow icon={XCircle} label="Broken" count={3} color="red" />
                                <AssumptionStatusRow icon={AlertCircle} label="Challenged" count={5} color="amber" />
                                <AssumptionStatusRow icon={Activity} label="Monitoring" count={8} color="blue" />
                                <AssumptionStatusRow icon={CheckCircle2} label="Valid" count={18} color="green" />
                            </div>
                        </div>

                        {/* OPLAN Status */}
                        <div className="bg-slate-900 border border-slate-800 rounded-lg">
                            <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-3">
                                <ScrollText className="w-5 h-5 text-purple-400" />
                                <h2 className="font-black uppercase text-sm text-white tracking-tight">
                                    OPLAN Status
                                </h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <OPLANStatusItem label="Active" count={2} color="green" />
                                <OPLANStatusItem label="In Development" count={1} color="blue" />
                                <OPLANStatusItem label="Under Review" count={1} color="amber" />
                            </div>
                        </div>

                        {/* Strategic Context */}
                        <div className="bg-slate-900 border border-slate-800 rounded-lg">
                            <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-3">
                                <Flag className="w-5 h-5 text-emerald-400" />
                                <h2 className="font-black uppercase text-sm text-white tracking-tight">
                                    Strategic Context
                                </h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <ContextIndicator label="Political Situation" value="Deteriorating" status="warning" />
                                <ContextIndicator label="Enemy Capability" value="Improving" status="warning" />
                                <ContextIndicator label="Timeline Pressure" value="High" status="critical" />
                                <ContextIndicator label="Resource Availability" value="Adequate" status="good" />
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
                                {canEditAssumptions && (
                                    <QuickActionButton icon={Shield} label="Manage Assumptions" to="/smartops/assumptions" editable />
                                )}
                                {!canEditAssumptions && (
                                    <QuickActionButton icon={Shield} label="Review Assumptions" to="/smartops/assumptions" />
                                )}
                                {canEditPlans && (
                                    <>
                                        <QuickActionButton icon={ScrollText} label="Edit OPLANs" to="/smartops/oplan" editable />
                                        <QuickActionButton icon={Map} label="Update Campaign" to="/smartops/campaign" editable />
                                        <QuickActionButton icon={Compass} label="Edit CONOPS" to="/smartops/conops" editable />
                                    </>
                                )}
                                {!canEditPlans && (
                                    <>
                                        <QuickActionButton icon={ScrollText} label="View OPLANs" to="/smartops/oplan" />
                                        <QuickActionButton icon={Map} label="View Campaign" to="/smartops/campaign" />
                                    </>
                                )}
                                <QuickActionButton icon={Divide} label="CoA Wargamer" to="/smartops/coa-wargamer" />
                                <QuickActionButton icon={Flag} label="Strategic Direction" to="/smartops/strategic-direction" />
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
        purple: 'text-purple-400 bg-purple-950/50 border-purple-900',
        red: 'text-red-400 bg-red-950/50 border-red-900',
        blue: 'text-blue-400 bg-blue-950/50 border-blue-900',
        amber: 'text-amber-400 bg-amber-950/50 border-amber-900',
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

function PlanningEffortCard({ title, phase, priority, progress, lead, deadline }: any) {
    const priorityColors: any = {
        HIGH: 'bg-orange-950/50 text-orange-400 border-orange-900',
        MEDIUM: 'bg-amber-950/50 text-amber-400 border-amber-900',
    };

    const progressColor = progress === 100 ? 'bg-green-600' : 'bg-purple-600';

    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors">
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-black text-white">{title}</span>
                        <span className={`text-xs px-2 py-0.5 rounded border font-bold uppercase ${priorityColors[priority]}`}>
                            {priority}
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
                    <div className={`h-full ${progressColor} rounded-full`} style={{ width: `${progress}%` }} />
                </div>
            </div>
            <div className="flex justify-between text-xs">
                <span className="text-slate-500">Lead: {lead}</span>
                <span className="text-slate-400">{deadline}</span>
            </div>
        </div>
    );
}

function MilestoneCard({ title, daysOut, status, participants }: any) {
    const statusColors: any = {
        'ON TRACK': 'bg-green-950/50 text-green-400 border-green-900',
        'PENDING': 'bg-amber-950/50 text-amber-400 border-amber-900',
        'SCHEDULED': 'bg-blue-950/50 text-blue-400 border-blue-900',
    };

    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-black text-white">{title}</span>
                <span className={`text-xs px-2 py-0.5 rounded border font-bold uppercase ${statusColors[status]}`}>
                    {status}
                </span>
            </div>
            <div className="flex justify-between text-xs">
                <span className="text-slate-400">{participants}</span>
                <span className="font-bold text-cyan-400">in {daysOut} days</span>
            </div>
        </div>
    );
}

function AssumptionStatusRow({ icon: Icon, label, count, color }: any) {
    const colorClasses: any = {
        red: 'text-red-400',
        amber: 'text-amber-400',
        blue: 'text-blue-400',
        green: 'text-green-400',
    };

    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${colorClasses[color]}`} />
                <span className="text-sm text-slate-300">{label}</span>
            </div>
            <span className={`text-lg font-black ${colorClasses[color]}`}>{count}</span>
        </div>
    );
}

function OPLANStatusItem({ label, count, color }: any) {
    const colorClasses: any = {
        green: 'text-green-400',
        blue: 'text-blue-400',
        amber: 'text-amber-400',
    };

    return (
        <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400 uppercase font-bold">{label}</span>
            <span className={`text-lg font-black ${colorClasses[color]}`}>{count}</span>
        </div>
    );
}

function ContextIndicator({ label, value, status }: any) {
    const statusColors: any = {
        good: 'text-green-400',
        warning: 'text-amber-400',
        critical: 'text-red-400',
    };

    return (
        <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400">{label}</span>
            <span className={`text-sm font-bold ${statusColors[status]} uppercase`}>{value}</span>
        </div>
    );
}

function QuickActionButton({ icon: Icon, label, to, editable = false }: any) {
    return (
        <Link
            to={to}
            className={`flex items-center gap-3 px-4 py-3 bg-slate-800/50 border rounded-lg hover:border-blue-600 hover:bg-blue-950/20 transition-colors group ${editable ? 'border-purple-800/50 bg-purple-950/10' : 'border-slate-700'
                }`}
        >
            <Icon className={`w-4 h-4 transition-colors ${editable ? 'text-purple-400 group-hover:text-purple-300' : 'text-slate-400 group-hover:text-blue-400'
                }`} />
            <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">
                {label}
            </span>
            {editable && <Edit3 size={12} className="ml-auto text-purple-400" />}
        </Link>
    );
}
