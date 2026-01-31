import { store, LATENCY } from './store';
import type { AssessmentReport, UUID, EffectivenessGap } from '../types';

export const AssessmentService = {
    getAssessments: async (campaignId: UUID): Promise<AssessmentReport[]> => {
        return new Promise(resolve => setTimeout(() => resolve(store.assessments.filter(a => a.campaignId === campaignId)), LATENCY));
    },

    getGapAnalysis: async (campaignId: UUID): Promise<EffectivenessGap[]> => {
        return new Promise(resolve => setTimeout(() => resolve(store.effectivenessGaps.filter(g => g.campaignId === campaignId)), LATENCY));
    }
};
