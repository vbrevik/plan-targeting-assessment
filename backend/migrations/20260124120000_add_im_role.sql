-- Add Information Manager Role
INSERT INTO roles (id, name, description, created_at)
VALUES (
    'im',
    'Information Manager',
    'Responsible for information lifecycle, knowledge management, and data governance.',
    datetime('now')
) ON CONFLICT(id) DO NOTHING;

-- Assign permissions to IM role
-- Permissions derived from frontend definition: ['rfis.view', 'ontology.view', 'digital_twin.view', 'cop.view', 'rxp.view', 'documents.view']

INSERT INTO permissions (role_id, action, created_at) VALUES 
('im', 'rfis.view', datetime('now')),
('im', 'ontology.view', datetime('now')),
('im', 'digital_twin.view', datetime('now')),
('im', 'cop.view', datetime('now')),
('im', 'rxp.view', datetime('now')),
('im', 'documents.view', datetime('now'))
ON CONFLICT(role_id, action) DO NOTHING;
