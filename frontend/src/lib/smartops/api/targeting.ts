// Targeting API Service
// Connects frontend components to backend targeting APIs

import { api } from '@/lib/api';

// ============================================================================
// TYPES
// ============================================================================

export interface DecisionGatesResponse {
  roe: DecisionGate;
  cde: DecisionGate;
  weather: DecisionGate;
  deconfliction: DecisionGate;
}

export interface DecisionGate {
  name: string;
  status: 'green' | 'yellow' | 'red';
  value: string;
  classification: 'UNCLASS' | 'CUI' | 'SECRET' | 'TOP_SECRET' | 'TS_SCI';
  caveats?: string[];
  details?: string;
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

export interface DtlEntry {
  id: string;
  target_id: string;
  priority_score: number;
  feasibility_score: number;
  combined_score: number;
  aging_hours: number;
  is_tst: boolean;
  tst_deadline?: string;
}

export interface TstAlert {
  id: string;
  name: string;
  deadline: string;
  minutes_remaining: number;
  priority: 'CRITICAL' | 'HIGH';
}

export interface IntelReport {
  id: string;
  target_id?: string;
  int_type: string;
  report_title: string;
  confidence_level: number;
  fusion_score?: number;
  classification: string;
}

export interface BdaAssessment {
  id: string;
  target_id: string;
  physical_damage: string;
  functional_damage: string;
  recommendation: string;
  confidence: number;
}

export interface StrikePlatform {
  id: string;
  platform_type: string;
  platform_name: string;
  platform_status: string;
  sorties_available: number;
}

export interface RiskAssessment {
  id: string;
  target_id: string;
  fratricide_risk: string;
  political_sensitivity: string;
  legal_review_status: string;
  overall_risk_score?: number;
}

export interface AssumptionChallenge {
  id: string;
  assumption_text: string;
  confidence_level: number;
  validation_status: string;
  bias_type?: string;
}

export interface TargetAnnotation {
  id: string;
  target_id?: string;
  user_id: string;
  annotation_text: string;
  annotation_type: string;
  is_critical: boolean;
}

// ============================================================================
// API SERVICE
// ============================================================================

export const TargetingApi = {
  // Decision Gates
  getDecisionGates: async (): Promise<DecisionGatesResponse> => {
    return api.get<DecisionGatesResponse>('/targeting/decision-gates');
  },

  // Mission Command
  getMissionIntent: async (): Promise<MissionIntent> => {
    return api.get<MissionIntent>('/targeting/mission/intent');
  },

  updateMissionIntent: async (intent: Partial<MissionIntent>): Promise<void> => {
    return api.put('/targeting/mission/intent', intent);
  },

  getTargetingGuidance: async (): Promise<TargetingGuidance> => {
    return api.get<TargetingGuidance>('/targeting/mission/guidance');
  },

  getAuthorityMatrix: async (): Promise<DecisionAuthority> => {
    return api.get<DecisionAuthority>('/targeting/mission/authority-matrix');
  },

  getOperationalTempo: async (): Promise<OperationalTempo> => {
    return api.get<OperationalTempo>('/targeting/mission/tempo');
  },

  // Targets
  getTargets: async (params?: { status?: string; priority?: string; limit?: number }): Promise<any[]> => {
    const queryParams: Record<string, string> = {};
    if (params?.status) queryParams.status = params.status;
    if (params?.priority) queryParams.priority = params.priority;
    if (params?.limit) queryParams.limit = params.limit.toString();
    return api.get<any[]>('/targeting/targets', queryParams);
  },

  getTarget: async (id: string): Promise<any> => {
    return api.get<any>(`/targeting/targets/${id}`);
  },

  // DTL (Dynamic Target List)
  getDtlEntries: async (params?: { limit?: number }): Promise<DtlEntry[]> => {
    const queryParams: Record<string, string> = {};
    if (params?.limit) queryParams.limit = params.limit.toString();
    return api.get<DtlEntry[]>('/targeting/dtl', queryParams);
  },

  getActiveTsts: async (): Promise<DtlEntry[]> => {
    // Returns DtlEntry[] where is_tst = true
    return api.get<DtlEntry[]>('/targeting/dtl/tst');
  },

  // Intelligence
  getIntelReports: async (): Promise<IntelReport[]> => {
    return api.get<IntelReport[]>('/targeting/intel/reports');
  },

  getIntelFusion: async (targetId: string): Promise<IntelReport[]> => {
    return api.get<IntelReport[]>(`/targeting/intel/fusion/${targetId}`);
  },

  // BDA
  getBdaAssessments: async (): Promise<BdaAssessment[]> => {
    return api.get<BdaAssessment[]>('/targeting/bda');
  },

  getReattackRecommendations: async (): Promise<BdaAssessment[]> => {
    return api.get<BdaAssessment[]>('/targeting/bda/re-attack');
  },

  getBdaAssessment: async (id: string): Promise<BdaAssessment> => {
    return api.get<BdaAssessment>(`/targeting/bda/${id}`);
  },

  // Strike Assets
  getStrikePlatforms: async (): Promise<StrikePlatform[]> => {
    return api.get<StrikePlatform[]>('/targeting/assets/platforms');
  },

  // ISR Platforms
  getIsrPlatforms: async (params?: { status?: string }): Promise<any[]> => {
    const queryParams: Record<string, string> = {};
    if (params?.status) queryParams.status = params.status;
    return api.get<any[]>('/targeting/isr/platforms', queryParams);
  },

  listIsrPlatforms: async (params?: { status?: string }): Promise<any[]> => {
    const queryParams: Record<string, string> = {};
    if (params?.status) queryParams.status = params.status;
    return api.get<any[]>('/targeting/isr/platforms', queryParams);
  },

  getPatternOfLife: async (): Promise<IntelReport[]> => {
    return api.get<IntelReport[]>('/targeting/isr/pattern-of-life');
  },

  // Risk Assessment
  getRiskAssessment: async (targetId: string): Promise<RiskAssessment> => {
    return api.get<RiskAssessment>(`/targeting/risk/${targetId}`);
  },

  getHighRiskTargets: async (): Promise<RiskAssessment[]> => {
    return api.get<RiskAssessment[]>('/targeting/risk/high');
  },

  // Alternative Analysis
  getAssumptions: async (): Promise<AssumptionChallenge[]> => {
    return api.get<AssumptionChallenge[]>('/targeting/analysis/assumptions');
  },

  getBiasAlerts: async (): Promise<AssumptionChallenge[]> => {
    return api.get<AssumptionChallenge[]>('/targeting/analysis/bias-alerts');
  },

  // Annotations
  getTargetAnnotations: async (targetId: string): Promise<TargetAnnotation[]> => {
    return api.get<TargetAnnotation[]>(`/targeting/annotations/${targetId}`);
  },
};
