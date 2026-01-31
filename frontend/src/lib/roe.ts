import { api } from './api';

export type ROEStatus = 'Active' | 'Draft' | 'Archived' | 'Superseded';

export interface ROE {
    id: string;
    code: string;
    description: string;
    status: ROEStatus;
    category?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
    created_by: string;
}

export type ROERequestStatus = 'Draft' | 'Submitted' | 'InReview' | 'Approved' | 'Rejected';

export interface ROERequest {
    id: string;
    requester_id: string;
    operation_id: string;
    roe_id?: string;
    request_type: 'New' | 'Modification' | 'Cancellation';
    justification: string;
    status: ROERequestStatus;
    current_handler_role?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateROERequest {
    operation_id: string;
    roe_id?: string;
    request_type: 'New' | 'Modification' | 'Cancellation';
    justification: string;
    proposed_text?: string;
}

export const roeApi = {
    getAll: (params?: { status?: ROEStatus }) => {
        return api.get<ROE[]>('/roe', params);
    },

    getById: (id: string) => {
        return api.get<ROE>(`/roe/${id}`);
    },

    getRequests: (params?: { operation_id?: string; status?: ROERequestStatus }) => {
        return api.get<ROERequest[]>('/roe/requests', params);
    },

    createRequest: (data: CreateROERequest) => {
        return api.post<ROERequest>('/roe/requests', data);
    },

    submitRequest: (id: string) => {
        return api.post<void>(`/roe/requests/${id}/submit`, {});
    },

    // Status updates usually restricted to specific roles
    updateRequestStatus: (id: string, status: ROERequestStatus, comments?: string) => {
        return api.put<void>(`/roe/requests/${id}/status`, { status, comments });
    }
};
