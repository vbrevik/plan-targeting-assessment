import {
    Target,
    CheckCircle2,
    Clock,
    Activity,
    Zap,
    ShieldAlert
} from 'lucide-react';

interface CompactMetricsBarProps {
    metrics: {
        activeTargets: number;
        pendingApprovals: number;
        tstAlerts: number;
        isrPlatformsActive: number;
        strikePlatformsReady: number;
        highRiskTargets: number;
    };
    className?: string;
}

export function CompactMetricsBar({ metrics, className }: CompactMetricsBarProps) {
    return (
        <div className={`flex items-center gap-8 py-2 px-4 bg-slate-900/50 border border-slate-800 rounded-lg backdrop-blur-sm ${className}`}>
            <MetricItem
                icon={Target}
                label="Active"
                value={metrics.activeTargets}
                color="text-blue-400"
            />
            <div className="h-8 w-px bg-slate-800" />
            <MetricItem
                icon={CheckCircle2}
                label="Pending"
                value={metrics.pendingApprovals}
                color={metrics.pendingApprovals > 0 ? "text-amber-400" : "text-slate-400"}
            />
            <div className="h-8 w-px bg-slate-800" />
            <MetricItem
                icon={Clock}
                label="TST Alerts"
                value={metrics.tstAlerts}
                color={metrics.tstAlerts > 0 ? "text-red-400" : "text-green-400"}
                alert={metrics.tstAlerts > 0}
            />
            <div className="h-8 w-px bg-slate-800" />
            <MetricItem
                icon={Activity}
                label="ISR Active"
                value={metrics.isrPlatformsActive}
                color="text-cyan-400"
            />
            <div className="h-8 w-px bg-slate-800" />
            <MetricItem
                icon={Zap}
                label="Strike Ready"
                value={metrics.strikePlatformsReady}
                color="text-amber-400"
            />
            <div className="h-8 w-px bg-slate-800" />
            <MetricItem
                icon={ShieldAlert}
                label="High Risk"
                value={metrics.highRiskTargets}
                color={metrics.highRiskTargets > 0 ? "text-red-500" : "text-slate-400"}
            />
        </div>
    );
}

function MetricItem({
    icon: Icon,
    label,
    value,
    color,
    alert = false
}: {
    icon: any,
    label: string,
    value: number | string,
    color: string,
    alert?: boolean
}) {
    return (
        <div className="flex items-center gap-3 group cursor-default">
            <div className={`p-1.5 rounded-md ${alert ? 'bg-red-500/10 animate-pulse' : 'bg-slate-800/50'} group-hover:bg-slate-800 transition-colors`}>
                <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
                <span className={`text-lg font-black leading-none ${color}`}>{value}</span>
            </div>
        </div>
    );
}
