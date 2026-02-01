// Entity Converter Utilities
// Converts raw backend ontology entities to type-safe frontend entities

import type {
    OntologyEntity,
    TargetEntity,
    TargetProperties,
    BdaReportEntity,
    BdaReportProperties,
} from '../types';

/**
 * Convert raw ontology entity to TargetEntity with type-safe properties
 * @param entity - Raw entity from backend
 * @returns Strongly-typed TargetEntity
 */
export function entityToTarget(entity: OntologyEntity<'TARGET'>): TargetEntity {
    return {
        ...entity,
        properties: (entity.properties || {}) as TargetProperties,
    };
}

/**
 * Convert raw ontology entity to BdaReportEntity with type-safe properties
 * @param entity - Raw entity from backend
 * @returns Strongly-typed BdaReportEntity
 */
export function entityToBdaReport(entity: OntologyEntity<'BDA_REPORT'>): BdaReportEntity {
    return {
        ...entity,
        properties: (entity.properties || {}) as BdaReportProperties,
    };
}

/**
 * Convert array of raw entities to typed entities
 * @param entities - Raw entities from backend
 * @param type - Entity type discriminator
 * @returns Array of typed entities
 */
export function entitiesToTyped<TType extends string>(
    entities: OntologyEntity<TType>[],
    type: 'TARGET'
): TargetEntity[];
export function entitiesToTyped<TType extends string>(
    entities: OntologyEntity<TType>[],
    type: 'BDA_REPORT'
): BdaReportEntity[];
export function entitiesToTyped<TType extends string>(
    entities: OntologyEntity<TType>[],
    type: TType
): Array<TargetEntity | BdaReportEntity> {
    if (type === 'TARGET') {
        return entities.map(e => entityToTarget(e as OntologyEntity<'TARGET'>));
    }
    if (type === 'BDA_REPORT') {
        return entities.map(e => entityToBdaReport(e as OntologyEntity<'BDA_REPORT'>));
    }
    // Fallback for unknown types
    return entities as any;
}
