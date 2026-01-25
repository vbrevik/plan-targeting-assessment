-- IM Ontology Schema: Seed Sample Entities for IM Domain
-- Phase IM01: Create sample entities representing the IM schema
-- 
-- Entity Model:
--   TOR (Terms of Reference) = Formal agenda, contains DecisionPoints
--   DecisionPoint = Expected decision item within a TOR
--   Meeting = Actual event instance (place + time) following a TOR
--   MoM (Minutes of Meeting) = Record of what happened in a Meeting
--   Decision = Actual outcome, produced in a Meeting, linked to a DecisionPoint
--   RFI = Request for Information (incoming/outgoing)
--   Task = Assigned work item
--   Person = Staff member

-- Sample TORs (Formal Meeting Agendas)
INSERT INTO entities (id, name, type, description, status, properties, created_at, updated_at)
VALUES
    ('im-tor-daily-standup', 'Daily Standup TOR', 'TOR', 
     'Terms of Reference for daily standup meetings',
     'Active',
     '{"type": "daily", "cadence": "daily", "authority_level": "tactical", "typical_duration_minutes": 30, "expected_attendees": ["IM Lead", "Shift Staff"]}',
     datetime('now'), datetime('now')),
    ('im-tor-weekly-sync', 'Weekly Planning Sync TOR', 'TOR',
     'Terms of Reference for weekly planning synchronization',
     'Active',
     '{"type": "planning", "cadence": "weekly", "authority_level": "operational", "typical_duration_minutes": 60, "expected_attendees": ["Commander", "J3", "J5", "IM Lead"]}',
     datetime('now'), datetime('now'))
ON CONFLICT(id) DO UPDATE SET
    name = excluded.name,
    description = excluded.description,
    properties = excluded.properties,
    updated_at = datetime('now');

-- Sample DecisionPoints (Expected Agenda Items in TOR)
INSERT INTO entities (id, name, type, description, status, properties, created_at, updated_at)
VALUES
    ('im-dp-001', 'Approve Phase 2 Transition', 'DecisionPoint',
     'Decision point for approving transition to Phase 2',
     'Scheduled',
     '{"authority_required": "Commander", "dependencies": ["J5 assessment", "J4 logistics readiness"]}',
     datetime('now'), datetime('now')),
    ('im-dp-002', 'Allocate Week 5 Resources', 'DecisionPoint',
     'Decision point for resource allocation',
     'Scheduled',
     '{"authority_required": "J3/J4", "dependencies": ["Logistics assessment"]}',
     datetime('now'), datetime('now')),
    ('im-dp-003', 'Review Daily Status', 'DecisionPoint',
     'Standing decision point for daily status review',
     'Recurring',
     '{"authority_required": "IM Lead", "dependencies": []}',
     datetime('now'), datetime('now'))
ON CONFLICT(id) DO UPDATE SET
    name = excluded.name,
    description = excluded.description,
    properties = excluded.properties,
    updated_at = datetime('now');

-- Sample Persons
INSERT INTO entities (id, name, type, description, status, properties, created_at, updated_at)
VALUES
    ('im-person-im-lead', 'IM Lead', 'Person',
     'Information Management Lead',
     'Active',
     '{"name": "IM Lead", "role": "Information Manager", "contact": "im@hq.mil"}',
     datetime('now'), datetime('now')),
    ('im-person-assistant-im', 'Assistant IM', 'Person',
     'Assistant Information Manager',
     'Active',
     '{"name": "Assistant IM", "role": "Assistant Information Manager", "contact": "assistant-im@hq.mil"}',
     datetime('now'), datetime('now')),
    ('im-person-j3-ops', 'J3 Ops Officer', 'Person',
     'J3 Operations Officer',
     'Active',
     '{"name": "J3 Ops Officer", "role": "J3 Operations", "contact": "j3@hq.mil"}',
     datetime('now'), datetime('now'))
ON CONFLICT(id) DO UPDATE SET
    name = excluded.name,
    description = excluded.description,
    properties = excluded.properties,
    updated_at = datetime('now');

