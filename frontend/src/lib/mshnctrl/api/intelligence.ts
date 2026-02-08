// Intelligence API Service
// Connects frontend components to backend Intelligence APIs

import { api } from '@/lib/api';

// ============================================================================
// ENUMS & CONSTANTS (Matching backend/src/features/intelligence/domain/intel_feed.rs)
// ============================================================================

export type IntelType = 'sigint' | 'osint' | 'humint' | 'geoint' | 'masint';

// ============================================================================
// CORE MODELS
// ============================================================================

export interface IntelFeed {
    id: string;
    target_id: string;
    bda_report_id?: string;
    intel_type: IntelType;
    source_agency: string;
    raw_data: string;
    interpretation: string;
    confidence_score: number;
    reliability_rating: string;
    visibility_level: string;
    external_reference_id?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateIntelFeedRequest {
    target_id: string;
    bda_report_id?: string;
    intel_type: IntelType;
    source_agency: string;
    raw_data: string;
    interpretation: string;
    confidence_score: number;
    reliability_rating: string;
    visibility_level: string;
    external_reference_id?: string;
}

// ============================================================================
// API SERVICE
// ============================================================================

export const intelligenceApi = {
    // ============================================================================
    // RFI (Request for Information) - Uses Ontology API
    // ============================================================================

    /**
     * Get all RFIs (uses ontology entities)
     */
    getRFIs: async (): Promise<any[]> => {
        return api.get('/ontology/entities?type=RFI');
    },

    /**
     * Get a single RFI by ID
     */
    getRFI: async (id: string): Promise<any> => {
        return api.get(`/ontology/entities/${id}`);
    },

    /**
     * Create a new RFI (as ontology entity)
     */
    createRFI: async (data: any): Promise<any> => {
        return api.post('/ontology/entities', {
            ...data,
            type: 'RFI',
        });
    },

    /**
     * Update an RFI
     */
    updateRFI: async (id: string, data: any): Promise<any> => {
        return api.put(`/ontology/entities/${id}`, data);
    },

    /**
     * Delete an RFI
     */
    deleteRFI: async (id: string): Promise<void> => {
        return api.delete(`/ontology/entities/${id}`);
    },

    // ============================================================================
    // Intel Feeds
    // ============================================================================

    /**
     * Create a new intelligence feed entry
     */
    createFeed: async (feed: CreateIntelFeedRequest): Promise<IntelFeed> => {
        return api.post<IntelFeed>('/intelligence', feed);
    },

    /**
     * Get all intelligence feeds associated with a target
     */
    getFeedsByTarget: async (targetId: string): Promise<IntelFeed[]> => {
        return api.get<IntelFeed[]>(`/intelligence/target/${targetId}`);
    },

    /**
     * Get all intelligence feeds associated with a BDA report
     */
    getFeedsByReport: async (reportId: string): Promise<IntelFeed[]> => {
        return api.get<IntelFeed[]>(`/intelligence/report/${reportId}`);
    },

    /**
     * Get a single intelligence feed entry by ID
     */
    getFeed: async (id: string): Promise<IntelFeed> => {
        return api.get<IntelFeed>(`/intelligence/${id}`);
    },

    /**
     * Update an intelligence feed entry
     */
    updateFeed: async (id: string, feed: Partial<IntelFeed>): Promise<IntelFeed> => {
        return api.put<IntelFeed>(`/intelligence/${id}`, feed);
    },

    /**
     * Delete an intelligence feed entry
     */
    deleteFeed: async (id: string): Promise<void> => {
        return api.delete(`/intelligence/${id}`);
    },
};

// Backward compatibility export
export const IntelligenceApi = intelligenceApi;
