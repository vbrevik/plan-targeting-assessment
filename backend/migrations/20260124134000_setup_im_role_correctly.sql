-- Clean up potentially failed previous attempt if table was wrong
-- (No need to DROP TABLE role_permissions if it doesn't exist, sqlx might complain)

-- Add Information Manager Role
INSERT INTO roles (id, name, description, created_at)
VALUES (
    'im',
    'Information Manager',
    'Responsible for information lifecycle, knowledge management, and data governance.',
    datetime('now')
) ON CONFLICT(id) DO UPDATE SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description;

-- Assign permissions to IM role
INSERT INTO permissions (role_id, action, created_at) VALUES 
('im', 'rfis.view', datetime('now')),
('im', 'ontology.view', datetime('now')),
('im', 'ontology.manage', datetime('now')),
('im', 'digital_twin.view', datetime('now')),
('im', 'cop.view', datetime('now')),
('im', 'rxp.view', datetime('now')),
('im', 'documents.view', datetime('now')),
('im', 'menu.manage', datetime('now')),
('im', 'tor.manage', datetime('now')),
('im', 'battle_rhythm.view', datetime('now'))
ON CONFLICT(role_id, action) DO NOTHING;
