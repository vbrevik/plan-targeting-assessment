// Feedback Events API Client
// Connects to backend ontology-based feedback events with mock fallback

import { api } from '@/lib/api';
import type { FeedbackEvent, FeedbackType } from '@/features/shared/types/feedback';
import { mockFeedbackEvents } from '@/features/shared/services/feedbackService';

// ============================================================================
// TYPES - Backend Entity shape (ontology-based)
// ============================================================================

interface FeedbackEntityProperties {
    event_type: string;
    source_module: string;
    target_module: string;
    severity: string;
    recommendation?: string;
    linked_entity_type?: string;
    linked_entity_id?: string;
    linked_entity_name?: string;
    resolved_by?: string;
}

interface FeedbackEntity {
    id: string;
    name: string;
    type_: string;
    description: string;
    status: string;
    properties: FeedbackEntityProperties;
    created_at: string;
    updated_at: string;
}

export interface CreateFeedbackEventRequest {
    event_type: FeedbackType;
    source_module: string;
    target_module: string;
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    title: string;
    description: string;
    recommendation?: string;
    linked_entity_type?: string;
    linked_entity_id?: string;
    linked_entity_name?: string;
}

export interface UpdateFeedbackEventRequest {
    status?: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';
    resolved_by?: string;
    recommendation?: string;
}

// ============================================================================
// TRANSFORM - Entity -> FeedbackEvent
// ============================================================================

function entityToFeedbackEvent(entity: FeedbackEntity): FeedbackEvent {
    const props = entity.properties;
    return {
        id: entity.id,
        type: (props.event_type || 'PEV') as FeedbackType,
        source: props.source_module || '',
        target: props.target_module || '',
        severity: (props.severity || 'INFO') as FeedbackEvent['severity'],
        timestamp: new Date(entity.created_at),
        title: entity.name,
        description: entity.description,
        recommendation: props.recommendation,
        linkedEntities: props.linked_entity_type
            ? [{ type: props.linked_entity_type, id: props.linked_entity_id || '', name: props.linked_entity_name || '' }]
            : [],
        status: (entity.status || 'OPEN') as FeedbackEvent['status'],
        resolvedBy: props.resolved_by,
        resolvedAt: entity.status === 'RESOLVED' ? new Date(entity.updated_at) : undefined,
    };
}

// ============================================================================
// FEEDBACK API CLIENT
// ============================================================================

export const feedbackApi = {
    /**
     * List feedback events with optional filters.
     * Falls back to mock data on failure.
     */
    async getFeedbackEvents(filters?: {
        event_type?: FeedbackType;
        status?: string;
        severity?: string;
    }): Promise<FeedbackEvent[]> {
        try {
            const params: Record<string, string> = {};
            if (filters?.event_type) params.event_type = filters.event_type;
            if (filters?.status) params.status = filters.status;
            if (filters?.severity) params.severity = filters.severity;
            const entities = await api.get<FeedbackEntity[]>('/feedback/events', params);
            return entities.map(entityToFeedbackEvent);
        } catch {
            return mockFeedbackEvents;
        }
    },

    /**
     * Get a single feedback event by ID.
     * Falls back to matching mock event on failure.
     */
    async getFeedbackEvent(id: string): Promise<FeedbackEvent> {
        try {
            const entity = await api.get<FeedbackEntity>(`/feedback/events/${id}`);
            return entityToFeedbackEvent(entity);
        } catch {
            const mock = mockFeedbackEvents.find(e => e.id === id);
            if (mock) return mock;
            throw new Error(`Feedback event ${id} not found`);
        }
    },

    /**
     * Create a new feedback event.
     */
    async createFeedbackEvent(data: CreateFeedbackEventRequest): Promise<FeedbackEvent> {
        const entity = await api.post<FeedbackEntity>('/feedback/events', data);
        return entityToFeedbackEvent(entity);
    },

    /**
     * Update a feedback event (status, resolved_by, recommendation).
     */
    async updateFeedbackEvent(id: string, data: UpdateFeedbackEventRequest): Promise<FeedbackEvent> {
        const entity = await api.patch<FeedbackEntity>(`/feedback/events/${id}`, data);
        return entityToFeedbackEvent(entity);
    },
};
