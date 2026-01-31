// Targeting API Client
// Connects frontend components to backend targeting APIs
// Expanded for NATO Multi-Domain Operations (MDO) & Cyber Focus

import { api } from '@/lib/api';
import { MshnCtrlService } from '@/lib/mshnctrl/mock-service';

// ============================================================================
// CORE ONTOLOGY & TYPES
// ============================================================================

export type Domain = 'LAND' | 'AIR' | 'MARITIME' | 'CYBER' | 'SPACE' | 'INFO' | 'COGNITIVE' | 'HUMAN' | 'EMS';
export type LevelOfWar = 'POLITICAL' | 'STRATEGIC' | 'OPERATIONAL' | 'TACTICAL' | 'SUB_TACTICAL';
export type BDAStatus = 'DESTROYED' | 'NEUTRALIZED' | 'DAMAGED' | 'INTACT' | 'PENDING';
export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

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

export interface EntityTypeDefinition {
    name: string;
    description: string;
    properties_schema?: any;
}

export interface RelationshipTypeDefinition {
    name: string;
    description: string;
    valid_sources: string[];
    valid_targets: string[];
}

export interface OntologySchema {
    version: string;
    last_updated: string;
    domains: string[];
    entity_types: EntityTypeDefinition[];
    relationship_types: RelationshipTypeDefinition[];
    levels_of_war: string[];
    affiliations: string[];
    target_statuses: string[];
    platform_types: string[];
    confidence_levels: string[];
    bda_statuses: string[];
}

// Targeted Entities (Ontology-Driven)
export interface Target {
    id: string;
    name: string;
    description?: string;
    domain: Domain;
    target_type: string;
    priority: string;
    target_status: string;
    coordinates: string;
    level_of_war?: LevelOfWar;
    operation_ids?: string[]; // Supports multi-operation context
    f3ead_stage?: string;
    be_number?: string;
    functional_type?: string;

    // Non-Kinetic / Cyber Specific Metadata
    cyber_attributes?: {
        logical_nodes: Array<{ id: string; type: string; status: string; ip?: string }>;
        access_status: 'NONE' | 'INITIAL' | 'USER_LEVEL' | 'ROOT_LEVEL' | 'PERSISTENT';
        vulnerabilities: string[];
    };

    cognitive_attributes?: {
        narrative_resonance: number; // 0-1.0
        audience_reach: number;
        sentiment_index: number; // -1 to 1
    };

    classification?: string;
}

