
import { api } from '@/lib/api';

export interface Roe {
    id: string;
    name: string;
    description: string;
    status: 'ACTIVE' | 'CANCELLED' | 'DRAFT';
    roe_type: 'SELF_DEFENSE' | 'MISSION_SPECIFIC' | 'STANDING';
    created_at: string;
    created_by: string;
}

export interface CreateRoeRequest {
    name: string;
    description: string;
    roe_type: 'SELF_DEFENSE' | 'MISSION_SPECIFIC' | 'STANDING';
    status: 'ACTIVE' | 'CANCELLED' | 'DRAFT';
    created_by: string;
}

export interface RoeComplianceRequest {
    target_id: string;
    proposed_action: string;
}

export interface RoeComplianceResult {
    compliant: boolean;
    violated_rules: string[];
    caveats: string[];
}

export const RoeApi = {
    getActiveRoes: async (): Promise<Roe[]> => {
        return api.get<Roe[]>('/roe');
    },

    createRoe: async (req: CreateRoeRequest): Promise<{ id: string }> => {
        return api.post<{ id: string }>('/roe', req);
    },

    checkCompliance: async (req: RoeComplianceRequest): Promise<RoeComplianceResult> => {
        return api.post<RoeComplianceResult>('/roe/check', req);
    }
};
