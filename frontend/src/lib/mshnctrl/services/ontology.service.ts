import { api } from '@/lib/api';
import type {
    UUID,
    TargetEntity,
    BdaReportEntity,
} from '../types';

/**
 * @deprecated Use OntologyEntity from types.ts instead
 * Legacy interface for backward compatibility
 */
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

    getRelationships: async (filter?: { source_id?: string; target_id?: string; relation_type?: string }): Promise<EntityRelationship[]> => {
        const params: Record<string, string> = {};
        if (filter?.source_id) params.source_id = filter.source_id;
        if (filter?.target_id) params.target_id = filter.target_id;
        if (filter?.relation_type) params.relation_type = filter.relation_type;

        return api.get<EntityRelationship[]>('/ontology/relationships', params);
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
    },

    // ========================================================================
    // PHASE 3: Type-safe entity methods
    // ========================================================================

    /**
     * Get targets as strongly-typed TargetEntity objects
     * @param filter - Entity filter with type automatically set to 'TARGET'
     * @returns Array of TargetEntity with type-safe properties
     */
    getTargets: async (filter?: Omit<EntityFilter, 'type'>): Promise<TargetEntity[]> => {
        const params: Record<string, string> = { type_: 'TARGET' };
        if (filter?.operation_id) params.operation_id = filter.operation_id;
        if (filter?.campaign_id) params.campaign_id = filter.campaign_id;
        if (filter?.urgent_only) params.urgent_only = 'true';
        if (filter?.created_after) params.created_after = filter.created_after;

        return api.get<TargetEntity[]>('/ontology/entities', params);
    },

    /**
     * Get BDA reports as strongly-typed BdaReportEntity objects
     * @param filter - Entity filter with type automatically set to 'BDA_REPORT'
     * @returns Array of BdaReportEntity with type-safe properties
     */
    getBdaReports: async (filter?: Omit<EntityFilter, 'type'>): Promise<BdaReportEntity[]> => {
        const params: Record<string, string> = { type_: 'BDA_REPORT' };
        if (filter?.operation_id) params.operation_id = filter.operation_id;
        if (filter?.campaign_id) params.campaign_id = filter.campaign_id;
        if (filter?.urgent_only) params.urgent_only = 'true';
        if (filter?.created_after) params.created_after = filter.created_after;

        return api.get<BdaReportEntity[]>('/ontology/entities', params);
    },

    /**
     * Get single target by ID as strongly-typed TargetEntity
     * @param id - Target entity ID
     * @returns TargetEntity with type-safe properties
     */
    getTarget: async (id: UUID): Promise<TargetEntity> => {
        return api.get<TargetEntity>(`/ontology/entities/${id}`);
    },

    /**
     * Get single BDA report by ID as strongly-typed BdaReportEntity
     * @param id - BDA report entity ID
     * @returns BdaReportEntity with type-safe properties
     */
    getBdaReport: async (id: UUID): Promise<BdaReportEntity> => {
        return api.get<BdaReportEntity>(`/ontology/entities/${id}`);
    },

    /**
     * Fetch navigation structure for the current user's role
     * @param roleId - Role ID
     * @returns Array of navigation groups with items
     */
    fetchNavigation: async (roleId: string): Promise<any[]> => {
        // 1. Get User's Role Entity and its outgoing relationships to UI_NAV_GROUP
        // Since we don't have a direct "traverse" endpoint for arbitrary depth yet, we do it in steps or use a future "graph query" endpoint.
        // For now, we'll fetch all UI_NAV_GROUP entities and filter by relationship (client-side join for MVP)
        // OR better: fetch groups linked to role.

        // MVP: Fetch ALL UI_NAV_GROUPs and items, then filter? Or fetch specific.
        // Let's rely on the backend's generic relationship fetcher.

        // A. Get relations from Role -> UI_NAV_GROUP
        const roleRelations = await OntologyService.getRelationships({ source_id: roleId, relation_type: 'CAN_VIEW' });
        // Deduplicate group IDs in case of duplicate relationships
        const groupIds = Array.from(new Set(roleRelations.map(r => r.target_id)));

        if (groupIds.length === 0) return [];

        // B. Fetch the Group Entities
        // We need a bulk fetch or loop. Loop for MVP.
        const groups: any[] = [];
        for (const groupId of groupIds) {
            const groupEntity = await OntologyService.getEntity(groupId);
            if (groupEntity.type !== 'UI_NAV_GROUP') continue;

            // C. Get relations Group -> UI_NAV_ITEM
            const itemRelations = await OntologyService.getRelationships({ source_id: groupId, relation_type: 'CONTAINS' });

            // Deduplicate item IDs
            const itemIds = Array.from(new Set(itemRelations.map(r => r.target_id)));

            // D. Fetch Items
            const items: any[] = [];
            for (const itemId of itemIds) {
                const itemEntity = await OntologyService.getEntity(itemId);
                if (itemEntity.type === 'UI_NAV_ITEM') {
                    // Map ontology properties to UI format
                    items.push({
                        // @ts-ignore
                        label: itemEntity.properties?.label || itemEntity.name,
                        // @ts-ignore
                        to: itemEntity.properties?.to || '#',
                        // @ts-ignore
                        icon: itemEntity.properties?.icon || 'Circle',
                        // @ts-ignore
                        permission: itemEntity.properties?.permission // Optional
                    });
                }
            }

            groups.push({
                // @ts-ignore
                label: groupEntity.properties?.label || groupEntity.name,
                // @ts-ignore
                order: groupEntity.properties?.order || 99,
                items: items
            });
        }

        // Sort groups
        return groups.sort((a, b) => a.order - b.order);
    }
};
