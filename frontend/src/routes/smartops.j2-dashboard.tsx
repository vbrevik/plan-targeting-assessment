import { createFileRoute, Link } from '@tanstack/react-router';
import { useRoleContext } from '@/lib/smartops/hooks/useRoleContext';
import {
    Brain,
    Search,
    AlertTriangle,
    TrendingUp,
    Clock,
    Shield,
    Activity,
    FileText,
    Zap,
    Radio,
    Eye,
    CheckCircle2,
    Target,
    Globe,
    Lock,
    Edit3
} from 'lucide-react';

export const Route = createFileRoute('/smartops/j2-dashboard')({
    component: J2Dashboard,
});

function J2Dashboard() {
    const { currentRole } = useRoleContext();
    const canEdit = currentRole.capabilities.canEditIntel;

    return (
        <div className="h-full overflow-y-auto bg-slate-950">
            <div className="max-w-[1800px] mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-black uppercase tracking-tight text-white">
                                J2 Intelligence Operations Center
                            </h1>
                            {canEdit ? (
                                <span className="flex items-center gap-1 px-3 py-1 bg-green-950/30 border border-green-800 rounded-full text-xs font-bold text-green-400 uppercase">
                                    <Edit3 size={12} />
                                    Edit Access
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-xs font-bold text-slate-400 uppercase">
                                    <Lock size={12} />
                                    Read Only
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-slate-400 mt-1">
                            Intelligence Assessments • Source Analysis • Uncertainty Management
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-xs font-bold text-slate-500 uppercase">Avg Source Confidence</div>
                            <div className="text-lg font-black text-blue-400">78%</div>
                        </div>
                        <div className="h-12 w-px bg-slate-800"></div>
                        <div className="text-right">
                            <div className="text-xs font-bold text-slate-500 uppercase">Temporal Currency</div>
                            <div className="text-lg font-black text-cyan-400">6.2h</div>
                        </div>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard
                        icon={Brain}
                        label="High Confidence Intel"
                        value="78%"
                        change="+5%"
                        changeType="positive"
                        color="blue"
                    />
                    <MetricCard
                        icon={AlertTriangle}
                        label="Critical Uncertainties"
                        value="3"
                        change="-1"
                        changeType="positive"
                        color="red"
                    />
                    <MetricCard
                        icon={FileText}
                        label="Active RFIs"
                        value="12"
                        change="+2"
                        changeType="neutral"
                        color="amber"
                    />
                    <MetricCard
                        icon={TrendingUp}
                        label="Recent Updates"
                        value="24"
                        change="Last 6h"
                        changeType="neutral"
                        color="cyan"
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content - 2 columns */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Critical Intelligence Assessments */}
                        <div className="bg-slate-900 border border-slate-800 rounded-lg">
                            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <AlertTriangle className="w-5 h-5 text-red-400" />
                                    <h2 className="font-black uppercase text-sm text-white tracking-tight">
                                        Critical Intelligence Gaps
                                    </h2>
                                </div>
                                <span className="text-xs font-bold text-slate-500 uppercase">
                                    Requires Immediate Action
                                </span>
                            </div>
                            <div className="p-6 space-y-3">
                                <IntelGapCard
                                    title="Enemy Command Structure"
                                    confidence="42%"
                                    sources={2}
                                    priority="CRITICAL"
                                    lastUpdate="18h ago"
                                    status="Unvalidated"
                                />
                                <IntelGapCard
                                    title="SAM System Locations"
                                    confidence="58%"
                                    sources={3}
                                    priority="HIGH"
                                    lastUpdate="6h ago"
                                    status="Conflicting reports"
                                />
                                <IntelGapCard
                                    title="Supply Route Activity"
                                    confidence="55%"
                                    sources={1}
                                    priority="HIGH"
                                    lastUpdate="12h ago"
                                    status="Single source"
                                />
                            </div>
                        </div>

                        {/* Recent Intelligence Updates */}
                        <div className="bg-slate-900 border border-slate-800 rounded-lg">
                            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Activity className="w-5 h-5 text-green-400" />
                                    <h2 className="font-black uppercase text-sm text-white tracking-tight">
                                        Recent Intelligence Updates
                                    </h2>
                                </div>
                            </div>
                            <div className="p-6 space-y-3">
                                <IntelUpdateCard
                                    source="SIGINT"
                                    title="Enemy Communications Intercepted"
                                    time="2 hours ago"
                                    confidence="HIGH"
                                    classification="SECRET"
                                />
                                <IntelUpdateCard
                                    source="IMINT"
                                    title="New SAM Deployment Detected"
                                    time="4 hours ago"
                                    confidence="MEDIUM"
                                    classification="SECRET"
                                />
                                <IntelUpdateCard
                                    source="HUMINT"
                                    title="Leadership Meeting Confirmed"
                                    time="6 hours ago"
                                    confidence="HIGH"
                                    classification="TOP SECRET"
                                />
                                <IntelUpdateCard
                                    source="OSINT"
                                    title="Supply Convoy Movement"
                                    time="8 hours ago"
                                    confidence="MEDIUM"
                                    classification="UNCLASS"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - 1 column */}
                    <div className="space-y-6">
                        {/* Active RFIs */}
                        <div className="bg-slate-900 border border-slate-800 rounded-lg">
                            <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-3">
                                <FileText className="w-5 h-5 text-amber-400" />
                                <h2 className="font-black uppercase text-sm text-white tracking-tight">
                                    Active RFIs
                                </h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <RFICard
                                    id="RFI-2401"
                                    title="Enemy Force Disposition"
                                    priority="HIGH"
                                    dueTime="Due today"
                                    status="IN PROGRESS"
                                />
                                <RFICard
                                    id="RFI-2398"
                                    title="Supply Route Analysis"
                                    priority="MEDIUM"
                                    dueTime="Due tomorrow"
                                    status="ASSIGNED"
                                />
                                <RFICard
                                    id="RFI-2395"
                                    title="Air Defense Coverage"
                                    priority="LOW"
                                    dueTime="Due in 3 days"
                                    status="PENDING"
                                />
                            </div>
                        </div>

                        {/* Source Distribution */}
                        <div className="bg-slate-900 border border-slate-800 rounded-lg">
                            <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-3">
                                <Radio className="w-5 h-5 text-cyan-400" />
                                <h2 className="font-black uppercase text-sm text-white tracking-tight">
                                    Source Distribution
                                </h2>
                            </div>
                            <div className="p-6 space-y-3">
                                <SourceBar label="SIGINT" percentage={45} color="cyan" />
                                <SourceBar label="IMINT" percentage={30} color="blue" />
                                <SourceBar label="HUMINT" percentage={15} color="green" />
                                <SourceBar label="OSINT" percentage={10} color="slate" />
                            </div>
                        </div>

                        {/* Quality Metrics */}
                        <div className="bg-slate-900 border border-slate-800 rounded-lg">
                            <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-3">
                                <Shield className="w-5 h-5 text-emerald-400" />
                                <h2 className="font-black uppercase text-sm text-white tracking-tight">
                                    Quality Metrics
                                </h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <QualityMetric label="Corroboration Rate" value="72%" status="good" />
                                <QualityMetric label="Temporal Currency" value="6.2h" status="good" />
                                <QualityMetric label="Source Reliability" value="B2 Average" status="medium" />
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
                                {canEdit && (
                                    <>
                                        <QuickActionButton icon={FileText} label="Submit Assessment" to="/smartops/rfis" editable />
                                        <QuickActionButton icon={Activity} label="Update Intelligence" to="/smartops/uncertainty" editable />
                                    </>
                                )}
                                <QuickActionButton icon={Search} label="Uncertainty Analysis" to="/smartops/uncertainty" />
                                <QuickActionButton icon={Globe} label="Digital Twin" to="/smartops/digital-twin" />
                                <QuickActionButton icon={Radio} label="Sensor Triage" to="/smartops/triage" />
                                <QuickActionButton icon={Target} label="RXP Overview" to="/smartops/rxp" />
                                <QuickActionButton icon={Eye} label="Social Domain" to="/smartops/social-domain" />
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
        blue: 'text-blue-400 bg-blue-950/50 border-blue-900',
        amber: 'text-amber-400 bg-amber-950/50 border-amber-900',
        red: 'text-red-400 bg-red-950/50 border-red-900',
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

function IntelGapCard({ title, confidence, sources, priority, lastUpdate, status }: any) {
    const priorityColors: any = {
        CRITICAL: 'bg-red-950/50 text-red-400 border-red-900',
        HIGH: 'bg-orange-950/50 text-orange-400 border-orange-900',
    };

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
                    <div className="text-xs text-slate-400">{status}</div>
                </div>
            </div>
            <div className="flex items-center justify-between text-xs">
                <div>
                    <span className="text-slate-500">Confidence: </span>
                    <span className="font-bold text-red-400">{confidence}</span>
                </div>
                <div>
                    <span className="text-slate-500">Sources: </span>
                    <span className="font-bold text-slate-300">{sources}</span>
                </div>
                <div className="text-slate-500">{lastUpdate}</div>
            </div>
        </div>
    );
}

function IntelUpdateCard({ source, title, time, confidence, classification }: any) {
    const sourceColors: any = {
        SIGINT: 'bg-cyan-950/50 text-cyan-400 border-cyan-900',
        IMINT: 'bg-blue-950/50 text-blue-400 border-blue-900',
        HUMINT: 'bg-green-950/50 text-green-400 border-green-900',
        OSINT: 'bg-slate-800 text-slate-400 border-slate-700',
    };

    const classificationColors: any = {
        'TOP SECRET': 'text-red-400',
        SECRET: 'text-amber-400',
        UNCLASS: 'text-slate-500',
    };

    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors">
            <div className="flex items-start justify-between mb-2">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded border font-bold uppercase ${sourceColors[source]}`}>
                            {source}
                        </span>
                        <span className={`text-xs font-bold ${classificationColors[classification]}`}>
                            {classification}
                        </span>
                    </div>
                    <div className="text-sm font-bold text-slate-300">{title}</div>
                </div>
            </div>
            <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">{time}</span>
                <span className="font-bold text-slate-400">Confidence: {confidence}</span>
            </div>
        </div>
    );
}

function RFICard({ id, title, priority, dueTime, status }: any) {
    const priorityColors: any = {
        HIGH: 'text-orange-400',
        MEDIUM: 'text-amber-400',
        LOW: 'text-slate-400',
    };

    const statusColors: any = {
        'IN PROGRESS': 'bg-blue-950/50 text-blue-400 border-blue-900',
        ASSIGNED: 'bg-amber-950/50 text-amber-400 border-amber-900',
        PENDING: 'bg-slate-800 text-slate-400 border-slate-700',
    };

    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-white">{id}</span>
                    <span className={`text-xs font-bold ${priorityColors[priority]}`}>
                        {priority}
                    </span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded border font-bold uppercase ${statusColors[status]}`}>
                    {status}
                </span>
            </div>
            <div className="text-xs font-bold text-slate-300 mb-2">{title}</div>
            <div className="text-xs text-slate-500">{dueTime}</div>
        </div>
    );
}

function SourceBar({ label, percentage, color }: any) {
    const colorClasses: any = {
        cyan: 'bg-cyan-600',
        blue: 'bg-blue-600',
        green: 'bg-green-600',
        slate: 'bg-slate-600',
    };

    return (
        <div>
            <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">{label}</span>
                <span className="font-bold text-slate-300">{percentage}%</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                    className={`h-full ${colorClasses[color]} rounded-full`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

function QualityMetric({ label, value, status }: any) {
    const statusColors: any = {
        good: 'text-green-400',
        medium: 'text-amber-400',
    };

    return (
        <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400">{label}</span>
            <span className={`text-sm font-bold ${statusColors[status]}`}>{value}</span>
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
