-- ABAC Core Tables Migration (SQLite)

-- Resources: Defines the different areas/scopes (e.g., projects, teams)
CREATE TABLE IF NOT EXISTS resources (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL UNIQUE,
    resource_type TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Roles: Defines available roles (e.g., admin, editor, viewer)
CREATE TABLE IF NOT EXISTS roles (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- User Roles: Links users to roles within specific resources
-- resource_id can be NULL for global roles
CREATE TABLE IF NOT EXISTS user_roles (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    resource_id TEXT REFERENCES resources(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (user_id, role_id, resource_id)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_resource ON user_roles(resource_id);

-- Permissions: Defines granular permissions for each role
CREATE TABLE IF NOT EXISTS permissions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (role_id, action)
);

CREATE INDEX IF NOT EXISTS idx_permissions_role ON permissions(role_id);

-- Seed default roles
INSERT OR IGNORE INTO roles (id, name, description) VALUES
    (lower(hex(randomblob(16))), 'superadmin', 'Full access to all resources and actions'),
    (lower(hex(randomblob(16))), 'admin', 'Administrative access within a specific resource'),
    (lower(hex(randomblob(16))), 'editor', 'Can create and modify content within a resource'),
    (lower(hex(randomblob(16))), 'viewer', 'Read-only access to a resource');

-- Seed default permissions for each role
-- Superadmin permissions (wildcard)
INSERT OR IGNORE INTO permissions (id, role_id, action)
SELECT lower(hex(randomblob(16))), id, '*' FROM roles WHERE name = 'superadmin';

-- Admin permissions
INSERT OR IGNORE INTO permissions (id, role_id, action)
SELECT lower(hex(randomblob(16))), id, 'read' FROM roles WHERE name = 'admin';
INSERT OR IGNORE INTO permissions (id, role_id, action)
SELECT lower(hex(randomblob(16))), id, 'write' FROM roles WHERE name = 'admin';
INSERT OR IGNORE INTO permissions (id, role_id, action)
SELECT lower(hex(randomblob(16))), id, 'delete' FROM roles WHERE name = 'admin';
INSERT OR IGNORE INTO permissions (id, role_id, action)
SELECT lower(hex(randomblob(16))), id, 'manage_users' FROM roles WHERE name = 'admin';

-- Editor permissions
INSERT OR IGNORE INTO permissions (id, role_id, action)
SELECT lower(hex(randomblob(16))), id, 'read' FROM roles WHERE name = 'editor';
INSERT OR IGNORE INTO permissions (id, role_id, action)
SELECT lower(hex(randomblob(16))), id, 'write' FROM roles WHERE name = 'editor';

-- Viewer permissions
INSERT OR IGNORE INTO permissions (id, role_id, action)
SELECT lower(hex(randomblob(16))), id, 'read' FROM roles WHERE name = 'viewer';
