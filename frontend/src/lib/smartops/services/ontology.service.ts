import { api } from '@/lib/api';
import type { UUID } from '../types';

export interface Entity {
    id: UUID;
    operation_id?: string;
    campaign_id?: string;
    name: string;
    type: string;
    description?: string;
    status?: string;
    location_lat?: number;
    location_lng?: number;
    properties?: any;
    source?: string;
    classification?: string;
    confidence?: number;
    created_at: string;
    updated_at: string;
}

export interface EntityRelationship {
    source_id: UUID;
    target_id: UUID;
    relation_type: string;
    properties?: any;
    created_at: string;
}

export interface EntityWithRelationships {
    entity: Entity;
    outgoing_relationships: EntityRelationship[];
    incoming_relationships: EntityRelationship[];
}

export interface EntityFilter {
    type?: string;
    operation_id?: string;
    campaign_id?: string;
}

export const OntologyService = {
    getEntities: async (filter?: EntityFilter): Promise<Entity[]> => {
        const params: Record<string, string> = {};
        if (filter?.type) params.type_ = filter.type; // backend uses type_
        if (filter?.operation_id) params.operation_id = filter.operation_id;
        if (filter?.campaign_id) params.campaign_id = filter.campaign_id;

        return api.get<Entity[]>('/ontology/entities', params);
    },

    getEntity: async (id: UUID): Promise<EntityWithRelationships> => {
        return api.get<EntityWithRelationships>(`/ontology/entities/${id}`);
    },

    getRelationships: async (): Promise<EntityRelationship[]> => {
        return api.get<EntityRelationship[]>('/ontology/relationships');
    },

    getNeighbors: async (id: UUID): Promise<Entity[]> => {
        return api.get<Entity[]>(`/ontology/entities/${id}/neighbors`);
    },

    createEntity: async (entity: Partial<Entity>): Promise<Entity> => {
        return api.post<Entity>('/ontology/entities', entity);
    },

    updateEntity: async (id: UUID, entity: Partial<Entity>): Promise<Entity> => {
        return api.put<Entity>(`/ontology/entities/${id}`, entity);
    },

    deleteEntity: async (id: UUID): Promise<void> => {
        return api.delete(`/ontology/entities/${id}`);
    },

    createRelationship: async (relationship: Omit<EntityRelationship, 'created_at'>): Promise<EntityRelationship> => {
        return api.post<EntityRelationship>('/ontology/relationships', relationship);
    }
};
