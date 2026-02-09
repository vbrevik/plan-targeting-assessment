-- Migration: 20260209010000_fix_roe_requests_ontology_fk
-- Fix: roe_requests.decision_id FK pointed to legacy 'decisions' table,
--       but DecisionService creates decisions in 'entities' table (ontology-first).
-- Also drops the unused legacy 'decisions' table.

-- 1. Recreate roe_requests with FK pointing to entities(id)
CREATE TABLE roe_requests_new (
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
    FOREIGN KEY (decision_id) REFERENCES entities(id) ON DELETE CASCADE
);

-- Copy existing data (if any)
INSERT INTO roe_requests_new SELECT * FROM roe_requests;

-- Drop old table and rename
DROP TABLE roe_requests;
ALTER TABLE roe_requests_new RENAME TO roe_requests;

-- Recreate indexes
CREATE INDEX idx_roe_requests_decision ON roe_requests(decision_id);
CREATE INDEX idx_roe_requests_status ON roe_requests(status);
CREATE INDEX idx_roe_requests_requested_at ON roe_requests(requested_at DESC);
CREATE INDEX idx_roe_requests_approval_authority ON roe_requests(approval_authority);

-- Recreate update trigger
CREATE TRIGGER update_roe_requests_updated_at
    AFTER UPDATE ON roe_requests
    FOR EACH ROW
BEGIN
    UPDATE roe_requests SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- 2. Drop the legacy 'decisions' table (unused - DecisionService uses entities)
DROP TABLE IF EXISTS decisions;
