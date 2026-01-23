-- Migration: 20260123083000_unify_data_ontology
-- Objective: Migrate siloed data into the ontology 'entities' table and establish sync triggers.

-- 1. Initial Migration: Targets
INSERT OR IGNORE INTO entities (
    id, name, type, description, status, classification, created_at, updated_at, properties
)
SELECT 
    id, 
    name, 
    'TARGET' as type, 
    description, 
    target_status as status, 
    classification, 
    created_at, 
    updated_at,
    json_object(
        'target_type', target_type,
        'priority', priority,
        'coordinates', coordinates,
        'f3ead_stage', f3ead_stage
    ) as properties
FROM targets;

-- 2. Initial Migration: Assumptions
INSERT OR IGNORE INTO entities (
    id, operation_id, campaign_id, name, type, description, status, created_at, updated_at, properties
)
SELECT 
    id, 
    operation_id, 
    campaign_id, 
    title as name, 
    'ASSUMPTION' as type, 
    description, 
    status, 
    created_at, 
    updated_at,
    json_object(
        'category', category,
        'risk_level', risk_level,
        'confidence_score', confidence_score,
        'stated_by', stated_by,
        'impact_notes', impact_notes
    ) as properties
FROM assumptions;

-- 3. Initial Migration: BDA Reports
INSERT OR IGNORE INTO entities (
    id, name, type, description, status, classification, created_at, updated_at, properties
)
SELECT 
    id, 
    assessment_type || ' - ' || id as name, 
    'BDA_REPORT' as type, 
    damage_description as description, 
    status, 
    classification_level as classification, 
    created_at, 
    updated_at,
    json_object(
        'physical_damage', physical_damage,
        'functional_damage', functional_damage,
        'desired_effect', desired_effect,
        'achieved_effect', achieved_effect,
        'recommendation', recommendation
    ) as properties
FROM bda_reports;

-- 4. Initial Migration: ISR Platforms
INSERT OR IGNORE INTO entities (
    id, name, type, description, status, classification, created_at, updated_at, properties
)
SELECT 
    id, 
    platform_name as name, 
    'ISR_PLATFORM' as type, 
    current_task as description, 
    status, 
    classification, 
    created_at, 
    updated_at,
    json_object(
        'platform_type', platform_type,
        'callsign', callsign,
        'sensor_type', sensor_type,
        'sensor_range_km', sensor_range_km
    ) as properties
FROM isr_platforms;

-- 5. Initial Relationships (BDA -> Target)
INSERT OR IGNORE INTO entity_relationships (source_id, target_id, relation_type, created_at)
SELECT id, target_id, 'ASSESSES', created_at
FROM bda_reports;

-- ============================================================================
-- SYNC TRIGGERS: TARGETS
-- ============================================================================

CREATE TRIGGER IF NOT EXISTS tr_targets_sync_insert AFTER INSERT ON targets
BEGIN
    INSERT OR IGNORE INTO entities (
        id, name, type, description, status, classification, created_at, updated_at, properties
    ) VALUES (
        NEW.id, NEW.name, 'TARGET', NEW.description, NEW.target_status, NEW.classification, NEW.created_at, NEW.updated_at,
        json_object('target_type', NEW.target_type, 'priority', NEW.priority, 'coordinates', NEW.coordinates, 'f3ead_stage', NEW.f3ead_stage)
    );
END;

CREATE TRIGGER IF NOT EXISTS tr_targets_sync_update AFTER UPDATE ON targets
BEGIN
    UPDATE entities SET
        name = NEW.name,
        description = NEW.description,
        status = NEW.target_status,
        classification = NEW.classification,
        updated_at = NEW.updated_at,
        properties = json_object('target_type', NEW.target_type, 'priority', NEW.priority, 'coordinates', NEW.coordinates, 'f3ead_stage', NEW.f3ead_stage)
    WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS tr_targets_sync_delete AFTER DELETE ON targets
BEGIN
    DELETE FROM entities WHERE id = OLD.id;
END;

-- ============================================================================
-- SYNC TRIGGERS: BDA_REPORTS
-- ============================================================================

CREATE TRIGGER IF NOT EXISTS tr_bda_reports_sync_insert AFTER INSERT ON bda_reports
BEGIN
    INSERT OR IGNORE INTO entities (
        id, name, type, description, status, classification, created_at, updated_at, properties
    ) VALUES (
        NEW.id, NEW.assessment_type || ' - ' || NEW.id, 'BDA_REPORT', NEW.damage_description, NEW.status, NEW.classification_level, NEW.created_at, NEW.updated_at,
        json_object('physical_damage', NEW.physical_damage, 'functional_damage', NEW.functional_damage, 'recommendation', NEW.recommendation)
    );
    INSERT OR IGNORE INTO entity_relationships (source_id, target_id, relation_type, created_at)
    VALUES (NEW.id, NEW.target_id, 'ASSESSES', NEW.created_at);
END;

CREATE TRIGGER IF NOT EXISTS tr_bda_reports_sync_update AFTER UPDATE ON bda_reports
BEGIN
    UPDATE entities SET
        status = NEW.status,
        updated_at = NEW.updated_at,
        properties = json_object('physical_damage', NEW.physical_damage, 'functional_damage', NEW.functional_damage, 'recommendation', NEW.recommendation)
    WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS tr_bda_reports_sync_delete AFTER DELETE ON bda_reports
BEGIN
    DELETE FROM entities WHERE id = OLD.id;
END;
