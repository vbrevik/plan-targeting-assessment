-- Migration: 20260202150000_align_decisions_ontology
-- Objective: Align decisions with the ontology-first architecture to support graph relationships.

-- 1. Create the Unified Decisions View
DROP VIEW IF EXISTS v_decisions_ontology;
CREATE VIEW v_decisions_ontology AS
SELECT 
    id,
    name as decision_text,
    description as decision_rationale,
    json_extract(properties, '$.decision_type') as decision_type,
    json_extract(properties, '$.decision_maker') as decision_maker,
    json_extract(properties, '$.decision_maker_role') as decision_maker_role,
    json_extract(properties, '$.authority_level') as authority_level,
    classification,
    created_at as decision_time,
    created_at
FROM entities
WHERE type = 'DECISION';

-- 2. Sync Triggers from legacy 'decision_log' table to 'entities'
DROP TRIGGER IF EXISTS tr_decision_log_insert_ontology;
CREATE TRIGGER tr_decision_log_insert_ontology
AFTER INSERT ON decision_log
BEGIN
    INSERT INTO entities (
        id, name, type, description, classification, properties, created_at, updated_at
    ) VALUES (
        NEW.id,
        NEW.decision_text,
        'DECISION',
        NEW.decision_rationale,
        NEW.classification,
        json_object(
            'decision_type', NEW.decision_type,
            'decision_maker', NEW.decision_maker,
            'decision_maker_role', NEW.decision_maker_role,
            'authority_level', NEW.authority_level
        ),
        NEW.created_at,
        NEW.created_at
    )
    ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        description = excluded.description,
        classification = excluded.classification,
        properties = excluded.properties;
END;

DROP TRIGGER IF EXISTS tr_decision_log_delete_ontology;
CREATE TRIGGER tr_decision_log_delete_ontology
AFTER DELETE ON decision_log
BEGIN
    DELETE FROM entities WHERE id = OLD.id AND type = 'DECISION';
END;
