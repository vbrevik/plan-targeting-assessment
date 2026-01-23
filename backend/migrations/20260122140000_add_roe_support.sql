-- ROE (Rules of Engagement) Support for Decision System
-- Migration: 20260122140000_add_roe_support
-- Adds ROE status tracking to decisions and ROE request workflow

-- ============================================================================
-- TABLE: DECISIONS (if not exists)
-- ============================================================================
-- Create decisions table if it doesn't exist (for Decision Support System)
CREATE TABLE IF NOT EXISTS decisions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    title TEXT NOT NULL,
    description TEXT,
    urgency TEXT NOT NULL CHECK (urgency IN ('critical', 'high', 'medium', 'low')),
    complexity TEXT NOT NULL CHECK (complexity IN ('high', 'medium', 'low')),
    deadline TEXT,
    category TEXT NOT NULL,
    political_sensitivity TEXT CHECK (political_sensitivity IN ('high', 'medium', 'low')),
    media_visibility TEXT CHECK (media_visibility IN ('high', 'medium', 'low')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'in_review', 'approved', 'rejected', 'deferred')),
    roe_status TEXT CHECK (roe_status IN (
        'within_approved_roe', 
        'requires_roe_release', 
        'roe_pending_approval',
        'roe_approved',
        'roe_rejected'
    )),
    roe_notes TEXT,
    roe_request_id TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    created_by TEXT,
    operation_id TEXT,
    campaign_id TEXT,
    selected_option_id TEXT,
    justification TEXT,
    approved_at TEXT,
    approved_by TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Create indexes for decisions
CREATE INDEX IF NOT EXISTS idx_decisions_status ON decisions(status);
CREATE INDEX IF NOT EXISTS idx_decisions_urgency ON decisions(urgency);
CREATE INDEX IF NOT EXISTS idx_decisions_roe_status ON decisions(roe_status);
CREATE INDEX IF NOT EXISTS idx_decisions_created_at ON decisions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_decisions_operation ON decisions(operation_id);

-- ============================================================================
-- TABLE: ROE REQUESTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS roe_requests (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    decision_id TEXT NOT NULL,
    requested_by TEXT NOT NULL,
    requested_at TEXT NOT NULL DEFAULT (datetime('now')),
    approval_authority TEXT,
    request_justification TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),
    approved_by TEXT,
    approved_at TEXT,
    rejection_reason TEXT,
    roe_reference TEXT,
    expiration_date TEXT,
    conditions TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (decision_id) REFERENCES decisions(id) ON DELETE CASCADE
);

-- Create indexes for ROE requests
CREATE INDEX IF NOT EXISTS idx_roe_requests_decision ON roe_requests(decision_id);
CREATE INDEX IF NOT EXISTS idx_roe_requests_status ON roe_requests(status);
CREATE INDEX IF NOT EXISTS idx_roe_requests_requested_at ON roe_requests(requested_at DESC);
CREATE INDEX IF NOT EXISTS idx_roe_requests_approval_authority ON roe_requests(approval_authority);

-- ============================================================================
-- UPDATE DECISIONS TABLE: Add ROE columns if table exists but columns missing
-- ============================================================================
-- Note: SQLite doesn't support ALTER TABLE ADD COLUMN IF NOT EXISTS
-- So we check if columns exist by attempting to add them (will fail silently if they exist)
-- In practice, if decisions table already exists, we need to handle this manually
-- For new installations, the table is created with ROE columns above

-- ============================================================================
-- TRIGGER: Update roe_requests.updated_at on change
-- ============================================================================
CREATE TRIGGER IF NOT EXISTS update_roe_requests_updated_at
    AFTER UPDATE ON roe_requests
    FOR EACH ROW
BEGIN
    UPDATE roe_requests SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- ============================================================================
-- TRIGGER: Update decisions.updated_at on change
-- ============================================================================
CREATE TRIGGER IF NOT EXISTS update_decisions_updated_at
    AFTER UPDATE ON decisions
    FOR EACH ROW
BEGIN
    UPDATE decisions SET updated_at = datetime('now') WHERE id = NEW.id;
END;
