import { createFileRoute, Link } from '@tanstack/react-router';
import { Scale, Shield, FileText, AlertTriangle, CheckCircle2, Clock, Zap, Target } from 'lucide-react';

export const Route = createFileRoute('/mshnctrl/legad-dashboard')({
    component: LEGADDashboard,
});

function LEGADDashboard() {
    return (
        <div className="h-full overflow-y-auto bg-slate-950">
            <div className="max-w-[1800px] mx-auto p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight text-white">Legal Advisor Operations Center</h1>
                        <p className="text-sm text-slate-400 mt-1">Legal Reviews • ROE Compliance • Advisory Queue</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-xs font-bold text-slate-500 uppercase">Compliance Rate</div>
                            <div className="text-lg font-black text-green-400">97%</div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard icon={FileText} label="Pending Reviews" value="8" change="Active" changeType="neutral" color="amber" />
                    <MetricCard icon={Shield} label="ROE Queries" value="3" change="Open" changeType="neutral" color="blue" />
                    <MetricCard icon={AlertTriangle} label="Legal Holds" value="1" change="Critical" changeType="negative" color="red" />
                    <MetricCard icon={CheckCircle2} label="Compliance Rate" value="97%" change="+2%" changeType="positive" color="green" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-slate-900 border border-slate-800 rounded-lg">
                            <div className="px-6 py-4 border-b border-slate-800">
                                <h2 className="font-black uppercase text-sm text-white tracking-tight">Urgent Legal Reviews</h2>
                            </div>
                            <div className="p-6 space-y-3">
                                <ReviewItem title="Target T-2401: Dual-use facility" priority="HIGH" time="6h pending" />
                                <ReviewItem title="Strike package: Urban proximity" priority="HIGH" time="2h pending" />
                                <ReviewItem title="ROE interpretation: Self-defense" priority="MEDIUM" time="4h pending" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="bg-slate-900 border border-slate-800 rounded-lg">
                            <div className="px-6 py-4 border-b border-slate-800">
                                <h2 className="font-black uppercase text-sm text-white tracking-tight">Quick Actions</h2>
                            </div>
                            <div className="p-6 space-y-2">
                                <QuickActionButton icon={Scale} label="Advisory Queue" to="/mshnctrl/advisory" />
                                <QuickActionButton icon={Shield} label="ROE Manager" to="/mshnctrl/roe" />
                                <QuickActionButton icon={Target} label="Targeting Review" to="/mshnctrl/targeting" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ icon: Icon, label, value, change, changeType, color }: any) {
    const colorClasses: any = {
        amber: 'text-amber-400 bg-amber-950/50 border-amber-900',
        blue: 'text-blue-400 bg-blue-950/50 border-blue-900',
        red: 'text-red-400 bg-red-950/50 border-red-900',
        green: 'text-green-400 bg-green-950/50 border-green-900',
    };
    return (
        <div className={`bg-slate-900 border rounded-lg p-5 ${colorClasses[color]}`}>
            <div className="flex items-center justify-between mb-3">
                <Icon className="w-6 h-6" />
                <span className="text-sm font-bold text-slate-400">{change}</span>
            </div>
            <div className="text-3xl font-black mb-1">{value}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-tight">{label}</div>
        </div>
    );
}

function ReviewItem({ title, priority, time }: any) {
    const priorityColors: any = {
        HIGH: 'text-red-400',
        MEDIUM: 'text-amber-400',
    };
    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex justify-between mb-2">
                <span className="text-sm font-bold text-white">{title}</span>
                <span className={`text-xs font-bold ${priorityColors[priority]}`}>{priority}</span>
            </div>
            <div className="text-xs text-slate-500">{time}</div>
        </div>
    );
}

function QuickActionButton({ icon: Icon, label, to }: any) {
    return (
        <Link to={to} className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-blue-600 hover:bg-blue-950/20 transition-colors group">
            <Icon className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
            <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">{label}</span>
        </Link>
    );
}
