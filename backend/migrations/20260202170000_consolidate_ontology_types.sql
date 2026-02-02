-- Migration: Consolidate Ontology Types & Standardize Naming
-- Standardize all entity types and relationship types to UPPER_SNAKE_CASE

-- 1. Entity Type Standardization
UPDATE entities SET type = 'DECISION' WHERE type IN ('Decision', 'DECISION');
UPDATE entities SET type = 'ROLE' WHERE type IN ('Role', 'ROLE');
UPDATE entities SET type = 'USER' WHERE type IN ('User', 'USER');
UPDATE entities SET type = 'PERMISSION' WHERE type IN ('Permission', 'PERMISSION');
UPDATE entities SET type = 'ASSESSMENT' WHERE type IN ('BDA_REPORT', 'Assessment', 'ASSESSMENT');
UPDATE entities SET type = 'PERSON' WHERE type = 'Person';
UPDATE entities SET type = 'INTEL_FEED' WHERE type = 'IntelFeed';
UPDATE entities SET type = 'AGENDA_POINT' WHERE type = 'AgendaPoint';
UPDATE entities SET type = 'MENU_ITEM' WHERE type = 'MenuItem';
UPDATE entities SET type = 'DATASET' WHERE type = 'Dataset';
UPDATE entities SET type = 'MEETING' WHERE type = 'Meeting';
UPDATE entities SET type = 'TASK' WHERE type = 'Task';
UPDATE entities SET type = 'EVENT' WHERE type = 'Event';
UPDATE entities SET type = 'TARGET' WHERE type = 'Target';
UPDATE entities SET type = 'ASSUMPTION' WHERE type = 'Assumption';
UPDATE entities SET type = 'UNIT' WHERE type = 'Unit';
UPDATE entities SET type = 'FACILITY' WHERE type = 'Facility';
UPDATE entities SET type = 'TRACK' WHERE type = 'Track';
UPDATE entities SET type = 'SENSOR' WHERE type = 'Sensor';
UPDATE entities SET type = 'TOR' WHERE type = 'TOR';
UPDATE entities SET type = 'ACTION' WHERE type = 'Action';
UPDATE entities SET type = 'RFI' WHERE type = 'RFI';

-- 2. Relationship Type Standardization
UPDATE entity_relationships SET relation_type = 'ASSESSES' WHERE relation_type IN ('assesses', 'ASSESSES');
UPDATE entity_relationships SET relation_type = 'HAS_ROLE' WHERE relation_type = 'assigned_to';
UPDATE entity_relationships SET relation_type = 'OPERATES_ON' WHERE relation_type = 'operates_on';
UPDATE entity_relationships SET relation_type = 'PERFORMS_ACTION' WHERE relation_type = 'performs_action';
UPDATE entity_relationships SET relation_type = 'PROVIDES_INTEL_FOR' WHERE relation_type = 'provides_intel_for';
UPDATE entity_relationships SET relation_type = 'REQUESTED_BY' WHERE relation_type = 'requested_by';
UPDATE entity_relationships SET relation_type = 'DECIDED_AT' WHERE relation_type = 'decided_at';
UPDATE entity_relationships SET relation_type = 'FOLLOWS' WHERE relation_type = 'follows';
UPDATE entity_relationships SET relation_type = 'IMPLEMENTS' WHERE relation_type = 'implements';
UPDATE entity_relationships SET relation_type = 'MADE_IN' WHERE relation_type = 'made_in';
UPDATE entity_relationships SET relation_type = 'PLANNED_FOR' WHERE relation_type = 'planned_for';
UPDATE entity_relationships SET relation_type = 'RECORDS' WHERE relation_type = 'records';

-- 3. Consolidate Hierarchy to HAS_PART
-- 'contains' is already Parent-HAS_PART-Child
UPDATE entity_relationships SET relation_type = 'HAS_PART' WHERE relation_type = 'contains';

-- 'part_of' is Child-part_of-Parent. Flip to Parent-HAS_PART-Child.
-- We create a temporary table to hold the flipped relationships
CREATE TABLE temp_flipped_rels (
    source_id TEXT,
    target_id TEXT,
    relation_type TEXT,
    properties JSONB,
    created_at DATETIME
);

INSERT INTO temp_flipped_rels (source_id, target_id, relation_type, properties, created_at)
SELECT target_id, source_id, 'HAS_PART', properties, created_at
FROM entity_relationships
WHERE relation_type = 'part_of';

-- Delete original part_of relationships
DELETE FROM entity_relationships WHERE relation_type = 'part_of';

-- Insert the flipped ones
INSERT INTO entity_relationships (id, source_id, target_id, relation_type, properties, created_at)
SELECT lower(hex(randomblob(16))), source_id, target_id, relation_type, properties, created_at
FROM temp_flipped_rels;

DROP TABLE temp_flipped_rels;

-- Final catch-all for any other dual-cased relationships that might be missing
UPDATE entity_relationships SET relation_type = 'HAS_PART' WHERE relation_type = 'HAS_PART';
UPDATE entity_relationships SET relation_type = 'GOVERNED_BY' WHERE relation_type = 'GOVERNED_BY';
UPDATE entity_relationships SET relation_type = 'HAS_PERMISSION' WHERE relation_type = 'HAS_PERMISSION';

-- Ensure all are UPPER
UPDATE entity_relationships SET relation_type = upper(relation_type);
UPDATE entities SET type = upper(type);
