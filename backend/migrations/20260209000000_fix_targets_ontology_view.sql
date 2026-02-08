-- Migration: Fix v_targets_ontology to read from entities table (not targets standalone table)
-- The original migration 20260126000000 incorrectly created this view reading from the targets table.
-- This breaks the ontology-first pattern. Sync triggers keep entities in sync, so data is already there.

DROP VIEW IF EXISTS v_targets_ontology;

CREATE VIEW v_targets_ontology AS
SELECT
    id,
    name,
    description,
    json_extract(properties, '$.target_type') as target_type,
    json_extract(properties, '$.priority') as priority,
    status as target_status,
    json_extract(properties, '$.coordinates') as coordinates,
    json_extract(properties, '$.f3ead_stage') as f3ead_stage,
    classification,
    json_extract(properties, '$.be_number') as be_number,
    json_extract(properties, '$.functional_type') as functional_type,
    operation_id,
    campaign_id,
    confidence,
    created_at,
    updated_at
FROM entities
WHERE type = 'TARGET';
