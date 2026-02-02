-- Migration: 20260202120000_align_admin_ontology
-- Objective: Migrate Users, Roles, and Permissions into the central ontology tables.

-- 1. Migrate Users
INSERT OR IGNORE INTO entities (
    id, name, type, description, status, classification, created_at, updated_at, properties
)
SELECT 
    id, 
    username as name, 
    'USER' as type, 
    'System User' as description, 
    'ACTIVE' as status, 
    'UNCLASSIFIED' as classification, 
    created_at, 
    updated_at,
    json_object(
        'email', email,
        'password_hash', password_hash,
        'last_login_ip', last_login_ip,
        'last_user_agent', last_user_agent,
        'last_login_at', last_login_at
    ) as properties
FROM users;

-- 2. Migrate Roles
INSERT OR IGNORE INTO entities (
    id, name, type, description, status, classification, created_at, updated_at, properties
)
SELECT 
    id, 
    name, 
    'ROLE' as type, 
    description, 
    'ACTIVE' as status, 
    'UNCLASSIFIED' as classification, 
    created_at, 
    created_at as updated_at, -- Roles table might not have updated_at
    json_object() as properties
FROM roles;

-- 3. Migrate Permissions
INSERT OR IGNORE INTO entities (
    id, name, type, description, status, classification, created_at, updated_at, properties
)
SELECT 
    id, 
    action as name, 
    'PERMISSION' as type, 
    'Permission Action' as description, 
    'ACTIVE' as status, 
    'UNCLASSIFIED' as classification, 
    created_at, 
    created_at as updated_at,
    json_object(
        'action', action,
        'resource_type', 'System' -- Default
    ) as properties
FROM permissions;

-- 4. Migrate User-Role Relationships (User -> Role)
INSERT OR IGNORE INTO entity_relationships (source_id, target_id, relation_type, properties, created_at)
SELECT 
    user_id, 
    role_id, 
    'HAS_ROLE', 
    CASE 
        WHEN resource_id IS NOT NULL THEN json_object('resource_id', resource_id)
        ELSE NULL
    END,
    CURRENT_TIMESTAMP
FROM user_roles;

-- 5. Migrate Role-Permission Relationships (Role -> Permission)
-- Note: 'permissions' table in legacy schema has a 'role_id' foreign key, meaning it's a direct many-to-one. 
-- In ontology, we link Role -> Permission entity.
INSERT OR IGNORE INTO entity_relationships (source_id, target_id, relation_type, created_at)
SELECT 
    role_id, 
    id, -- permission id
    'HAS_PERMISSION', 
    created_at
FROM permissions;

-- ============================================================================
-- SYNC TRIGGERS: USERS
-- ============================================================================

CREATE TRIGGER IF NOT EXISTS tr_users_sync_insert AFTER INSERT ON users
BEGIN
    INSERT OR IGNORE INTO entities (
        id, name, type, description, status, classification, created_at, updated_at, properties
    ) VALUES (
        NEW.id, NEW.username, 'USER', 'System User', 'ACTIVE', 'UNCLASSIFIED', NEW.created_at, NEW.updated_at,
        json_object(
            'email', NEW.email, 
            'password_hash', NEW.password_hash,
            'last_login_ip', NEW.last_login_ip,
            'last_user_agent', NEW.last_user_agent,
            'last_login_at', NEW.last_login_at
        )
    );
END;

CREATE TRIGGER IF NOT EXISTS tr_users_sync_update AFTER UPDATE ON users
BEGIN
    UPDATE entities SET
        name = NEW.username,
        updated_at = NEW.updated_at,
        properties = json_object(
            'email', NEW.email, 
            'password_hash', NEW.password_hash,
            'last_login_ip', NEW.last_login_ip,
            'last_user_agent', NEW.last_user_agent,
            'last_login_at', NEW.last_login_at
        )
    WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS tr_users_sync_delete AFTER DELETE ON users
BEGIN
    DELETE FROM entities WHERE id = OLD.id;
END;

-- ============================================================================
-- SYNC TRIGGERS: ROLES
-- ============================================================================

