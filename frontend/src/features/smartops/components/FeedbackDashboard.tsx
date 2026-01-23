import { useState } from 'react';
import {
    Activity,
    AlertTriangle,
    CheckCircle,
    ArrowRight,
    Clock,
    ArrowUpRight,
    CircleSlash,
    Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockFeedbackEvents } from '../services/feedbackService';
import { FEEDBACK_LABELS, FEEDBACK_COLORS, type FeedbackEvent, type FeedbackType } from '../types/feedback';

export function FeedbackDashboard() {
    const [events] = useState<FeedbackEvent[]>(mockFeedbackEvents);
    const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'RESOLVED'>('ALL');
    const [selectedType] = useState<FeedbackType | 'ALL'>('ALL');
    const [viewMode, setViewMode] = useState<'OVERVIEW' | 'VARIANCE'>('OVERVIEW');

    const filteredEvents = events.filter(e => {
        if (filter === 'OPEN' && e.status !== 'OPEN') return false;
        if (filter === 'RESOLVED' && e.status === 'OPEN') return false;
        if (selectedType !== 'ALL' && e.type !== selectedType) return false;
        return true;
    });

    const stats = {
        open: events.filter(e => e.status === 'OPEN').length,
        critical: events.filter(e => e.severity === 'CRITICAL' && e.status === 'OPEN').length,
        resolved: events.filter(e => e.status === 'RESOLVED').length,
    };

    return (
        <div className="flex h-full bg-[#020617] text-slate-200 overflow-hidden font-sans">
            {/* Sidebar - Metrics */}
            <div className="w-80 border-r border-slate-800 bg-slate-950/30 flex flex-col shrink-0">
                <div className="p-4 border-b border-slate-800 bg-slate-950">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loop Status</h3>
                </div>
                <div className="p-6 space-y-8 overflow-y-auto">
                    {/* Big Numbers */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <span className="text-2xl font-black text-white block">{stats.critical}</span>
                            <span className="text-[9px] font-black text-red-400 uppercase tracking-tight">Critical Breaches</span>
                        </div>
                        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                            <span className="text-2xl font-black text-white block">{stats.open}</span>
                            <span className="text-[9px] font-black text-blue-400 uppercase tracking-tight">Active Loops</span>
                        </div>
                    </div>

                    {/* Loop Health Indicators */}
                    <div className="space-y-4">
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block">System Health</span>
                        <div className="space-y-3">
                            {[
                                { label: 'Plan-Execute Variance', val: 88, status: 'Stable' },
                                { label: 'Effectiveness (A2P)', val: 62, status: 'Degraded' },
                                { label: 'Assumptions Valid', val: 95, status: 'Stable' },
                                { label: 'Data Quality', val: 45, status: 'Critical' },
                            ].map((metric, i) => (
                                <div
                                    key={i}
                                    onClick={() => metric.label === 'Plan-Execute Variance' && setViewMode('VARIANCE')}
                                    className={cn(
                                        "space-y-1 cursor-pointer hover:bg-slate-900/50 p-1 -m-1 rounded transition-colors group",
                                        viewMode === 'VARIANCE' && metric.label === 'Plan-Execute Variance' ? "bg-blue-900/20 ring-1 ring-blue-500/30" : ""
                                    )}>
                                    <div className="flex justify-between text-[10px] uppercase font-bold">
                                        <span className={cn(
                                            "transition-colors",
                                            metric.label === 'Plan-Execute Variance' ? "text-blue-400 group-hover:text-blue-300" : "text-slate-300"
                                        )}>{metric.label}</span>
                                        <span className={cn(
                                            metric.val > 90 ? "text-emerald-500" :
                                                metric.val > 70 ? "text-blue-500" :
                                                    metric.val > 50 ? "text-yellow-500" : "text-red-500"
                                        )}>{metric.val}%</span>
                                    </div>
                                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className={cn(
                                                "h-full rounded-full",
                                                metric.val > 90 ? "bg-emerald-500" :
                                                    metric.val > 70 ? "bg-blue-500" :
                                                        metric.val > 50 ? "bg-yellow-500" : "bg-red-500"
                                            )}
                                            style={{ width: `${metric.val}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#020617] relative overflow-hidden">
                {/* Header */}
                <div className="p-8 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md flex justify-between items-end">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Activity className="text-blue-500" size={20} />
                            <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Feedback Loops</h1>
                        </div>
                        <p className="text-xs text-slate-400 max-w-xl font-medium leading-relaxed">
                            Continuous improvement engine monitoring variances, effectiveness gaps, and lessons learned across the operational cycle.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg">
                            {(['ALL', 'OPEN', 'RESOLVED'] as const).map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={cn(
                                        "px-3 py-1.5 rounded text-[10px] font-black uppercase transition-all",
                                        filter === f ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"
                                    )}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                        <button className="h-full px-4 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                            <Search size={16} />
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8">
                    {viewMode === 'VARIANCE' ? (
                        <div className="max-w-5xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                                    <CircleSlash className="text-blue-500" />
                                    Variance Analysis: H+48 Assessment
                                </h2>
                                <button
                                    onClick={() => setViewMode('OVERVIEW')}
                                    className="text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-widest border border-slate-700 px-3 py-1 rounded hover:bg-slate-800 transition-colors">
                                    Return to Overview
                                </button>
                            </div>

                            {/* Variance Chart Mock */}
                            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6">
                                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6">Deviation from Baseline (Last 24h)</h3>
                                <div className="h-48 flex items-end gap-2 px-4 pb-2 border-b border-slate-800">
                                    {[10, 15, 8, 5, -5, -12, -20, -15, -5, 2, 8, 12, 18, 22, 25, 20, 15, 10, 5, 2, -2, -5, -8, -10].map((val, i) => (
                                        <div key={i} className="flex-1 group relative">
                                            <div
                                                className={cn(
                                                    "w-full rounded-t transition-all hover:opacity-80",
                                                    val > 0 ? "bg-red-500/50" : "bg-emerald-500/50"
                                                )}
                                                style={{ height: `${Math.abs(val) * 2}px`, marginBottom: val < 0 ? `-${Math.abs(val) * 2}px` : 0 }}
                                            />
                                            {/* Tooltip */}
                                            <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-950 border border-slate-700 text-[9px] font-mono text-white whitespace-nowrap rounded z-10 pointer-events-none">
                                                T+{i}h: {val > 0 ? `+${val}% Drift` : `${val}% Recovery`}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between mt-2 text-[9px] font-mono text-slate-600 uppercase">
                                    <span>H-24</span>
                                    <span>H-12</span>
                                    <span>Now</span>
                                </div>
                            </div>

                            {/* Specific Variance Events */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl">
                                    <h4 className="text-[11px] font-black text-red-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <ArrowUpRight size={14} /> Negative Variance (Risks)
                                    </h4>
                                    <div className="space-y-3">
                                        {[
                                            { id: 'V-102', title: "Logistics Drag", desc: "Fuel consumption 15% above rate for TF-ALPHA.", impact: "High" },
                                            { id: 'V-104', title: "Movement Delay", desc: "Cross-FLOT movement delayed 2h due to weather.", impact: "Med" }
                                        ].map(item => (
                                            <div key={item.id} className="p-3 bg-red-950/10 border border-red-500/10 rounded flex gap-3">
                                                <div className="text-[10px] font-mono text-red-500/50">{item.id}</div>
                                                <div>
                                                    <div className="text-[11px] font-bold text-slate-200">{item.title}</div>
                                                    <div className="text-[10px] text-slate-500 leading-tight mt-1">{item.desc}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl">
                                    <h4 className="text-[11px] font-black text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <CheckCircle size={14} /> Positive Variance (Opportunities)
                                    </h4>
                                    <div className="space-y-3">
                                        {[
                                            { id: 'V-109', title: "Effectiveness Spike", desc: "PsyOps campaign effectiveness +22% vs forecast.", impact: "High" },
                                            { id: 'V-111', title: "Early Arrival", desc: "Reserve element arrived at staging H-4.", impact: "Low" }
                                        ].map(item => (
                                            <div key={item.id} className="p-3 bg-emerald-950/10 border border-emerald-500/10 rounded flex gap-3">
                                                <div className="text-[10px] font-mono text-emerald-500/50">{item.id}</div>
                                                <div>
                                                    <div className="text-[11px] font-bold text-slate-200">{item.title}</div>
                                                    <div className="text-[10px] text-slate-500 leading-tight mt-1">{item.desc}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 max-w-5xl">
                            {filteredEvents.map(event => (
                                <div
                                    key={event.id}
                                    className={cn(
                                        "group relative overflow-hidden rounded-xl border bg-slate-900/40 p-1 transition-all hover:bg-slate-900/60",
                                        event.severity === 'CRITICAL' ? "border-red-500/30" : "border-slate-800 hover:border-slate-700"
                                    )}
                                >
                                    <div className="flex items-start gap-4 p-5">
                                        {/* Icon Box */}
                                        <div className={cn(
                                            "h-12 w-12 rounded-lg flex items-center justify-center shrink-0 border",
                                            FEEDBACK_COLORS[event.type]
                                        )}>
                                            {event.type === 'AV' ? <AlertTriangle size={20} /> :
                                                event.type === 'PEV' ? <CircleSlash size={20} /> :
                                                    event.type === 'BDA' ? <ArrowUpRight size={20} /> :
                                                        <Activity size={20} />}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className={cn(
                                                    "text-[9px] font-black uppercase px-2 py-0.5 rounded border",
                                                    FEEDBACK_COLORS[event.type]
                                                )}>
                                                    {FEEDBACK_LABELS[event.type]}
                                                </span>
                                                <span className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-2">
                                                    {event.source} <ArrowRight size={10} /> {event.target}
                                                </span>
                                                {event.status === 'RESOLVED' && (
                                                    <span className="ml-auto text-[10px] font-black text-emerald-500 uppercase flex items-center gap-1">
                                                        <CheckCircle size={12} /> Resolved
                                                    </span>
                                                )}
                                            </div>

                                            <h3 className="text-lg font-bold text-white mb-2">{event.title}</h3>
                                            <p className="text-sm text-slate-400 leading-relaxed mb-4">{event.description}</p>

                                            {event.recommendation && (
                                                <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded flex items-start gap-3 mb-4">
                                                    <div className="mt-0.5"><ArrowUpRight className="text-blue-500" size={14} /></div>
                                                    <div>
                                                        <span className="text-[9px] font-black text-blue-400 uppercase block mb-1">Recommended Action</span>
                                                        <p className="text-[11px] text-slate-300 font-medium">{event.recommendation}</p>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                                                <div className="flex gap-4">
                                                    {event.linkedEntities.map((entity, i) => (
                                                        <button key={i} className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase hover:text-blue-400 transition-colors">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                                                            {entity.type}: {entity.name}
                                                        </button>
                                                    ))}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-600">
                                                    <Clock size={12} />
                                                    <span>{event.timestamp.toLocaleTimeString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
