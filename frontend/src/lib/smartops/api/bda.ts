// BDA API Service
// Connects frontend components to backend BDA APIs

import { api } from '@/lib/api';

// ============================================================================
// TYPES
// ============================================================================


export type PhysicalDamage = 'none' | 'light' | 'moderate' | 'severe' | 'destroyed';
export type FunctionalDamage = 'none' | 'degraded' | 'non_mission_capable';
export type AssessmentType = 'initial' | 'supplemental' | 'final';
export type Recommendation = 'effect_achieved' | 're_attack' | 're_weaponeer' | 'monitor';
export type EffectLevel = 'none' | 'limited' | 'significant' | 'full'; // Assuming values based on error context or standard BDA
export type SensorType = 'SAR' | 'EO' | 'IR' | 'FMV' | 'Commercial' | 'Other';

export interface CreateBdaReportRequest extends Partial<BdaReport> {
  target_id: string;
  // other required fields
}

export interface BdaReport {
  id: string;
  target_id: string;
  strike_id?: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  assessment_type: AssessmentType;
  physical_damage: PhysicalDamage;
  functional_damage: FunctionalDamage;
  recommendation: Recommendation;
  effect_level?: EffectLevel; // Added optional field if needed
  confidence: number;
  assessment_date: string;
  analyst_id: string;
  classification: string;
}

export interface BdaStatistics {
  total_reports: number;
  pending_assessment: number;
  approved: number;
  re_attack_recommended: number;
  average_confidence: number;
}

export interface BdaImagery {
  id: string;
  bda_report_id: string;
  collection_date: string;
  collection_platform?: string;
  sensor_type?: SensorType;
  is_pre_strike_baseline: boolean;
  image_url: string;
  thumbnail_url?: string;
  image_format?: string;
  file_size_bytes?: number;
  classification_level: string;
  annotations_json?: string;
  annotated_by?: string;
  annotated_at?: string;
  [key: string]: any; // Allow additional fields
}


// ============================================================================
// API SERVICE
// ============================================================================

