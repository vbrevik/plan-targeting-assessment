
import { test, expect } from '@playwright/test';

test.describe('IM Dashboard Extended View', () => {

    test.beforeEach(async ({ page }) => {
        // Mock Ontology Schema with a NEW dynamic type
        await page.route('**/api/ontology/schema', async route => {
            await route.fulfill({
                json: {
                    entity_types: [
                        { name: 'RFI', description: 'Request for Information' },
                        { name: 'Task', description: 'Task' },
                        { name: 'Meeting', description: 'Meeting' },
                        { name: 'TOR', description: 'Terms of Reference' },
                        { name: 'Decision', description: 'Decision' },
                        { name: 'Person', description: 'Person' },
                        { name: 'NewThreat', description: 'Newly identified threat type' } // DYNAMIC TYPE
                    ],
                    relationship_types: []
                }
            });
        });

        // Mock Ontology API responses (Common for all tests)
        await page.route(/.*\/api\/ontology\/entities.*type_=RFI.*/, async route => {
            await route.fulfill({ json: [{ id: 'rfi-1', name: 'Test RFI', properties: { status: 'Open', priority: 'high', subject: 'Intel Request', direction: 'outgoing' } }] });
        });
        await page.route(/.*\/api\/ontology\/entities.*type_=Task.*/, async route => {
            await route.fulfill({ json: [{ id: 'task-1', name: 'Test Task', properties: { status: 'in_progress', priority: 'medium', description: 'Do work' } }] });
        });
        await page.route(/.*\/api\/ontology\/entities.*type_=Meeting.*/, async route => {
            await route.fulfill({ json: [{ id: 'mtg-1', name: 'Morning Brief', properties: { status: 'scheduled', location: 'War Room', start_time: new Date().toISOString() } }] });
        });
        await page.route(/.*\/api\/ontology\/entities.*type_=TOR.*/, async route => {
            await route.fulfill({ json: [{ id: 'tor-1', name: 'Standard TOR', status: 'Active', properties: { cadence: 'daily', authority_level: 'tactical' } }] });
        });
        await page.route(/.*\/api\/ontology\/entities.*type_=Decision.*/, async route => {
            await route.fulfill({ json: [{ id: 'dec-1', name: 'Go/No-Go', status: 'Decided', properties: { outcome: 'Go', rationale: 'All green' } }] });
        });
        await page.route(/.*\/api\/ontology\/entities.*type_=Person.*/, async route => {
            await route.fulfill({ json: [{ id: 'p-1', name: 'Major Tom', properties: { role: 'Commander', contact: 'Comms' } }] });
        });
        await page.route(/.*\/api\/ontology\/entities.*type_=NewThreat.*/, async route => {
            await route.fulfill({ json: [{ id: 'threat-1', name: 'Unknown Drone', status: 'Pending', description: 'Sighted near base' }] });
        });

        // Mock supporting endpoints
        await page.route('**/api/operations/campaigns', async route => {
            await route.fulfill({ json: [] });
        });
        await page.route('**/api/notifications/unread', async route => {
            await route.fulfill({ json: { count: 0 } });
        });
    });

    test('should display all sections when user has FULL permissions', async ({ page }) => {
        // Mock Auth User with ALL permissions
        await page.route('**/api/auth/user', async route => {
            await route.fulfill({
                status: 200,
                json: {
                    id: 'im-user-full',
                    username: 'im_lead',
                    roles: [{ role_name: 'Information Manager' }],
                    permissions: ['rfis.view', 'battle_rhythm.view', 'ontology.view', 'cop.view', 'im.dashboard.view']
                }
            });
        });

        await page.goto('/smartops/information-management');

        // Check Headers
        await expect(page.getByText('Information Management (IM)')).toBeVisible();

        // All sections should be visible
        await expect(page.getByText('Requests for Information (RFI)')).toBeVisible();
        await expect(page.getByText('Active Tasks')).toBeVisible();
        await expect(page.getByText('Scheduled Meetings')).toBeVisible();
        await expect(page.getByText('Terms of Reference')).toBeVisible();
        await expect(page.getByText('Recent Decisions')).toBeVisible();
        await expect(page.getByText('Team Roster')).toBeVisible();

        // Assert Dynamic Type is visible
        await expect(page.getByText('NewThreats')).toBeVisible();
        await expect(page.getByText('Unknown Drone')).toBeVisible();
    });

    test('should HIDE sections when user has LIMITED permissions', async ({ page }) => {
        // Mock Auth User with LIMITED permissions (Only Team/COP view)
        await page.route('**/api/auth/user', async route => {
            await route.fulfill({
                status: 200,
                json: {
                    id: 'im-user-limited',
                    username: 'guest_analyst',
                    roles: [{ role_name: 'Analyst' }],
                    permissions: ['cop.view', 'im.dashboard.view'] // Missing rfis, battle_rhythm, ontology
                }
            });
        });

        await page.goto('/smartops/information-management');

        // Check Headers
        await expect(page.getByText('Information Management (IM)')).toBeVisible();

        // Visible Sections (cop.view)
        await expect(page.getByText('Team Roster')).toBeVisible();

        // HIDDEN Sections
        await expect(page.getByText('Requests for Information (RFI)')).toBeHidden();
        await expect(page.getByText('Active Tasks')).toBeHidden();
        await expect(page.getByText('Scheduled Meetings')).toBeHidden();
        await expect(page.getByText('Terms of Reference')).toBeHidden();
        await expect(page.getByText('Recent Decisions')).toBeHidden();

        // Dynamic Type should also be hidden (requires ontology.view)
        await expect(page.getByText('NewThreats')).toBeHidden();
    });
});
