-- Seed data for Battle Rhythm / Meetings feature
-- Run with: sqlite3 backend/data/app.db < backend/seed_meetings.sql

-- ============================================
-- Terms of Reference (TOR) entities
-- ============================================

-- Combined Assessment Board TOR
INSERT OR REPLACE INTO entities (id, name, type, description, properties, status, created_at, updated_at)
VALUES (
    'tor-cab-001',
    'Combined Assessment Board TOR',
    'TOR',
    'Terms of Reference for the Combined Assessment Board - reviews BDA reports and validates targeting priorities',
    json('{
        "objectives": [
            "Review and validate BDA reports from last 24 hours",
            "Assess target system degradation",
            "Prioritize re-attack requirements",
            "Coordinate multi-INT collection"
        ],
        "participants": [
            {"role": "J2 Chief", "required": true},
            {"role": "J3 Chief", "required": true},
            {"role": "LEGAD", "required": true},
            {"role": "J5 Plans", "required": false},
            {"role": "POLAD", "required": false}
        ],
        "agenda": [
            "Roll Call & Quorum Verification",
            "BDA Reports Review",
            "Target System Assessment",
            "Re-attack Prioritization",
            "Collection Requirements",
            "Closing & Action Items"
        ],
        "frequency": "Daily",
        "duration_minutes": 90,
        "classification": "SECRET"
    }'),
    'active',
    datetime('now'),
    datetime('now')
);

-- Decision Review Board TOR
INSERT OR REPLACE INTO entities (id, name, type, description, properties, status, created_at, updated_at)
VALUES (
    'tor-drb-001',
    'Decision Review Board TOR',
    'TOR',
    'Terms of Reference for the Decision Review Board - reviews and approves targeting decisions',
    json('{
        "objectives": [
            "Review pending target nominations",
            "Assess collateral damage estimates",
            "Approve/Reject strike packages",
            "Document decision rationale"
        ],
        "participants": [
            {"role": "Commander", "required": true},
            {"role": "J2 Intel", "required": true},
            {"role": "J3 Ops", "required": true},
            {"role": "LEGAD", "required": true},
            {"role": "POLAD", "required": true}
        ],
        "agenda": [
            "Intelligence Update",
            "Target Nominations Review",
            "CDE Assessment",
            "ROE Verification",
            "Commander Decision",
            "Action Items"
        ],
        "frequency": "As Required",
        "duration_minutes": 60,
        "classification": "SECRET"
    }'),
    'active',
    datetime('now'),
    datetime('now')
);

-- ============================================
-- Meeting (Event) entities - scheduled sessions
-- ============================================

-- CAB Session - Today
INSERT OR REPLACE INTO entities (id, name, type, description, properties, status, created_at, updated_at)
VALUES (
    'mtg-cab-2026-001',
    'CAB Session - 2026-02-01 0900Z',
    'Event',
    'Daily Combined Assessment Board session',
    json('{
        "start_time": "2026-02-01T09:00:00Z",
        "end_time": "2026-02-01T10:30:00Z",
        "location": "JOC Room Alpha",
        "chair": "J2 Chief",
        "status": "Scheduled",
        "type": "DecisionBoard"
    }'),
    'scheduled',
    datetime('now'),
    datetime('now')
);

-- CAB Session - Tomorrow
INSERT OR REPLACE INTO entities (id, name, type, description, properties, status, created_at, updated_at)
VALUES (
    'mtg-cab-2026-002',
    'CAB Session - 2026-02-02 0900Z',
    'Event',
    'Daily Combined Assessment Board session',
    json('{
        "start_time": "2026-02-02T09:00:00Z",
        "end_time": "2026-02-02T10:30:00Z",
        "location": "JOC Room Alpha",
        "chair": "J2 Chief",
        "status": "Scheduled",
        "type": "DecisionBoard"
    }'),
    'scheduled',
    datetime('now'),
    datetime('now')
);

-- DRB Session
INSERT OR REPLACE INTO entities (id, name, type, description, properties, status, created_at, updated_at)
VALUES (
    'mtg-drb-2026-001',
    'DRB Session - 2026-02-01 1400Z',
    'Event',
    'Decision Review Board for pending nominations',
    json('{
        "start_time": "2026-02-01T14:00:00Z",
        "end_time": "2026-02-01T15:00:00Z",
        "location": "Command Suite",
        "chair": "Commander",
        "status": "Scheduled",
        "type": "DecisionBoard"
    }'),
    'scheduled',
    datetime('now'),
    datetime('now')
);