CREATE TRIGGER IF NOT EXISTS tr_roles_sync_insert AFTER INSERT ON roles
BEGIN
    INSERT OR IGNORE INTO entities (
        id, name, type, description, status, classification, created_at, updated_at, properties
    ) VALUES (
        NEW.id, NEW.name, 'ROLE', NEW.description, 'ACTIVE', 'UNCLASSIFIED', NEW.created_at, NEW.created_at,
        json_object()
    );
END;

CREATE TRIGGER IF NOT EXISTS tr_roles_sync_update AFTER UPDATE ON roles
BEGIN
    UPDATE entities SET
        name = NEW.name,
        description = NEW.description,
        updated_at = datetime('now'),
        properties = json_object()
    WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS tr_roles_sync_delete AFTER DELETE ON roles
BEGIN
    DELETE FROM entities WHERE id = OLD.id;
END;

-- ============================================================================
-- SYNC TRIGGERS: PERMISSIONS
-- ============================================================================

CREATE TRIGGER IF NOT EXISTS tr_permissions_sync_insert AFTER INSERT ON permissions
BEGIN
    INSERT OR IGNORE INTO entities (
        id, name, type, description, status, classification, created_at, updated_at, properties
    ) VALUES (
        NEW.id, NEW.action, 'PERMISSION', 'Permission Action', 'ACTIVE', 'UNCLASSIFIED', NEW.created_at, NEW.created_at,
        json_object('action', NEW.action, 'resource_type', 'System')
    );
    -- Link Role -> Permission
    INSERT OR IGNORE INTO entity_relationships (source_id, target_id, relation_type, created_at)
    VALUES (NEW.role_id, NEW.id, 'HAS_PERMISSION', NEW.created_at);
END;

-- Note: Updating permissions usually means deleting/recreating in simple models, but if update:
CREATE TRIGGER IF NOT EXISTS tr_permissions_sync_update AFTER UPDATE ON permissions
BEGIN
    UPDATE entities SET
        name = NEW.action,
        properties = json_object('action', NEW.action, 'resource_type', 'System')
    WHERE id = NEW.id;
    -- Update relationship if role_id changed (unlikely but possible)
    UPDATE entity_relationships SET source_id = NEW.role_id WHERE target_id = NEW.id AND relation_type = 'HAS_PERMISSION';
END;

CREATE TRIGGER IF NOT EXISTS tr_permissions_sync_delete AFTER DELETE ON permissions
BEGIN
    DELETE FROM entities WHERE id = OLD.id;
    -- Relationships cascade delete via constraints or manually? 
    -- Manual logic:
    DELETE FROM entity_relationships WHERE target_id = OLD.id AND relation_type = 'HAS_PERMISSION';
END;

-- ============================================================================
-- SYNC TRIGGERS: USER_ROLES
-- ============================================================================

CREATE TRIGGER IF NOT EXISTS tr_user_roles_sync_insert AFTER INSERT ON user_roles
BEGIN
    INSERT OR IGNORE INTO entity_relationships (source_id, target_id, relation_type, properties, created_at)
    VALUES (
        NEW.user_id, 
        NEW.role_id, 
        'HAS_ROLE', 
        CASE 
            WHEN NEW.resource_id IS NOT NULL THEN json_object('resource_id', NEW.resource_id)
            ELSE NULL
        END,
        NEW.created_at
    );
END;

CREATE TRIGGER IF NOT EXISTS tr_user_roles_sync_delete AFTER DELETE ON user_roles
BEGIN
    DELETE FROM entity_relationships 
    WHERE source_id = OLD.user_id 
      AND target_id = OLD.role_id 
      AND relation_type = 'HAS_ROLE'
      AND (
          (OLD.resource_id IS NULL AND (json_extract(properties, '$.resource_id') IS NULL))
          OR 
          (json_extract(properties, '$.resource_id') = OLD.resource_id)
      );
END;

-- ============================================================================
-- 6. COMPATIBILITY VIEWS (for service refactoring)
-- ============================================================================

CREATE VIEW IF NOT EXISTS v_users_ontology AS
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

CREATE VIEW IF NOT EXISTS v_roles_ontology AS
SELECT 
    id,
    name,
    description,
    created_at,
    updated_at
FROM entities
WHERE type = 'ROLE';

CREATE VIEW IF NOT EXISTS v_permissions_ontology AS
SELECT 
    id,
    json_extract(properties, '$.action') as action,
    name as description, -- Using name as description placeholder or extracting from desc
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

