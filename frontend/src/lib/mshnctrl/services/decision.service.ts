import type { Decision, DecisionAnalysis } from '../types';
import { decisionsApi } from '../api/decisions.api';

/**
 * Service for managing decisions in the C2 Command & Control system.
 * This service mediates between the Decision Board components and the backend API.
 * It is fully ontology-driven, fetching data from the C2 Decision ontology.
 */
export const DecisionService = {
    /**
     * Fetches all decisions requiring commander attention.
     */
    getPendingDecisions: async (): Promise<Decision[]> => {
        try {
            const response = await decisionsApi.getPendingDecisions();
            return response.decisions || [];
        } catch (error) {
            console.error('[DecisionService] Failed to fetch pending decisions:', error);
            return [];
        }
    },

    /**
     * Fetches a specific decision by its ontology ID.
     */
    getDecisionById: async (id: string): Promise<Decision | null> => {
        try {
            // For now, we fetch pending and filter. 
            // In a mature implementation, we'd have a specific GET /entities/:id call.
            const pending = await decisionsApi.getPendingDecisions();
            const decision = pending.decisions?.find(d => d.id === id);
            return decision || null;
        } catch (error) {
            console.error(`[DecisionService] Failed to fetch decision ${id}:`, error);
            return null;
        }
    },

    /**
     * Performs a multi-criteria analysis of the decision, including trade-offs and consequences.
     */
    analyzeDecision: async (decisionId: string): Promise<DecisionAnalysis> => {
        try {
            return await decisionsApi.getDecisionAnalysis(decisionId);
        } catch (error) {
            console.error(`[DecisionService] Failed to analyze decision ${decisionId}:`, error);
            throw error;
        }
    },

    /**
     * Records the commander's selection and rationale.
     */
    approveDecision: async (decisionId: string, optionId: string, rationale: string): Promise<void> => {
        try {
            await decisionsApi.approveDecision(decisionId, optionId, rationale);
        } catch (error) {
            console.error(`[DecisionService] Failed to approve decision ${decisionId}:`, error);
            throw error;
        }
    },

    /**
     * Routes the decision to a specific meeting or board (CAB, DRB, etc.)
     */
    routeDecision: async (decisionId: string, venueId: string): Promise<void> => {
        try {
            await decisionsApi.routeDecision(decisionId, venueId);
        } catch (error) {
            console.error(`[DecisionService] Failed to route decision ${decisionId}:`, error);
            throw error;
        }
    }
};
