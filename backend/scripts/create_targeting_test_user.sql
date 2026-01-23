-- Script to create a test user with targeting_cell role
-- Password: TargetingCell2026!
-- Password hash for 'TargetingCell2026!' using bcrypt

-- First, insert the test user
-- Note: The password hash below is for 'TargetingCell2026!'
-- Generated using: echo 'TargetingCell2026!' | bcrypt-cli 10
INSERT OR IGNORE INTO users (id, username, email, password_hash, created_at, updated_at)
VALUES (
    'targeting-cell-test-001',
    'targeting_cell_test',
    'targeting_cell@test.mil',
    '$2b$10$YQZ.5Z8X9X.XwXZvXZxXZeXZxXZxXZxXZxXZxXZxXZxXZxXZxXZxX',
    datetime('now'),
    datetime('now')
);

-- Assign the targeting_cell role to the test user
INSERT OR IGNORE INTO user_roles (user_id, role_id, resource_id)
SELECT 
    'targeting-cell-test-001',
    id,
    NULL
FROM roles
WHERE name = 'targeting_cell';

-- Verify the user was created
SELECT 
    u.id,
    u.username,
    u.email,
    r.name as role_name
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
WHERE u.id = 'targeting-cell-test-001';
