// Targeting API Client
// Connects frontend components to backend targeting APIs

import { api } from '@/lib/api';

// ============================================================================
// TYPES
// ============================================================================

export interface DecisionGate {
    name: string;
    status: 'GREEN' | 'YELLOW' | 'RED';
    value: string;
    classification: 'UNCLASS' | 'CUI' | 'SECRET' | 'TOP_SECRET' | 'TS_SCI';
    caveats?: string[];
    details?: string;
}

export interface DecisionGatesResponse {
    roe: DecisionGate;
    cde: DecisionGate;
    weather: DecisionGate;
    deconfliction: DecisionGate;
}

export interface Target {
    id: string;
    name: string;
    description?: string;
    target_type: string;
    priority: string;
    target_status: string;
    coordinates: string;
    f3ead_stage?: string; // F3EAD cycle stage: FIND, FIX, FINISH, EXPLOIT, ANALYZE, DISSEMINATE
    // Expanded Ontology Fields
    be_number?: string;
    functional_type?: string;
    collateral_estimate?: any; // JSON
    time_window?: any; // JSON
    pattern_of_life?: any[]; // JSON array
    engagement_history?: any[]; // JSON array
    commander_remarks?: string;
    legal_status?: any; // JSON
    weather_constraints?: any; // JSON
    deconfliction_status?: any; // JSON
    classification?: string;
}

export interface StrikeRequest {
    id: string;
    target_id: string;
    requesting_unit: string;
    requested_platform?: string;
    requested_munition?: string;
    status: 'PENDING' | 'APPROVED' | 'DENIED' | 'EXECUTED';
    justification?: string;
    priority: string;
    classification: string;
    created_at: string;
    updated_at: string;
}

export interface ApprovalChain {
    id: string;
    subject_entity_id: string;
    chain_type: 'TARGETING_BOARD' | 'STRIKE_AUTH' | 'CDE_REVIEW';
    current_node: string;
    status: 'IN_PROGRESS' | 'APPROVED' | 'REJECTED';
    history: any[]; // JSON array
    classification: string;
    created_at: string;
    updated_at: string;
}

export interface DtlEntry {
    id: string;
    target_id: string;
    priority_score: number;
    feasibility_score: number;
    combined_score?: number;
    aging_hours: number;
    is_tst: boolean;
    tst_deadline?: string;
    approval_chain?: string;
    current_approver?: string;
    approval_level?: number;
    created_at: string;
    updated_at: string;
}

export interface TargetingSummary {
    total_targets: number;
    active_targets: number;
    pending_nominations: number;
    approved_targets: number;
}

export interface RiskAssessment {
    id: string;
    target_id: string;
    fratricide_risk: string;
    friendly_forces_distance_km?: number;
    political_sensitivity: string;
    sensitive_sites_nearby?: string;
    proportionality_assessment?: string;
    legal_review_status: string;
    legal_reviewer?: string;
    legal_review_date?: string;
    overall_risk_score?: number;
    classification: string;
    assessed_by: string;
    created_at: string;
    updated_at: string;
}

export interface StrikePlatform {
    id: string;
    platform_type: string;
    platform_name: string;
    callsign?: string;
    unit?: string;
    munitions_available?: string; // JSON string
    sorties_available: number;
    platform_status: string;
    classification: string;
    created_at: string;
    updated_at: string;
}

// ============================================================================
// MISSION COMMAND TYPES
// ============================================================================

export interface MissionIntent {
    phase: string;
    priorityEffects: string[];
    endstate: string;
    endstateMetrics: Array<{
        name: string;
        current: number;
        target: number;
        status: 'on-track' | 'at-risk' | 'off-track';
    }>;
}

export interface TargetingGuidance {
    roeLevel: string;
    collateralThreshold: string;
    approvedTargetSets: string[];
    restrictions: string[];
}

export interface DecisionAuthority {
    level: string;
    authority: string;
    canApprove: string[];
    mustEscalate: string[];
}

export interface OperationalTempo {
    currentPhase: string;
    hoursIntoPhase: number;
    criticalDecisionPoints: Array<{
        name: string;
        time: string;
        status: 'upcoming' | 'current' | 'passed';
    }>;
}

export interface JtbSession {
    id: string;
    session_name: string;
    session_date: string;
    session_time: string;
    session_datetime: string;
    chair: string;
    chair_rank?: string;
    status: string;
    required_attendees?: string;
    actual_attendees?: string;
    quorum_verified: boolean;
    protocol_notes?: string;
    session_minutes?: string;
    classification: string;
    caveats?: string;
    created_by: string;
    created_at: string;
    updated_at: string;
    completed_at?: string;
}

export interface JtbTarget {
    id: string;
    session_id: string;
    target_id: string;
    presentation_order: number;
    decision?: string;
    decision_rationale?: string;
    decided_by?: string;
    decided_at?: string;
    votes_for: number;
    votes_against: number;
    votes_abstain: number;
    approval_conditions?: string;
    mitigation_requirements?: string;
    added_to_session_at: string;
    created_at: string;
    updated_at: string;
}

