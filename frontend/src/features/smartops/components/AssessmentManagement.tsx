import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import {
    TrendingUp,
    TrendingDown,
    Minus,
    FileText,
    ShieldCheck,
    AlertCircle,
    ChevronRight,
    Target,
    Calendar,
    CheckCircle2,
    Activity,
    ArrowUpRight
} from 'lucide-react';
import { GapAnalysisView } from './GapAnalysisView';
import { SmartOpsService } from '@/lib/smartops/mock-service';
import { cn } from '@/lib/utils';
import type {
    AssessmentReport,
    Trend
} from '@/lib/smartops/types';

export function AssessmentManagement() {
    const [assessments, setAssessments] = useState<AssessmentReport[]>([]);
    const [activeReport, setActiveReport] = useState<AssessmentReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [showGapAnalysis, setShowGapAnalysis] = useState(false);

    useEffect(() => {
        async function loadAssessments() {
            const activeCampaign = await SmartOpsService.getActiveCampaign();
            if (activeCampaign) {
                const data = await SmartOpsService.getAssessments(activeCampaign.id);
                setAssessments(data);
                if (data.length > 0) setActiveReport(data[0]);
            }
            setLoading(false);
        }
        loadAssessments();
    }, []);

    const handleRaiseRequirement = async (subject: string, description: string) => {
        await SmartOpsService.createRFI({
            direction: 'Outbound',
            subject: `Assessment Finding: ${subject}`,
            description: `Auto-generated from assessment audit. Context: ${description}`,
            requestor: 'Senior Analyst (J2/J5)',
            assignee: 'J2 Intelligence',
            priority: 'Routine',
            status: 'Open',
            deadline: new Date(Date.now() + 86400000).toISOString() // Tomorrow
        });
        alert('Information Requirement Raised in Product Center.');
    };

    if (loading) return <div className="p-8 text-slate-500 animate-pulse uppercase font-mono tracking-widest text-xs">Analyzing Operational Data...</div>;
    if (loading) return <div className="p-8 text-slate-500 animate-pulse uppercase font-mono tracking-widest text-xs">Analyzing Operational Data...</div>;
    if (!activeReport) return <div className="p-8 text-slate-400">No assessment reports available.</div>;

    // Use non-null assertion or guard clause since we already checked !activeReport above
    const report = activeReport!;

    const renderTrendIcon = (trend: Trend) => {
        switch (trend) {
            case 'Improving': return <TrendingUp size={14} className="text-green-500" />;
            case 'Degrading': return <TrendingDown size={14} className="text-red-500" />;
            default: return <Minus size={14} className="text-slate-500" />;
        }
    };

    return (
        <div className="flex h-full bg-[#020617] text-slate-200 overflow-hidden font-sans border-l border-slate-900">

            {/* Sidebar: Report History */}
            <div className="w-80 border-r border-slate-800 bg-slate-950/30 flex flex-col">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Assessment Logs</h2>
                    <button className="text-[10px] font-black text-blue-500 hover:text-blue-400 uppercase">New Cycle</button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {assessments.map((report: any) => (
                        <div
                            key={report.id}
                            onClick={() => setActiveReport(report)}
                            className={cn(
                                "p-3 rounded border cursor-pointer transition-all",
                                activeReport?.id === report.id
                                    ? "bg-blue-600/10 border-blue-500/50"
                                    : "bg-slate-900/40 border-slate-800 hover:border-slate-700"
                            )}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[11px] font-black text-white uppercase tracking-tight leading-tight">{report.title}</span>
                                <span className={cn(
                                    "px-1.5 py-0.5 rounded text-[8px] font-bold uppercase",
                                    report.status === 'Final' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                                )}>{report.status}</span>
                            </div>
                            <div className="flex items-center gap-3 text-[9px] font-mono text-slate-500 uppercase">
                                <span className="flex items-center gap-1"><Calendar size={10} /> {report.date}</span>
                                <span className="flex items-center gap-1"><ShieldCheck size={10} /> Conf: {report.confidenceLevel}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content: Report Detail */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* Report Header */}
                <div className="p-6 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-black text-white tracking-tight uppercase mb-1">{activeReport.title}</h1>
                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                            <span className="text-blue-400">Phase: Stabilization II</span>
                            <span className="h-3 w-px bg-slate-800" />
                            <span>Cycle: {activeReport.date}</span>
                            <span className="h-3 w-px bg-slate-800" />
                            <span className={cn(
                                activeReport.confidenceLevel === 'High' ? 'text-green-500' :
                                    activeReport.confidenceLevel === 'Medium' ? 'text-yellow-500' : 'text-red-500'
                            )}>Confidence: {activeReport.confidenceLevel}</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            to="/smartops/cog"
                            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 text-slate-300 hover:text-white text-[10px] font-black uppercase rounded border border-slate-700 hover:border-slate-500 transition-colors"
                        >
                            COG Analysis
                        </Link>
                        <Link
                            to="/smartops/uncertainty"
                            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 text-slate-300 hover:text-white text-[10px] font-black uppercase rounded border border-slate-700 hover:border-slate-500 transition-colors"
                        >
                            Uncertainty
                        </Link>
                        <button
                            onClick={() => setShowGapAnalysis(!showGapAnalysis)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 text-white text-[10px] font-black uppercase rounded border transition-colors",
                                showGapAnalysis
                                    ? "bg-blue-600 border-blue-500 hover:bg-blue-500"
                                    : "bg-blue-600/10 border-blue-500/20 text-blue-500 hover:bg-blue-600/20"
                            )}
                        >
                            {showGapAnalysis ? <Activity size={12} /> : <TrendingDown size={12} />}
                            {showGapAnalysis ? "Close Analysis" : "Gap Analysis"}
                        </button>
                    </div>
                </div>

                {/* Report Body */}
                {showGapAnalysis ? (
                    <div className="flex-1 overflow-hidden">
                        <GapAnalysisView />
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto p-6 space-y-8">

                        {/* Summary & Recommendations */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <section className="bg-slate-900/40 border border-slate-800 rounded-lg p-5">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-4 flex items-center gap-2">
                                    <FileText size={16} /> Executive Summary
                                </h3>
                                <p className="text-xs text-slate-300 leading-relaxed font-bold">
                                    {report.executiveSummary}
                                </p>
                            </section>
                            <section className="bg-slate-900/40 border border-slate-800 rounded-lg p-5">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-4 flex items-center gap-2">
                                    <CheckCircle2 size={16} /> Command Recommendations
                                </h3>
                                <ul className="space-y-3">
                                    {report.recommendations.map((rec, i) => (
                                        <li key={i} className="flex gap-3 text-xs text-slate-300">
                                            <ChevronRight size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                                            <span>{rec}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        </div>

                        {/* Measures of Effectiveness (MOEs) */}
                        <section>
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                <Target size={16} className="text-red-500" /> Measures of Effectiveness (MOE)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {report.moes.map((moe: any) => (
                                    <div key={moe.id} className="p-4 bg-slate-950 border border-slate-800 rounded flex items-center justify-between group hover:border-slate-700 transition-colors">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                {renderTrendIcon(moe.trend)}
                                                <span className="text-[11px] font-black text-white uppercase tracking-tight">{moe.name}</span>
                                            </div>
                                            <p className="text-[10px] text-slate-500 font-bold">{moe.description}</p>
                                        </div>
                                        <div className="text-right ml-4 flex flex-col items-end gap-2">
                                            <div>
                                                <div className="text-sm font-black text-white group-hover:text-blue-400 transition-colors">{moe.currentValue}{moe.unit}</div>
                                                <div className="text-[9px] font-black text-slate-600 uppercase">Target: {moe.targetValue}{moe.unit}</div>
                                            </div>
                                            {(moe.trend === 'Degrading' || moe.currentValue < moe.targetValue) && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRaiseRequirement(`MOE Gap: ${moe.name}`, `Current: ${moe.currentValue}, Target: ${moe.targetValue}. Trend: ${moe.trend}`);
                                                    }}
                                                    className="p-1 px-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded text-[8px] font-black uppercase tracking-widest transition-all"
                                                >
                                                    Raise RFI
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Measures of Performance (MOPs) */}
                        <section>
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                <Activity size={16} className="text-blue-500" /> Measures of Performance (MOP)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {report.mops.map((mop: any) => (
                                    <div key={mop.id} className="p-4 bg-slate-950 border border-slate-800 rounded">
                                        <span className="text-[10px] font-black text-slate-500 uppercase block mb-2">{mop.name}</span>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex justify-between items-baseline">
                                                <span className="text-lg font-black text-white">{mop.currentValue}</span>
                                                <span className="text-[9px] font-black text-slate-500">Of {mop.targetValue} {mop.unit}</span>
                                            </div>
                                            <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                                                <div className="h-full bg-slate-700" style={{ width: `${(mop.currentValue / mop.targetValue) * 100}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Critical Findings */}
                        <section className="bg-red-950/20 border border-red-900/30 rounded-lg p-5">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-4 flex items-center gap-2">
                                <AlertCircle size={16} /> Critical Findings / Risks
                            </h3>
                            <ul className="space-y-4">
                                {report.findings.map((finding: any, i: number) => (
                                    <li key={i} className="flex gap-4 p-3 bg-red-950/20 border border-red-900/20 rounded items-center group/finding">
                                        <span className="flex-1 text-xs text-red-200/80 font-bold leading-relaxed">{finding}</span>
                                        <button
                                            onClick={() => handleRaiseRequirement("Critical Finding", finding)}
                                            className="opacity-0 group-hover/finding:opacity-100 bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                                        >
                                            Investigate <ArrowUpRight size={10} />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </section>

                    </div>
                )}

            </div>

        </div>
    );
}
