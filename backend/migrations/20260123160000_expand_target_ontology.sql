-- Migration: 20260123160000_expand_target_ontology
-- Objective: Add comprehensive target properties and new entity types (Strike Requests, Approval Chains)

-- 0. Ensure Targets Table Exists (Base Schema)
CREATE TABLE IF NOT EXISTS targets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    target_type TEXT,
    priority TEXT,
    target_status TEXT, -- status mapped to this
    coordinates TEXT,
    f3ead_stage TEXT,
    classification TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 1. Expand Targets Table
-- SQLite doesn't support IF NOT EXISTS for ALTER TABLE, so we use a dummy update to suppress errors or just let them fail safely if running manually
-- But for a script, we'll just run them. If they exist, it might error, but we can wrap in transaction or check columns.
-- For simplicity in this agent context, we assume if table created above, these ALTERS work. If table existed, they work.
-- If columns already exist (unlikely), it fails.
ALTER TABLE targets ADD COLUMN be_number TEXT;
ALTER TABLE targets ADD COLUMN functional_type TEXT;
ALTER TABLE targets ADD COLUMN collateral_estimate TEXT; -- JSON
ALTER TABLE targets ADD COLUMN time_window TEXT; -- JSON
ALTER TABLE targets ADD COLUMN pattern_of_life TEXT; -- JSON array
ALTER TABLE targets ADD COLUMN engagement_history TEXT; -- JSON array
ALTER TABLE targets ADD COLUMN commander_remarks TEXT;
ALTER TABLE targets ADD COLUMN legal_status TEXT; -- JSON
ALTER TABLE targets ADD COLUMN weather_constraints TEXT; -- JSON
ALTER TABLE targets ADD COLUMN deconfliction_status TEXT; -- JSON

-- 2. Update Targets Sync Triggers to include new fields
DROP TRIGGER IF EXISTS tr_targets_sync_insert;
CREATE TRIGGER tr_targets_sync_insert AFTER INSERT ON targets
BEGIN
    INSERT OR IGNORE INTO entities (
        id, name, type, description, status, classification, created_at, updated_at, properties
    ) VALUES (
        NEW.id, NEW.name, 'TARGET', NEW.description, NEW.target_status, NEW.classification, NEW.created_at, NEW.updated_at,
        json_object(
            'target_type', NEW.target_type, 
            'priority', NEW.priority, 
            'coordinates', NEW.coordinates, 
            'f3ead_stage', NEW.f3ead_stage,
            'be_number', NEW.be_number,
            'functional_type', NEW.functional_type,
            'collateral_estimate', NEW.collateral_estimate,
            'time_window', NEW.time_window,
            'pattern_of_life', NEW.pattern_of_life,
            'engagement_history', NEW.engagement_history,
            'commander_remarks', NEW.commander_remarks,
            'legal_status', NEW.legal_status,
            'weather_constraints', NEW.weather_constraints,
            'deconfliction_status', NEW.deconfliction_status
        )
    );
END;

DROP TRIGGER IF EXISTS tr_targets_sync_update;
CREATE TRIGGER tr_targets_sync_update AFTER UPDATE ON targets
BEGIN
    UPDATE entities SET
        name = NEW.name,
        description = NEW.description,
        status = NEW.target_status,
        classification = NEW.classification,
        updated_at = NEW.updated_at,
        properties = json_object(
            'target_type', NEW.target_type, 
            'priority', NEW.priority, 
            'coordinates', NEW.coordinates, 
            'f3ead_stage', NEW.f3ead_stage,
            'be_number', NEW.be_number,
            'functional_type', NEW.functional_type,
            'collateral_estimate', NEW.collateral_estimate,
            'time_window', NEW.time_window,
            'pattern_of_life', NEW.pattern_of_life,
            'engagement_history', NEW.engagement_history,
            'commander_remarks', NEW.commander_remarks,
            'legal_status', NEW.legal_status,
            'weather_constraints', NEW.weather_constraints,
            'deconfliction_status', NEW.deconfliction_status
        )
    WHERE id = NEW.id;
END;

DROP TRIGGER IF EXISTS tr_targets_sync_delete;
CREATE TRIGGER tr_targets_sync_delete AFTER DELETE ON targets
BEGIN
    DELETE FROM entities WHERE id = OLD.id;
END;

-- 3. Create Strike Requests Table (if not exists)
CREATE TABLE IF NOT EXISTS strike_requests (
    id TEXT PRIMARY KEY,
    target_id TEXT NOT NULL,
    requesting_unit TEXT NOT NULL,
    requested_platform TEXT, -- Preferred platform
    requested_munition TEXT, -- Preferred munition
    status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, DENIED, EXECUTED
    justification TEXT,
    priority TEXT DEFAULT 'MEDIUM',
    classification TEXT DEFAULT 'SECRET',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(target_id) REFERENCES targets(id)
);

