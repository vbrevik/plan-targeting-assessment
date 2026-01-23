import { api } from './api';

export interface Assumption {
    id: string;
    operation_id?: string;
    campaign_id?: string;
    title: string;
    description?: string;
    category: string;
    status: 'Valid' | 'Monitoring' | 'Challenged' | 'Broken';
    risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
    confidence_score?: number;
    stated_by?: string;
    validated_by?: string;
    last_validated_at?: string;
    dependencies?: any;
    impact_notes?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateAssumptionRequest {
    operation_id?: string;
    campaign_id?: string;
    title: string;
    description?: string;
    category: string;
    confidence_score?: number;
    stated_by?: string;
    dependencies?: any;
}

export interface UpdateAssumptionRequest {
    title?: string;
    description?: string;
    category?: string;
    status?: string;
    risk_level?: string;
    confidence_score?: number;
    validated_by?: string;
    dependencies?: any;
    impact_notes?: string;
}

export interface AssumptionSummary {
    total: number;
    valid: number;
    monitoring: number;
    challenged: number;
    broken: number;
    high_risk: number;
    critical_risk: number;
}

export const assumptionsApi = {
    getAll: (params?: { status?: string; campaign_id?: string; operation_id?: string }) => {
        return api.get<Assumption[]>('/assumptions', params);
    },

    getById: (id: string) => {
        return api.get<Assumption>(`/assumptions/${id}`);
    },

    create: (data: CreateAssumptionRequest) => {
        return api.post<Assumption>('/assumptions', data);
    },

    update: (id: string, data: UpdateAssumptionRequest) => {
        return api.put<Assumption>(`/assumptions/${id}`, data);
    },

    delete: (id: string) => {
        return api.delete(`/assumptions/${id}`);
    },

    getSummary: () => {
        return api.get<AssumptionSummary>('/assumptions/summary');
    },
};
