import {
    ShieldAlert,
    Eye,
    Search,
    User,
    FileWarning,
    Lock,
    Network,
    Activity,
    AlertTriangle,
    CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function InsiderThreatDashboard() {
    const alerts = [
        { id: '1', level: 'CRITICAL', user: 'V. Brevik', role: 'System Admin', action: 'Mass Export Attempt', time: '2m ago' },
        { id: '2', level: 'MED', user: 'J. Doe', role: 'Ops Officer', action: 'Unusual Login Location', time: '14m ago' },
        { id: '3', level: 'LOW', user: 'S. Smith', role: 'Analyst', action: 'Accessing Restricted ROE', time: '1h ago' },
    ];

    return (
        <div className="flex h-full bg-[#020617] text-slate-200 font-sans overflow-hidden">
            {/* Sidebar - Risk Profiles */}
            <div className="w-80 border-r border-slate-800 bg-slate-950/30 flex flex-col shrink-0">
                <div className="p-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Security Watchlist</h3>
                    <Search size={14} className="text-slate-600" />
                </div>
                <div className="p-4 space-y-3 overflow-y-auto">
                    {[
                        { name: 'Personnel Risk Score', val: 'Low', color: 'text-emerald-500' },
                        { name: 'Data Leakage Score', val: 'Stable', color: 'text-blue-400' },
                        { name: 'Auth Anomaly Rate', val: '2.1%', color: 'text-yellow-500' },
                    ].map((stat, i) => (
                        <div key={i} className="p-4 bg-slate-900/40 border border-slate-800 rounded-lg">
                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-1">{stat.name}</span>
                            <span className={cn("text-lg font-black uppercase", stat.color)}>{stat.val}</span>
                        </div>
                    ))}

                    <div className="pt-4 border-t border-slate-800/50 mt-4">
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-4">Active Canary Tokens</span>
                        <div className="space-y-2">
                            {[
                                { label: 'Doc: OPLAN-DELTA.pdf', status: 'UNTOUCHED' },
                                { label: 'DB: TARGET-LIST-INTERNAL', status: 'UNTOUCHED' },
                            ].map((token, i) => (
                                <div key={i} className="px-3 py-2 bg-slate-950 border border-slate-900 rounded flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-400 truncate">{token.label}</span>
                                    <div className="flex items-center gap-1.5 text-[8px] font-black text-emerald-500 uppercase">
                                        <CheckCircle size={10} /> {token.status}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Overwatch Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#020617] relative overflow-hidden">
                {/* Header */}
                <div className="p-8 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md flex justify-between items-end">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <ShieldAlert className="text-red-500" size={20} />
                            <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Insider Threat / Counter-Intel</h1>
                        </div>
                        <p className="text-xs text-slate-400 max-w-xl font-medium leading-relaxed">
                            Continuous monitoring of privileged user behavior and data access patterns.
                            Automated detection of malicious activities via UBA and honeypots.
                        </p>
                    </div>
                    <div className="px-5 py-2 bg-red-600/10 border border-red-500/30 rounded flex items-center gap-3">
                        <Activity className="text-red-500 animate-pulse" size={16} />
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Global Security State: ENHANCED</span>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    {/* Active Security Incidents */}
                    <div className="space-y-4">
                        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                            <AlertTriangle size={14} className="text-red-500" /> Active Behavioral Anomaly Log
                        </h2>
                        <div className="space-y-3">
                            {alerts.map(alert => (
                                <div key={alert.id} className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center gap-6 group hover:border-red-500/30 transition-all">
                                    <div className={cn(
                                        "w-12 h-12 rounded-lg flex items-center justify-center shrink-0 border",
                                        alert.level === 'CRITICAL' ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-slate-800 border-slate-700 text-slate-500"
                                    )}>
                                        <ShieldAlert size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-[13px] font-black text-white uppercase tracking-tight">{alert.action}</span>
                                            <span className="text-[9px] font-mono text-slate-500">{alert.time}</span>
                                        </div>
                                        <div className="flex gap-4">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5"><User size={12} /> {alert.user}</span>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase">{alert.role}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black uppercase rounded transition-all">Review Audit</button>
                                        <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase rounded shadow-lg shadow-red-900/20 transition-all">LOCK ACCOUNT</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Behavior Map */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Information Access Graph */}
                        <div className="space-y-4">
                            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                                <Network size={14} className="text-blue-500" /> Information Proximity Map
                            </h2>
                            <div className="aspect-video bg-slate-950 border border-slate-800 rounded-xl relative flex items-center justify-center overflow-hidden">
                                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,#3b82f6_0%,transparent_70%)]" />
                                <div className="z-10 text-center space-y-4">
                                    <Activity className="text-blue-600 mx-auto" size={48} />
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">UBA Relationship Graph<br />Initializing Cluster Analysis...</span>
                                </div>
                                {/* Mock Nodes */}
                                <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                                <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-blue-500 rounded-full" />
                                <div className="absolute bottom-1/4 left-1/2 w-2 h-2 bg-emerald-500 rounded-full" />
                            </div>
                        </div>

                        {/* Recent Access History */}
                        <div className="space-y-4">
                            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                                <Eye size={14} className="text-slate-500" /> Real-time Audit Stream
                            </h2>
                            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl divide-y divide-slate-800/50 h-[320px] overflow-hidden">
                                {[
                                    { time: '20:44:12', user: 'SYSTEM', msg: 'Watermark-Delta inserted into EXPORT-A1' },
                                    { time: '20:44:08', user: 'LEGAD', msg: 'Authorized access to ROE-99 (Approved)' },
                                    { time: '20:43:55', user: 'OPS-CO', msg: 'Clipboard scrub pulse: 0 leaks detected' },
                                    { time: '20:43:40', user: 'ADMIN', msg: 'Login from verified subnet (Brussels-H)' },
                                    { time: '20:43:12', user: 'OPS-2', msg: 'Targeting module data retrieval' },
                                ].map((log, i) => (
                                    <div key={i} className="py-2.5 flex items-center gap-4 group">
                                        <span className="text-[10px] font-mono text-slate-600 shrink-0">{log.time}</span>
                                        <span className="text-[9px] font-black text-blue-500/70 w-20 shrink-0 uppercase">{log.user}</span>
                                        <span className="text-[10px] font-bold text-slate-400 group-hover:text-white transition-colors uppercase tracking-tight">{log.msg}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Bar */}
                <div className="h-12 border-t border-slate-800 bg-slate-950 px-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Lock size={12} className="text-slate-600" />
                            <span className="text-[10px] font-mono text-slate-600 uppercase">Need-to-Know Enforced</span>
                        </div>
                        <div className="h-3 w-px bg-slate-800" />
                        <div className="flex items-center gap-2">
                            <FileWarning size={12} className="text-slate-600" />
                            <span className="text-[10px] font-mono text-slate-600 uppercase">Honeyfile status: ACTIVE</span>
                        </div>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authorized Overwatch // SECURITY-DIR</span>
                </div>
            </div>
        </div>
    );
}
