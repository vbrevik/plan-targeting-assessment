import { createFileRoute, Link } from '@tanstack/react-router';
import { useRoleContext } from '@/lib/mshnctrl/hooks/useRoleContext';
import {
    ScrollText,
    Shield,
    Activity,
    FileText,
    AlertTriangle,
    CheckCircle2,
    Zap,
    Clock,
    Target,
    Calendar,
    Map,
    Compass,
    TrendingUp,
    Lock,
    Edit3,
    Layers,
    Swords,
    ArrowRight,
} from 'lucide-react';

export const Route = createFileRoute('/mshnctrl/j5-dashboard')({
    component: J5Dashboard,
});

// -- Mock Data --

const campaignPhases = [
    { id: 1, label: 'Phase 0', name: 'Shape', status: 'COMPLETED' as const },
    { id: 2, label: 'Phase 1', name: 'Deter', status: 'COMPLETED' as const },
    { id: 3, label: 'Phase 2', name: 'Seize Initiative', status: 'ACTIVE' as const },
    { id: 4, label: 'Phase 3', name: 'Dominate', status: 'PLANNED' as const },
    { id: 5, label: 'Phase 4', name: 'Stabilize', status: 'PLANNED' as const },
    { id: 6, label: 'Phase 5', name: 'Enable Civil Authority', status: 'PLANNED' as const },
];

const assumptions = [
    {
        id: 'ASM-001',
        title: 'Coalition forces maintain air superiority throughout Phase 2',
        confidence: 'HIGH' as const,
        status: 'VALIDATED' as const,
        lastReview: '2 days ago',
    },
    {
        id: 'ASM-004',
        title: 'Host nation infrastructure supports LOC requirements',
        confidence: 'MEDIUM' as const,
        status: 'AT RISK' as const,
        lastReview: '12h ago',
    },
    {
        id: 'ASM-007',
        title: 'Enemy unable to reconstitute brigade-level forces within 72h',
        confidence: 'LOW' as const,
        status: 'UNDER REVIEW' as const,
        lastReview: '4h ago',
    },
    {
        id: 'ASM-012',
        title: 'Cyber domain remains contested but manageable',
        confidence: 'MEDIUM' as const,
        status: 'VALIDATED' as const,
        lastReview: '1 day ago',
    },
];

const oplans = [
    {
        id: 'OPLAN-2401',
        name: 'OP Resolute Storm',
        phase: 'Final Review',
        status: 'REVIEW' as const,
        owner: 'COL Anderson',
        lastUpdated: '3h ago',
        progress: 85,
    },
    {
        id: 'OPLAN-2398',
        name: 'OP Iron Shield',
        phase: 'Phase 2 Planning',
        status: 'DRAFT' as const,
        owner: 'LTC Martinez',
        lastUpdated: '1 day ago',
        progress: 45,
    },
    {
        id: 'OPLAN-2395',
        name: 'OP Swift Horizon',
        phase: 'Approved',
        status: 'APPROVED' as const,
        owner: 'COL Thompson',
        lastUpdated: '5 days ago',
        progress: 100,
    },
];

const planningEvents = [
    {
        time: '09:00Z',
        title: 'Joint Planning Group (JPG)',
        status: 'COMPLETED' as const,
        attendees: 'J5, J3, J2, POLAD',
    },
    {
        time: '14:00Z',
        title: 'OPLAN 2401 Review Board',
        status: 'UPCOMING' as const,
        attendees: 'J5, DCOM, CoS',
    },
    {
        time: '16:30Z',
        title: 'CoA Wargame: OP Iron Shield',
        status: 'SCHEDULED' as const,
        attendees: 'J5, J2, J3, J4, Fires',
    },
    {
        time: '20:00Z',
        title: 'Strategic Assessment Update',
        status: 'SCHEDULED' as const,
        attendees: 'J5, J2, STRATCOM',
    },
];

const strategicGuidance = [
    { label: 'Commander\'s Intent', value: 'Deny enemy freedom of movement in AO North', updated: '48h ago' },
    { label: 'Main Effort', value: 'Isolate enemy C2 nodes, Phase 2 transition', updated: '24h ago' },
    { label: 'End State', value: 'Enemy forces unable to project power beyond LOC Alpha', updated: '5 days ago' },
];

