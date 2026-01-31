import { createFileRoute, Link } from '@tanstack/react-router';
import { useRoleContext } from '@/lib/mshnctrl/hooks/useRoleContext';
import { Clipboard, CheckCircle2, Clock, FileText, Target, Users, Globe, Activity, Lock, Eye } from 'lucide-react';

export const Route = createFileRoute('/mshnctrl/analyst-dashboard')({
    component: AnalystDashboard,
});

function AnalystDashboard() {
    const { currentRole } = useRoleContext();
    
    return (
        <div className="h-full overflow-y-auto bg-slate-950">
            <div className="max-w-[1800px] mx-auto p-6 space-y-6">
                {/* Read-Only Notice Banner */}
                <div className="bg-blue-950/20 border border-blue-900/50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                        <Eye className="w-5 h-5 text-blue-400" />
                        <div className="flex-1">
                            <div className="font-black text-blue-400 uppercase text-sm">Analyst Access Level</div>
                            <div className="text-slate-300 text-sm mt-1">
                                Limited to assigned tasks and read-only views • Contact J2 for additional access
                            </div>
                        </div>
                        <span className="flex items-center gap-1 px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-xs font-bold text-slate-400 uppercase shrink-0">
                            <Lock size={12} />
                            Read Only
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight text-white">Intelligence Analyst Workspace</h1>
                        <p className="text-sm text-slate-400 mt-1">Task Management • Analysis • Reporting</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-xs font-bold text-slate-500 uppercase">Tasks Due Today</div>
                            <div className="text-lg font-black text-amber-400">3</div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard icon={Clipboard} label="Assigned Tasks" value="5" change="Active" changeType="neutral" color="blue" />
                    <MetricCard icon={CheckCircle2} label="Completed Today" value="3" change="+3" changeType="positive" color="green" />
                    <MetricCard icon={FileText} label="Pending RFIs" value="2" change="Assigned" changeType="neutral" color="amber" />
                    <MetricCard icon={Activity} label="Reports This Week" value="12" change="+4" changeType="positive" color="cyan" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-slate-900 border border-slate-800 rounded-lg">
                            <div className="px-6 py-4 border-b border-slate-800">
                                <h2 className="font-black uppercase text-sm text-white tracking-tight">My Assigned Tasks</h2>
                            </div>
                            <div className="p-6 space-y-3">
                                <TaskItem title="Analyze SIGINT intercepts" priority="HIGH" dueTime="Due in 4h" />
                                <TaskItem title="Update enemy ORBAT" priority="HIGH" dueTime="Due today" />
                                <TaskItem title="RFI-2401 research" priority="MEDIUM" dueTime="Due today" />
                                <TaskItem title="Track analysis for RAP" priority="LOW" dueTime="Due tomorrow" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="bg-slate-900 border border-slate-800 rounded-lg">
                            <div className="px-6 py-4 border-b border-slate-800">
                                <h2 className="font-black uppercase text-sm text-white tracking-tight">My Workspace</h2>
                            </div>
                            <div className="p-6 space-y-3">
                                <WorkspaceStat label="Tasks" value="5 open" />
                                <WorkspaceStat label="RFIs" value="2 assigned" />
                                <WorkspaceStat label="Reports" value="3 drafts" />
                            </div>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 rounded-lg">
                            <div className="px-6 py-4 border-b border-slate-800">
                                <h2 className="font-black uppercase text-sm text-white tracking-tight">Quick Actions</h2>
                            </div>
                            <div className="p-6 space-y-2">
                                <QuickActionButton icon={FileText} label="Submit Report" to="/mshnctrl/rfis" />
                                <QuickActionButton icon={Target} label="Update Track" to="/mshnctrl/rxp" />
                                <QuickActionButton icon={Globe} label="View COP" to="/mshnctrl/cop-summary" />
                                <QuickActionButton icon={Users} label="View ORBAT" to="/mshnctrl/orbat" />
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
        blue: 'text-blue-400 bg-blue-950/50 border-blue-900',
        green: 'text-green-400 bg-green-950/50 border-green-900',
        amber: 'text-amber-400 bg-amber-950/50 border-amber-900',
        cyan: 'text-cyan-400 bg-cyan-950/50 border-cyan-900',
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

function TaskItem({ title, priority, dueTime }: any) {
    const priorityColors: any = {
        HIGH: 'text-red-400',
        MEDIUM: 'text-amber-400',
        LOW: 'text-slate-400',
    };
    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex justify-between mb-2">
                <span className="text-sm font-bold text-white">{title}</span>
                <span className={`text-xs font-bold ${priorityColors[priority]}`}>{priority}</span>
            </div>
            <div className="text-xs text-slate-500">{dueTime}</div>
        </div>
    );
}

function WorkspaceStat({ label, value }: any) {
    return (
        <div className="flex justify-between">
            <span className="text-sm text-slate-400">{label}</span>
            <span className="text-sm font-bold text-slate-300">{value}</span>
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