-- Sample Meetings (Actual Event Instances)
INSERT INTO entities (id, name, type, description, status, properties, valid_from, created_at, updated_at)
VALUES
    ('im-meeting-daily-1', 'Daily Standup 2026-01-25', 'Meeting',
     'Morning standup for 25 Jan 2026',
     'Scheduled',
     '{"status": "scheduled", "location": "Op Room A", "start_time": "2026-01-25T08:00:00Z", "end_time": "2026-01-25T08:30:00Z"}',
     datetime('2026-01-25 08:00:00'),
     datetime('now'), datetime('now')),
    ('im-meeting-weekly-1', 'Weekly Planning Sync 2026-01-27', 'Meeting',
     'Weekly planning sync for week of 27 Jan',
     'Scheduled',
     '{"status": "scheduled", "location": "Briefing Room", "start_time": "2026-01-27T10:00:00Z", "end_time": "2026-01-27T11:00:00Z"}',
     datetime('2026-01-27 10:00:00'),
     datetime('now'), datetime('now'))
ON CONFLICT(id) DO UPDATE SET
    name = excluded.name,
    description = excluded.description,
    properties = excluded.properties,
    updated_at = datetime('now');

-- Sample MoM (Minutes of Meeting) - created after meetings conclude
INSERT INTO entities (id, name, type, description, status, properties, created_at, updated_at)
VALUES
    ('im-mom-daily-prev', 'MoM: Daily Standup 2026-01-24', 'MoM',
     'Minutes of previous daily standup',
     'Final',
     '{"meeting_date": "2026-01-24T08:00:00Z", "scribe": "Assistant IM", "attendees": ["IM Lead", "Assistant IM"], "summary": "Status updates completed, no blockers identified."}',
     datetime('now'), datetime('now'))
ON CONFLICT(id) DO UPDATE SET
    name = excluded.name,
    description = excluded.description,
    properties = excluded.properties,
    updated_at = datetime('now');

-- Sample RFIs
INSERT INTO entities (id, name, type, description, status, properties, valid_from, created_at, updated_at)
VALUES
    ('im-rfi-001', 'RFI: Enemy Force Disposition', 'RFI',
     'Request for intelligence on enemy force disposition in sector 7',
     'Pending',
     '{"status": "pending", "due_date": "2026-01-25T12:00:00Z", "priority": "high", "direction": "outgoing", "subject": "Enemy Force Disposition"}',
     datetime('now'),
     datetime('now'), datetime('now')),
    ('im-rfi-002', 'RFI: Logistics Capacity', 'RFI',
     'Request for information on logistics capacity for upcoming operation',
     'Open',
     '{"status": "open", "due_date": "2026-01-26T18:00:00Z", "priority": "medium", "direction": "incoming", "subject": "Logistics Capacity"}',
     datetime('now'),
     datetime('now'), datetime('now'))
ON CONFLICT(id) DO UPDATE SET
    name = excluded.name,
    description = excluded.description,
    status = excluded.status,
    properties = excluded.properties,
    updated_at = datetime('now');

-- Sample Decisions (Actual Outcomes)
INSERT INTO entities (id, name, type, description, status, properties, created_at, updated_at)
VALUES
    ('im-decision-001', 'Decision: Authorize Phase 2', 'Decision',
     'Decision to authorize transition to Phase 2 operations',
     'Planned',
     '{"status": "planned", "outcome": null, "decided_at": null, "rationale": null}',
     datetime('now'), datetime('now')),
    ('im-decision-002', 'Decision: Resource Allocation', 'Decision',
     'Decision on resource allocation for week 5',
     'Pending',
     '{"status": "pending", "outcome": null, "decided_at": null, "rationale": "Awaiting J4 input"}',
     datetime('now'), datetime('now')),
    ('im-decision-prev', 'Decision: Approved Night Ops', 'Decision',
     'Previous decision approving night operations',
     'Decided',
     '{"status": "decided", "outcome": "approved", "decided_at": "2026-01-24T08:15:00Z", "rationale": "All conditions met"}',
     datetime('now'), datetime('now'))
ON CONFLICT(id) DO UPDATE SET
    name = excluded.name,
    description = excluded.description,
    status = excluded.status,
    properties = excluded.properties,
    updated_at = datetime('now');

