-- Create Mission Command tables for targeting system
-- Migration: 20260121181000_create_mission_command_tables
-- Creates tables for mission intent, targeting guidance, decision authority, and operational tempo

-- ============================================================================
-- TABLE 1: MISSION_INTENT
-- Commander's intent, phase, priority effects, endstate, metrics
-- ============================================================================
CREATE TABLE IF NOT EXISTS mission_intent (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    operation_id TEXT, -- Links to operations table if needed
    
    -- Phase Information
    phase TEXT NOT NULL, -- e.g., "Phase 2: Hostile Force Degradation"
    phase_start_date TEXT,
    phase_end_date TEXT,
    phase_number INTEGER DEFAULT 1,
    
    -- Commander's Intent
    priority_effects TEXT NOT NULL, -- JSON array of priority effects
    endstate TEXT NOT NULL,
    endstate_metrics TEXT NOT NULL, -- JSON array of {name, current, target, status}
    
    -- Classification
    classification TEXT NOT NULL DEFAULT 'SECRET' CHECK (classification IN ('UNCLASS', 'CUI', 'SECRET', 'TOP_SECRET', 'TS_SCI')),
    caveats TEXT DEFAULT '[]', -- JSON array
    
    -- Metadata
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    is_current INTEGER NOT NULL DEFAULT 1 -- Only one current intent per operation
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_mission_intent_current ON mission_intent(operation_id, is_current) WHERE is_current = 1;
CREATE INDEX IF NOT EXISTS idx_mission_intent_operation ON mission_intent(operation_id);

-- ============================================================================
-- TABLE 2: TARGETING_GUIDANCE
-- ROE level, collateral threshold, approved target sets, restrictions
-- ============================================================================
CREATE TABLE IF NOT EXISTS targeting_guidance (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    operation_id TEXT,
    
    -- ROE Information (references roe_status table)
    roe_level TEXT NOT NULL, -- e.g., "WEAPON_FREE", "WEAPON_TIGHT"
    roe_reference TEXT, -- Reference to specific ROE document
    
    -- Collateral Damage
    collateral_threshold TEXT NOT NULL, -- e.g., "CDE < 50 civilian casualties per strike"
    cde_limit INTEGER DEFAULT 50,
    
    -- Target Sets
    approved_target_sets TEXT NOT NULL, -- JSON array of approved target categories
    restricted_target_sets TEXT DEFAULT '[]', -- JSON array of restricted categories
    
    -- Restrictions
    restrictions TEXT NOT NULL, -- JSON array of restrictions
    prohibited_targets TEXT DEFAULT '[]', -- JSON array
    
    -- Classification
    classification TEXT NOT NULL DEFAULT 'SECRET' CHECK (classification IN ('UNCLASS', 'CUI', 'SECRET', 'TOP_SECRET', 'TS_SCI')),
    caveats TEXT DEFAULT '[]', -- JSON array
    
    -- Metadata
    issued_by TEXT NOT NULL, -- Authority who issued guidance
    effective_date TEXT NOT NULL DEFAULT (datetime('now')),
    expiration_date TEXT,
    is_current INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_targeting_guidance_current ON targeting_guidance(operation_id, is_current) WHERE is_current = 1;
CREATE INDEX IF NOT EXISTS idx_targeting_guidance_operation ON targeting_guidance(operation_id);

-- ============================================================================
-- TABLE 3: DECISION_AUTHORITY
-- Decision authority matrix (level, authority, can approve, must escalate)
-- ============================================================================
CREATE TABLE IF NOT EXISTS decision_authority (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    operation_id TEXT,
    
    -- Authority Level
    level TEXT NOT NULL, -- e.g., "OPERATIONAL", "TACTICAL", "STRATEGIC"
    authority TEXT NOT NULL, -- e.g., "Commander, Joint Task Force"
    authority_position TEXT, -- Position title
    
    -- Approval Authority
    can_approve TEXT NOT NULL, -- JSON array of what this authority can approve
    must_escalate TEXT NOT NULL, -- JSON array of what must be escalated
    
    -- Limits
    max_cde_authority INTEGER, -- Maximum CDE this authority can approve
    max_target_priority TEXT, -- Maximum target priority (e.g., "HIGH", "CRITICAL")
    
    -- Classification
    classification TEXT NOT NULL DEFAULT 'SECRET' CHECK (classification IN ('UNCLASS', 'CUI', 'SECRET', 'TOP_SECRET', 'TS_SCI')),
    caveats TEXT DEFAULT '[]', -- JSON array
    
    -- Metadata
    effective_date TEXT NOT NULL DEFAULT (datetime('now')),
    expiration_date TEXT,
    is_current INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_decision_authority_current ON decision_authority(operation_id, is_current) WHERE is_current = 1;
CREATE INDEX IF NOT EXISTS idx_decision_authority_operation ON decision_authority(operation_id);

-- ============================================================================
-- TABLE 4: OPERATIONAL_TEMPO
-- Current phase, hours into phase, critical decision points
-- ============================================================================
CREATE TABLE IF NOT EXISTS operational_tempo (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    operation_id TEXT,
    
    -- Phase Information
    current_phase TEXT NOT NULL, -- e.g., "Day 12 of 21 - Phase 2"
    phase_start_datetime TEXT NOT NULL, -- ISO 8601 format
    phase_end_datetime TEXT, -- ISO 8601 format
    hours_into_phase INTEGER, -- Calculated at runtime or via view
    
    -- Decision Points
    critical_decision_points TEXT NOT NULL, -- JSON array of {name, time, status}
    
    -- Battle Rhythm
    battle_rhythm_events TEXT DEFAULT '[]', -- JSON array of scheduled events
    
    -- Classification
    classification TEXT NOT NULL DEFAULT 'SECRET' CHECK (classification IN ('UNCLASS', 'CUI', 'SECRET', 'TOP_SECRET', 'TS_SCI')),
    caveats TEXT DEFAULT '[]', -- JSON array
    
    -- Metadata
    is_current INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_operational_tempo_current ON operational_tempo(operation_id, is_current) WHERE is_current = 1;
CREATE INDEX IF NOT EXISTS idx_operational_tempo_operation ON operational_tempo(operation_id);

-- Insert default records (for current operation)
INSERT OR IGNORE INTO mission_intent (
    id, phase, priority_effects, endstate, endstate_metrics, classification, created_by, is_current
) VALUES (
    'default-intent-001',
    'Phase 2: Hostile Force Degradation',
    '["Disrupt enemy C2 networks", "Attrit enemy armor by 30%", "Deny enemy freedom of movement in AO-North"]',
    'Enemy unable to conduct coordinated operations in AO-North',
    '[{"name": "Enemy C2 Nodes Destroyed", "current": 12, "target": 18, "status": "at-risk"}, {"name": "Armor Attrition %", "current": 22, "target": 30, "status": "at-risk"}, {"name": "Movement Denial Coverage %", "current": 87, "target": 90, "status": "on-track"}]',
    'SECRET',
    'system',
    1
);

INSERT OR IGNORE INTO targeting_guidance (
    id, roe_level, collateral_threshold, approved_target_sets, restrictions, classification, issued_by, is_current
) VALUES (
    'default-guidance-001',
    'WEAPON_FREE',
    'CDE < 50 civilian casualties per strike',
    '["Category 1: C2 Nodes (High Priority)", "Category 2: Armor Formations (Medium Priority)", "Category 3: Logistics Hubs (Low Priority)"]',
    '["NO STRIKE: Cultural/religious sites", "NO STRIKE: Medical facilities", "RESTRICTED: Dual-use infrastructure (Commander approval required)"]',
    'SECRET',
    'CENTCOM J3',
    1
);

INSERT OR IGNORE INTO decision_authority (
    id, level, authority, can_approve, must_escalate, classification, is_current
) VALUES (
    'default-authority-001',
    'OPERATIONAL',
    'Commander, Joint Task Force',
    '["Category 1-2 targets (CDE < 50)", "Time-sensitive targets (CDE < 20)", "ROE modifications within authority"]',
    '["Category 1-2 targets (CDE ≥ 50)", "All Category 3 targets", "Strategic targets", "Cross-border strikes"]',
    'SECRET',
    1
);

INSERT OR IGNORE INTO operational_tempo (
    id, current_phase, phase_start_datetime, critical_decision_points, classification, is_current
) VALUES (
    'default-tempo-001',
    'Day 12 of 21 - Phase 2',
    datetime('now', '-12 days'),
    '[{"name": "JTB Session", "time": "14:00Z", "status": "upcoming"}, {"name": "Strike Window Opens", "time": "16:00Z", "status": "upcoming"}, {"name": "BDA Review", "time": "20:00Z", "status": "upcoming"}, {"name": "Phase 3 Transition Decision", "time": "D+15", "status": "upcoming"}]',
    'SECRET',
    1
);