export const BdaApi = {
  // Get BDA queue (reports needing assessment)
  getQueue: async (): Promise<BdaReport[]> => {
    return api.get<BdaReport[]>('/bda/queue');
  },

  // Get BDA statistics
  getStatistics: async (): Promise<BdaStatistics> => {
    return api.get<BdaStatistics>('/bda/statistics');
  },

  // Get all BDA reports
  getReports: async (params?: { status?: string; target_id?: string }): Promise<BdaReport[]> => {
    return api.get<BdaReport[]>('/bda/reports', params);
  },

  // Get single BDA report
  getReport: async (id: string): Promise<BdaReport> => {
    return api.get<BdaReport>(`/bda/reports/${id}`);
  },

  // Create BDA report
  createReport: async (report: Partial<BdaReport>): Promise<BdaReport> => {
    return api.post<BdaReport>('/bda/reports', report);
  },

  // Update BDA report
  updateReport: async (id: string, report: Partial<BdaReport>): Promise<BdaReport> => {
    return api.put<BdaReport>(`/bda/reports/${id}`, report);
  },

  // Submit BDA report
  submitReport: async (id: string): Promise<void> => {
    return api.post(`/bda/reports/${id}/submit`, {});
  },

  // Approve BDA report
  approveReport: async (id: string): Promise<void> => {
    return api.post(`/bda/reports/${id}/approve`, {});
  },

  // Reject BDA report
  rejectReport: async (id: string): Promise<void> => {
    return api.post(`/bda/reports/${id}/reject`, {});
  },

  // Upload imagery file (multipart/form-data)
  uploadImageryFile: async (formData: FormData): Promise<BdaImagery> => {
    // Use fetch directly for multipart/form-data (can't use api.post with FormData)
    const response = await fetch('/api/bda/imagery/upload', {
      method: 'POST',
      body: formData,
      credentials: 'include',
      // Don't set Content-Type - browser will set it with boundary
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `API Error: ${response.status}`);
    }

    return response.json();
  },

  // Get imagery by ID
  getImagery: async (id: string): Promise<BdaImagery> => {
    return api.get<BdaImagery>(`/bda/imagery/${id}`);
  },

  // Get imagery for a report
  getReportImagery: async (reportId: string): Promise<BdaImagery[]> => {
    return api.get<BdaImagery[]>(`/bda/reports/${reportId}/imagery`);
  },

  // Update imagery
  updateImagery: async (id: string, updates: Partial<BdaImagery>): Promise<BdaImagery> => {
    return api.put<BdaImagery>(`/bda/imagery/${id}`, updates);
  },

  // Get report history
  getReportHistory: async (reportId: string, params?: { limit?: number; offset?: number }): Promise<ReportHistoryResponse> => {
    return api.get<ReportHistoryResponse>(`/bda/reports/${reportId}/history`, params);
  },

  // Get specific version
  getReportVersion: async (reportId: string, version: number): Promise<BdaReportHistory> => {
    return api.get<BdaReportHistory>(`/bda/reports/${reportId}/history/${version}`);
  },

  // Component Assessments
  getReportComponents: async (reportId: string): Promise<BdaComponentAssessment[]> => {
    return api.get<BdaComponentAssessment[]>(`/bda/reports/${reportId}/components`);
  },

  createComponentAssessment: async (component: Partial<BdaComponentAssessment>): Promise<BdaComponentAssessment> => {
    return api.post<BdaComponentAssessment>('/bda/components', component);
  },

  updateComponentAssessment: async (id: string, component: Partial<BdaComponentAssessment>): Promise<BdaComponentAssessment> => {
    return api.put<BdaComponentAssessment>(`/bda/components/${id}`, component);
  },

  deleteComponentAssessment: async (id: string): Promise<void> => {
    return api.delete(`/bda/components/${id}`);
  },

  // Peer Reviews
  getReportReviews: async (reportId: string): Promise<BdaPeerReview[]> => {
    return api.get<BdaPeerReview[]>(`/bda/reports/${reportId}/reviews`);
  },

  getReviewSummary: async (reportId: string): Promise<BdaReviewSummary> => {
    return api.get<BdaReviewSummary>(`/bda/reports/${reportId}/reviews/summary`);
  },

  createPeerReview: async (review: Partial<BdaPeerReview>): Promise<BdaPeerReview> => {
    return api.post<BdaPeerReview>('/bda/reviews', review);
  },

  updatePeerReview: async (id: string, review: Partial<BdaPeerReview>): Promise<BdaPeerReview> => {
    return api.put<BdaPeerReview>(`/bda/reviews/${id}`, review);
  },

  deletePeerReview: async (id: string): Promise<void> => {
    return api.delete(`/bda/reviews/${id}`);
  },

  // Report Generation
  getReportTemplates: async (): Promise<BdaReportTemplate[]> => {
    return api.get<BdaReportTemplate[]>('/bda/templates');
  },

  generateReport: async (reportId: string, request: GenerateReportRequest): Promise<Blob | any> => {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/bda/reports/${reportId}/generate`, {
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

    // Check content type to determine if it's a blob or JSON
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return response.json();
    } else {
      return response.blob();
    }
  },
};

// ============================================================================
// REPORT TEMPLATE TYPES
// ============================================================================

export interface BdaReportTemplate {
  type: 'initial' | 'interim' | 'final' | 'executive_summary' | 'technical';
  name: string;
  description: string;
}

export interface GenerateReportRequest {
  bda_report_id: string;
  template_type: 'initial' | 'interim' | 'final' | 'executive_summary' | 'technical' | 'statistical' | 'lessons_learned' | 'after_action';
  format: 'pdf' | 'nitfs' | 'kml' | 'json' | 'html';
  include_imagery?: boolean;
  include_components?: boolean;
  include_peer_reviews?: boolean;
  include_history?: boolean;
  classification?: 'UNCLASSIFIED' | 'CONFIDENTIAL' | 'SECRET' | 'TOP_SECRET' | 'TOP_SECRET_SCI';
  custom_sections?: string[];
}

export interface ReportGenerationResponse {
  report_id: string;
  template_type: string;
  format: string;
  file_url?: string;
  file_size_bytes?: number;
  generated_at: string;
  generated_by: string;
  classification: string;
}

// ============================================================================
// DISTRIBUTION TYPES
// ============================================================================

export interface BdaDistributionList {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface BdaDistributionMember {
  id: string;
  distribution_list_id: string;
  recipient_name: string;
  recipient_email?: string;
  recipient_role?: string;
  recipient_organization?: string;
  delivery_method: 'email' | 'system' | 'manual' | 'api';
  delivery_preferences?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BdaReportDistribution {
  id: string;
  bda_report_id: string;
  distribution_list_id?: string;
  recipient_name: string;
  recipient_email?: string;
  report_format: string;
  report_template_type: string;
  classification_level: string;
  delivery_status: 'pending' | 'sent' | 'delivered' | 'failed' | 'cancelled';
  delivery_method: 'email' | 'system' | 'manual' | 'api';
  sent_at?: string;
  delivered_at?: string;
  delivery_attempts: number;
  last_error?: string;
  distributed_by: string;
  distributed_at: string;
  delivery_confirmation_received: boolean;
  confirmation_received_at?: string;
  file_url?: string;
  file_size_bytes?: number;
}

export interface BdaDistributionSummary {
  bda_report_id: string;
  total_distributions: number;
  delivered_count: number;
  sent_count: number;
  pending_count: number;
  failed_count: number;
  confirmed_count: number;
  first_sent_at?: string;
  last_delivered_at?: string;
}

export interface DistributeReportRequest {
  distribution_list_ids?: string[];
  individual_recipients?: Array<{
    recipient_name: string;
    recipient_email?: string;
    recipient_role?: string;
    recipient_organization?: string;
  }>;
  report_format: string;
  report_template_type: string;
  classification_level: string;
  delivery_method?: 'email' | 'system' | 'manual' | 'api';
}

// ============================================================================
// PEER REVIEW TYPES
// ============================================================================

export interface BdaPeerReview {
  id: string;
  bda_report_id: string;
  reviewer_id: string;
  reviewer_name?: string;
  reviewer_role?: string;
  assigned_by: string;
  assigned_at: string;
  due_date?: string;
  priority: 'normal' | 'urgent' | 'critical';
  review_status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  started_at?: string;
  completed_at?: string;
  overall_quality: 'high' | 'medium' | 'low' | 'needs_rework';
  confidence_adequate?: boolean;
  evidence_sufficient?: boolean;
  methodology_sound?: boolean;
  recommendations_appropriate?: boolean;
  review_comments?: string;
  strengths?: string;
  weaknesses?: string;
  specific_concerns?: string;
  recommendation: 'approve' | 'approve_with_changes' | 'reject' | 'request_clarification';
  required_changes?: string;
  clarification_questions?: string;
  imagery_reviewed: boolean;
  damage_categories_correct: boolean;
  functional_assessment_complete: boolean;
  component_assessments_reviewed: boolean;
  collateral_damage_assessed: boolean;
  weaponeering_validated: boolean;
  recommendations_justified: boolean;
  classification_appropriate: boolean;
  time_spent_minutes?: number;
  review_version: number;
  created_at: string;
  updated_at: string;
}

export interface BdaReviewSummary {
  bda_report_id: string;
  total_reviews: number;
  completed_reviews: number;
  pending_reviews: number;
  in_progress_reviews: number;
  approve_count: number;
  approve_with_changes_count: number;
  reject_count: number;
  clarification_count: number;
  avg_quality_score?: number;
  earliest_due_date?: string;
  last_completed_at?: string;
}

// ============================================================================
// COMPONENT ASSESSMENT TYPES
// ============================================================================

export interface BdaComponentAssessment {
  id: string;
  bda_report_id: string;
  component_name: string;
  component_type: 'structure' | 'equipment' | 'infrastructure' | 'vehicle' | 'other';
  component_location?: string;
  physical_damage: 'ND' | 'SD' | 'MD' | 'SVD' | 'D';
  physical_damage_percentage?: number;
  damage_description?: string;
  functional_damage: 'FMC' | 'PMC' | 'NMC';
  estimated_repair_time_hours?: number;
  repair_cost_estimate_usd?: number;
  component_criticality?: 'critical' | 'important' | 'supporting' | 'non_essential';
  pre_strike_function?: string;
  post_strike_function?: string;
  replacement_required: boolean;
  replacement_availability_days?: number;
  assessed_by: string;
  assessed_at: string;
  confidence_level?: number;
  assessment_notes?: string;
  classification_level: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// HISTORY TYPES
// ============================================================================

export interface BdaReportHistory {
  id: string;
  bda_report_id: string;
  version_number: number;
  report_data_json: string;
  changed_by: string;
  changed_at: string;
  change_type: 'created' | 'updated' | 'submitted' | 'reviewed' | 'approved' | 'rejected';
  change_description?: string;
  status: string;
}

export interface ReportHistoryResponse {
  history: BdaReportHistory[];
  total: number;
  latest_version: number;
}