-- Sample Tasks
INSERT INTO entities (id, name, type, description, status, properties, valid_from, created_at, updated_at)
VALUES
    ('im-task-001', 'Task: Prepare Briefing Slides', 'Task',
     'Prepare briefing slides for weekly sync',
     'In Progress',
     '{"status": "in_progress", "due_date": "2026-01-26T17:00:00Z", "priority": "high", "description": "Prepare briefing slides for weekly commander sync"}',
     datetime('now'),
     datetime('now'), datetime('now')),
    ('im-task-002', 'Task: Respond to RFI-001', 'Task',
     'Draft response to RFI on enemy force disposition',
     'Open',
     '{"status": "open", "due_date": "2026-01-25T11:00:00Z", "priority": "high", "description": "Respond to incoming RFI on enemy disposition"}',
     datetime('now'),
     datetime('now'), datetime('now'))
ON CONFLICT(id) DO UPDATE SET
    name = excluded.name,
    description = excluded.description,
    status = excluded.status,
    properties = excluded.properties,
    updated_at = datetime('now');

-- ===== RELATIONSHIPS =====

-- TOR contains DecisionPoints
INSERT INTO entity_relationships (source_id, target_id, relation_type, properties, created_at)
VALUES
    ('im-tor-weekly-sync', 'im-dp-001', 'contains', '{"order": 1}', datetime('now')),
    ('im-tor-weekly-sync', 'im-dp-002', 'contains', '{"order": 2}', datetime('now')),
    ('im-tor-daily-standup', 'im-dp-003', 'contains', '{"order": 1}', datetime('now'))
ON CONFLICT DO NOTHING;

-- Meeting follows TOR
INSERT INTO entity_relationships (source_id, target_id, relation_type, properties, created_at)
VALUES
    ('im-meeting-daily-1', 'im-tor-daily-standup', 'follows', '{}', datetime('now')),
    ('im-meeting-weekly-1', 'im-tor-weekly-sync', 'follows', '{}', datetime('now'))
ON CONFLICT DO NOTHING;

-- MoM records Meeting
INSERT INTO entity_relationships (source_id, target_id, relation_type, properties, created_at)
VALUES
    ('im-mom-daily-prev', 'im-meeting-daily-1', 'records', '{}', datetime('now'))
ON CONFLICT DO NOTHING;

-- MoM contains Decisions (actual outcomes captured in minutes)
INSERT INTO entity_relationships (source_id, target_id, relation_type, properties, created_at)
VALUES
    ('im-mom-daily-prev', 'im-decision-prev', 'contains', '{}', datetime('now'))
ON CONFLICT DO NOTHING;

-- Decision implements DecisionPoint
INSERT INTO entity_relationships (source_id, target_id, relation_type, properties, created_at)
VALUES
    ('im-decision-001', 'im-dp-001', 'implements', '{}', datetime('now')),
    ('im-decision-002', 'im-dp-002', 'implements', '{}', datetime('now'))
ON CONFLICT DO NOTHING;

-- Decision made_in Meeting
INSERT INTO entity_relationships (source_id, target_id, relation_type, properties, created_at)
VALUES
    ('im-decision-prev', 'im-meeting-daily-1', 'made_in', '{}', datetime('now'))
ON CONFLICT DO NOTHING;

-- Task assigned_to Person
INSERT INTO entity_relationships (source_id, target_id, relation_type, properties, created_at)
VALUES
    ('im-task-001', 'im-person-assistant-im', 'assigned_to', '{}', datetime('now')),
    ('im-task-002', 'im-person-im-lead', 'assigned_to', '{}', datetime('now'))
ON CONFLICT DO NOTHING;

-- RFI requested_by Person
INSERT INTO entity_relationships (source_id, target_id, relation_type, properties, created_at)
VALUES
    ('im-rfi-001', 'im-person-j3-ops', 'requested_by', '{}', datetime('now'))
ON CONFLICT DO NOTHING;

-- Task part_of RFI
INSERT INTO entity_relationships (source_id, target_id, relation_type, properties, created_at)
VALUES
    ('im-task-002', 'im-rfi-001', 'part_of', '{}', datetime('now'))
ON CONFLICT DO NOTHING;
