-- Migration: Update Views and Triggers for Standardized Types

-- 1. Update Decisions View
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

-- 2. Update Decisions Triggers
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

-- 3. Update Assumptions View
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

-- 4. Update Assumptions Triggers
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
        'UNCLASSIFIED',
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

-- 5. Update Admin Views
DROP VIEW IF EXISTS v_users_ontology;
CREATE VIEW v_users_ontology AS
SELECT 
    id,
    name as username,
    json_extract(properties, '$.email') as email,
    json_extract(properties, '$.password_hash') as password_hash,
    created_at,
    updated_at,
    json_extract(properties, '$.last_login_ip') as last_login_ip,
    json_extract(properties, '$.last_user_agent') as last_user_agent,
    json_extract(properties, '$.last_login_at') as last_login_at
FROM entities
WHERE type = 'USER';

DROP VIEW IF EXISTS v_roles_ontology;
CREATE VIEW v_roles_ontology AS
SELECT 
    id,
    name,
    description,
    created_at,
    updated_at
FROM entities
WHERE type = 'ROLE';

DROP VIEW IF EXISTS v_permissions_ontology;
CREATE VIEW v_permissions_ontology AS
SELECT 
    id,
    json_extract(properties, '$.action') as action,
    name as description,
    json_extract(properties, '$.resource_type') as resource_type,
    created_at
FROM entities
WHERE type = 'PERMISSION';

DROP VIEW IF EXISTS v_user_roles_ontology;
CREATE VIEW v_user_roles_ontology AS
SELECT 
    source_id as user_id,
    target_id as role_id,
    json_extract(properties, '$.resource_id') as resource_id,
    created_at
FROM entity_relationships
WHERE relation_type = 'HAS_ROLE';
