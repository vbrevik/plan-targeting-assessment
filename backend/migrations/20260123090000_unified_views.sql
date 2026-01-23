-- Migration: 20260123090000_unified_views
-- Objective: Create flattened SQL views for easier querying of the ontology data.

-- 1. Universal Entity View (with basic properties extraction)
CREATE VIEW IF NOT EXISTS v_entities_all AS
SELECT 
    id,
    operation_id,
    campaign_id,
    name,
    type,
    description,
    status,
    location_lat,
    location_lng,
    classification,
    confidence,
    properties,
    created_at,
    updated_at
FROM entities;

-- 2. Unified Target View (Mapped from Entities)
CREATE VIEW IF NOT EXISTS v_targets_ontology AS
SELECT 
    id,
    name,
    description,
    json_extract(properties, '$.target_type') as target_type,
    status as target_status,
    json_extract(properties, '$.priority') as priority,
    json_extract(properties, '$.coordinates') as coordinates,
    classification,
    json_extract(properties, '$.f3ead_stage') as f3ead_stage,
    created_at,
    updated_at
FROM entities
WHERE type = 'TARGET';

-- 3. Unified BDA Report View (Mapped from Entities)
CREATE VIEW IF NOT EXISTS v_bda_reports_ontology AS
SELECT 
    id,
    name,
    description as damage_description,
    status,
    classification as classification_level,
    json_extract(properties, '$.physical_damage') as physical_damage,
    json_extract(properties, '$.functional_damage') as functional_damage,
    json_extract(properties, '$.desired_effect') as desired_effect,
    json_extract(properties, '$.achieved_effect') as achieved_effect,
    json_extract(properties, '$.recommendation') as recommendation,
    created_at,
    updated_at
FROM entities
WHERE type = 'BDA_REPORT';

-- 4. Unified ISR Platform View
CREATE VIEW IF NOT EXISTS v_isr_platforms_ontology AS
SELECT 
    id,
    name as platform_name,
    description as current_task,
    status,
    classification,
    json_extract(properties, '$.platform_type') as platform_type,
    json_extract(properties, '$.callsign') as callsign,
    json_extract(properties, '$.sensor_type') as sensor_type,
    json_extract(properties, '$.sensor_range_km') as sensor_range_km,
    created_at,
    updated_at
FROM entities
WHERE type = 'ISR_PLATFORM';

-- 5. Graph Adjacency View (Names instead of just IDs)
CREATE VIEW IF NOT EXISTS v_relationship_details AS
SELECT 
    s.name as source_name,
    s.type as source_type,
    r.relation_type,
    t.name as target_name,
    t.type as target_type,
    r.source_id,
    r.target_id,
    r.properties,
    r.created_at
FROM entity_relationships r
JOIN entities s ON r.source_id = s.id
JOIN entities t ON r.target_id = t.id;