-- Working Group Session
INSERT OR REPLACE INTO entities (id, name, type, description, properties, status, created_at, updated_at)
VALUES (
    'mtg-wg-intel-001',
    'Intelligence Working Group',
    'Event',
    'Weekly intelligence coordination meeting',
    json('{
        "start_time": "2026-02-03T10:00:00Z",
        "end_time": "2026-02-03T11:00:00Z",
        "location": "SCIF",
        "chair": "J2 Analyst",
        "status": "Scheduled",
        "type": "WorkingGroup"
    }'),
    'scheduled',
    datetime('now'),
    datetime('now')
);

-- ============================================
-- Agenda Point entities
-- ============================================

-- CAB Agenda Points
INSERT OR REPLACE INTO entities (id, name, type, description, properties, status, created_at, updated_at)
VALUES 
    ('ap-cab-001', 'Roll Call & Quorum', 'AgendaPoint', 'Verify attendance and quorum', json('{"order": 1, "duration_minutes": 5}'), 'active', datetime('now'), datetime('now')),
    ('ap-cab-002', 'BDA Reports Review', 'AgendaPoint', 'Review BDA reports from last 24 hours', json('{"order": 2, "duration_minutes": 30, "presenter": "J2 Analyst"}'), 'active', datetime('now'), datetime('now')),
    ('ap-cab-003', 'Target System Assessment', 'AgendaPoint', 'Assess overall target system degradation', json('{"order": 3, "duration_minutes": 20, "presenter": "J2 Chief"}'), 'active', datetime('now'), datetime('now')),
    ('ap-cab-004', 'Re-attack Prioritization', 'AgendaPoint', 'Prioritize targets for re-attack', json('{"order": 4, "duration_minutes": 25, "presenter": "J3 Chief"}'), 'active', datetime('now'), datetime('now')),
    ('ap-cab-005', 'Closing & Action Items', 'AgendaPoint', 'Summarize decisions and assign actions', json('{"order": 5, "duration_minutes": 10}'), 'active', datetime('now'), datetime('now'));

-- DRB Agenda Points
INSERT OR REPLACE INTO entities (id, name, type, description, properties, status, created_at, updated_at)
VALUES 
    ('ap-drb-001', 'Intelligence Update', 'AgendaPoint', 'Current threat assessment', json('{"order": 1, "duration_minutes": 10, "presenter": "J2"}'), 'active', datetime('now'), datetime('now')),
    ('ap-drb-002', 'Target Nominations', 'AgendaPoint', 'Review pending target nominations', json('{"order": 2, "duration_minutes": 20, "presenter": "Targeting Cell"}'), 'active', datetime('now'), datetime('now')),
    ('ap-drb-003', 'Commander Decision', 'AgendaPoint', 'Commander renders decisions on nominations', json('{"order": 3, "duration_minutes": 20}'), 'active', datetime('now'), datetime('now')),
    ('ap-drb-004', 'Action Items', 'AgendaPoint', 'Document actions and next steps', json('{"order": 4, "duration_minutes": 10}'), 'active', datetime('now'), datetime('now'));

-- ============================================
-- Relationships: Meetings GOVERNED_BY TOR
-- ============================================

INSERT OR REPLACE INTO entity_relationships (source_id, target_id, relation_type, created_at)
VALUES 
    ('mtg-cab-2026-001', 'tor-cab-001', 'GOVERNED_BY', datetime('now')),
    ('mtg-cab-2026-002', 'tor-cab-001', 'GOVERNED_BY', datetime('now')),
    ('mtg-drb-2026-001', 'tor-drb-001', 'GOVERNED_BY', datetime('now'));

-- ============================================
-- Relationships: TOR HAS_PART AgendaPoint
-- ============================================

INSERT OR REPLACE INTO entity_relationships (source_id, target_id, relation_type, created_at)
VALUES 
    -- CAB TOR has agenda points
    ('tor-cab-001', 'ap-cab-001', 'HAS_PART', datetime('now')),
    ('tor-cab-001', 'ap-cab-002', 'HAS_PART', datetime('now')),
    ('tor-cab-001', 'ap-cab-003', 'HAS_PART', datetime('now')),
    ('tor-cab-001', 'ap-cab-004', 'HAS_PART', datetime('now')),
    ('tor-cab-001', 'ap-cab-005', 'HAS_PART', datetime('now')),
    -- DRB TOR has agenda points
    ('tor-drb-001', 'ap-drb-001', 'HAS_PART', datetime('now')),
    ('tor-drb-001', 'ap-drb-002', 'HAS_PART', datetime('now')),
    ('tor-drb-001', 'ap-drb-003', 'HAS_PART', datetime('now')),
    ('tor-drb-001', 'ap-drb-004', 'HAS_PART', datetime('now'));

-- ============================================
-- Verification query
-- ============================================
-- To verify: 
-- SELECT * FROM entities WHERE type IN ('Event', 'TOR', 'AgendaPoint');
-- SELECT * FROM entity_relationships WHERE relation_type IN ('GOVERNED_BY', 'HAS_PART');
