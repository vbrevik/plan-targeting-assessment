-- Add Targeting Cell Role Migration

-- Insert the new targeting_cell role
INSERT OR IGNORE INTO roles (id, name, description) VALUES
    (lower(hex(randomblob(16))), 'targeting_cell', 'Targeting cell operator with restricted access to targeting-related functions only');

-- Add targeting cell permissions
-- Basic read access
INSERT OR IGNORE INTO permissions (id, role_id, action)
SELECT lower(hex(randomblob(16))), id, 'read' FROM roles WHERE name = 'targeting_cell';

-- Targeting-specific permissions
INSERT OR IGNORE INTO permissions (id, role_id, action)
SELECT lower(hex(randomblob(16))), id, 'targeting.view' FROM roles WHERE name = 'targeting_cell';

INSERT OR IGNORE INTO permissions (id, role_id, action)
SELECT lower(hex(randomblob(16))), id, 'targeting.nominate' FROM roles WHERE name = 'targeting_cell';

INSERT OR IGNORE INTO permissions (id, role_id, action)
SELECT lower(hex(randomblob(16))), id, 'targeting.jtb' FROM roles WHERE name = 'targeting_cell';

INSERT OR IGNORE INTO permissions (id, role_id, action)
SELECT lower(hex(randomblob(16))), id, 'targeting.manage' FROM roles WHERE name = 'targeting_cell';

-- Strike optimizer access
INSERT OR IGNORE INTO permissions (id, role_id, action)
SELECT lower(hex(randomblob(16))), id, 'strike.view' FROM roles WHERE name = 'targeting_cell';

-- BDA (Battle Damage Assessment) access for targeting assessment
INSERT OR IGNORE INTO permissions (id, role_id, action)
SELECT lower(hex(randomblob(16))), id, 'bda.view' FROM roles WHERE name = 'targeting_cell';

-- Decision board view access (for JTB decisions)
INSERT OR IGNORE INTO permissions (id, role_id, action)
SELECT lower(hex(randomblob(16))), id, 'decision_board.view' FROM roles WHERE name = 'targeting_cell';

-- ROE (Rules of Engagement) view access
INSERT OR IGNORE INTO permissions (id, role_id, action)
SELECT lower(hex(randomblob(16))), id, 'roe.view' FROM roles WHERE name = 'targeting_cell';

-- Assessment view access
INSERT OR IGNORE INTO permissions (id, role_id, action)
SELECT lower(hex(randomblob(16))), id, 'assessment.view' FROM roles WHERE name = 'targeting_cell';

-- COP Summary view (minimal situational awareness)
INSERT OR IGNORE INTO permissions (id, role_id, action)
SELECT lower(hex(randomblob(16))), id, 'cop.view' FROM roles WHERE name = 'targeting_cell';
