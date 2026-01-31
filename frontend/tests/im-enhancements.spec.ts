
import { test as base, expect, APIRequestContext } from '@playwright/test';

// Define custom fixture for IM User
type AuthFixtures = {
    authenticatedPage: any;
    authenticatedRequest: APIRequestContext;
};

// Robust login helper with CSRF
async function loginIMUser(request: APIRequestContext) {
    const user = {
        identifier: 'im@test.mil',
        password: 'Password123!'
    };

    const response = await request.post('http://localhost:3000/api/auth/login', {
        data: { identifier: user.identifier, password: user.password }
    });

    if (!response.ok()) {
        throw new Error(`Failed to login as IM User (im@test.mil). Status: ${response.status()}. Ensure migrations have run.`);
    }

    const body = await response.json();
    const token = body.access_token;

    // CSRF Handling
    let csrfToken = '';
    const cookies = response.headers()['set-cookie'];
    if (cookies) {
        const cookieArray = Array.isArray(cookies) ? cookies : [cookies];
        for (const cookie of cookieArray) {
            const match = cookie.match(/csrf_token=([^;,\s]+)/);
            if (match) {
                csrfToken = match[1];
                break;
            }
        }
    }

    return { token, csrfToken };
}

const imUserTest = base.extend<AuthFixtures>({
    authenticatedRequest: async ({ playwright, request }, use) => {
        const auth = await loginIMUser(request);

        const extraHTTPHeaders: Record<string, string> = {
            'Authorization': `Bearer ${auth.token}`,
        };

        if (auth.csrfToken) {
            extraHTTPHeaders['X-CSRF-Token'] = auth.csrfToken;
            extraHTTPHeaders['Cookie'] = `csrf_token=${auth.csrfToken}`;
        }

        const apiContext = await playwright.request.newContext({
            baseURL: 'http://localhost:3000',
            extraHTTPHeaders,
        });
        await use(apiContext);
        await apiContext.dispose();
    },
    authenticatedPage: async ({ page, request }, use) => {
        const auth = await loginIMUser(request);

        await page.addInitScript((data) => {
            window.localStorage.setItem('auth_token', data.token);
            window.localStorage.setItem('user_role', 'Information Manager');
        }, auth);

        await use(page);
    }
});

const test = imUserTest;

test.describe('IM Dashboard Enhancements (IM05, IM06, IM07)', () => {

    test('should toggle focus mode and filter non-urgent items', async ({ authenticatedPage: page, authenticatedRequest: request }) => {
        // 1. Seed Data
        const rfiId = `e2e_rfi_${Date.now()}`;
        const taskId = `e2e_task_${Date.now()}`;

        // Urgent RFI
        const rfi = await request.post('/api/ontology/entities', {
            data: {
                id: rfiId,
                name: 'Urgent Intel Request',
                type_: 'RFI', // Corrected field name
                properties: { status: 'Open', priority: 'critical', direction: 'incoming' }
            }
        });
        expect(rfi.status(), `Failed to create RFI: ${await rfi.text()}`).toBe(201);

        // Routine Task
        const task = await request.post('/api/ontology/entities', {
            data: {
                id: taskId,
                name: 'Routine Maintenance',
                type_: 'Task', // Corrected field name
                properties: { status: 'in_progress', priority: 'low' }
            }
        });
        expect(task.status(), `Failed to create Task: ${await task.text()}`).toBe(201);

        // 2. Navigate
        await page.goto('/smartops/information-management');
        await page.waitForLoadState('networkidle');

        // Retry logic: If item not found, reload once (handling potential compilation/fetch lag)
        try {
            await expect(page.getByText('Urgent Intel Request')).toBeVisible({ timeout: 5000 });
        } catch (e) {
            console.log('Retry: Reloading page to find created entity...');
            await page.reload();
            await page.waitForLoadState('networkidle');
        }

        // 3. Verify
        await expect(page.getByText('Urgent Intel Request')).toBeVisible();
        await expect(page.getByText('Routine Maintenance')).toBeVisible();

        // 4. Toggle Focus
        await page.getByText('Focus Mode', { exact: true }).click();
        await expect(page.getByText('Urgent Intel Request')).toBeVisible();
        await expect(page.getByText('Routine Maintenance')).toBeHidden();

        // Cleanup
        await request.delete(`/api/ontology/entities/${rfiId}`).catch(() => { });
        await request.delete(`/api/ontology/entities/${taskId}`).catch(() => { });
    });

    test('should open context drawer and show relationships', async ({ authenticatedPage: page, authenticatedRequest: request }) => {
        const decId = `e2e_dec_${Date.now()}`;
        const mtgId = `e2e_mtg_${Date.now()}`;

        // 1. Create Linked Entities
        // Meeting
        const mtg = await request.post('/api/ontology/entities', {
            data: {
                id: mtgId,
                name: 'Strategy Meeting',
                type_: 'Meeting', // Corrected
                status: 'scheduled'
            }
        });
        expect(mtg.status(), `Failed to create Meeting: ${await mtg.text()}`).toBe(201);

        // Decision
        const dec = await request.post('/api/ontology/entities', {
            data: {
                id: decId,
                name: 'Approve Strike',
                type_: 'Decision', // Corrected
                status: 'Decided',
                properties: { outcome: 'Approved' }
            }
        });
        expect(dec.status(), `Failed to create Decision: ${await dec.text()}`).toBe(201);

        // Create Relationship (Decision -> Meeting)
        // relationship_type: 'decided_at'
        const rel = await request.post('/api/ontology/relationships', {
            data: {
                source_id: decId,
                target_id: mtgId,
                relation_type: 'decided_at'
            }
        });
        // If 422 here, check if relationship type is valid in schema
        expect(rel.status(), `Failed to create Relationship: ${await rel.text()}`).toBe(201);


        // 2. Navigate
        await page.goto('/smartops/information-management');
        await page.waitForLoadState('networkidle');

        // 3. Open Drawer
        await page.getByText('Approve Strike').click();
        const drawer = page.getByTestId('entity-drawer');
        await expect(drawer).toBeVisible();

        // 4. Verify Content & Relationship
        await expect(drawer).toContainText('Approve Strike');
        await expect(drawer).toContainText('Approved');
        await expect(drawer).toContainText('Strategy Meeting'); // Linked entity title

        // Cleanup
        await request.delete(`/api/ontology/entities/${decId}`).catch(() => { });
        await request.delete(`/api/ontology/entities/${mtgId}`).catch(() => { });
    });

    test('should toggle timeline view', async ({ authenticatedPage: page, authenticatedRequest: request }) => {
        const rfiId = `e2e_rfi_time_${Date.now()}`;

        const rfi = await request.post('/api/ontology/entities', {
            data: {
                id: rfiId,
                name: 'Urgent Intel Request',
                type_: 'RFI', // Corrected
                properties: { status: 'Open', priority: 'critical' }
            }
        });
        expect(rfi.status(), `Failed to create RFI for timeline: ${await rfi.text()}`).toBe(201);

        await page.goto('/smartops/information-management');

        await expect(page.getByText('Operational Timeline')).toBeHidden();
        await page.locator('button[title="Timeline View"]').click();
        await expect(page.getByText('Operational Timeline')).toBeVisible();
        await expect(page.getByText('Urgent Intel Request')).toBeVisible();

        await page.locator('button[title="Grid View"]').click();
        await expect(page.getByText('Operational Timeline')).toBeHidden();

        await request.delete(`/api/ontology/entities/${rfiId}`).catch(() => { });
    });

});
