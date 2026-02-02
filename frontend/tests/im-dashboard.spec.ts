
import { test, expect } from '@playwright/test';

test.describe('IM Dashboard Extended View', () => {

    test.beforeEach(async ({ page }) => {
        // Mock supporting endpoints
        await page.route('**/api/auth/user', async route => {
            await route.fulfill({
                status: 200,
                json: {
                    id: 'im-user-full',
                    username: 'im_lead',
                    roles: [{ role_name: 'Information Manager' }],
                    permissions: [
                        'rfis.view',
                        'battle_rhythm.view',
                        'ontology.view',
                        'cop.view',
                        'im.dashboard.view',
                        'ontology.manage',
                        'digital_twin.view',
                        'rxp.view',
                        'documents.view',
                        'menu.manage',
                        'tor.manage'
                    ]
                }
            });
        });

        // Mock supporting endpoints
        await page.route('**/api/operations/campaigns', async route => {
            await route.fulfill({ json: [] });
        });
        await page.route('**/api/notifications/unread', async route => {
            await route.fulfill({ json: { count: 0 } });
        });

        // Mock ontology entities for IM Dashboard
        await page.route('**/api/ontology/entities*', async route => {
            const url = new URL(route.request().url());
            const typeFilter = url.searchParams.get('type_');

            let entities: any[] = [];
            if (typeFilter === 'Event' || typeFilter === 'Meeting') {
                entities = [
                    {
                        id: 'event-1',
                        name: 'Daily Standup',
                        type: 'Meeting',
                        status: 'NEW',
                        created_at: new Date().toISOString(),
                        properties: {
                            priority: 'High',
                            chair_role: 'IM Lead',
                            agenda: 'Review current RFIs and mission status.',
                            expected_attendees: 'J3, J2, IM'
                        }
                    }
                ];
            } else if (typeFilter === 'TOR') {
                entities = [
                    {
                        id: 'tor-1',
                        name: 'JTWG Terms of Reference',
                        type: 'TOR',
                        status: 'IN_PROGRESS',
                        created_at: new Date().toISOString(),
                        properties: { priority: 'Medium', type: 'Policy Review' }
                    }
                ];
            } else if (typeFilter === 'RFI') {
                entities = [
                    {
                        id: 'rfi-1',
                        name: 'Sector 4 Supply Chain',
                        type: 'RFI',
                        status: 'NEW',
                        created_at: new Date().toISOString(),
                        properties: { priority: 'Critical', direction: 'incoming', subject: 'Logistics' }
                    }
                ];
            } else if (typeFilter === 'Decision') {
                entities = [
                    {
                        id: 'decision-1',
                        name: 'A2/AD Operations Order',
                        type: 'Decision',
                        status: 'APPROVED',
                        created_at: new Date().toISOString(),
                        properties: { priority: 'High', originator_id: 'J3-OPS' }
                    }
                ];
            }

            await route.fulfill({ json: entities });
        });
    });

    // Mock specific entity with relationships and neighbors
    test.beforeEach(async ({ page }) => {
        await page.route('**/api/ontology/entities/event-1', async route => {
            await route.fulfill({
                json: {
                    id: 'event-1',
                    name: 'Daily Standup',
                    type: 'Meeting',
                    status: 'NEW',
                    created_at: new Date().toISOString(),
                    properties: {
                        priority: 'High',
                        chair_role: 'IM Lead',
                        agenda: 'Review current RFIs and mission status.',
                        expected_attendees: 'J3, J2, IM'
                    },
                    outgoing_relationships: [
                        { source_id: 'event-1', target_id: 'rfi-1', relation_type: 'DISCUSSED_IN' }
                    ],
                    incoming_relationships: []
                }
            });
        });

        await page.route('**/api/ontology/neighbors/event-1', async route => {
            await route.fulfill({
                json: [
                    {
                        id: 'rfi-1',
                        name: 'Sector 4 Supply Chain',
                        type: 'RFI',
                        status: 'NEW',
                        created_at: new Date().toISOString(),
                        properties: { priority: 'Critical', direction: 'incoming' }
                    }
                ]
            });
        });
    });

    test('should display the 3-column workflow and agenda view by default', async ({ page }) => {
        await page.goto('/mshnctrl/information-management');

        // Check Header
        await expect(page.getByText('IM Operational Hub')).toBeVisible();

        // Check Workflow Columns
        await expect(page.getByText('Incoming')).toBeVisible();
        await expect(page.getByText('Processing')).toBeVisible();
        await expect(page.getByText('Outgoing')).toBeVisible();

        // Check if Agenda View is visible by default
        await expect(page.getByText('Operational Agenda')).toBeVisible();
        await expect(page.getByRole('button', { name: 'WEEK' })).toBeVisible();
    });

    test('should allow selecting an item to update the detail pane', async ({ page }) => {
        await page.goto('/mshnctrl/information-management');

        await expect(page.getByText('Processing')).toBeVisible();

        const processingItem = page.locator('text=Policy Review').first();
        await processingItem.click();

        await expect(page.locator('h2', { hasText: 'JTWG Terms of Reference' })).toBeVisible();
    });

    test('should display meeting specifics and graph context', async ({ page }) => {
        await page.goto('/mshnctrl/information-management');

        // Ensure agenda is visible first
        await expect(page.getByText('Operational Agenda')).toBeVisible();

        // The 'Daily Standup' (Meeting) should be in 'Incoming' as it's NEW
        // Be very specific to the left pane workflow item
        const meetingItem = page.locator('section.border-r').locator('h4', { hasText: 'Daily Standup' }).first();
        await expect(meetingItem).toBeVisible();
        await meetingItem.click();

        // Check Meeting specifics in the detail pane
        const detailPane = page.locator('section.w-1/2').last();
        await expect(detailPane.getByText('Meeting Dynamics')).toBeVisible();
        await expect(detailPane.getByText(/Review current RFIs/)).toBeVisible();
        await expect(detailPane.getByText(/J3, J2, IM/)).toBeVisible();

        // Check Graph Context
        await expect(detailPane.getByText('Graph Context')).toBeVisible();
        await expect(detailPane.getByText('DISCUSSED_IN')).toBeVisible();
        await expect(detailPane.getByText('Sector 4 Supply Chain')).toBeVisible();
    });

    test('should navigate to linked entity and allow returning to agenda', async ({ page }) => {
        await page.goto('/mshnctrl/information-management');

        const meetingItem = page.locator('section.border-r').locator('h4', { hasText: 'Daily Standup' }).first();
        await meetingItem.click();

        // Click on the linked RFI in the graph context (right pane)
        const linkedItem = page.locator('section:not(.border-r)').locator('text=Sector 4 Supply Chain').last();
        await linkedItem.click();

        // Verify the Selection switched to the RFI
        await expect(page.locator('h2', { hasText: 'Sector 4 Supply Chain' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Return to Agenda' })).toBeVisible();

        // Return to Agenda
        await page.getByRole('button', { name: 'Return to Agenda' }).click();
        await expect(page.getByText('Operational Agenda')).toBeVisible();
    });
});
