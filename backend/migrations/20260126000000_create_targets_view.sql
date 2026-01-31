-- Migration: 20260126000000_create_targets_view
-- Objective: Create missing v_targets_ontology view (safe version matching base schema)

DROP VIEW IF EXISTS v_targets_ontology;

CREATE VIEW v_targets_ontology AS
SELECT
    id,
    name,
    description,
    target_type,
    priority,
    target_status,
    coordinates,
    f3ead_stage,
    classification,
    created_at,
    updated_at
FROM targets;
