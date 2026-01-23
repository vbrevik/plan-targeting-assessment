-- Add classification support to targeting system
-- Migration: 20260121140000_add_classification_support
-- SQLite version

-- Note: SQLite stores arrays as JSON text
-- Note: SQLite uses TEXT for timestamps and doesn't have strict types

-- Create user_clearances table
CREATE TABLE IF NOT EXISTS user_clearances (
    user_id TEXT NOT NULL PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    clearance_level TEXT NOT NULL DEFAULT 'UNCLASS',
    compartments TEXT DEFAULT '[]', -- JSON array
    caveats TEXT DEFAULT '[]', -- JSON array
    granted_date TEXT NOT NULL DEFAULT (datetime('now')),
    expiration_date TEXT,
    granting_authority TEXT,
    investigation_date TEXT,
    adjudication_date TEXT,
    last_reviewed TEXT DEFAULT (datetime('now')),
    is_active INTEGER NOT NULL DEFAULT 1, -- SQLite uses INTEGER for boolean
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Create index for quick clearance lookups
CREATE INDEX IF NOT EXISTS idx_user_clearances_active ON user_clearances(user_id) WHERE is_active = 1;

-- Create classification_audit_log table
CREATE TABLE IF NOT EXISTS classification_audit_log (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL REFERENCES users(id),
    resource_type TEXT NOT NULL, -- 'target', 'nomination', 'jtb_session', 'strike_assessment'
    resource_id TEXT NOT NULL,
    classification_level TEXT NOT NULL,
    caveats TEXT DEFAULT '[]', -- JSON array
    action TEXT NOT NULL, -- 'view', 'create', 'update', 'delete', 'export'
    ip_address TEXT,
    user_agent TEXT,
    accessed_at TEXT NOT NULL DEFAULT (datetime('now')),
    session_id TEXT
);

-- Create indexes for audit log queries
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON classification_audit_log(user_id, accessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_resource ON classification_audit_log(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_classification ON classification_audit_log(classification_level, accessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_accessed_at ON classification_audit_log(accessed_at DESC);

-- Create ROE status table
CREATE TABLE IF NOT EXISTS roe_status (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    status TEXT NOT NULL, -- 'WEAPON_FREE', 'WEAPON_TIGHT', 'WEAPON_HOLD', 'WEAPON_RESTRICTED'
    level INTEGER NOT NULL, -- 1=PROHIBITED, 2=RESTRICTED, 3=ENGAGE
    active_zones INTEGER DEFAULT 0,
    classification TEXT NOT NULL DEFAULT 'SECRET',
    caveats TEXT DEFAULT '[]', -- JSON array
    description TEXT,
    prohibited_targets TEXT DEFAULT '[]', -- JSON array
    restricted_targets TEXT DEFAULT '[]', -- JSON array
    issuing_authority TEXT,
    effective_date TEXT NOT NULL DEFAULT (datetime('now')),
    expiration_date TEXT,
    is_current INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Create unique index for getting current ROE
CREATE UNIQUE INDEX IF NOT EXISTS idx_roe_status_current ON roe_status(is_current) WHERE is_current = 1;

-- Insert default clearance for existing users (UNCLASS to start)
INSERT OR IGNORE INTO user_clearances (user_id, clearance_level, granted_date, granting_authority, is_active)
SELECT 
    id, 
    'UNCLASS',
    datetime('now'),
    'SYSTEM_DEFAULT',
    1
FROM users;

-- Seed SECRET clearance for targeting_cell@test.mil user (if exists)
UPDATE user_clearances
SET 
    clearance_level = 'SECRET',
    caveats = '["NOFORN"]',
    granted_date = datetime('now', '-1 year'),
    expiration_date = datetime('now', '+4 years'),
    granting_authority = 'DoD CAF',
    investigation_date = datetime('now', '-2 years'),
    adjudication_date = datetime('now', '-1 year'),
    is_active = 1,
    updated_at = datetime('now')
WHERE user_id IN (SELECT id FROM users WHERE email = 'targeting_cell@test.mil');

-- Insert default ROE status
INSERT OR IGNORE INTO roe_status (
    id,
    status, 
    level, 
    active_zones,
    classification,
    caveats,
    description,
    prohibited_targets,
    restricted_targets,
    issuing_authority,
    is_current
)
VALUES (
    'default-roe-001',
    'WEAPON_FREE',
    3,
    3,
    'SECRET',
    '["NOFORN"]',
    'Self-defense authorized. Attack approved targets without additional clearance.',
    '["Cultural sites", "Medical facilities", "Religious structures"]',
    '["Dual-use infrastructure", "Urban targets with CDE > 50"]',
    'CENTCOM J3',
    1
);

-- Create CDE status table for Decision Gates
CREATE TABLE IF NOT EXISTS cde_status (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    target_id TEXT, -- Can be NULL for general CDE tracking
    status TEXT NOT NULL, -- 'APPROVED', 'PENDING', 'REVIEW_REQUIRED', 'REJECTED'
    classification TEXT NOT NULL DEFAULT 'SECRET',
    estimated_casualties INTEGER,
    cde_limit INTEGER,
    analysis_complete INTEGER DEFAULT 0,
    analyst TEXT,
    reviewed_by TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_cde_status_pending ON cde_status(status) WHERE status = 'PENDING';

-- Insert some default CDE status records
INSERT OR IGNORE INTO cde_status (id, status, classification, estimated_casualties, cde_limit, analysis_complete)
VALUES 
    ('cde-001', 'PENDING', 'SECRET', 15, 50, 0),
    ('cde-002', 'PENDING', 'SECRET', 22, 50, 1);

-- Create weather status table for Decision Gates
CREATE TABLE IF NOT EXISTS weather_status (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    status TEXT NOT NULL, -- 'GREEN', 'YELLOW', 'RED'
    classification TEXT NOT NULL DEFAULT 'UNCLASS',
    current_conditions TEXT,
    visibility_km REAL,
    cloud_ceiling_m REAL,
    wind_speed_kts REAL,
    temperature_c REAL,
    forecast_6h TEXT,
    forecast_24h TEXT,
    impact_on_operations TEXT,
    last_updated TEXT NOT NULL DEFAULT (datetime('now')),
    is_current INTEGER NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_weather_current ON weather_status(is_current) WHERE is_current = 1;

-- Insert default weather status
INSERT OR IGNORE INTO weather_status (
    id,
    status,
    classification,
    current_conditions,
    visibility_km,
    cloud_ceiling_m,
    wind_speed_kts,
    temperature_c,
    forecast_6h,
    forecast_24h,
    impact_on_operations,
    is_current
)
VALUES (
    'weather-001',
    'GREEN',
    'UNCLASS',
    'Clear skies, light winds',
    25.0,
    3000.0,
    10.0,
    15.0,
    'Clear',
    'Partly cloudy',
    'No impact on air operations',
    1
);

-- Create deconfliction status table for Decision Gates
CREATE TABLE IF NOT EXISTS deconfliction_status (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    status TEXT NOT NULL, -- 'GREEN', 'YELLOW', 'RED'
    classification TEXT NOT NULL DEFAULT 'SECRET',
    total_airspaces INTEGER DEFAULT 0,
    conflicted_airspaces INTEGER DEFAULT 0,
    pending_deconflictions INTEGER DEFAULT 0,
    resolved_today INTEGER DEFAULT 0,
    conflict_details TEXT, -- JSON array of conflict descriptions
    last_updated TEXT NOT NULL DEFAULT (datetime('now')),
    is_current INTEGER NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_decon_current ON deconfliction_status(is_current) WHERE is_current = 1;

-- Insert default deconfliction status
INSERT OR IGNORE INTO deconfliction_status (
    id,
    status,
    classification,
    total_airspaces,
    conflicted_airspaces,
    pending_deconflictions,
    resolved_today,
    conflict_details,
    is_current
)
VALUES (
    'decon-001',
    'RED',
    'SECRET',
    12,
    1,
    1,
    3,
    '[{"airspace": "AO-NORTH-23", "conflict": "Friendly ISR asset", "priority": "HIGH"}]',
    1
);

-- Migration complete
-- Note: SQLite doesn't support complex ALTER TABLE operations
-- If you need to add classification columns to existing tables (targets, nominations, etc.),
-- those tables would need to be created in their respective migrations with classification support