-- 4. Sync Trigger for Strike Requests (recreate to ensure correctness)
DROP TRIGGER IF EXISTS tr_strike_requests_sync_insert;
CREATE TRIGGER tr_strike_requests_sync_insert AFTER INSERT ON strike_requests
BEGIN
    INSERT OR IGNORE INTO entities (
        id, name, type, description, status, classification, created_at, updated_at, properties
    ) VALUES (
        NEW.id, 'Strike Req: ' || NEW.target_id, 'STRIKE_REQUEST', NEW.justification, NEW.status, NEW.classification, NEW.created_at, NEW.updated_at,
        json_object(
            'target_id', NEW.target_id,
            'requesting_unit', NEW.requesting_unit,
            'requested_platform', NEW.requested_platform,
            'requested_munition', NEW.requested_munition,
            'priority', NEW.priority
        )
    );
    -- Auto-link to Target
    INSERT OR IGNORE INTO entity_relationships (source_id, target_id, relation_type, created_at)
    VALUES (NEW.id, NEW.target_id, 'TARGETS', NEW.created_at);
END;

DROP TRIGGER IF EXISTS tr_strike_requests_sync_update;
CREATE TRIGGER tr_strike_requests_sync_update AFTER UPDATE ON strike_requests
BEGIN
    UPDATE entities SET
        status = NEW.status,
        description = NEW.justification,
        classification = NEW.classification,
        updated_at = NEW.updated_at,
        properties = json_object(
            'target_id', NEW.target_id,
            'requesting_unit', NEW.requesting_unit,
            'requested_platform', NEW.requested_platform,
            'requested_munition', NEW.requested_munition,
            'priority', NEW.priority
        )
    WHERE id = NEW.id;
END;

DROP TRIGGER IF EXISTS tr_strike_requests_sync_delete;
CREATE TRIGGER tr_strike_requests_sync_delete AFTER DELETE ON strike_requests
BEGIN
    DELETE FROM entities WHERE id = OLD.id;
END;

-- 5. Create Approval Chains Table (if not exists)
CREATE TABLE IF NOT EXISTS approval_chains (
    id TEXT PRIMARY KEY,
    subject_entity_id TEXT NOT NULL, -- Target or Strike Request ID
    chain_type TEXT NOT NULL, -- TARGETING_BOARD, STRIKE_AUTH, CDE_REVIEW
    current_node TEXT NOT NULL, -- e.g., "J2_TARGETING", "LEGAD", "CHOPS", "JTF_COMMANDER"
    status TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    history TEXT, -- JSON array of approval steps
    classification TEXT DEFAULT 'SECRET',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. Sync Trigger for Approval Chains (recreate)
DROP TRIGGER IF EXISTS tr_approval_chains_sync_insert;
CREATE TRIGGER tr_approval_chains_sync_insert AFTER INSERT ON approval_chains
BEGIN
    INSERT OR IGNORE INTO entities (
        id, name, type, description, status, classification, created_at, updated_at, properties
    ) VALUES (
        NEW.id, 'Approval: ' || NEW.chain_type, 'APPROVAL_CHAIN', 'Node: ' || NEW.current_node, NEW.status, NEW.classification, NEW.created_at, NEW.updated_at,
        json_object(
            'subject_entity_id', NEW.subject_entity_id,
            'chain_type', NEW.chain_type,
            'current_node', NEW.current_node,
            'history', NEW.history
        )
    );
    -- Auto-link to Subject
    INSERT OR IGNORE INTO entity_relationships (source_id, target_id, relation_type, created_at)
    VALUES (NEW.id, NEW.subject_entity_id, 'APPROVES', NEW.created_at);
END;

DROP TRIGGER IF EXISTS tr_approval_chains_sync_update;
CREATE TRIGGER tr_approval_chains_sync_update AFTER UPDATE ON approval_chains
BEGIN
    UPDATE entities SET
        status = NEW.status,
        description = 'Node: ' || NEW.current_node,
        updated_at = NEW.updated_at,
        properties = json_object(
            'subject_entity_id', NEW.subject_entity_id,
            'chain_type', NEW.chain_type,
            'current_node', NEW.current_node,
            'history', NEW.history
        )
    WHERE id = NEW.id;
END;

DROP TRIGGER IF EXISTS tr_approval_chains_sync_delete;
CREATE TRIGGER tr_approval_chains_sync_delete AFTER DELETE ON approval_chains
BEGIN
    DELETE FROM entities WHERE id = OLD.id;
END;