export interface StrikePlatform {
    id: string;
    platform_type: 'FIGHTER' | 'BOMBER' | 'ARTILLERY' | 'MISSILE' | 'CYBER' | 'EW' | 'PSYOP';
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

export interface BDAAssessment {
    strikeId: string;
    targetId: string;
    targetName: string;
    strikeTime: string;
    assessmentTime: string;
    bdaStatus: BDAStatus;
    effectivenessPercentage: number;
    desiredEffects: string[];
    achievedEffects: Array<{
        effect: string;
        achieved: boolean;
        percentage: number;
    }>;
    collateral_damage_non_kinetic?: string;
    reAttackRecommended: boolean;
}

export interface MissionIntent {
    id: string;
    commander_intent: string;
    end_state: string;
    center_of_gravity: string;
    lines_of_effort: string[];
}

export interface TargetingGuidance {
    id: string;
    priorities: string[];
    restrictions: string[];
    focus_areas: string[];
}

export interface DecisionAuthority {
    level: string;
    role: string;
    authorities: string[];
}

export interface OperationalTempo {
    current_phase: string;
    tempo: 'HIGH' | 'MEDIUM' | 'LOW';
    next_decision_point: string;
}


// ============================================================================
// API CLIENT IMPLEMENTATION
// ============================================================================

export const targetingApi = {
    // Decision Gates
    async getDecisionGates(): Promise<DecisionGatesResponse> {
        return api.get<DecisionGatesResponse>('/targeting/decision-gates');
    },

    async getMissionIntent(): Promise<MissionIntent> {
        return api.get<MissionIntent>('/targeting/mission/intent').catch(() => ({
            id: 'mock-intent',
            commander_intent: 'Degrade adversary C2 capability...',
            end_state: 'Adversary unable to coordinate large scale operations.',
            center_of_gravity: 'Strategic Command Node',
            lines_of_effort: ['C2 Degradation', 'Logistics Disruption']
        }));
    },

    async getTargetingGuidance(): Promise<TargetingGuidance> {
        return api.get<TargetingGuidance>('/targeting/mission/guidance').catch(() => ({
            id: 'mock-guidance',
            priorities: ['HVT C2', 'Logistics Hubs'],
            restrictions: ['No strike within 500m of cultural sites'],
            focus_areas: ['Sector Alpha', 'Sector Bravo']
        }));
    },

    async getAuthorityMatrix(): Promise<DecisionAuthority[]> {
        return api.get<DecisionAuthority[]>('/targeting/mission/authorities').catch(() => []);
    },

    async getOperationalTempo(): Promise<OperationalTempo> {
        return api.get<OperationalTempo>('/targeting/mission/tempo').catch(() => ({
            current_phase: 'Phase 2: Deter',
            tempo: 'HIGH',
            next_decision_point: 'H+48'
        }));
    },


    // Targets
    async getTargets(params?: { status?: string; priority?: string; limit?: number; domain?: Domain; level?: LevelOfWar; operationId?: string }): Promise<Target[]> {
        const query: Record<string, string> = {};
        if (params?.status) query.status = params.status;
        if (params?.priority) query.priority = params.priority;
        if (params?.limit) query.limit = params.limit.toString();
        if (params?.domain) query.domain = params.domain;
        if (params?.level) query.level = params.level;
        if (params?.operationId) query.operationId = params.operationId;
        return api.get<Target[]>('/targeting/targets', query);
    },

    async getTarget(id: string): Promise<Target> {
        return api.get<Target>(`/targeting/targets/${id}`)
            .catch(async () => {
                console.warn(`[targetingApi] Failed to fetch target ${id} from API, falling back to mock.`);
                const mockTarget = await MshnCtrlService.getTarget(id);
                if (!mockTarget) throw new Error('Target not found in mock');
                return mockTarget;
            });
    },

    // Intelligence & ISR
    async getIntelReports(): Promise<any[]> {
        return api.get<any[]>('/targeting/intel/reports');
    },

    async listIsrPlatforms(params?: { status?: string }): Promise<any[]> {
        const queryParams: Record<string, string> = {};
        if (params?.status) queryParams.status = params.status;
        return api.get<any[]>('/targeting/isr/platforms', queryParams);
    },

    async getPatternOfLife(): Promise<any[]> {
        return api.get<any[]>('/targeting/isr/pattern-of-life');
    },

    // Assessment (Deprecated - Use BdaApi)
    // Legacy methods removed to enforce use of /api/bda router

    // Assets
    async getStrikePlatforms(): Promise<StrikePlatform[]> {
        return api.get<StrikePlatform[]>('/targeting/assets/platforms');
    },

    // Collaboration & Workflow
    async listDecisions(params?: { limit?: number }): Promise<any[]> {
        const queryParams: Record<string, string> = {};
        if (params?.limit) queryParams.limit = params.limit.toString();
        return api.get<any[]>('/targeting/decisions', queryParams);
    },

    async listHandovers(params?: { limit?: number }): Promise<any[]> {
        const queryParams: Record<string, string> = {};
        if (params?.limit) queryParams.limit = params.limit.toString();
        return api.get<any[]>('/targeting/handovers', queryParams);
    },

    // Search
    async search(params: { q: string; limit?: number; types?: string }): Promise<any> {
        const queryParams: Record<string, string> = { q: params.q };
        if (params.limit) queryParams.limit = params.limit.toString();
        if (params.types) queryParams.types = params.types;
        return api.get('/targeting/search', queryParams);
    },

    // Action Management
    async getActionRequired(): Promise<{ items: any[] }> {
        return api.get<{ items: any[] }>('/targeting/action-required');
    },

    // Alternative Analysis
    async getAssumptions(): Promise<any[]> {
        return api.get<any[]>('/targeting/analysis/assumptions');
    },

    async getBiasAlerts(): Promise<any[]> {
        return api.get<any[]>('/targeting/analysis/bias-alerts');
    },

    // Ontology (Data-Driven Schema)
    async getOntologySchema(): Promise<OntologySchema> {
        return api.get<OntologySchema>('/ontology/schema');
    }
};
