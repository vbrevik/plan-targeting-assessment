import { createFileRoute, Link } from '@tanstack/react-router';
import { Package, Truck, Factory, AlertTriangle, TrendingUp, Activity, Zap, Network, CheckCircle2, Clock } from 'lucide-react';

export const Route = createFileRoute('/mshnctrl/j4-dashboard')({
    component: J4Dashboard,
});

function J4Dashboard() {
    return (
        <div className="h-full overflow-y-auto bg-slate-950">
            <div className="max-w-[1800px] mx-auto p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight text-white">J4 Logistics Operations Center</h1>
                        <p className="text-sm text-slate-400 mt-1">Supply Management • Infrastructure • Distribution</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-xs font-bold text-slate-500 uppercase">Supply Status</div>
                            <div className="text-lg font-black text-amber-400">82%</div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard icon={Package} label="Supply Status" value="82%" change="Adequate" changeType="neutral" color="amber" />
                    <MetricCard icon={AlertTriangle} label="Critical Shortages" value="2" change="Fuel, Ammo" changeType="negative" color="red" />
                    <MetricCard icon={Truck} label="In-Transit" value="15" change="+3" changeType="neutral" color="blue" />
                    <MetricCard icon={Factory} label="Infrastructure Health" value="91%" change="+2%" changeType="positive" color="green" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-slate-900 border border-slate-800 rounded-lg">
                            <div className="px-6 py-4 border-b border-slate-800">
                                <h2 className="font-black uppercase text-sm text-white tracking-tight">Critical Supply Issues</h2>
                            </div>
                            <div className="p-6 space-y-3">
                                <SupplyItem name="Fuel (Class III)" level={68} status="CRITICAL" trend="Decreasing" />
                                <SupplyItem name="Ammunition (Class V)" level={72} status="LOW" trend="Stable" />
                                <SupplyItem name="Spare Parts (Class IX)" level={85} status="ADEQUATE" trend="Increasing" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="bg-slate-900 border border-slate-800 rounded-lg">
                            <div className="px-6 py-4 border-b border-slate-800">
                                <h2 className="font-black uppercase text-sm text-white tracking-tight">Quick Actions</h2>
                            </div>
                            <div className="p-6 space-y-2">
                                <QuickActionButton icon={Package} label="Request Resupply" to="/mshnctrl/logistics" />
                                <QuickActionButton icon={Network} label="Supply Chain" to="/mshnctrl/supply-chain" />
                                <QuickActionButton icon={Factory} label="Infrastructure" to="/mshnctrl/infrastructure" />
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
        red: 'text-red-400 bg-red-950/50 border-red-900',
        blue: 'text-blue-400 bg-blue-950/50 border-blue-900',
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

function SupplyItem({ name, level, status, trend }: any) {
    const statusColors: any = {
        CRITICAL: 'text-red-400',
        LOW: 'text-amber-400',
        ADEQUATE: 'text-green-400',
    };
    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex justify-between mb-2">
                <span className="text-sm font-bold text-white">{name}</span>
                <span className={`text-sm font-bold ${statusColors[status]}`}>{level}%</span>
            </div>
            <div className="flex justify-between text-xs">
                <span className="text-slate-500">Trend: {trend}</span>
                <span className={`font-bold ${statusColors[status]}`}>{status}</span>
            </div>
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
