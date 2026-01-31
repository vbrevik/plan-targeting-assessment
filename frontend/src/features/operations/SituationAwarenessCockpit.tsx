import { Link } from '@tanstack/react-router';
import { Calendar, Target, ChevronRight } from 'lucide-react';
import { TacticalMap } from '../operations/TacticalMap';
import { LOOTimeline } from '@/features/planning/LOOTimeline';
import { DecisionAnalysisPanel } from '../decisions/DecisionAnalysisPanel';
import { DecisionTrackingPanel } from '../decisions/DecisionTrackingPanel';
import { useCockpitData } from '@/features/cockpit/hooks/useCockpitData';
import { OperationalContextBar } from '../cockpit/OperationalContextBar';

import { CriticalAttentionZone } from '../cockpit/CriticalAttentionZone';
import { ActiveMonitoringZone } from '../cockpit/ActiveMonitoringZone';

export function SituationAwarenessCockpit() {
    const {
        context,
        stats,
        externalFactors,
        currentTime,
        pendingDecisions,
        selectedDecision,
        setSelectedDecision,
        decisionAnalysis,
        trackedDecisions,
        impactMonitors,
        selectedTracking,
        setSelectedTracking
    } = useCockpitData();

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
            <OperationalContextBar context={context} currentTime={currentTime} />

            <div className="flex-1 flex min-h-0 overflow-hidden">

                {/* LEFT COLUMN: CRITICAL ACTIONS + ACTIVE MONITORING */}
                <div className="w-[420px] flex flex-col gap-3 p-4 shrink-0 overflow-y-auto bg-slate-950/30 border-r border-slate-800">

                    {/* ========== TIER 1: CRITICAL ATTENTION ZONE (TODAY) ========== */}
                    <CriticalAttentionZone
                        pendingDecisions={pendingDecisions}
                        driftingObjectives={driftingObjectives}
                        newInsights={newInsights}
                        onSelectDecision={setSelectedDecision}
                    />

                    {/* ========== TIER 2: ACTIVE MONITORING (THIS WEEK) ========== */}
                    <ActiveMonitoringZone
                        readinessTrend={readinessTrend}
                        targetingEfficacy={targetingEfficacy}
                        stats={stats}
                        newInsights={newInsights}
                        externalFactors={externalFactors}
                        trackedDecisions={trackedDecisions}
                        impactMonitors={impactMonitors}
                        onViewTrackingDetails={(decisionId) => {
                            const tracking = trackedDecisions.find(t => t.decisionId === decisionId);
                            if (tracking) setSelectedTracking(tracking);
                        }}
                        onViewImpactDimension={(dimension) => {
                            console.log('View dimension:', dimension);
                            // TODO: Navigate to detailed dimension view
                        }}
                    />

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
                                to="/mshnctrl/campaign"
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
