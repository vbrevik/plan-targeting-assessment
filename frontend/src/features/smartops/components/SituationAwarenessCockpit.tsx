import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import {
    AlertOctagon,
    MessageSquareWarning,
    TrendingUp,
    TrendingDown,
    Clock,
    CheckCircle2,
    AlertTriangle,
    Activity,
    Target,
    Gavel,
    Calendar,
    ChevronRight,
    FileCheck,
    Crosshair,
    Shield
} from 'lucide-react';
import { TacticalMap } from './TacticalMap';
import { LOOTimeline } from './LOOTimeline';
import { SmartOpsService } from '@/lib/smartops/mock-service';
import { DecisionService } from '@/lib/smartops/services/decision.service';
import { DecisionTrackingService } from '@/lib/smartops/services/decision-tracking.service';
import { useToast } from '@/components/ui/use-toast';
import { useOperationalContext, getPhaseColor } from '@/lib/smartops/hooks/useOperationalContext';
import { cn } from '@/lib/utils';
import { DecisionCard } from './decisions/DecisionCard';
import { DecisionAnalysisPanel } from './decisions/DecisionAnalysisPanel';
import { DecisionTracker } from './decisions/DecisionTracker';
import { DecisionImpactMonitorComponent } from './decisions/DecisionImpactMonitor';
import { DecisionTrackingPanel } from './decisions/DecisionTrackingPanel';
import type {
    PoliticalStatement,
    NaturalDisaster,
    DisinformationEvent,
    FakeMedia,
    Decision,
    DecisionAnalysis,
    DecisionTracking,
    DecisionImpactMonitor
} from '@/lib/smartops/types';

