// ROE (Rules of Engagement) API Service
// Connects frontend components to backend ROE APIs

import { api } from '@/lib/api';
import type { RoutingPlan } from '@/lib/mshnctrl/types';

// ============================================================================
// TYPES
// ============================================================================

export interface DecisionROEStatus {
    decision_id: string;
    roe_status?: string;
    roe_notes?: string;
    roe_request_id?: string;
}

export interface CreateROERequestRequest {
    approval_authority?: string;
    request_justification: string;
    roe_reference?: string;
    conditions?: string;
}

export interface ROERequest {
    id: string;
    decision_id: string;
    requested_by: string;
    requested_at: string;
    approval_authority?: string;
    request_justification: string;
    status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
    approved_by?: string;
    approved_at?: string;
    rejection_reason?: string;
    roe_reference?: string;
    expiration_date?: string;
    conditions?: string;
    created_at: string;
    updated_at: string;
}

export interface ROEBlockingCheck {
    can_proceed: boolean;
    is_blocked: boolean;
    is_pending: boolean;
    roe_status?: string;
    blocking_reason?: string;
    suggested_action?: string;
}

export interface AutoDetermineROEResponse {
    decision_id: string;
    roe_status: string;
    roe_notes?: string;
}

// ============================================================================
// ROE API CLIENT
// ============================================================================

export const roeApi = {
    /**
     * Get ROE status for a decision
     */
    async getDecisionROEStatus(decisionId: string): Promise<DecisionROEStatus> {
        return api.get<DecisionROEStatus>(`/roe/decisions/${decisionId}/status`);
    },

    /**
     * Update ROE status for a decision
     */
    async updateDecisionROEStatus(
        decisionId: string,
        data: {
            roe_status?: string;
            roe_notes?: string;
            roe_request_id?: string;
        }
    ): Promise<DecisionROEStatus> {
        return api.patch<DecisionROEStatus>(`/roe/decisions/${decisionId}/status`, data);
    },

    /**
     * Auto-determine ROE status for a decision
     */
    async autoDetermineROEStatus(decisionId: string): Promise<AutoDetermineROEResponse> {
        return api.post<AutoDetermineROEResponse>(`/roe/decisions/${decisionId}/auto-determine`, {});
    },

    /**
     * Create ROE request for a decision
     */
    async createROERequest(
        decisionId: string,
        data: CreateROERequestRequest
    ): Promise<ROERequest> {
        return api.post<ROERequest>(`/roe/decisions/${decisionId}/request`, data);
    },

    /**
     * Get ROE request by ID
     */
    async getROERequest(requestId: string): Promise<ROERequest> {
        return api.get<ROERequest>(`/roe/requests/${requestId}`);
    },

    /**
     * Update ROE request status (approve/reject)
     */
    async updateROERequestStatus(
        requestId: string,
        data: {
            status: 'approved' | 'rejected' | 'withdrawn';
            approved_by?: string;
            rejection_reason?: string;
            roe_reference?: string;
            expiration_date?: string;
            conditions?: string;
        }
    ): Promise<ROERequest> {
        return api.patch<ROERequest>(`/roe/requests/${requestId}`, data);
    },

    /**
     * Get ROE request by decision ID
     */
    async getROERequestByDecision(decisionId: string): Promise<ROERequest | null> {
        return api.get<ROERequest | null>(`/roe/requests/decision/${decisionId}`);
    },

    /**
     * List ROE requests with optional status filter
     */
    async listROERequests(params?: { status?: string }): Promise<ROERequest[]> {
        const queryParams: Record<string, string> = {};
        if (params?.status) queryParams.status = params.status;
        return api.get<ROERequest[]>('/roe/requests', queryParams);
    },

    /**
     * Check if decision is blocked by ROE
     */
    async checkROEBlocking(decisionId: string): Promise<ROEBlockingCheck> {
        return api.get<ROEBlockingCheck>(`/roe/decisions/${decisionId}/check-blocking`);
    },

    /**
     * Route decision (includes ROE blocking check)
     */
    async routeDecision(decisionId: string): Promise<RoutingPlan> {
        return api.get<RoutingPlan>(`/roe/decisions/${decisionId}/route`);
    },
};
