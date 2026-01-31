import { api } from '@/lib/api';
import type { Campaign, Operation } from '@/lib/mshnctrl/types';

export const OperationsApi = {
    getCampaigns: async (): Promise<Campaign[]> => {
        return api.get<Campaign[]>('/operations/campaigns');
    },

    createCampaign: async (campaign: Partial<Campaign>): Promise<Campaign> => {
        return api.post<Campaign>('/operations/campaigns', campaign);
    },

    getOperations: async (campaignId: string): Promise<Operation[]> => {
        return api.get<Operation[]>(`/operations/campaigns/${campaignId}/operations`);
    },

    createOperation: async (operation: Partial<Operation>): Promise<Operation> => {
        return api.post<Operation>('/operations/operations', operation);
    }
};