// -- Component --

function J5Dashboard() {
    const { currentRole } = useRoleContext();
    const canEdit = currentRole.capabilities.canEditPlans;
    const canEditAssumptions = currentRole.capabilities.canEditAssumptions;
    const canSubmit = currentRole.capabilities.canSubmitProposals;

    return (
        <div className="h-full overflow-y-auto bg-slate-950">
            <div className="max-w-[1800px] mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-black uppercase tracking-tight text-white">
                                J5 Plans Center
                            </h1>
                            {canEdit ? (
                                <span className="flex items-center gap-1 px-3 py-1 bg-green-950/30 border border-green-800 rounded-full text-xs font-bold text-green-400 uppercase">
                                    <Edit3 size={12} />
                                    Plans Officer
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-xs font-bold text-slate-400 uppercase">
                                    <Lock size={12} />
                                    Monitor Only
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-slate-400 mt-1">
                            Strategic Planning • Campaign Design • OPLAN Development
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-xs font-bold text-slate-500 uppercase">Campaign Phase</div>
                            <div className="text-lg font-black text-purple-400">PHASE 2</div>
                        </div>
                        <div className="h-12 w-px bg-slate-800"></div>
                        <div className="text-right">
                            <div className="text-xs font-bold text-slate-500 uppercase">Planning Horizon</div>
                            <div className="text-lg font-black text-cyan-400">D+45</div>
                        </div>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard
                        icon={ScrollText}
                        label="Active OPLANs"
                        value="3"
                        change="2 In Progress"
                        changeType="neutral"
                        color="purple"
                    />
                    <MetricCard
                        icon={Map}
                        label="Campaign Phase"
                        value="2 of 5"
                        change="Seize Initiative"
                        changeType="neutral"
                        color="blue"
                    />
                    <MetricCard
                        icon={Shield}
                        label="Assumptions Tracked"
                        value="14"
                        change="1 At Risk"
                        changeType="negative"
                        color="amber"
                    />
                    <MetricCard
                        icon={Target}
                        label="COAs Evaluated"
                        value="6"
                        change="+2 this week"
                        changeType="positive"
                        color="cyan"
                    />
                </div>

                {/* Campaign Phase Timeline */}
                <div className="bg-slate-900 border border-slate-800 rounded-lg">
                    <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="w-5 h-5 text-purple-400" />
                            <h2 className="font-black uppercase text-sm text-white tracking-tight">
                                Campaign Phase Timeline
                            </h2>
                        </div>
                        <span className="text-xs font-bold text-slate-500 uppercase">
                            Current: Phase 2 - Seize Initiative
                        </span>
                    </div>
                    <div className="p-6">
                        <div className="flex items-center gap-2">
                            {campaignPhases.map((phase, index) => (
                                <div key={phase.id} className="flex items-center flex-1">
                                    <div className="flex-1">
                                        <div
                                            className={`rounded-lg p-3 border transition-colors ${
                                                phase.status === 'ACTIVE'
                                                    ? 'bg-purple-950/50 border-purple-700 ring-1 ring-purple-500/30'
                                                    : phase.status === 'COMPLETED'
                                                      ? 'bg-green-950/30 border-green-900'
                                                      : 'bg-slate-800/50 border-slate-700'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span
                                                    className={`text-xs font-black uppercase ${
                                                        phase.status === 'ACTIVE'
                                                            ? 'text-purple-400'
                                                            : phase.status === 'COMPLETED'
                                                              ? 'text-green-400'
                                                              : 'text-slate-500'
                                                    }`}
                                                >
                                                    {phase.label}
                                                </span>
                                                {phase.status === 'COMPLETED' && (
                                                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                                                )}
                                                {phase.status === 'ACTIVE' && (
                                                    <Activity className="w-3 h-3 text-purple-400" />
                                                )}
                                            </div>
                                            <div
                                                className={`text-xs font-bold truncate ${
                                                    phase.status === 'ACTIVE'
                                                        ? 'text-white'
                                                        : phase.status === 'COMPLETED'
                                                          ? 'text-green-300'
                                                          : 'text-slate-500'
                                                }`}
                                            >
                                                {phase.name}
                                            </div>
                                        </div>
                                    </div>
                                    {index < campaignPhases.length - 1 && (
                                        <ArrowRight
                                            className={`w-4 h-4 mx-1 shrink-0 ${
                                                phase.status === 'COMPLETED'
                                                    ? 'text-green-700'
                                                    : 'text-slate-700'
                                            }`}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content - 2 columns */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* OPLAN Status */}
                        <div className="bg-slate-900 border border-slate-800 rounded-lg">
                            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <ScrollText className="w-5 h-5 text-purple-400" />
                                    <h2 className="font-black uppercase text-sm text-white tracking-tight">
                                        OPLAN Status
                                    </h2>
                                </div>
                                <span className="text-xs font-bold text-slate-500 uppercase">
                                    {oplans.length} Plans Tracked
                                </span>
                            </div>
                            <div className="p-6 space-y-3">
                                {oplans.map((oplan) => (
                                    <OPLANCard key={oplan.id} {...oplan} />
                                ))}
                            </div>
                        </div>

                        {/* Planning Assumptions */}
                        <div className="bg-slate-900 border border-slate-800 rounded-lg">
                            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                                    <h2 className="font-black uppercase text-sm text-white tracking-tight">
                                        Planning Assumptions
                                    </h2>
                                </div>
                                <Link
                                    to="/mshnctrl/assumptions"
                                    className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase"
                                >
                                    View All
                                </Link>
                            </div>
                            <div className="p-6 space-y-3">
                                {assumptions.map((assumption) => (
                                    <AssumptionCard key={assumption.id} {...assumption} />
                                ))}
                            </div>
                        </div>

                        {/* Strategic Guidance Summary */}
                        <div className="bg-slate-900 border border-slate-800 rounded-lg">
                            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Compass className="w-5 h-5 text-blue-400" />
                                    <h2 className="font-black uppercase text-sm text-white tracking-tight">
                                        Strategic Guidance
                                    </h2>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                {strategicGuidance.map((item, i) => (
                                    <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-black text-blue-400 uppercase">{item.label}</span>
                                            <span className="text-xs text-slate-500">Updated {item.updated}</span>
                                        </div>
                                        <p className="text-sm font-bold text-slate-300">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - 1 column */}
                    <div className="space-y-6">
                        {/* Planning Coordination */}
                        <div className="bg-slate-900 border border-slate-800 rounded-lg">
                            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-5 h-5 text-blue-400" />
                                    <h2 className="font-black uppercase text-sm text-white tracking-tight">
                                        Planning Coordination
                                    </h2>
                                </div>
                                <span className="text-xs font-bold text-slate-500 uppercase">
                                    {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </span>
                            </div>
                            <div className="p-6 space-y-3">
                                {planningEvents.map((event, i) => (
                                    <PlanningEventCard key={i} {...event} />
                                ))}
                            </div>
                        </div>

                        {/* Assumption Confidence Distribution */}
                        <div className="bg-slate-900 border border-slate-800 rounded-lg">
                            <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-3">
                                <Shield className="w-5 h-5 text-emerald-400" />
                                <h2 className="font-black uppercase text-sm text-white tracking-tight">
                                    Assumption Confidence
                                </h2>
                            </div>
                            <div className="p-6 space-y-3">
                                <ConfidenceBar label="High Confidence" count={8} total={14} color="green" />
                                <ConfidenceBar label="Medium Confidence" count={4} total={14} color="amber" />
                                <ConfidenceBar label="Low Confidence" count={2} total={14} color="red" />
                            </div>
                        </div>

                        {/* Pending Reviews */}
                        <div className="bg-slate-900 border border-slate-800 rounded-lg">
                            <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-3">
                                <FileText className="w-5 h-5 text-amber-400" />
                                <h2 className="font-black uppercase text-sm text-white tracking-tight">
                                    Pending Reviews
                                </h2>
                            </div>
                            <div className="p-6 space-y-3">
                                <ReviewItem
                                    title="OPLAN 2401 Annex C update"
                                    priority="HIGH"
                                    dueTime="Today"
                                />
                                <ReviewItem
                                    title="Phase 2 transition criteria assessment"
                                    priority="HIGH"
                                    dueTime="Tomorrow"
                                />
                                <ReviewItem
                                    title="COG analysis revision - AO South"
                                    priority="MEDIUM"
                                    dueTime="In 3 days"
                                />
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
                                    <QuickActionButton icon={Shield} label="New Assumption" to="/mshnctrl/assumptions" editable />
                                )}
                                {canEdit && (
                                    <QuickActionButton icon={ScrollText} label="Review OPLAN" to="/mshnctrl/oplan" editable />
                                )}
                                {canSubmit && (
                                    <QuickActionButton icon={Swords} label="Launch Wargame" to="/mshnctrl/coa-wargamer" editable />
                                )}
                                <QuickActionButton icon={Compass} label="CONOPS Builder" to="/mshnctrl/conops" />
                                <QuickActionButton icon={Activity} label="COG Analysis" to="/mshnctrl/cog" />
                                <QuickActionButton icon={Layers} label="Ontology Matrix" to="/mshnctrl/ontology" />
                                <QuickActionButton icon={Map} label="Campaign Design" to="/mshnctrl/campaign" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// -- Sub-components --

function MetricCard({ icon: Icon, label, value, change, changeType, color }: any) {
    const colorClasses: any = {
        purple: 'text-purple-400 bg-purple-950/50 border-purple-900',
        blue: 'text-blue-400 bg-blue-950/50 border-blue-900',
        amber: 'text-amber-400 bg-amber-950/50 border-amber-900',
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

function OPLANCard({ id, name, phase, status, owner, lastUpdated, progress }: any) {
    const statusColors: any = {
        DRAFT: 'bg-slate-800 text-slate-400 border-slate-700',
        REVIEW: 'bg-amber-950/50 text-amber-400 border-amber-900',
        APPROVED: 'bg-green-950/50 text-green-400 border-green-900',
    };

    const progressColors: any = {
        DRAFT: 'bg-slate-600',
        REVIEW: 'bg-amber-600',
        APPROVED: 'bg-green-600',
    };

    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-500">{id}</span>
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
                    <div
                        className={`h-full ${progressColors[status]} rounded-full`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Owner: {owner}</span>
                <span>Updated {lastUpdated}</span>
            </div>
        </div>
    );
}

function AssumptionCard({ id, title, confidence, status, lastReview }: any) {
    const confidenceColors: any = {
        HIGH: 'text-green-400',
        MEDIUM: 'text-amber-400',
        LOW: 'text-red-400',
    };

    const statusColors: any = {
        VALIDATED: 'bg-green-950/50 text-green-400 border-green-900',
        'AT RISK': 'bg-red-950/50 text-red-400 border-red-900',
        'UNDER REVIEW': 'bg-amber-950/50 text-amber-400 border-amber-900',
    };

    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors">
            <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-slate-500">{id}</span>
                        <span className={`text-xs px-2 py-0.5 rounded border font-bold uppercase ${statusColors[status]}`}>
                            {status}
                        </span>
                    </div>
                    <div className="text-sm font-bold text-slate-300">{title}</div>
                </div>
            </div>
            <div className="flex items-center justify-between text-xs">
                <div>
                    <span className="text-slate-500">Confidence: </span>
                    <span className={`font-bold ${confidenceColors[confidence]}`}>{confidence}</span>
                </div>
                <span className="text-slate-500">Reviewed {lastReview}</span>
            </div>
        </div>
    );
}

function PlanningEventCard({ time, title, status, attendees }: any) {
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

function ConfidenceBar({ label, count, total, color }: any) {
    const percentage = Math.round((count / total) * 100);
    const colorClasses: any = {
        green: 'bg-green-600',
        amber: 'bg-amber-600',
        red: 'bg-red-600',
    };

    const textColor: any = {
        green: 'text-green-400',
        amber: 'text-amber-400',
        red: 'text-red-400',
    };

    return (
        <div>
            <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">{label}</span>
                <span className={`font-bold ${textColor[color]}`}>{count} / {total}</span>
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

function ReviewItem({ title, priority, dueTime }: any) {
    const priorityColors: any = {
        HIGH: 'bg-orange-950/50 text-orange-400 border-orange-900',
        MEDIUM: 'bg-amber-950/50 text-amber-400 border-amber-900',
        LOW: 'bg-slate-800 text-slate-400 border-slate-700',
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
