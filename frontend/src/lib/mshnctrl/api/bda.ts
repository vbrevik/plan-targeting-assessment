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
// COMPONENT ASSESSMENTS
// ============================================================================

export interface BdaComponentAssessment {
  id: string;
  bda_report_id: string;
  component_name: string;
  component_type?: string;
  physical_damage?: PhysicalDamage;
  functional_damage?: FunctionalDamage;
  damage_percentage?: number;
  criticality?: 'critical' | 'important' | 'supporting';
  notes?: string;
  created_at: string;
  updated_at: string;
  component_location?: string;
  physical_damage_percentage?: number;
  component_criticality?: string;
  replacement_required?: boolean;
  damage_description?: string;
  estimated_repair_time_hours?: number;
  repair_cost_estimate_usd?: number;
  replacement_availability_days?: number;
  confidence_level?: number;
  pre_strike_function?: string;
  post_strike_function?: string;
}

// ============================================================================
// DISTRIBUTION
// ============================================================================

export interface BdaDistributionList {
  id: string;
  name: string;
  description?: string;
  recipients: string[];
  classification_level: string;
  created_at: string;
}

export interface BdaReportDistribution {
  id: string;
  bda_report_id: string;
  distribution_list_id: string;
  distributed_at: string;
  distributed_by: string;
  delivery_method: string;
  status: 'pending' | 'delivered' | 'failed';
  recipient_name?: string;
  recipient_email?: string;
  delivery_status?: string;
  report_format?: string;
  sent_at?: string;
  delivered_at?: string;
  delivery_attempts?: number;
  last_error?: string;
  delivery_confirmation_received?: boolean;
}

export interface BdaDistributionSummary {
  total_distributions: number;
  by_status: Record<string, number>;
  last_distributed_at?: string;
  delivered_count?: number;
  sent_count?: number;
  pending_count?: number;
  failed_count?: number;
}

// ============================================================================
// SENSOR TYPES
// ============================================================================

export type SensorType = 'EO' | 'IR' | 'SAR' | 'MTI' | 'LIDAR' | 'MULTI';

// ============================================================================
// PEER REVIEW
// ============================================================================

export interface BdaPeerReview {
  id: string;
  bda_report_id: string;
  reviewer_id: string;
  reviewer_name?: string;
  status: 'pending' | 'approved' | 'rejected' | 'revision_requested';
  comments?: string;
  reviewed_at?: string;
  created_at: string;
  reviewer_role?: string;
  review_status?: string;
  priority?: string;
  due_date?: string;
  overall_quality?: number;
  recommendation?: string;
  time_spent_minutes?: number;
  review_comments?: string[];
  strengths?: string[];
  weaknesses?: string[];
  required_changes?: string[];
  clarification_questions?: string[];
  imagery_reviewed?: boolean;
  damage_categories_correct?: boolean;
  functional_assessment_complete?: boolean;
  component_assessments_reviewed?: boolean;
  collateral_damage_assessed?: boolean;
  weaponeering_validated?: boolean;
  recommendations_justified?: boolean;
  classification_appropriate?: boolean;
}

export interface BdaReviewSummary {
  total_reviews: number;
  approved: number;
  rejected: number;
  pending: number;
  consensus: 'approved' | 'rejected' | 'pending' | 'mixed';
  completed_reviews?: number;
}

// ============================================================================
// REPORT GENERATION
// ============================================================================

export interface GenerateReportRequest {
  bda_report_id: string;
  template_type: string;
  format: 'pdf' | 'html' | 'json' | 'kml';
  include_imagery?: boolean;
  include_components?: boolean;
  include_peer_reviews?: boolean;
  include_history?: boolean;
  classification?: string;
}

export interface BdaReportTemplate {
  id: string;
  name: string;
  type: string;
  description?: string;
  format: string;
}

export interface ReportGenerationResponse {
  report_id: string;
  format: string;
  url?: string;
  generated_at: string;
}

// ============================================================================
// REPORT HISTORY
// ============================================================================

export interface BdaReportHistory {
  version_number: number;
  changed_by: string;
  changed_at: string;
  change_summary?: string;
  report_data_json: string;
  id?: string;
  change_type?: string;
  status?: string;
  change_description?: string;
}

export interface ReportHistoryResponse {
  report_id: string;
  history: BdaReportHistory[];
  total?: number;
  latest_version?: number;
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

  getReports: async (params?: { target_id?: string; limit?: number }): Promise<BdaReportEntity[]> => {
    if (params?.target_id) {
      return api.get<BdaReportEntity[]>(`/bda/${params.target_id}`);
    }
    const queryParams: Record<string, string> = {};
    if (params?.limit) queryParams.limit = params.limit.toString();
    return api.get<BdaReportEntity[]>('/bda/reports', queryParams);
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

  // Component Assessments
  deleteComponentAssessment: async (id: string): Promise<void> => {
    return api.delete(`/bda/components/${id}`);
  },

  // Distribution
  getDistributionLists: async (): Promise<BdaDistributionList[]> => {
    return api.get<BdaDistributionList[]>('/bda/distribution-lists');
  },

  getReportDistributions: async (reportId: string): Promise<BdaReportDistribution[]> => {
    return api.get<BdaReportDistribution[]>(`/bda/reports/${reportId}/distributions`);
  },

  getReportDistributionSummary: async (reportId: string): Promise<BdaDistributionSummary> => {
    return api.get<BdaDistributionSummary>(`/bda/reports/${reportId}/distributions/summary`);
  },

  distributeReport: async (reportId: string, params: {
    distribution_list_ids: string[];
    report_format: string;
    report_template_type: string;
    classification_level: string;
    delivery_method: string;
  }): Promise<void> => {
    return api.post(`/bda/reports/${reportId}/distribute`, params);
  },

  // Imagery updates
  updateImagery: async (id: string, data: Partial<BdaImagery>): Promise<BdaImagery> => {
    return api.put<BdaImagery>(`/bda/imagery/${id}`, data);
  },

  // Report Templates
  getReportTemplates: async (): Promise<BdaReportTemplate[]> => {
    return api.get<BdaReportTemplate[]>('/bda/report-templates');
  },

  // Report Version
  getReportVersion: async (reportId: string, versionNumber: number): Promise<BdaReportHistory> => {
    return api.get<BdaReportHistory>(`/bda/reports/${reportId}/history/${versionNumber}`);
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

