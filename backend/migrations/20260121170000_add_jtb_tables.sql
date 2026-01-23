-- NATO COPD Targeting Cell - Add JTB (Joint Targeting Board) Tables
-- Migration: 20260121170000_add_jtb_tables
-- Creates tables for JTB session management and target decisions

-- ============================================================================
-- TABLE 1: JTB_SESSIONS
-- Joint Targeting Board sessions for formal decision-making
-- ============================================================================
CREATE TABLE IF NOT EXISTS jtb_sessions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    session_name TEXT NOT NULL,
    session_date TEXT NOT NULL,
    session_time TEXT NOT NULL, -- HH:MM format
    session_datetime TEXT NOT NULL, -- Combined for sorting (ISO 8601)
    
    -- Leadership
    chair TEXT NOT NULL, -- Session chair (e.g., "COM JFC")
    chair_rank TEXT,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    
    -- Attendance
    required_attendees TEXT, -- JSON: array of roles/names
    actual_attendees TEXT,   -- JSON: array who actually attended
    quorum_verified INTEGER NOT NULL DEFAULT 0,
    
    -- Session Protocol
    protocol_notes TEXT,
    session_minutes TEXT,
    
    -- Classification
    classification TEXT NOT NULL DEFAULT 'SECRET' CHECK (classification IN ('UNCLASS', 'CUI', 'SECRET', 'TOP_SECRET', 'TS_SCI')),
    caveats TEXT, -- JSON: array
    
    -- Metadata
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    completed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_jtb_session_datetime ON jtb_sessions(session_datetime DESC);
CREATE INDEX IF NOT EXISTS idx_jtb_status ON jtb_sessions(status);
CREATE INDEX IF NOT EXISTS idx_jtb_date ON jtb_sessions(session_date DESC);

-- ============================================================================
-- TABLE 2: JTB_TARGETS
-- Junction table linking targets to JTB sessions with decisions
-- ============================================================================
CREATE TABLE IF NOT EXISTS jtb_targets (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    session_id TEXT NOT NULL REFERENCES jtb_sessions(id) ON DELETE CASCADE,
    target_id TEXT NOT NULL REFERENCES targets(id) ON DELETE CASCADE,
    
    -- Presentation Order
    presentation_order INTEGER NOT NULL DEFAULT 1,
    
    -- Decision
    decision TEXT CHECK (decision IN ('APPROVED', 'REJECTED', 'DEFERRED', 'PENDING')),
    decision_rationale TEXT,
    decided_by TEXT,
    decided_at TEXT,
    
    -- Vote Tracking (if applicable)
    votes_for INTEGER DEFAULT 0,
    votes_against INTEGER DEFAULT 0,
    votes_abstain INTEGER DEFAULT 0,
    
    -- Conditions
    approval_conditions TEXT, -- Special conditions or restrictions
    mitigation_requirements TEXT, -- Required mitigation actions
    
    -- Metadata
    added_to_session_at TEXT NOT NULL DEFAULT (datetime('now')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    
    UNIQUE(session_id, target_id) -- Each target appears once per session
);

CREATE INDEX IF NOT EXISTS idx_jtb_targets_session ON jtb_targets(session_id);
CREATE INDEX IF NOT EXISTS idx_jtb_targets_target ON jtb_targets(target_id);
CREATE INDEX IF NOT EXISTS idx_jtb_targets_decision ON jtb_targets(decision);
CREATE INDEX IF NOT EXISTS idx_jtb_targets_order ON jtb_targets(session_id, presentation_order);

-- ============================================================================
-- TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
-- ============================================================================

CREATE TRIGGER IF NOT EXISTS trg_jtb_sessions_updated_at
AFTER UPDATE ON jtb_sessions
FOR EACH ROW
BEGIN
    UPDATE jtb_sessions SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_jtb_targets_updated_at
AFTER UPDATE ON jtb_targets
FOR EACH ROW
BEGIN
    UPDATE jtb_targets SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- Migration complete
-- NATO COPD Targeting Cell JTB Tables v1.0
-- New tables: jtb_sessions, jtb_targets
-- Triggers: 2 auto-update timestamp triggers
