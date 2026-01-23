import { store, LATENCY } from './store';
import type { Campaign, UUID, LineOfOperation, DecisiveCondition, DCStatus, Operation, JointCoordinationOrder, Scenario, StrategicGuidance, CourseOfAction } from '../types';

export const CampaignService = {
    getActiveCampaign: async (): Promise<Campaign | undefined> => {
        return new Promise(resolve => setTimeout(() => resolve(store.campaigns.find(c => c.status === 'Active')), LATENCY));
    },

    getCampaignLOOs: async (campaignId: UUID): Promise<LineOfOperation[]> => {
        return new Promise(resolve => setTimeout(() => resolve(store.loos.filter(l => l.campaignId === campaignId).sort((a, b) => a.sequence - b.sequence)), LATENCY));
    },

    getLOODecisiveConditions: async (campaignId: UUID): Promise<DecisiveCondition[]> => {
        return new Promise(resolve => setTimeout(() => resolve(store.decisiveConditions.filter(dc => dc.campaignId === campaignId)), LATENCY));
    },

    updateDCStatus: async (id: UUID, status: DCStatus): Promise<DecisiveCondition> => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const idx = store.decisiveConditions.findIndex(dc => dc.id === id);
                if (idx === -1) return reject('DC not found');
                store.decisiveConditions[idx] = { ...store.decisiveConditions[idx], status };
                resolve(store.decisiveConditions[idx]);
            }, LATENCY);
        });
    },

    getOperations: async (campaignId: UUID): Promise<Operation[]> => {
        return new Promise(resolve => setTimeout(() => resolve(store.operations.filter(op => op.campaignId === campaignId)), LATENCY));
    },

    getActiveJCOs: async (campaignId: UUID): Promise<JointCoordinationOrder[]> => {
        return new Promise(resolve => setTimeout(() => resolve(store.activeJCOs.filter(j => j.campaignId === campaignId)), LATENCY));
    },

    getScenarios: async (): Promise<Scenario[]> => {
        return new Promise(resolve => setTimeout(() => resolve([...store.scenarios]), LATENCY));
    },

    getStrategicGuidance: async (): Promise<StrategicGuidance> => {
        return new Promise(resolve => setTimeout(() => resolve({ ...store.strategicGuidance }), LATENCY));
    },

    getCOAs: async (operationId?: UUID): Promise<CourseOfAction[]> => {
        return new Promise(resolve => setTimeout(() => {
            const data = operationId ? store.coas.filter(c => c.operationId === operationId) : store.coas;
            resolve([...data]);
        }, LATENCY));
    },

    updateCOA: async (coaId: UUID, updates: Partial<CourseOfAction>): Promise<CourseOfAction> => {
        return new Promise((resolve, reject) => setTimeout(() => {
            const coa = store.coas.find(c => c.id === coaId);
            if (!coa) return reject('CoA not found');
            Object.assign(coa, updates);
            resolve({ ...coa });
        }, LATENCY));
    }
};
