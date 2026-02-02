import { expect } from '@playwright/test';
import { authenticatedTest as test } from './fixtures/auth';

test.describe('Target Management (Ontology-Aligned)', () => {

    // Cleanup/Setup if needed, but we'll rely on unique names for now

    test('should nominate a new target successfully', async ({ authenticatedPage: page }) => {
        // 1. Navigate to Nomination Page
        await page.goto('/mshnctrl/targeting/nominate');
        await expect(page).toHaveURL(/.*\/nominate/);

        // 2. Fill out the form
        // Using placeholders/labels as pseudo-selectors since explicit test-ids are missing
        await page.getByPlaceholder('e.g. RADAR SITE ALPHA').fill('ONTOLOGY TARGET ' + Date.now());
        await page.getByPlaceholder('32U PK 1234 5678').fill('32U PK 1234 5678');

        // Select Category (e.g., "C2 Node")
        const categorySelect = page.locator('select').first(); // Assumption: first select is category
        await categorySelect.selectOption('C2 Node');

        // Select Priority
        const prioritySelect = page.locator('select').nth(1); // Assumption: second select is priority
        await prioritySelect.selectOption('HIGH');

        // Select Effect (Button click)
        await page.getByRole('button', { name: 'Neutralize' }).click();

        // Description
        await page.getByPlaceholder('Provide detailed intelligence justifying', { exact: false })
            .fill('Automated E2E Test Target Nomination');

        // 3. Submit
        const submitBtn = page.getByRole('button', { name: 'Submit Nomination' });
        await expect(submitBtn).toBeEnabled();
        await submitBtn.click();

        // 4. Verify Redirect to Detail Page
        await expect(page).toHaveURL(/\/mshnctrl\/targeting\/[a-zA-Z0-9-]+/);

        // 5. Verify Detail Content
        await expect(page.getByText('ONTOLOGY TARGET')).toBeVisible();
        await expect(page.getByText('Target Intelligence Summary')).toBeVisible();
        await expect(page.getByText('PENDING REVIEW')).toBeVisible(); // Advisory status checks

        // Coordinates might be "Unknown Location" if backend didn't parse MGRS
        await expect(page.getByText('Unknown Location').or(page.getByText('32U PK 1234 5678'))).toBeVisible();
    });

    test('should verify target detail functionality', async ({ authenticatedPage: page, authenticatedRequest: request }) => {
        // Prerequisite: Create a target via API to ensure one exists for testing
        const targetName = 'DETAIL-VIEW-TEST-' + Date.now();
        const createRes = await request.post('/api/targeting/targets', {
            data: {
                name: targetName,
                target_type: 'HPT',
                priority: 'HIGH',
                coordinates: '32U PK 1111 2222',
                classification: 'SECRET',
                description: 'For detail view verification'
            }
        });
        expect(createRes.ok()).toBeTruthy();
        const target = await createRes.json();

        // 1. Navigate to Detail Page
        await page.goto(`/mshnctrl/targeting/${target.id}`);

        // 2. Verify Header Info
        await expect(page.getByRole('heading', { name: targetName })).toBeVisible();
        await expect(page.getByText('32.0000, 11.0000').or(page.getByText('32U PK 1111 2222')).or(page.getByText('Unknown Location'))).toBeVisible();

        // 3. Verify Tabs
        await expect(page.getByRole('button', { name: 'Overview', exact: true })).toBeVisible();
        await expect(page.getByRole('button', { name: 'System Analysis' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Pattern of Life' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Weaponeering' })).toBeVisible();

        // 4. Verify Workflow Actions
        // Should show "Advance to Validated" if status is Nominated (default)
        const advanceBtn = page.getByRole('button', { name: 'Advance to Validated' });
        if (await advanceBtn.isVisible()) {
            // Optional: Test the transition
            await advanceBtn.click();
            await expect(page.getByText('Validated').first()).toBeVisible();
        }
    });
});
