import { api } from '@/lib/api';
import type { Decision, DecisionAnalysis } from '../types';

export const decisionsApi = {
    /**
     * Get all pending decisions for the current operation/campaign scope
     */
    async getPendingDecisions(): Promise<{ decisions: Decision[] }> {
        return api.get<{ decisions: Decision[] }>('/c2/decisions/pending');
    },

    /**
     * Get full multi-criteria analysis for a specific decision
     */
    async getDecisionAnalysis(id: string): Promise<DecisionAnalysis> {
        return api.get<DecisionAnalysis>(`/c2/decisions/${id}/analysis`);
    },

    /**
     * Approve a decision with a selected option
     */
    async approveDecision(id: string, optionId: string, rationale: string): Promise<void> {
        return api.post(`/c2/decisions/${id}/approve`, { optionId, rationale });
    },

    /**
     * Route a decision to a specific meeting venue (CAB, DRB, etc.)
     */
    async routeDecision(id: string, venueId: string): Promise<void> {
        return api.post(`/c2/decisions/${id}/route`, { venueId });
    },

    /**
     * Create a new decision
     */
    async createDecision(req: {
        name: string;
        description?: string;
        source_id?: string;
        properties: any;
    }): Promise<{ id: string; status: string }> {
        return api.post('/c2/decisions', req);
    }
};
