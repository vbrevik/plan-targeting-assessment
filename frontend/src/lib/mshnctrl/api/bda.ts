// BDA API Service
// Connects frontend components to backend BDA APIs

import { api } from '@/lib/api';
import type { BdaReportEntity } from '@/lib/mshnctrl/types';

// ============================================================================
// ENUMS & CONSTANTS (Matching backend/src/features/bda/domain/bda_report.rs)
// ============================================================================

export type PhysicalDamage = 'ND' | 'SD' | 'MD' | 'SVD' | 'D';
export type FunctionalDamage = 'FMC' | 'PMC' | 'NMC';
export type AssessmentType = 'initial' | 'interim' | 'final';
export type Recommendation = 'effect_achieved' | 'monitor' | 're_attack' | 're_weaponeer';
export type BdaStatus = 'draft' | 'submitted' | 'reviewed' | 'approved' | 'rejected';
export type AssessmentQuality = 'high' | 'medium' | 'low';
export type GuidancePerformance = 'nominal' | 'degraded' | 'failed';
export type WeaponPerformance = 'exceeded' | 'met' | 'below' | 'failed';
export type CivcasCredibility = 'no_credibility' | 'possible' | 'credible' | 'confirmed';
export type EffectLevel = 'first_order' | 'second_order' | 'third_order';

// ============================================================================
// CORE MODELS
// ============================================================================

/**
 * @deprecated Use BdaReportEntity from types.ts instead
 * Legacy interface for backward compatibility  
 */
export interface BdaReport {
  id: string;
  target_id: string;
  strike_id?: string;

  assessment_date: string;
  analyst_id: string;
  assessment_type: AssessmentType;

  physical_damage: PhysicalDamage;
  physical_damage_percentage?: number;
  damage_description?: string;

  functional_damage: FunctionalDamage;
  estimated_repair_time_hours?: number;
  pre_strike_capability_baseline?: string;

  desired_effect: string;
  achieved_effect: string;
  effect_level?: EffectLevel;
  unintended_effects?: string;

  confidence_level: number;
  assessment_quality?: AssessmentQuality;
  limiting_factors?: string;

  recommendation: Recommendation;
  re_attack_priority?: number;
  re_attack_rationale?: string;
  alternative_munitions?: string;

  collateral_damage_detected: boolean;
  civcas_credibility?: CivcasCredibility;
  civilian_casualties_estimate?: number;
  protected_structures_damaged?: string;
  cde_vs_actual_comparison?: string;

  // Weaponeering Validation (Phase 2)
  weapon_performance_vs_predicted?: WeaponPerformance;
  munition_reliability?: string;
  circular_error_probable_meters?: number;
  penetration_depth_meters?: number;

  status: BdaStatus;
  submitted_at?: string;
  reviewed_at?: string;
  reviewed_by?: string;
  approved_at?: string;
  approved_by?: string;

