-- Migration: 20260202140000_align_assumptions_ontology
-- Objective: Align assumptions with the ontology-first architecture by using views and triggers.

-- 1. Create the Unified Assumptions View
DROP VIEW IF EXISTS v_assumptions_ontology;
CREATE VIEW v_assumptions_ontology AS
SELECT 
    id,
    operation_id,
    campaign_id,
    name as title,
    description,
    json_extract(properties, '$.category') as category,
    status,
    json_extract(properties, '$.risk_level') as risk_level,
    (confidence * 100.0) as confidence_score,
    json_extract(properties, '$.stated_by') as stated_by,
    json_extract(properties, '$.validated_by') as validated_by,
    json_extract(properties, '$.last_validated_at') as last_validated_at,
    json_extract(properties, '$.dependencies') as dependencies,
    json_extract(properties, '$.impact_notes') as impact_notes,
    created_at,
    updated_at
FROM entities
WHERE type = 'ASSUMPTION';

-- 2. Sync Triggers from legacy 'assumptions' table to 'entities'
-- This ensures that any writes to the legacy table are reflected in the ontology.

DROP TRIGGER IF EXISTS tr_assumptions_insert_ontology;
CREATE TRIGGER tr_assumptions_insert_ontology
AFTER INSERT ON assumptions
BEGIN
    INSERT INTO entities (
        id, operation_id, campaign_id, name, type, description, status, classification, confidence, properties, created_at, updated_at
    ) VALUES (
        NEW.id,
        NEW.operation_id,
        NEW.campaign_id,
        NEW.title,
        'ASSUMPTION',
        NEW.description,
        NEW.status,
        'UNCLASSIFIED', -- Default classification
        NEW.confidence_score / 100.0,
        json_object(
            'category', NEW.category,
            'risk_level', NEW.risk_level,
            'stated_by', NEW.stated_by,
            'validated_by', NEW.validated_by,
            'last_validated_at', NEW.last_validated_at,
            'dependencies', json(COALESCE(NEW.dependencies, '[]')),
            'impact_notes', NEW.impact_notes
        ),
        NEW.created_at,
        NEW.updated_at
    )
    ON CONFLICT(id) DO UPDATE SET
        operation_id = excluded.operation_id,
        campaign_id = excluded.campaign_id,
        name = excluded.name,
        description = excluded.description,
        status = excluded.status,
        confidence = excluded.confidence,
        properties = excluded.properties,
        updated_at = excluded.updated_at;
END;

DROP TRIGGER IF EXISTS tr_assumptions_update_ontology;
CREATE TRIGGER tr_assumptions_update_ontology
AFTER UPDATE ON assumptions
BEGIN
    UPDATE entities SET
        operation_id = NEW.operation_id,
        campaign_id = NEW.campaign_id,
        name = NEW.title,
        description = NEW.description,
        status = NEW.status,
        confidence = NEW.confidence_score / 100.0,
        properties = json_object(
            'category', NEW.category,
            'risk_level', NEW.risk_level,
            'stated_by', NEW.stated_by,
            'validated_by', NEW.validated_by,
            'last_validated_at', NEW.last_validated_at,
            'dependencies', json(COALESCE(NEW.dependencies, '[]')),
            'impact_notes', NEW.impact_notes
        ),
        updated_at = NEW.updated_at
    WHERE id = NEW.id AND type = 'ASSUMPTION';
END;

DROP TRIGGER IF EXISTS tr_assumptions_delete_ontology;
CREATE TRIGGER tr_assumptions_delete_ontology
AFTER DELETE ON assumptions
BEGIN
    DELETE FROM entities WHERE id = OLD.id AND type = 'ASSUMPTION';
END;
