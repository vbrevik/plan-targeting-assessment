-- Add Dashboard View Permissions for Role-Based Routing
-- This mimics the "Ontology-First" approach where access is determined by capabilities (permissions)
-- rather than rigid Role IDs.

-- 1. Define new permissions
-- We use ignore to allow re-running safely
INSERT OR IGNORE INTO permissions (id, role_id, action) VALUES 
-- IM
((lower(hex(randomblob(16)))), 'im', 'im.dashboard.view'),
-- J4 (Need to look up ID or rely on name if ID unknown, but we used IDs in setup script. 
-- For migration safety we select from roles)
((lower(hex(randomblob(16)))), (SELECT id FROM roles WHERE name='J4 Logistics' OR name='j4-log' LIMIT 1), 'j4.dashboard.view'),
-- Targeting
((lower(hex(randomblob(16)))), (SELECT id FROM roles WHERE name='Targeting Cell' OR name='targeting_cell' LIMIT 1), 'targeting.dashboard.view'),
-- J2
((lower(hex(randomblob(16)))), (SELECT id FROM roles WHERE name='J2 Intelligence' OR name='j2-intel' LIMIT 1), 'j2.dashboard.view'),
-- J3
((lower(hex(randomblob(16)))), (SELECT id FROM roles WHERE name='J3 Operations' OR name='j3-ops' LIMIT 1), 'j3.dashboard.view'),
-- J5
((lower(hex(randomblob(16)))), (SELECT id FROM roles WHERE name='J5 Plans' OR name='j5-plans' LIMIT 1), 'j5.dashboard.view'),
-- Commander
((lower(hex(randomblob(16)))), (SELECT id FROM roles WHERE name='Commander' OR name='commander' LIMIT 1), 'commander.dashboard.view'),
-- LEGAD
((lower(hex(randomblob(16)))), (SELECT id FROM roles WHERE name='Legal Advisor' OR name='legad' LIMIT 1), 'legad.dashboard.view'),
-- Analyst
((lower(hex(randomblob(16)))), (SELECT id FROM roles WHERE name='Analyst' OR name='analyst' LIMIT 1), 'analyst.dashboard.view');

-- Ensure the 'Assistant-IM' role exists (if we want to seed it here, or we can do it in verification script)
-- For now, we just ensure the permissions exist for the main roles.
