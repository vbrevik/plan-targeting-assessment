-- Migration: 20260131200000_extend_decision_ontology
-- Objective: Ensure core decision-related entities and relationship seeds exist.

-- 1. Insert default Meeting Venues as Entities
INSERT OR IGNORE INTO entities (
    id, name, type, description, status, created_at, updated_at, properties
) VALUES 
(
    'venue-cab', 'Campaign Assessment Board', 'MEETING_VENUE', 
    'Weekly board for strategic campaign assessment.', 'active', 
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 
    json_object('short_name', 'CAB', 'schedule', 'Monday 0800-0900', 'recurrence', 'weekly', 'authority_level', 'strategic', 'default_approver', 'commander')
),
(
    'venue-drb', 'Decision Review Board', 'MEETING_VENUE', 
    'Weekly board for operational decision review.', 'active', 
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 
    json_object('short_name', 'DRB', 'schedule', 'Wednesday 1400-1600', 'recurrence', 'weekly', 'authority_level', 'operational', 'default_approver', 'commander')
),
(
    'venue-rab', 'Resource Allocation Board', 'MEETING_VENUE', 
    'Weekly board for tactical resource allocation.', 'active', 
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 
    json_object('short_name', 'RAB', 'schedule', 'Friday 0900-1000', 'recurrence', 'weekly', 'authority_level', 'tactical', 'default_approver', 'deputy')
);

-- Note: The relationship types are conceptual, but we can document them in code.
-- We don't need tables for relationship types because 'relation_type' is just a string.
