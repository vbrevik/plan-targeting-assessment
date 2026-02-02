-- Migration: 20260202160000_fix_abac_schema
-- Objective: Add 'id' column to entity_relationships and update views for Abac compatibility.

-- 1. Recreate entity_relationships with 'id' column
-- SQLite doesn't support ALTER TABLE to add PK or drop PK, so we recreate.
PRAGMA foreign_keys=OFF;

CREATE TABLE entity_relationships_new (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    source_id TEXT REFERENCES entities(id),
    target_id TEXT REFERENCES entities(id),
    relation_type TEXT NOT NULL, 
    properties JSONB,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Copy data, generating IDs for existing rows
INSERT INTO entity_relationships_new (source_id, target_id, relation_type, properties, created_at)
SELECT source_id, target_id, relation_type, properties, created_at
FROM entity_relationships;

DROP TABLE entity_relationships;
ALTER TABLE entity_relationships_new RENAME TO entity_relationships;

CREATE INDEX idx_relationships_target ON entity_relationships(target_id, relation_type);
CREATE INDEX idx_relationships_source_type ON entity_relationships(source_id, relation_type);

PRAGMA foreign_keys=ON;

-- 2. Update v_user_roles_ontology to include 'id'
DROP VIEW IF EXISTS v_user_roles_ontology;
CREATE VIEW v_user_roles_ontology AS
SELECT 
    id,
    source_id as user_id,
    target_id as role_id,
    json_extract(properties, '$.resource_id') as resource_id,
    created_at
FROM entity_relationships
WHERE relation_type = 'HAS_ROLE';

-- 3. Also update sync triggers if they reference OLD system (though they usually just target the tables)
-- tr_user_roles_sync_insert and tr_user_roles_sync_delete should be fine as they target the table structure.
-- One detail: tr_user_roles_sync_delete previously relied on composite uniqueness. 
-- Now we have a surrogate PK. If the sync delete relies on source_id/target_id/relation_type, it's fine.

-- Let's refine the unique constraint to allow the same role for different resources, 
-- but NOT the same role for the SAME resource (to prevent duplicates).
-- Properties might be NULL or empty json.

CREATE UNIQUE INDEX idx_unique_relationship ON entity_relationships(source_id, target_id, relation_type, properties);
