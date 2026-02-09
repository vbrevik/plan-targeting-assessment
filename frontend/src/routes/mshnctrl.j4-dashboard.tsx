import { createFileRoute, Link } from '@tanstack/react-router';
import { useRoleContext } from '@/lib/mshnctrl/hooks/useRoleContext';
import {
    Package,
    Truck,
    AlertTriangle,
    Fuel,
    Wrench,
    Shield,
    Clock,
    Zap,
    FileText,
    Factory,
    Network,
    Lock,
    Edit3,
    Plus,
    ClipboardList,
    Pill,
    Boxes,
    CircleDot,
} from 'lucide-react';

export const Route = createFileRoute('/mshnctrl/j4-dashboard')({
    component: J4Dashboard,
});

// --- Mock Data ---

const supplyCategories = [
    { name: 'Ammunition (Class V)', level: 72, status: 'Warning' as const, trend: -3, icon: CircleDot },
    { name: 'Fuel (Class III)', level: 85, status: 'Optimal' as const, trend: +2, icon: Fuel },
    { name: 'Rations (Class I)', level: 91, status: 'Optimal' as const, trend: 0, icon: Boxes },
    { name: 'Medical (Class VIII)', level: 64, status: 'Warning' as const, trend: -5, icon: Pill },
    { name: 'Spare Parts (Class IX)', level: 48, status: 'Critical' as const, trend: -8, icon: Wrench },
];

const equipmentReadiness = [
    { type: 'Main Battle Tanks', total: 24, operational: 20, maintenance: 3, deadlined: 1, readiness: 83 },
    { type: 'APCs/IFVs', total: 48, operational: 42, maintenance: 4, deadlined: 2, readiness: 88 },
    { type: 'Artillery Systems', total: 18, operational: 16, maintenance: 2, deadlined: 0, readiness: 89 },
    { type: 'Logistics Vehicles', total: 64, operational: 52, maintenance: 8, deadlined: 4, readiness: 81 },
    { type: 'Rotary Wing', total: 12, operational: 9, maintenance: 2, deadlined: 1, readiness: 75 },
    { type: 'UAV Systems', total: 8, operational: 7, maintenance: 1, deadlined: 0, readiness: 88 },
];

const criticalAlerts = [
    { id: 'LOG-001', message: 'Class IX spare parts below minimum sustaining rate for 3rd BDE', severity: 'CRITICAL' as const, time: '35 min ago', category: 'Supply' },
    { id: 'LOG-002', message: 'Convoy ECHO-7 delayed at MSR ALPHA checkpoint - route compromise suspected', severity: 'CRITICAL' as const, time: '1h ago', category: 'Movement' },
    { id: 'LOG-003', message: 'Medical resupply request overdue for FOB Sentinel (Class VIII)', severity: 'HIGH' as const, time: '2h ago', category: 'Supply' },
    { id: 'LOG-004', message: 'Fuel consumption rate exceeding forecast by 18% in AO North', severity: 'HIGH' as const, time: '3h ago', category: 'Sustainment' },
    { id: 'LOG-005', message: '2x Logistics vehicles deadlined - awaiting Class IX parts', severity: 'MEDIUM' as const, time: '4h ago', category: 'Maintenance' },
];

const recentActivity = [
    { time: '20 min ago', text: 'Supply request SR-4412 approved: Class V resupply for 1st BN' },
    { time: '45 min ago', text: 'Convoy DELTA-3 arrived at Distribution Point BRAVO' },
    { time: '1h ago', text: 'Equipment status updated: 2x MBTs returned to operational' },
    { time: '2h ago', text: 'Emergency Class VIII push to FOB Sentinel initiated' },
    { time: '3h ago', text: 'Route assessment completed: MSR CHARLIE rated GREEN' },
    { time: '4h ago', text: 'Weekly sustainment forecast submitted to JFC' },
    { time: '5h ago', text: 'Convoy ECHO-7 departed from LSA WARRIOR' },
];

