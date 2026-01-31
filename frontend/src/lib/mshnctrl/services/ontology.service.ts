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

export interface EntityWithRelationships extends Entity {
    outgoing_relationships: EntityRelationship[];
    incoming_relationships: EntityRelationship[];
}

export interface EntityFilter {
    type?: string;
    operation_id?: string;
    campaign_id?: string;
    urgent_only?: boolean;
    created_after?: string;
}

export interface EntityTypeDefinition {
    name: string;
    description: string;
    properties_schema?: any;
}

export interface OntologySchema {
    entity_types: EntityTypeDefinition[];
    relationship_types: any[];
}

export const OntologyService = {
    getSchema: async (): Promise<OntologySchema> => {
        return api.get<OntologySchema>('/ontology/schema');
    },

    getEntities: async (filter?: EntityFilter): Promise<Entity[]> => {
        const params: Record<string, string> = {};
        if (filter?.type) params.type_ = filter.type;
        if (filter?.operation_id) params.operation_id = filter.operation_id;
        if (filter?.campaign_id) params.campaign_id = filter.campaign_id;
        if (filter?.urgent_only) params.urgent_only = 'true';
        if (filter?.created_after) params.created_after = filter.created_after;

        return api.get<Entity[]>('/ontology/entities', params);
    },

    getEntity: async (id: UUID): Promise<Entity> => {
        const entity = await api.get<EntityWithRelationships>(`/ontology/entities/${id}`);
        return entity;
    },

    getEntityWithRelationships: async (id: UUID): Promise<EntityWithRelationships> => {
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
    },

    acknowledgeEntity: async (id: UUID, acknowledged_by: string): Promise<Entity> => {
        return api.post<Entity>(`/ontology/entities/${id}/acknowledge`, { acknowledged_by });
    }
};
