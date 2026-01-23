-- Migration to switch User IDs from INTEGER to TEXT (UUID)
-- This migration recreates the tables to change the primary and foreign key types.

-- Disable foreign key checks temporarily
PRAGMA foreign_keys = OFF;

-- 1. Recreate users table
CREATE TABLE users_new (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login_ip TEXT,
    last_user_agent TEXT,
    last_login_at TIMESTAMP,
    notification_preferences TEXT DEFAULT '{}'
);

-- We don't migrate data because IDs are changing fundamentally and it's a dev environment.
-- If we needed to migrate, we would generate UUIDs for each row here.

-- 2. Recreate refresh_tokens table
CREATE TABLE refresh_tokens_new (
    token_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users_new(id) ON DELETE CASCADE
);

-- 3. Recreate notifications table
CREATE TABLE notifications_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    message TEXT NOT NULL,
    read INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users_new(id) ON DELETE CASCADE
);

-- Drop old tables
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS users;

-- Rename new tables
ALTER TABLE users_new RENAME TO users;
ALTER TABLE refresh_tokens_new RENAME TO refresh_tokens;
ALTER TABLE notifications_new RENAME TO notifications;

-- Recreate indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_refresh_tokens_token_id ON refresh_tokens(token_id);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- Re-enable foreign key checks
PRAGMA foreign_keys = ON;