export interface MissionIntent {
    phase: string;
    priorityEffects: string[];
    endstate: string;
    endstateMetrics: Array<{
        name: string;
        current: number;
        target: number;
        status: 'on-track' | 'at-risk' | 'off-track';
    }>;
}

export interface TargetingGuidance {
    roeLevel: string;
    collateralThreshold: string;
    approvedTargetSets: string[];
    restrictions: string[];
}

export interface DecisionAuthority {
    level: string;
    authority: string;
    canApprove: string[];
    mustEscalate: string[];
}

export interface OperationalTempo {
    currentPhase: string;
    hoursIntoPhase: number;
    criticalDecisionPoints: Array<{
        name: string;
        time: string;
        status: 'upcoming' | 'current' | 'passed';
    }>;
}

// ============================================================================
// TARGETING API CLIENT
// ============================================================================

export const targetingApi = {
    // Decision Gates
    async getDecisionGates(): Promise<DecisionGatesResponse> {
        return api.get<DecisionGatesResponse>('/targeting/decision-gates');
    },

    // Targets
    async getTargets(params?: { status?: string; priority?: string; limit?: number }): Promise<Target[]> {
        return api.get<Target[]>('/targeting/targets', params as Record<string, string>);
    },

    async getTarget(id: string): Promise<Target> {
        return api.get<Target>(`/targeting/targets/${id}`);
    },

    async getTargetTimeline(id: string): Promise<any[]> {
        return api.get<any[]>(`/targeting/targets/${id}/timeline`);
    },

    async updateTarget(id: string, data: {
        name?: string;
        priority?: string;
        target_status?: string;
    }): Promise<Target> {
        return api.put<Target>(`/targeting/targets/${id}`, data);
    },

    async getTargetingSummary(): Promise<TargetingSummary> {
        return api.get<TargetingSummary>('/targeting/summary');
    },

    async createTarget(data: {
        name: string;
        description?: string;
        target_type: string;
        priority: string;
        coordinates: string;
        classification?: string;
    }): Promise<{ id: string; message: string }> {
        return api.post<{ id: string; message: string }>('/targeting/targets', data);
    },

    // DTL (Dynamic Target List)
    async getDtlEntries(params?: { limit?: number }): Promise<DtlEntry[]> {
        return api.get<DtlEntry[]>('/targeting/dtl', params as Record<string, string>);
    },

    async getActiveTsts(): Promise<DtlEntry[]> {
        return api.get<DtlEntry[]>('/targeting/dtl/tst');
    },

    // JTB (Joint Targeting Board)
    async getJtbSessions(params?: { status?: string }): Promise<JtbSession[]> {
        return api.get<JtbSession[]>('/targeting/jtb/sessions', params as Record<string, string>);
    },

    async getJtbSession(sessionId: string): Promise<{ session: JtbSession; targets: JtbTarget[] }> {
        return api.get<{ session: JtbSession; targets: JtbTarget[] }>(`/targeting/jtb/sessions/${sessionId}`);
    },

    async createJtbSession(data: {
        session_name: string;
        session_date: string;
        session_time: string;
        session_datetime: string;
        chair: string;
        chair_rank?: string;
        required_attendees?: string[];
        classification: string;
        caveats?: string[];
    }): Promise<{ id: string }> {
        return api.post<{ id: string }>('/targeting/jtb/sessions', data);
    },

    async addTargetToJtbSession(sessionId: string, data: {
        target_id: string;
        presentation_order?: number;
    }): Promise<{ id: string }> {
        return api.post<{ id: string }>(`/targeting/jtb/sessions/${sessionId}/targets`, data);
    },

    async recordJtbDecision(jtbTargetId: string, data: {
        decision: string;
        decision_rationale: string;
        decided_by: string;
        votes_for?: number;
        votes_against?: number;
        votes_abstain?: number;
        approval_conditions?: string;
        mitigation_requirements?: string;
    }): Promise<void> {
        return api.put<void>(`/targeting/jtb/targets/${jtbTargetId}/decision`, data);
    },

    async updateJtbSessionStatus(sessionId: string, status: string): Promise<void> {
        return api.put<void>(`/targeting/jtb/sessions/${sessionId}/status`, { status });
    },

    // Mission Command
    async getMissionIntent(): Promise<MissionIntent> {
        return api.get<MissionIntent>('/targeting/mission/intent');
    },

    async updateMissionIntent(data: MissionIntent): Promise<{ message: string }> {
        return api.put<{ message: string }>('/targeting/mission/intent', data);
    },

    async getTargetingGuidance(): Promise<TargetingGuidance> {
        return api.get<TargetingGuidance>('/targeting/mission/guidance');
    },

    async getAuthorityMatrix(): Promise<DecisionAuthority> {
        return api.get<DecisionAuthority>('/targeting/mission/authority-matrix');
    },

    async getOperationalTempo(): Promise<OperationalTempo> {
        return api.get<OperationalTempo>('/targeting/mission/tempo');
    },

    // Action Required
    async getActionRequired(): Promise<{
        items: any[];
        total: number;
        critical_count: number;
        high_count: number;
    }> {
        return api.get('/targeting/action-required');
    },

    // Search
    async search(params: {
        q: string;
        limit?: number;
        types?: string; // Comma-separated: "targets,bda,decisions"
    }): Promise<{
        results: Array<{
            id: string;
            type: string;
            title: string;
            description?: string;
            status?: string;
            priority?: string;
            metadata: any;
        }>;
        total: number;
        query: string;
    }> {
        return api.get('/targeting/search', params as Record<string, string>);
    },

    // Intelligence
    async getIntelReports(): Promise<any[]> {
        return api.get<any[]>('/targeting/intel/reports');
    },

    async getIntelFusion(targetId: string): Promise<any[]> {
        return api.get<any[]>(`/targeting/intel/fusion/${targetId}`);
    },

    // ISR Platforms
    async listIsrPlatforms(params?: { status?: string }): Promise<any[]> {
        const queryParams: Record<string, string> = {};
        if (params?.status) queryParams.status = params.status;
        return api.get<any[]>('/targeting/isr/platforms', queryParams);
    },

    async getPatternOfLife(): Promise<any[]> {
        return api.get<any[]>('/targeting/isr/pattern-of-life');
    },

    // BDA
    async getBdaAssessments(): Promise<any[]> {
        return api.get<any[]>('/targeting/bda');
    },

    async getReattackRecommendations(): Promise<any[]> {
        return api.get<any[]>('/targeting/bda/re-attack');
    },

    async getBdaAssessment(id: string): Promise<any> {
        return api.get<any>(`/targeting/bda/${id}`);
    },

    // Strike Assets
    async getStrikePlatforms(): Promise<StrikePlatform[]> {
        return api.get<StrikePlatform[]>('/targeting/assets/platforms');
    },

    // Risk Assessment
    async getRiskAssessment(targetId: string): Promise<RiskAssessment> {
        return api.get<RiskAssessment>(`/targeting/risk/${targetId}`);
    },

    async getHighRiskTargets(): Promise<RiskAssessment[]> {
        return api.get<RiskAssessment[]>('/targeting/risk/high');
    },

    // Alternative Analysis
    async getAssumptions(): Promise<any[]> {
        return api.get<any[]>('/targeting/analysis/assumptions');
    },

    async getBiasAlerts(): Promise<any[]> {
        return api.get<any[]>('/targeting/analysis/bias-alerts');
    },

    // ========================================================================
    // COLLABORATION
    // ========================================================================

    async listDecisions(params?: { limit?: number }): Promise<any[]> {
        const queryParams: Record<string, string> = {};
        if (params?.limit) queryParams.limit = params.limit.toString();
        return api.get<any[]>('/targeting/decisions', queryParams);
    },

    async createDecision(data: any): Promise<{ id: string }> {
        return api.post<{ id: string }>('/targeting/decisions', data);
    },

    async listHandovers(params?: { limit?: number }): Promise<any[]> {
        const queryParams: Record<string, string> = {};
        if (params?.limit) queryParams.limit = params.limit.toString();
        return api.get<any[]>('/targeting/handovers', queryParams);
    },

    async generateHandover(data: any): Promise<{ id: string }> {
        return api.post<{ id: string }>('/targeting/handovers/generate', data);
    },

    async getTargetAnnotations(targetId: string): Promise<any[]> {
        return api.get<any[]>(`/targeting/annotations/${targetId}`);
    },

    async createAnnotation(data: any): Promise<{ id: string }> {
        return api.post<{ id: string }>('/targeting/annotations', data);
    },

    // ========================================================================
    // NEW ENTITY TYPES (STRIKE REQUESTS & APPROVALS)
    // ========================================================================

    async createStrikeRequest(data: Partial<StrikeRequest>): Promise<{ id: string }> {
        return api.post<{ id: string }>('/targeting/strike-requests', data);
    },

    async getStrikeRequests(params?: { status?: string }): Promise<StrikeRequest[]> {
        return api.get<StrikeRequest[]>('/targeting/strike-requests', params as any);
    },

    async updateStrikeRequestStatus(id: string, status: string): Promise<void> {
        return api.put<void>(`/targeting/strike-requests/${id}/status`, { status });
    },

    async getApprovalChain(subjectId: string): Promise<ApprovalChain | null> {
        return api.get<ApprovalChain | null>(`/targeting/approvals/${subjectId}`);
    },

    async createApprovalChain(data: Partial<ApprovalChain>): Promise<{ id: string }> {
        return api.post<{ id: string }>('/targeting/approvals', data);
    },
};
