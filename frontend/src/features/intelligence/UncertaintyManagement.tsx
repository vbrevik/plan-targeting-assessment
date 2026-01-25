import { useEffect, useState } from 'react';
import {
    AlertCircle,
    HelpCircle,
    BarChart3,
    History,
    Layers,
    ShieldCheck,
    AlertTriangle,
    Target as TargetIcon,
    Shield,
    ArrowRight,
    Eye,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SmartOpsService } from '@/lib/smartops/mock-service';
import type { BaseEntity, Unit, Target } from '@/lib/smartops/types';
import { assumptionsApi, type Assumption } from '@/lib/assumptions';
import { Link } from '@tanstack/react-router';

interface ScoredEntity extends BaseEntity {
    confidenceScore: number; // 0-100
    riskLevel: 'Low' | 'Medium' | 'High';
    qualityIssues: string[];
}

export function UncertaintyManagement() {
    const [entities, setEntities] = useState<ScoredEntity[]>([]);
    const [globalConfidence, setGlobalConfidence] = useState(0);
    const [brokenAssumptions, setBrokenAssumptions] = useState<Assumption[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            const [units, targets, assumptions] = await Promise.all([
                SmartOpsService.getUnits(),
                SmartOpsService.getTargets(),
                assumptionsApi.getAll({ status: 'Broken' }).catch(() => [] as Assumption[])
            ]);

            const allEntities: (Unit | Target)[] = [...units, ...targets];

            const scored = allEntities.map(e => {
                const report = SmartOpsService.validateEntity(e);
                return {
                    ...e,
                    confidenceScore: report.score,
                    riskLevel: report.riskLevel,
                    qualityIssues: report.issues
                };
            });

            // Calculate global average
            const avg = scored.reduce((acc, curr) => acc + curr.confidenceScore, 0) / scored.length;

            setEntities(scored);
            setGlobalConfidence(avg);
            setBrokenAssumptions(assumptions);
            setLoading(false);
        }
        loadData();
    }, []);

    // Priority-based filtering
    const criticalEntities = entities.filter(e => e.confidenceScore < 60).sort((a, b) => a.confidenceScore - b.confidenceScore);
    const watchlist = entities.filter(e => e.confidenceScore < 80).sort((a, b) => a.confidenceScore - b.confidenceScore);
    const goodConfidenceEntities = entities.filter(e => e.confidenceScore >= 80);
    
    // Smart visibility: Only show detailed analysis if no critical issues
    const hasCriticalIssues = criticalEntities.length > 0 || brokenAssumptions.length > 0;
    const hasMinorIssues = watchlist.length > 0 && criticalEntities.length === 0;

    if (loading) return <div className="p-8 text-slate-500 animate-pulse font-mono text-[10px] uppercase">Calculating Confidence Matrices...</div>;

    return (
        <div className="flex h-full bg-[#020617] text-slate-200 overflow-hidden font-sans">
            {/* Sidebar - Priority-Based Confidence Metrics */}
            <div className="w-80 border-r border-slate-800 bg-slate-950/30 flex flex-col shrink-0">
                <div className="p-4 border-b border-slate-800 bg-slate-950">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {hasCriticalIssues ? '🚨 Critical Alert' : 'Quality Metrics'}
                    </h3>
                </div>
                <div className="p-6 space-y-8 overflow-y-auto">
                    {/* Critical Alert Badge */}
                    {hasCriticalIssues && (
                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="text-red-500 animate-pulse" size={16} />
                                <span className="text-[11px] font-black text-red-500 uppercase">Data Quality Alert</span>
                            </div>
                            <p className="text-[9px] text-slate-300 font-bold uppercase leading-relaxed">
                                {criticalEntities.length} critical confidence failure{criticalEntities.length > 1 ? 's' : ''} detected
                                {brokenAssumptions.length > 0 && ` + ${brokenAssumptions.length} broken assumption${brokenAssumptions.length > 1 ? 's' : ''}`}
                            </p>
                        </div>
                    )}
                    {/* Source Reliability (STANAG) */}
                    <div className="space-y-4">
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block">Global Source Reliability</span>
                        <div className="grid grid-cols-6 gap-1 h-2">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className={cn("rounded-sm", i <= 4 ? "bg-blue-500" : "bg-slate-800")} title={`Grade ${i}`} />
                            ))}
                        </div>
                        <div className="flex justify-between text-[10px] font-bold text-slate-400">
                            <span>RELIABLE (B)</span>
                            <span className="text-blue-400">72%</span>
                        </div>
                    </div>

                    {/* Data Freshness - Only show when no critical issues */}
                    {!hasCriticalIssues && (
                        <div className="space-y-4">
                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block">Temporal Currency</span>
                            <div className="space-y-3">
                                {[
                                    { label: 'IMINT (Sat)', age: '14m', health: 95 },
                                    { label: 'SIGINT (Radio)', age: '2m', health: 80 },
                                    { label: 'HUMINT (Field)', age: '6h', health: 30 },
                                ].map((item, i) => (
                                    <div key={i} className="space-y-1">
                                        <div className="flex justify-between text-[9px] uppercase font-bold">
                                            <span className="text-slate-300">{item.label}</span>
                                            <span className="text-slate-500">{item.age} ago</span>
                                        </div>
                                        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${item.health}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Distribution Map - Only show when no critical issues */}
                    {!hasCriticalIssues && (
                        <div className="pt-6 border-t border-slate-800/50">
                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-4">Uncertainty Hotspots</span>
                            <div className="aspect-square bg-slate-900 rounded-lg border border-slate-800 relative overflow-hidden flex items-center justify-center">
                                <Layers className="text-slate-800 absolute opacity-20" size={120} />
                                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-red-500/10" />
                                <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/40 animate-pulse absolute top-1/4 right-1/4" />
                                <div className="w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/20 absolute bottom-1/3 left-1/4" />
                                <span className="text-[8px] font-mono text-slate-500 uppercase z-10">Sector 4: High Ambiguity</span>
                            </div>
                        </div>
                    )}

                    {/* Related System */}
                    <div className="pt-6 border-t border-slate-800/50 space-y-4">
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block">Related System</span>
                        <Link
                            to="/smartops/assumptions"
                            className="flex items-center justify-between p-3 bg-slate-900/40 border border-slate-800 rounded hover:border-blue-500/40 transition-all group"
                        >
                            <div className="flex items-center gap-2">
                                <Shield size={14} className="text-blue-500" />
                                <span className="text-[10px] font-bold text-slate-300 uppercase">Planning Assumptions</span>
                            </div>
                            <ArrowRight size={12} className="text-slate-600 group-hover:text-blue-500 transition-colors" />
                        </Link>
                        {brokenAssumptions.length > 0 && (
                            <div className="px-3 py-2 bg-red-500/10 border border-red-500/30 rounded flex items-center gap-2">
                                <AlertCircle size={12} className="text-red-500" />
                                <span className="text-[9px] font-black text-red-500 uppercase">{brokenAssumptions.length} Broken</span>
                            </div>
                        )}
                    </div>

                    {/* System Health Indicator */}
                    {!hasCriticalIssues && !hasMinorIssues && (
                        <div className="pt-6 border-t border-slate-800/50">
                            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-center">
                                <CheckCircle2 className="text-emerald-500 mx-auto mb-2" size={20} />
                                <span className="text-[9px] font-black text-emerald-500 uppercase block">System Healthy</span>
                                <span className="text-[8px] text-slate-400 uppercase block mt-1">High Data Quality</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-950 relative overflow-hidden">
                {/* Header */}
                <div className="p-8 border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm z-10 flex justify-between items-end">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <BarChart3 className="text-blue-500" size={20} />
                            <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Information Quality & Uncertainty</h1>
                        </div>
                        <p className="text-xs text-slate-400 max-w-xl font-medium leading-relaxed">
                            Quantifying the reliability of the Common Operational Picture. This module tracks data lineage,
                            measures dependency risks, and evaluates the validity of core planning assumptions.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded text-right">
                            <span className="text-[8px] font-black text-slate-500 uppercase block">Global Confidence</span>
                            <span className="text-lg font-black text-white">{globalConfidence.toFixed(1)} <span className="text-[10px] text-blue-500">(LIVE)</span></span>
                        </div>
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    {/* PRIORITY 1: Broken Assumptions Alert - Always Visible */}
                    {brokenAssumptions.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-red-500 flex items-center gap-2">
                                    <AlertCircle size={14} className="animate-pulse" /> 🚨 Broken Planning Assumptions ({brokenAssumptions.length})
                                </h2>
                                <Link
                                    to="/smartops/assumptions"
                                    className="text-[10px] font-black uppercase text-blue-500 hover:text-blue-400 flex items-center gap-1 transition-colors"
                                >
                                    View All Assumptions
                                    <ArrowRight size={12} />
                                </Link>
                            </div>
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
                                <div className="flex items-start gap-4 mb-4">
                                    <Shield className="text-red-500 mt-1" size={20} />
                                    <div className="flex-1">
                                        <p className="text-[12px] font-bold text-white mb-2 uppercase tracking-tight">
                                            Critical Planning Risk Detected
                                        </p>
                                        <p className="text-[10px] text-slate-400 leading-relaxed mb-4">
                                            {brokenAssumptions.length} planning assumption{brokenAssumptions.length > 1 ? 's have' : ' has'} been
                                            invalidated. This represents a major risk requiring immediate plan revision and commander review.
                                        </p>
                                        <div className="space-y-2">
                                            {brokenAssumptions.slice(0, 3).map((assumption) => (
                                                <div key={assumption.id} className="flex items-start gap-2 text-[10px]">
                                                    <AlertTriangle className="text-red-500 mt-0.5 shrink-0" size={12} />
                                                    <span className="text-slate-300 font-bold">{assumption.title}</span>
                                                </div>
                                            ))}
                                            {brokenAssumptions.length > 3 && (
                                                <div className="text-[9px] text-slate-500 uppercase font-bold pt-2">
                                                    + {brokenAssumptions.length - 3} more broken assumptions
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <Link
                                    to="/smartops/assumptions"
                                    className="w-full py-2 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase rounded transition-all shadow-[0_4px_12px_rgba(220,38,38,0.3)] flex items-center justify-center gap-2"
                                >
                                    <Shield size={14} />
                                    Review Assumptions & Assess Impact
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* PRIORITY 2: Critical Confidence Failures (<60%) */}
                    {criticalEntities.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="text-red-500" size={14} />
                                <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-red-500">
                                    Critical Confidence Failures (&lt;60%)
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {criticalEntities.map(e => (
                                    <div key={e.id} className="p-5 bg-red-500/5 border border-red-500/30 rounded-lg hover:border-red-500/50 transition-all group">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className={cn(
                                                "text-[8px] font-black px-2 py-0.5 rounded border uppercase",
                                                "bg-red-500/10 text-red-500 border-red-500/20"
                                            )}>{e.type} // {e.affiliation}</span>
                                            <span className="text-[8px] font-black uppercase flex items-center gap-1.5 text-red-500">
                                                <AlertTriangle size={10} />
                                                Urgent Review
                                            </span>
                                        </div>
                                        <p className="text-[13px] font-bold text-white mb-2 tracking-tight leading-snug">{e.name}</p>
                                        <p className="text-[10px] text-slate-500 mb-6 uppercase flex items-center gap-2">
                                            ID: <span className="font-mono text-slate-400">{e.id}</span>
                                        </p>
                                        <div className="flex items-center justify-between pt-4 border-t border-red-500/20">
                                            <div className="flex flex-col w-full mr-4">
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-[8px] font-black text-red-500 uppercase">Confidence Score</span>
                                                    <span className="text-[10px] font-mono font-bold text-red-500">{e.confidenceScore}%</span>
                                                </div>
                                                <div className="h-1 bg-slate-800 rounded-full w-full">
                                                    <div className="h-full rounded-full bg-red-500 transition-all duration-1000" style={{ width: `${e.confidenceScore}%` }} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* PRIORITY 3: Low Confidence Watchlist - Only if no critical issues */}
                    {!hasCriticalIssues && watchlist.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                                    <ShieldCheck size={14} className="text-blue-500" /> Low Confidence Watchlist (&lt;80%)
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {watchlist.map(e => (
                                    <div key={e.id} className="p-5 bg-slate-900/40 border border-slate-800 rounded-lg hover:border-slate-700 transition-all group">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className={cn(
                                                "text-[8px] font-black px-2 py-0.5 rounded border uppercase",
                                                e.riskLevel === 'High' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                                    e.riskLevel === 'Medium' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                                        "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                            )}>{e.type} // {e.affiliation}</span>
                                            <span className={cn(
                                                "text-[8px] font-black uppercase flex items-center gap-1.5",
                                                e.riskLevel === 'High' ? "text-red-500" : "text-yellow-500"
                                            )}>
                                                <AlertTriangle size={10} />
                                                Review
                                            </span>
                                        </div>
                                        <p className="text-[13px] font-bold text-white mb-2 tracking-tight leading-snug">{e.name}</p>
                                        <p className="text-[10px] text-slate-500 mb-6 uppercase flex items-center gap-2">
                                            ID: <span className="font-mono text-slate-400">{e.id}</span>
                                        </p>

                                        <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                                            <div className="flex flex-col w-full mr-4">
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-[8px] font-black text-slate-500 uppercase">Confidence Score</span>
                                                    <span className="text-[10px] font-mono font-bold text-white">{e.confidenceScore}%</span>
                                                </div>
                                                <div className="h-1 bg-slate-800 rounded-full w-full">
                                                    <div className={cn("h-full rounded-full transition-all duration-1000",
                                                        e.confidenceScore > 70 ? "bg-emerald-500" :
                                                            e.confidenceScore > 40 ? "bg-yellow-500" : "bg-red-500"
                                                    )} style={{ width: `${e.confidenceScore}%` }} />
                                                </div>
                                            </div>
                                            <div className="text-right whitespace-nowrap">
                                                <span className="text-[8px] font-black text-slate-500 uppercase block">Last Verified</span>
                                                <span className="text-[9px] font-mono text-slate-400">{e.lastVerified ? new Date(e.lastVerified).toLocaleTimeString() : 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Hidden Content Indicator */}
                    {hasCriticalIssues && goodConfidenceEntities.length > 0 && (
                        <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-lg text-center">
                            <Eye className="text-slate-600 mx-auto mb-2" size={20} />
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                                {goodConfidenceEntities.length} high-confidence entities hidden
                            </p>
                            <p className="text-[9px] text-slate-500">
                                Resolve critical issues above to view detailed analysis
                            </p>
                        </div>
                    )}

                    {/* System Health Indicator */}
                    {!hasCriticalIssues && !hasMinorIssues && (
                        <div className="p-8 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-center">
                            <CheckCircle2 className="text-emerald-500 mx-auto mb-3" size={24} />
                            <p className="text-[12px] font-black text-emerald-500 uppercase mb-1">
                                Operational Picture: High Confidence
                            </p>
                            <p className="text-[9px] text-slate-400 uppercase">
                                All entities above 80% confidence threshold
                            </p>
                        </div>
                    )}

                    {/* Bottom Split - Decision Analysis (Collapsed when critical issues) */}
                    {!hasCriticalIssues && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Dependency Impact (Module 17 Integration) */}
                        <div className="lg:col-span-2 space-y-4">
                            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                                <History size={14} className="text-slate-500" /> Decision Impact Analysis
                            </h2>
                            <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
                                <table className="w-full text-left font-sans">
                                    <thead className="bg-slate-950">
                                        <tr>
                                            <th className="px-6 py-3 text-[9px] font-black text-slate-500 uppercase">Affected Decision</th>
                                            <th className="px-6 py-3 text-[9px] font-black text-slate-500 uppercase">Dependency</th>
                                            <th className="px-6 py-3 text-[9px] font-black text-slate-500 uppercase">Drift Risk</th>
                                            <th className="px-6 py-3 text-[9px] font-black text-slate-500 uppercase">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800">
                                        {[
                                            { decision: 'Armor Advance-Sector 4', dep: 'Bridge-A Integrity', risk: 'HIGH', status: 'CRITICAL' },
                                            { decision: 'UAV Patrol-North', dep: 'Constellation-X Coverage', risk: 'LOW', status: 'STABLE' },
                                            { decision: 'C4I Sync Night-2', dep: 'Sector-7 Comms Window', risk: 'MED', status: 'MONITOR' }
                                        ].map((row, i) => (
                                            <tr key={i} className="hover:bg-slate-900/40 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <TargetIcon size={14} className="text-slate-600" />
                                                        <span className="text-[11px] font-black text-white uppercase tracking-tight">{row.decision}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">{row.dep}</td>
                                                <td className="px-6 py-4">
                                                    <span className={cn(
                                                        "text-[9px] font-black px-2 py-0.5 rounded border uppercase",
                                                        row.risk === 'HIGH' ? "text-red-500 border-red-500/20" :
                                                            row.risk === 'MED' ? "text-yellow-500 border-yellow-500/20" :
                                                                "text-emerald-500 border-emerald-500/20"
                                                    )}>{row.risk}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-[9px] font-black text-blue-500 uppercase cursor-pointer hover:underline">Re-Evaluate</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Truth Resolution (Module 23 Data Fusion Preview) */}
                        <div className="space-y-4">
                            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                                <HelpCircle size={14} className="text-purple-500" /> Truth Resolution
                            </h2>
                            <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-xl space-y-6">
                                <div className="text-center space-y-1">
                                    <span className="text-[24px] font-black text-white">12</span>
                                    <span className="text-[9px] font-black text-slate-500 uppercase block tracking-widest">Conflicting Reports</span>
                                </div>
                                <div className="space-y-3">
                                    <div className="p-3 bg-red-500/5 border border-red-500/20 rounded flex items-start gap-3">
                                        <AlertCircle className="text-red-500 mt-0.5" size={14} />
                                        <div className="flex-1">
                                            <span className="text-[10px] font-black text-white uppercase block mb-1">Entity Discrepancy</span>
                                            <p className="text-[9px] text-slate-500 font-bold uppercase">SIGINT reports Armor Platoon at Grid-44; IMINT shows empty revetments.</p>
                                        </div>
                                    </div>
                                    <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase rounded transition-all shadow-[0_4px_12px_rgba(37,99,235,0.2)]">
                                        Investigate Anomaly
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    )}
                </div>

                {/* Footer / Status */}
                <div className="h-12 border-t border-slate-800 bg-slate-950 px-8 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] animate-pulse" />
                        <span className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-4">
                            <span>System: QUANTUM-ASSURE v1.2</span>
                            <span>|</span>
                            <span>Baseline Truth: ESTABLISHED</span>
                        </span>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authorized Access // J2-INTEL</span>
                </div>
            </div>
        </div>
    );
}
