-- Add Test IM User
INSERT INTO users (id, username, email, password_hash, created_at, updated_at)
VALUES (
    'im-test-uuid',
    'im_test',
    'im@test.mil',
    '$argon2id$v=19$m=19456,t=2,p=1$QZPcySWGhUyDu5DSPbompA$PTFO+2QAb9bptjEB7yh/2wHPVK7exMRWtdohk8R+ZdE', -- Hash for 'Password123!'
    datetime('now'),
    datetime('now')
) ON CONFLICT(id) DO NOTHING;

-- Link user to IM role
INSERT INTO user_roles (id, user_id, role_id, created_at)
VALUES (
    'ur-im-test-uuid',
    'im-test-uuid',
    'im',
    datetime('now')
) ON CONFLICT(id) DO NOTHING;