  classification_level: string;
  handling_caveats?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// STATISTICS
// ============================================================================

export interface BdaStatusCounts {
  draft: number;
  submitted: number;
  reviewed: number;
  approved: number;
  rejected: number;
}

export interface BdaRecommendationCounts {
  effect_achieved: number;
  monitor: number;
  re_attack: number;
  re_weaponeer: number;
}

export interface BdaStatistics {
  total_reports: number;
  by_status: BdaStatusCounts;
  by_recommendation: BdaRecommendationCounts;
  by_physical_damage: Record<string, number>;
  average_confidence: number;
  collateral_damage_incidents: number;
}

// ============================================================================
// WEAPONEERING (Phase 2)
// ============================================================================

export interface WeaponPerformanceSummary {
  weapon_system: string;
  munition_type: string;
  total_strikes: number;
  successful_detonations: number;
  avg_cep_meters: number;
  avg_blast_radius_meters: number;
  malfunctions: number;
  reliability_percentage: number;
}

export interface StrikeCorrelation {
  id: string;
  bda_report_id: string;
  target_id?: string;
  weapon_system: string;
  munition_type: string;
  munition_quantity: number;
  time_on_target: string;
  impact_coordinates: string;
  dmpi_coordinates?: string;
  offset_from_dmpi_meters?: number;
  successful_detonation?: boolean;
  fuzing_as_designed?: boolean;
  guidance_system_performance?: GuidancePerformance;
  circular_error_probable_meters?: number;
  malfunction_detected: boolean;
  classification_level: string;
  created_at: string;
}

// ============================================================================
// IMAGERY
// ============================================================================

export interface BdaImagery {
  id: string;
  bda_report_id: string;
  collection_date: string;
  image_url: string;
  thumbnail_url?: string;
  is_pre_strike_baseline: boolean;
  sensor_type?: string;
  classification_level: string;
  [key: string]: any;
}

// ============================================================================
// API SERVICE
// ============================================================================

/**
 * @deprecated Use Partial<BdaReportEntity> instead
 */
export type CreateBdaReportRequest = Partial<BdaReport>;

export const BdaApi = {
  // Reports (Phase 3: Using unified BdaReportEntity types)
  getQueue: async (): Promise<BdaReportEntity[]> => {
    return api.get<BdaReportEntity[]>('/bda/queue');
  },

  getStatistics: async (): Promise<BdaStatistics> => {
    return api.get<BdaStatistics>('/bda/statistics');
  },

  getReports: async (params?: { target_id?: string }): Promise<BdaReportEntity[]> => {
    if (!params?.target_id) throw new Error("target_id is required to fetch BDA reports");
    return api.get<BdaReportEntity[]>(`/bda/${params.target_id}`);
  },

  getReport: async (id: string): Promise<BdaReportEntity> => {
    return api.get<BdaReportEntity>(`/bda/reports/${id}`);
  },

  createReport: async (report: Partial<BdaReportEntity>): Promise<BdaReportEntity> => {
    return api.post<BdaReportEntity>('/bda', report);
  },

  updateReport: async (id: string, report: Partial<BdaReportEntity>): Promise<BdaReportEntity> => {
    return api.put<BdaReportEntity>(`/bda/reports/${id}`, report);
  },

  submitReport: async (id: string): Promise<void> => {
    return api.post(`/bda/reports/${id}/submit`, {});
  },

  approveReport: async (id: string): Promise<void> => {
    return api.post(`/bda/reports/${id}/approve`, {});
  },

  rejectReport: async (id: string): Promise<void> => {
    return api.post(`/bda/reports/${id}/reject`, {});
  },

  // Weapon Performance (Phase 2)
  getWeaponPerformance: async (): Promise<WeaponPerformanceSummary[]> => {
    return api.get<WeaponPerformanceSummary[]>('/bda/weapon-performance');
  },

  // Strike Correlation (Phase 2)
  getReportStrikes: async (reportId: string): Promise<StrikeCorrelation[]> => {
    return api.get<StrikeCorrelation[]>(`/bda/reports/${reportId}/strikes`);
  },

  createStrikeCorrelation: async (data: any): Promise<StrikeCorrelation> => {
    return api.post<StrikeCorrelation>('/bda/strikes', data);
  },

  getStrikesByTarget: async (targetId: string): Promise<any[]> => {
    return api.get<any[]>(`/bda/strikes/target/${targetId}`);
  },

  // Imagery
  getReportImagery: async (reportId: string): Promise<BdaImagery[]> => {
    return api.get<BdaImagery[]>(`/bda/reports/${reportId}/imagery`);
  },

  uploadImageryFile: async (formData: FormData): Promise<BdaImagery> => {
    const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/bda/imagery/upload`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || `API Error: ${response.status}`);
    }

    return response.json();
  },

  // History
  getReportHistory: async (reportId: string): Promise<any> => {
    return api.get(`/bda/reports/${reportId}/history`);
  },

  // Components
  getReportComponents: async (reportId: string): Promise<any[]> => {
    return api.get(`/bda/reports/${reportId}/components`);
  },

  // Reviews
  getReportReviews: async (reportId: string): Promise<any[]> => {
    return api.get(`/bda/reports/${reportId}/reviews`);
  },

  getReviewSummary: async (reportId: string): Promise<any> => {
    return api.get(`/bda/reports/${reportId}/reviews/summary`);
  },

  // Generation
  generateReport: async (reportId: string, request: any): Promise<Blob | any> => {
    const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/bda/reports/${reportId}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate report: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return response.json();
    } else {
      return response.blob();
    }
  },
};