export function SituationAwarenessCockpit() {
    const { toast } = useToast();
    const { context, isStrategic } = useOperationalContext();
    const [stats, setStats] = useState<{
        activeOrders: number;
        pendingProposals: number;
        activeScenario: string;
        readiness: number;
        loos: any[];
        decisiveConditions: any[];
    } | null>(null);

    const [externalFactors, setExternalFactors] = useState<{
        political: PoliticalStatement[];
        disasters: NaturalDisaster[];
        disinfo: DisinformationEvent[];
        media: FakeMedia[];
    }>({ political: [], disasters: [], disinfo: [], media: [] });

    const [currentTime, setCurrentTime] = useState(new Date());
    const [pendingDecisions, setPendingDecisions] = useState<Decision[]>([]);
    const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);
    const [decisionAnalysis, setDecisionAnalysis] = useState<DecisionAnalysis | null>(null);
    const [trackedDecisions, setTrackedDecisions] = useState<DecisionTracking[]>([]);
    const [impactMonitors, setImpactMonitors] = useState<DecisionImpactMonitor[]>([]);
    const [selectedTracking, setSelectedTracking] = useState<DecisionTracking | null>(null);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        SmartOpsService.getDashboardStats(context.operationId || undefined).then((res: any) => setStats(res));

        Promise.all([
            SmartOpsService.getPoliticalStatements(context.operationId || undefined),
            SmartOpsService.getNaturalDisasters(context.operationId || undefined),
            SmartOpsService.getDisinformationEvents(context.operationId || undefined),
            SmartOpsService.getFakeMedia(context.operationId || undefined),
            DecisionService.getPendingDecisions(),
            DecisionTrackingService.getTrackedDecisions(),
            DecisionTrackingService.getImpactMonitors()
        ]).then(([political, disasters, disinfo, media, decisions, tracked, impacts]) => {
            setExternalFactors({ political, disasters, disinfo, media });
            setPendingDecisions(decisions);
            setTrackedDecisions(tracked);
            setImpactMonitors(impacts);
        });
    }, [context.operationId]);

    // Fetch decision analysis when a decision is selected
    useEffect(() => {
        if (selectedDecision) {
            DecisionService.analyzeDecision(selectedDecision.id).then(setDecisionAnalysis);
        } else {
            setDecisionAnalysis(null);
        }
    }, [selectedDecision]);

    if (!stats) return (
        <div className="h-screen flex items-center justify-center bg-slate-950 text-white font-mono uppercase tracking-[0.2em] animate-pulse">
            Initializing Command Core...
        </div>
    );

    // Intel insights requiring action
    const newInsights = [
        ...externalFactors.disinfo,
        ...externalFactors.political,
        ...externalFactors.disasters
    ];

    // Campaign drift items
    const driftingObjectives = stats.decisiveConditions?.filter((dc: any) => dc.status === 'AtRisk') || [];

    const readinessTrend = 2.1; // Mock - replace with real calculation
    const targetingEfficacy = 64; // Mock

    return (
        <div className="h-full w-full flex flex-col bg-[#020617] text-slate-200 overflow-hidden font-sans">

            {/* OPERATIONAL CONTEXT BAR */}
            <div className="h-14 flex items-center justify-between px-6 bg-slate-950 border-b-2 border-slate-800 shadow-2xl z-20">
                <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.15em]">Operation</span>
                        <span className="text-sm font-black text-white tracking-tight">{context.name || 'Rolling Thunder'}</span>
                    </div>
                    <div className="h-8 w-px bg-slate-800" />
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.15em]">Timeline</span>
                        <span className="text-sm font-mono text-white">D+04</span>
                    </div>
                    <div className="h-8 w-px bg-slate-800" />
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.15em]">Zulu Time</span>
                        <span className="text-sm font-mono text-white">
                            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}Z
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">DEFCON</span>
                        <span className="text-sm font-black text-white">4</span>
                    </div>
                    <div className="px-4 py-2 bg-red-950/40 border-2 border-red-500/70 rounded flex items-center gap-2">
                        <AlertOctagon className="text-red-500 animate-pulse" size={20} />
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-red-400 uppercase tracking-widest">Alert Level</span>
                            <span className="text-sm font-black text-white">RED-ALPHA</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex min-h-0 overflow-hidden">

                {/* LEFT COLUMN: CRITICAL ACTIONS + ACTIVE MONITORING */}
                <div className="w-[420px] flex flex-col gap-3 p-4 shrink-0 overflow-y-auto bg-slate-950/30 border-r border-slate-800">

                    {/* ========== TIER 1: CRITICAL ATTENTION ZONE (TODAY) ========== */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-red-400 flex items-center gap-2">
                                <Clock size={14} className="animate-pulse" />
                                Critical - TODAY
                            </h2>
                            <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[9px] font-black border border-red-500/30 rounded-full">
                                {pendingDecisions.length + (driftingObjectives.length > 0 ? 1 : 0)}
                            </span>
                        </div>

                        {/* Decision Cards */}
                        {pendingDecisions.map((decision) => (
                            <DecisionCard
                                key={decision.id}
                                decision={decision}
                                onExpand={() => setSelectedDecision(decision)}
                            />
                        ))}

                        {/* Campaign Drift Alert */}
                        {driftingObjectives.length > 0 && (
                            <Link
                                to="/smartops/campaign"
                                className="group block p-4 rounded-lg border-2 transition-all cursor-pointer bg-amber-950/20 border-amber-500/40 hover:bg-amber-950/40 hover:border-amber-400"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle size={16} className="text-amber-400" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-amber-400">
                                            DRIFT
                                        </span>
                                    </div>
                                    <span className="text-[8px] font-bold text-slate-500 uppercase">This week</span>
                                </div>
                                <h3 className="text-sm font-black text-white mb-1 leading-tight group-hover:text-blue-300 transition-colors">
                                    {driftingObjectives.length} Campaign Objective{driftingObjectives.length > 1 ? 's' : ''} at DRIFT
                                </h3>
                                <p className="text-[10px] text-slate-400 leading-relaxed">
                                    {driftingObjectives.map((dc: any) => dc.name).join(', ')}
                                </p>
                                <div className="flex items-center justify-end mt-2 text-[9px] text-slate-500 group-hover:text-blue-400 transition-colors font-black uppercase">
                                    View Campaign <ChevronRight size={12} className="ml-1" />
                                </div>
                            </Link>
                        )}

                        {/* Intel Insights Alert */}
                        {newInsights.length > 0 && (
                            <Link
                                to="/smartops/advisory"
                                className="group block p-4 rounded-lg border-2 transition-all cursor-pointer bg-amber-950/20 border-amber-500/40 hover:bg-amber-950/40 hover:border-amber-400"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <MessageSquareWarning size={16} className="text-amber-400" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-amber-400">
                                            INTEL
                                        </span>
                                    </div>
                                    <span className="text-[8px] font-bold text-slate-500 uppercase">Next 24 hours</span>
                                </div>
                                <h3 className="text-sm font-black text-white mb-1 leading-tight group-hover:text-blue-300 transition-colors">
                                    {newInsights.length} New Intel Insight{newInsights.length > 1 ? 's' : ''}
                                </h3>
                                <p className="text-[10px] text-slate-400 leading-relaxed">
                                    Require review and assessment
                                </p>
                                <div className="flex items-center justify-end mt-2 text-[9px] text-slate-500 group-hover:text-blue-400 transition-colors font-black uppercase">
                                    Review All <ChevronRight size={12} className="ml-1" />
                                </div>
                            </Link>
                        )}
                    </div>

                    {/* ========== TIER 2: ACTIVE MONITORING (THIS WEEK) ========== */}
                    <div className="space-y-3 mt-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-blue-400 flex items-center gap-2">
                                <Activity size={14} />
                                Active Monitoring
                            </h2>
                        </div>

                        {/* Force Readiness Card */}
                        <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-700 hover:border-blue-500/40 transition-all">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Shield size={14} className="text-blue-400" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Force Readiness</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    {readinessTrend > 0 ? (
                                        <TrendingUp size={12} className="text-emerald-500" />
                                    ) : (
                                        <TrendingDown size={12} className="text-red-500" />
                                    )}
                                    <span className={cn(
                                        "text-[10px] font-bold",
                                        readinessTrend > 0 ? 'text-emerald-500' : 'text-red-500'
                                    )}>
                                        {readinessTrend > 0 ? '+' : ''}{readinessTrend}%
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-black text-white">{stats.readiness}</span>
                                <span className="text-lg text-slate-600 font-black">%</span>
                            </div>
                            <div className="mt-2 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                    style={{ width: `${stats.readiness}%` }}
                                />
                            </div>
                        </div>

                        {/* Targeting Efficacy Card */}
                        <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-700 hover:border-blue-500/40 transition-all">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Crosshair size={14} className="text-cyan-400" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Targeting Efficacy</span>
                                </div>
                                <span className="text-[9px] text-slate-500 uppercase">Phase II</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-black text-slate-300">{targetingEfficacy}</span>
                                <span className="text-lg text-slate-600 font-black">%</span>
                            </div>
                            <div className="mt-2 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                                    style={{ width: `${targetingEfficacy}%` }}
                                />
                            </div>
                            {targetingEfficacy < 70 && (
                                <div className="mt-2 flex items-center gap-1 text-[9px] text-amber-400 font-bold">
                                    <AlertTriangle size={10} />
                                    Below optimal threshold
                                </div>
                            )}
                        </div>

                        {/* Intel Insights Summary */}
                        <Link
                            to="/smartops/advisory"
                            className="block p-4 rounded-lg bg-slate-900/60 border border-slate-700 hover:border-purple-500/40 transition-all cursor-pointer group"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <MessageSquareWarning size={14} className="text-purple-400" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Intel Insights</span>
                                </div>
                                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-[9px] font-black border border-purple-500/30 rounded-full">
                                    {newInsights.length} NEW
                                </span>
                            </div>
                            <div className="space-y-1.5">
                                {externalFactors.disinfo.slice(0, 1).map(event => (
                                    <div key={event.id} className="flex items-center gap-2 text-[10px]">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                        <span className="text-red-400 font-black uppercase">DISINFO</span>
                                        <span className="text-slate-400 truncate">{event.name}</span>
                                    </div>
                                ))}
                                {externalFactors.political.slice(0, 1).map(st => (
                                    <div key={st.id} className="flex items-center gap-2 text-[10px]">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                        <span className="text-blue-400 font-black uppercase">POLITICAL</span>
                                        <span className="text-slate-400 truncate">{st.name}</span>
                                    </div>
                                ))}
                                {externalFactors.disasters.slice(0, 1).map(d => (
                                    <div key={d.id} className="flex items-center gap-2 text-[10px]">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                        <span className="text-amber-400 font-black uppercase">ENV</span>
                                        <span className="text-slate-400 truncate">{d.name}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center justify-end mt-3 text-[9px] text-slate-500 group-hover:text-purple-400 transition-colors font-black uppercase">
                                Review All <ChevronRight size={12} className="ml-1" />
                            </div>
                        </Link>

                        {/* Decision Tracking */}
                        {trackedDecisions.length > 0 && (
                            <div className="mt-6">
                                <DecisionTracker
                                    trackedDecisions={trackedDecisions}
                                    onViewDetails={(decisionId) => {
                                        const tracking = trackedDecisions.find(t => t.decisionId === decisionId);
                                        if (tracking) setSelectedTracking(tracking);
                                    }}
                                />
                            </div>
                        )}

                        {/* Decision Impacts */}
                        {impactMonitors.length > 0 && (
                            <div className="mt-6">
                                <DecisionImpactMonitorComponent
                                    impactMonitors={impactMonitors}
                                    onViewDimension={(dimension) => {
                                        console.log('View dimension:', dimension);
                                        // TODO: Navigate to detailed dimension view
                                    }}
                                />
                            </div>
                        )}

                    </div>

                    {/* ========== TIER 3: PLANNING HORIZON ========== */}
                    <div className="space-y-2 mt-6">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-600 flex items-center gap-2">
                            <Calendar size={12} />
                            This Month
                        </h2>
                        <div className="p-3 rounded bg-slate-900/30 border border-slate-800">
                            <div className="flex items-center justify-between text-[10px]">
                                <span className="text-slate-500 font-bold">Upcoming Governance</span>
                                <span className="text-slate-600">3 meetings</span>
                            </div>
                        </div>
                        <div className="p-3 rounded bg-slate-900/30 border border-slate-800">
                            <div className="flex items-center justify-between text-[10px]">
                                <span className="text-slate-500 font-bold">Campaign Milestones</span>
                                <span className="text-slate-600">5 objectives</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: TACTICAL COP + CAMPAIGN TIMELINE */}
                <div className="flex-1 flex flex-col gap-3 p-4 min-w-0">

                    {/* Tactical Map */}
                    <div className="flex-1 relative border-2 border-slate-800 rounded-lg overflow-hidden group min-h-0">
                        <TacticalMap />
                        <div className="absolute top-4 left-4">
                            <div className="bg-slate-950/90 border border-slate-700 px-4 py-2 rounded-lg backdrop-blur">
                                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Tactical COP</div>
                                <div className="text-sm font-black text-white">AO VULCAN - CRITICAL</div>
                            </div>
                        </div>
                        <div className="absolute top-4 right-4 space-y-2">
                            <div className="bg-slate-950/90 border border-blue-500/30 px-3 py-1.5 rounded backdrop-blur flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500" />
                                <span className="text-[9px] font-black text-blue-400 uppercase">1-64 MECH</span>
                            </div>
                            <div className="bg-slate-950/90 border border-red-500/30 px-3 py-1.5 rounded backdrop-blur flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                <span className="text-[9px] font-black text-red-400 uppercase">OPFOR REGT</span>
                            </div>
                        </div>
                    </div>

                    {/* Campaign Timeline */}
                    <div className="h-[260px] border-2 border-slate-800 rounded-lg overflow-hidden bg-slate-900/40 flex flex-col">
                        <div className="h-12 border-b border-slate-800 bg-slate-950 flex items-center justify-between px-4">
                            <div className="flex items-center gap-3">
                                <Target size={16} className="text-blue-400" />
                                <span className="text-xs font-black text-white uppercase tracking-widest">Campaign Lines of Operation</span>
                            </div>
                            <Link
                                to="/smartops/campaign"
                                className="text-[10px] font-black text-slate-500 hover:text-blue-400 transition-colors uppercase tracking-widest flex items-center gap-1"
                            >
                                View Full Campaign <ChevronRight size={12} />
                            </Link>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <LOOTimeline loos={stats.loos} decisiveConditions={stats.decisiveConditions} />
                        </div>
                    </div>
                </div>
            </div>

            {/* STATUS FOOTER */}
            <div className="h-8 flex items-center justify-between px-6 text-[9px] font-mono text-slate-600 bg-slate-950 border-t border-slate-800">
                <div className="flex gap-6 items-center">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                        <span className="font-bold text-slate-500">SYSTEM NOMINAL</span>
                    </div>
                    <span className="text-slate-700">Last Update: {currentTime.toLocaleTimeString()}</span>
                </div>
                <div className="flex gap-6 items-center font-bold">
                    <span className="text-slate-500">HQ NORTH C2</span>
                    <span className="text-blue-500/50 uppercase">NATO COPD</span>
                </div>
            </div>

            {/* DECISION ANALYSIS PANEL (Modal) */}
            {selectedDecision && decisionAnalysis && (
                <DecisionAnalysisPanel
                    decision={selectedDecision}
                    analysis={decisionAnalysis}
                    onClose={() => setSelectedDecision(null)}
                    onSelectOption={(optionId) => {
                        console.log('Selected option:', optionId);
                        // TODO: Implement option approval flow
                    }}
                />
            )}

            {/* DECISION TRACKING PANEL (Modal) */}
            {selectedTracking && (
                <DecisionTrackingPanel
                    tracking={selectedTracking}
                    onClose={() => setSelectedTracking(null)}
                />
            )}
        </div>
    );
}
