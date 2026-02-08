import { useState, useEffect } from 'react';
import { useOperationalContext } from '@/lib/mshnctrl/hooks/useOperationalContext';
// Context events (Political, Disasters, Disinfo) have no backend - stubbed
// TODO: Implement backend or remove these features
import { DecisionService } from '@/lib/mshnctrl/services/decision.service';
import { DecisionTrackingService } from '@/lib/mshnctrl/services/decision-tracking.service';
import type {
    PoliticalStatement,
    NaturalDisaster,
    DisinformationEvent,
    FakeMedia,
    Decision,
    DecisionAnalysis,
    DecisionTracking,
    DecisionImpactMonitor
} from '@/lib/mshnctrl/types';

export function useCockpitData() {
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
        // TODO: Implement backend for dashboard stats and external factors
        setStats({
            activeOrders: 0,
            pendingProposals: 0,
            activeScenario: 'No active scenario',
            readiness: 0,
            loos: [],
            decisiveConditions: []
        });

        Promise.all([
            Promise.resolve([]), // political statements - no backend
            Promise.resolve([]), // disasters - no backend
            Promise.resolve([]), // disinfo - no backend
            Promise.resolve([]), // fake media - no backend
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

    return {
        context,
        isStrategic,
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
    };
}