const activeConvoys = [
    { id: 'DELTA-3', route: 'MSR BRAVO', status: 'ARRIVED', progress: 100, destination: 'DP BRAVO' },
    { id: 'ECHO-7', route: 'MSR ALPHA', status: 'DELAYED', progress: 62, destination: 'FOB Sentinel' },
    { id: 'FOXTROT-2', route: 'MSR CHARLIE', status: 'EN ROUTE', progress: 45, destination: 'BSA NORTH' },
    { id: 'GOLF-1', route: 'ASR DELTA', status: 'STAGING', progress: 0, destination: 'FOB Liberty' },
];

function J4Dashboard() {
    const { currentRole } = useRoleContext();
    const canEdit = currentRole.capabilities.canEditLogistics;
    const canRequest = currentRole.capabilities.canRequestSupply;

    const overallReadiness = Math.round(
        supplyCategories.reduce((sum, c) => sum + c.level, 0) / supplyCategories.length
    );

    const totalEquipment = equipmentReadiness.reduce((sum, e) => sum + e.total, 0);
    const totalOperational = equipmentReadiness.reduce((sum, e) => sum + e.operational, 0);
    const equipmentAvailability = Math.round((totalOperational / totalEquipment) * 100);

    return (
        <div className="h-full overflow-y-auto bg-slate-950">
            <div className="max-w-[1800px] mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-black uppercase tracking-tight text-white">
                                J4 Logistics Operations Center
                            </h1>
                            {canEdit ? (
                                <span className="flex items-center gap-1 px-3 py-1 bg-green-950/30 border border-green-800 rounded-full text-xs font-bold text-green-400 uppercase">
                                    <Edit3 size={12} />
                                    Logistics Manager
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-xs font-bold text-slate-400 uppercase">
                                    <Lock size={12} />
                                    Monitor Only
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-slate-400 mt-1">
                            Supply Chain Management • Equipment Readiness • Sustainment Operations
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-xs font-bold text-slate-500 uppercase">Supply Readiness</div>
                            <div className={`text-lg font-black ${overallReadiness >= 80 ? 'text-green-400' : overallReadiness >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                                {overallReadiness}%
                            </div>
                        </div>
                        <div className="h-12 w-px bg-slate-800"></div>
                        <div className="text-right">
                            <div className="text-xs font-bold text-slate-500 uppercase">Equipment Available</div>
                            <div className={`text-lg font-black ${equipmentAvailability >= 85 ? 'text-green-400' : equipmentAvailability >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
                                {equipmentAvailability}%
                            </div>
                        </div>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard
                        icon={Package}
                        label="Supply Readiness"
                        value={`${overallReadiness}%`}
                        change={overallReadiness >= 80 ? 'Adequate' : 'Degraded'}
                        changeType={overallReadiness >= 80 ? 'positive' : 'negative'}
                        color="green"
                    />
                    <MetricCard
                        icon={Wrench}
                        label="Equipment Availability"
                        value={`${equipmentAvailability}%`}
                        change={`${totalOperational}/${totalEquipment}`}
                        changeType={equipmentAvailability >= 85 ? 'positive' : 'neutral'}
                        color="blue"
                    />
                    <MetricCard
                        icon={Truck}
                        label="Active Convoys"
                        value={activeConvoys.filter(c => c.status !== 'ARRIVED').length.toString()}
                        change={`${activeConvoys.length} total`}
                        changeType="neutral"
                        color="cyan"
                    />
                    <MetricCard
                        icon={AlertTriangle}
                        label="Pending Requests"
                        value="14"
                        change="3 urgent"
                        changeType="negative"
                        color="amber"
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content - 2 columns */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Supply Status Breakdown */}
                        <div className="bg-slate-900 border border-slate-800 rounded-lg">
                            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Package className="w-5 h-5 text-green-400" />
                                    <h2 className="font-black uppercase text-sm text-white tracking-tight">
                                        Supply Status by Category
                                    </h2>
                                </div>
                                <span className="text-xs font-bold text-slate-500 uppercase">
                                    As of {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}Z
                                </span>
                            </div>
                            <div className="p-6 space-y-4">
                                {supplyCategories.map((cat) => (
                                    <SupplyBar
                                        key={cat.name}
                                        icon={cat.icon}
                                        label={cat.name}
                                        level={cat.level}
                                        status={cat.status}
                                        trend={cat.trend}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Equipment Readiness Grid */}
                        <div className="bg-slate-900 border border-slate-800 rounded-lg">
                            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Shield className="w-5 h-5 text-blue-400" />
                                    <h2 className="font-black uppercase text-sm text-white tracking-tight">
                                        Equipment Readiness Status
                                    </h2>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-xs text-slate-500 uppercase font-bold border-b border-slate-800">
                                                <th className="text-left pb-3 pr-4">Equipment Type</th>
                                                <th className="text-center pb-3 px-2">Total</th>
                                                <th className="text-center pb-3 px-2">
                                                    <span className="text-green-400">Oper.</span>
                                                </th>
                                                <th className="text-center pb-3 px-2">
                                                    <span className="text-amber-400">Maint.</span>
                                                </th>
                                                <th className="text-center pb-3 px-2">
                                                    <span className="text-red-400">Dead.</span>
                                                </th>
                                                <th className="text-right pb-3 pl-4">Readiness</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/50">
                                            {equipmentReadiness.map((eq) => (
                                                <tr key={eq.type} className="hover:bg-slate-800/30 transition-colors">
                                                    <td className="py-3 pr-4 font-bold text-slate-300">{eq.type}</td>
                                                    <td className="py-3 px-2 text-center text-slate-400">{eq.total}</td>
                                                    <td className="py-3 px-2 text-center text-green-400 font-bold">{eq.operational}</td>
                                                    <td className="py-3 px-2 text-center text-amber-400 font-bold">{eq.maintenance}</td>
                                                    <td className="py-3 px-2 text-center text-red-400 font-bold">{eq.deadlined}</td>
                                                    <td className="py-3 pl-4 text-right">
                                                        <ReadinessIndicator value={eq.readiness} />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Active Convoys */}
                        <div className="bg-slate-900 border border-slate-800 rounded-lg">
                            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Truck className="w-5 h-5 text-cyan-400" />
                                    <h2 className="font-black uppercase text-sm text-white tracking-tight">
                                        Active Convoys
                                    </h2>
                                </div>
                            </div>
                            <div className="p-6 space-y-3">
                                {activeConvoys.map((convoy) => (
                                    <ConvoyCard key={convoy.id} {...convoy} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - 1 column */}
                    <div className="space-y-6">
                        {/* Critical Alerts */}
                        <div className="bg-slate-900 border border-slate-800 rounded-lg">
                            <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-3">
                                <AlertTriangle className="w-5 h-5 text-red-400" />
                                <h2 className="font-black uppercase text-sm text-white tracking-tight">
                                    Critical Alerts
                                </h2>
                            </div>
                            <div className="p-6 space-y-3">
                                {criticalAlerts.map((alert) => (
                                    <AlertCard key={alert.id} {...alert} />
                                ))}
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
                                {recentActivity.map((item, i) => (
                                    <ActivityItem key={i} time={item.time} text={item.text} />
                                ))}
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
                                {canRequest && (
                                    <QuickActionButton icon={Plus} label="New Supply Request" to="/mshnctrl/logistics" editable />
                                )}
                                {canEdit && (
                                    <QuickActionButton icon={ClipboardList} label="Equipment Report" to="/mshnctrl/logistics" editable />
                                )}
                                <QuickActionButton icon={Truck} label="Convoy Status" to="/mshnctrl/logistics" />
                                <QuickActionButton icon={Package} label="Supply Status" to="/mshnctrl/logistics" />
                                <QuickActionButton icon={Factory} label="Critical Infrastructure" to="/mshnctrl/infrastructure" />
                                <QuickActionButton icon={Network} label="Supply Network" to="/mshnctrl/supply-chain" />
                                <QuickActionButton icon={FileText} label="View Proposals" to="/mshnctrl/proposals" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Sub-Components ---

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

function SupplyBar({ icon: Icon, label, level, status, trend }: any) {
    const barColor = status === 'Critical' ? 'bg-red-600' : status === 'Warning' ? 'bg-amber-600' : 'bg-green-600';
    const textColor = status === 'Critical' ? 'text-red-400' : status === 'Warning' ? 'text-amber-400' : 'text-green-400';
    const statusBg = status === 'Critical'
        ? 'bg-red-950/50 text-red-400 border-red-900'
        : status === 'Warning'
            ? 'bg-amber-950/50 text-amber-400 border-amber-900'
            : 'bg-green-950/50 text-green-400 border-green-900';

    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${textColor}`} />
                    <span className="text-sm font-bold text-slate-300">{label}</span>
                </div>
                <div className="flex items-center gap-2">
                    {trend !== 0 && (
                        <span className={`text-xs font-bold ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {trend > 0 ? '+' : ''}{trend}%
                        </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded border font-bold uppercase ${statusBg}`}>
                        {status}
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${level}%` }} />
                </div>
                <span className={`text-sm font-black ${textColor} w-12 text-right`}>{level}%</span>
            </div>
        </div>
    );
}

function ReadinessIndicator({ value }: { value: number }) {
    const color = value >= 85 ? 'text-green-400' : value >= 70 ? 'text-amber-400' : 'text-red-400';
    const bgColor = value >= 85 ? 'bg-green-600' : value >= 70 ? 'bg-amber-600' : 'bg-red-600';

    return (
        <div className="flex items-center gap-2 justify-end">
            <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full ${bgColor} rounded-full`} style={{ width: `${value}%` }} />
            </div>
            <span className={`font-black text-sm ${color}`}>{value}%</span>
        </div>
    );
}

function ConvoyCard({ id, route, status, progress, destination }: any) {
    const statusColors: any = {
        'EN ROUTE': 'bg-blue-950/50 text-blue-400 border-blue-900',
        DELAYED: 'bg-red-950/50 text-red-400 border-red-900',
        ARRIVED: 'bg-green-950/50 text-green-400 border-green-900',
        STAGING: 'bg-slate-800 text-slate-400 border-slate-700',
    };

    const progressColor: any = {
        'EN ROUTE': 'bg-blue-600',
        DELAYED: 'bg-red-600',
        ARRIVED: 'bg-green-600',
        STAGING: 'bg-slate-600',
    };

    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-black text-white">Convoy {id}</span>
                    <span className={`text-xs px-2 py-0.5 rounded border font-bold uppercase ${statusColors[status]}`}>
                        {status}
                    </span>
                </div>
            </div>
            <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-400">Route: <span className="text-slate-300 font-bold">{route}</span></span>
                <span className="text-slate-400">Dest: <span className="text-slate-300 font-bold">{destination}</span></span>
            </div>
            {status !== 'STAGING' && (
                <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500">Progress</span>
                        <span className="font-bold text-slate-300">{progress}%</span>
                    </div>
                    <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                        <div className={`h-full ${progressColor[status]} rounded-full`} style={{ width: `${progress}%` }} />
                    </div>
                </div>
            )}
        </div>
    );
}

function AlertCard({ id, message, severity, time, category }: any) {
    const severityColors: any = {
        CRITICAL: 'bg-red-950/50 text-red-400 border-red-900',
        HIGH: 'bg-orange-950/50 text-orange-400 border-orange-900',
        MEDIUM: 'bg-amber-950/50 text-amber-400 border-amber-900',
    };

    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-500">{id}</span>
                    <span className={`text-xs px-2 py-0.5 rounded border font-bold uppercase ${severityColors[severity]}`}>
                        {severity}
                    </span>
                </div>
                <span className="text-xs text-slate-500 shrink-0">{time}</span>
            </div>
            <div className="text-sm font-bold text-slate-300 mb-2">{message}</div>
            <div className="text-xs text-slate-500">{category}</div>
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
