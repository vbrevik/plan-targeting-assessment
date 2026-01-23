-- Add rate limit configuration tables
CREATE TABLE IF NOT EXISTS rate_limit_rules (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    endpoint_pattern TEXT NOT NULL,
    max_requests INTEGER NOT NULL,
    window_seconds INTEGER NOT NULL,
    strategy TEXT NOT NULL CHECK(strategy IN ('IP', 'User', 'Global')),
    enabled BOOLEAN NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index on endpoint_pattern for faster lookups
CREATE INDEX IF NOT EXISTS idx_rate_limit_rules_pattern ON rate_limit_rules(endpoint_pattern);
CREATE INDEX IF NOT EXISTS idx_rate_limit_rules_enabled ON rate_limit_rules(enabled);

-- Seed default rate limit rules
INSERT INTO rate_limit_rules (id, name, endpoint_pattern, max_requests, window_seconds, strategy, enabled) VALUES
    ('auth-login', 'Auth - Login/Register', '/api/auth/(login|register)', 5, 900, 'IP', 1),
    ('auth-general', 'Auth - General', '/api/auth/*', 60, 60, 'User', 1),
    ('api-read', 'API - Read Operations', '/api/*/GET', 100, 60, 'User', 1),
    ('api-write', 'API - Write Operations', '/api/*/POST|PUT|DELETE', 30, 60, 'User', 1),
    ('admin', 'Admin Endpoints', '/api/admin/*', 50, 60, 'User', 1);

-- Create rate limit bypass tokens table
CREATE TABLE IF NOT EXISTS rate_limit_bypass_tokens (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    token TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    created_by TEXT,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create index on token for fast lookups
CREATE INDEX IF NOT EXISTS idx_bypass_tokens_token ON rate_limit_bypass_tokens(token);

-- Generate initial bypass token for testing
INSERT INTO rate_limit_bypass_tokens (token, description) VALUES
    (lower(hex(randomblob(32))), 'Initial test bypass token');
