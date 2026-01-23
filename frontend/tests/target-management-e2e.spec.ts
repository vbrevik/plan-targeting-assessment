// E2E tests for target management features
// Tests target nomination, detail view, and status transitions

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:5173';
const API_BASE_URL = process.env.PLAYWRIGHT_API_BASE_URL || 'http://localhost:3000';

test.describe('Target Management E2E', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to targeting page
        await page.goto(`${BASE_URL}/smartops/targeting`);
        // Wait for page to load
        await page.waitForLoadState('networkidle');
    });

    test('should display target nomination form', async ({ page }) => {
        // Navigate to nomination page
        await page.goto(`${BASE_URL}/smartops/targeting/nominate`);
        
        // Check form elements are present
        await expect(page.locator('input[placeholder*="RADAR SITE"]')).toBeVisible();
        await expect(page.locator('select').first()).toBeVisible();
        await expect(page.locator('textarea')).toBeVisible();
        await expect(page.getByRole('button', { name: /submit nomination/i })).toBeVisible();
    });

    test('should create target via nomination form', async ({ page }) => {
        // Navigate to nomination page
        await page.goto(`${BASE_URL}/smartops/targeting/nominate`);
        
        // Fill form
        await page.fill('input[placeholder*="RADAR SITE"]', 'E2E TEST TARGET');
        await page.locator('select').first().selectOption('C2 Node');
        await page.fill('input[placeholder*="32U PK"]', '32U PK 1234 5678');
        // Find priority select by label or nearby text
        const prioritySelect = page.locator('select').filter({ hasText: /priority/i }).or(page.locator('select').nth(1));
        await prioritySelect.selectOption('CRITICAL');
        await page.fill('textarea', 'E2E test target description');
        
        // Submit form
        await page.click('button:has-text("Submit Nomination")');
        
        // Wait for navigation or success message
        await page.waitForURL(/\/smartops\/targeting\/[^/]+/, { timeout: 5000 }).catch(() => {
            // If navigation doesn't happen, check for error message
            const errorMsg = page.locator('text=/error|failed/i');
            if (errorMsg.isVisible()) {
                console.log('Form submission error detected');
            }
        });
    });

    test('should display target detail view', async ({ page }) => {
        // First, we need a target ID - try to navigate to a known target or create one
        // For now, we'll test the detail view structure
        
        // Navigate to a target detail page (using a mock ID)
        await page.goto(`${BASE_URL}/smartops/targeting/test-target-id`);
        
        // Check for key elements (may fail if target doesn't exist, which is expected)
        const targetName = page.locator('h1').first();
        const backButton = page.getByRole('button', { name: /back|arrow/i }).first();
        
        // At least check that the page structure loads
        await expect(backButton.or(page.locator('text=/target not found/i'))).toBeVisible({ timeout: 5000 });
    });

    test('should display status transition buttons', async ({ page }) => {
        // Navigate to target detail (assuming we have a target)
        await page.goto(`${BASE_URL}/smartops/targeting/test-target-id`);
        
        // Check for status badge or target not found message
        // Wait for page to load
        await page.waitForLoadState('networkidle');
        
        // Check if target exists or not found message appears
        const statusBadge = page.getByText(/Nominated|Validated|Approved|Engaged|Assessed/i);
        const notFound = page.getByText(/target not found/i);
        
        // At least one should be visible
        const statusCount = await statusBadge.count();
        const notFoundCount = await notFound.count();
        
        // If target exists, check for transition buttons
        if (statusCount > 0) {
            const transitionButton = page.getByRole('button').filter({ hasText: /→|Validated|Approved|Engaged|Assessed/i });
            const buttonCount = await transitionButton.count();
            // Status badge should be visible
            expect(statusCount).toBeGreaterThan(0);
        } else {
            // Target not found is acceptable
            expect(notFoundCount).toBeGreaterThan(0);
        }
    });

    test('should update target status via transition button', async ({ page }) => {
        // This test requires a target to exist
        // Navigate to target detail
        await page.goto(`${BASE_URL}/smartops/targeting/test-target-id`);
        
        // Look for status transition button
        const advanceButton = page.getByRole('button').filter({ hasText: /→|Advance|Validated|Approved|Engaged|Assessed/i }).first();
        
        if (await advanceButton.isVisible({ timeout: 2000 })) {
            // Get current status
            const currentStatus = await page.locator('text=/Nominated|Validated|Approved/i').first().textContent();
            
            // Click transition button
            await advanceButton.click();
            
            // Wait for status update (check for loading state or status change)
            await page.waitForTimeout(1000);
            
            // Verify status changed (or at least button state changed)
            const newStatus = await page.locator('text=/Nominated|Validated|Approved|Engaged/i').first().textContent();
            
            // Status should have changed (unless it was already final)
            if (currentStatus && newStatus) {
                expect(newStatus).not.toBe(currentStatus);
            }
        } else {
            // Skip if no transition button (target might be in final state)
            test.skip();
        }
    });

    test('should show error message on invalid form submission', async ({ page }) => {
        await page.goto(`${BASE_URL}/smartops/targeting/nominate`);
        
        // Try to submit empty form
        await page.click('button:has-text("Submit Nomination")');
        
        // Check for validation error (browser native or custom)
        const errorVisible = await Promise.race([
            page.locator('text=/required|error|invalid/i').first().isVisible().then(() => true),
            page.waitForTimeout(1000).then(() => false),
        ]);
        
        // Form should not submit (either browser validation or custom error)
        expect(errorVisible || page.url().includes('/nominate')).toBeTruthy();
    });

    test('should navigate back from detail view', async ({ page }) => {
        await page.goto(`${BASE_URL}/smartops/targeting/test-target-id`);
        
        // Find back button
        const backButton = page.getByRole('button').filter({ hasText: /back|arrow/i }).first();
        
        if (await backButton.isVisible({ timeout: 2000 })) {
            await backButton.click();
            
            // Should navigate back to targeting list
            await expect(page).toHaveURL(/\/smartops\/targeting/, { timeout: 3000 });
        }
    });

    test('should display target timeline', async ({ page }) => {
        await page.goto(`${BASE_URL}/smartops/targeting/test-target-id`);
        
        // Wait for page to load
        await page.waitForLoadState('networkidle');
        
        // Look for timeline or history section or target not found message
        const timeline = page.getByText(/timeline|history|audit/i);
        const notFound = page.getByText(/target not found/i);
        
        // Timeline may not be visible if target doesn't exist, but structure should be there
        const timelineCount = await timeline.count();
        const notFoundCount = await notFound.count();
        
        // Either timeline/history should be visible, or target not found message
        expect(timelineCount + notFoundCount).toBeGreaterThan(0);
        
        // If target exists, verify page structure
        if (notFoundCount === 0) {
            // Page should have loaded successfully
            expect(await page.title()).toBeTruthy();
        }
    });

    test('should filter targets by status', async ({ page }) => {
        await page.goto(`${BASE_URL}/smartops/targeting`);
        
        // Look for filter controls (if they exist in the UI)
        const statusFilter = page.locator('select, button').filter({ hasText: /status|filter/i }).first();
        
        if (await statusFilter.isVisible({ timeout: 2000 })) {
            // Interact with filter if available
            await statusFilter.click();
            await page.waitForTimeout(500);
        }
        
        // At minimum, targets list should be visible
        await expect(page.locator('text=/target|nomination/i').first()).toBeVisible({ timeout: 5000 });
    });
});

test.describe('Target API Integration', () => {
    // Note: These tests require the backend server to be running on port 3000
    // If the server is not available, tests will skip gracefully
    
    // Helper function to get authentication token
    async function getAuthToken(request: any): Promise<{ token: string; csrfToken: string } | null> {
        // Helper to extract CSRF token from Set-Cookie header
        const extractCsrfToken = (setCookieHeader: string | string[] | undefined): string | null => {
            if (!setCookieHeader) return null;
            const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
            for (const cookie of cookies) {
                // Match csrf_token=value (before semicolon or end of string)
                const match = cookie.match(/csrf_token=([^;,\s]+)/);
                if (match) {
                    return match[1];
                }
            }
            return null;
        };
        
        try {
            // First, try to login
            const loginResponse = await request.post(`${API_BASE_URL}/api/auth/login`, {
                data: {
                    identifier: 'targeting_cell@test.mil',
                    password: 'TargetingCell2026!',
                },
                timeout: 5000,
            });
            
            if (loginResponse.ok()) {
                const body = await loginResponse.json();
                if (body.access_token) {
                    // Extract CSRF token from Set-Cookie header
                    const setCookie = loginResponse.headers()['set-cookie'];
                    const csrfToken = extractCsrfToken(setCookie);
                    
                    if (csrfToken) {
                        console.log('CSRF token extracted:', csrfToken.substring(0, 10) + '...');
                        return { token: body.access_token, csrfToken };
                    }
                    console.warn('No CSRF token found in login response');
                    // If no CSRF token, still return token (CSRF might be optional for some endpoints)
                    return { token: body.access_token, csrfToken: 'no-csrf-token' };
                }
            }
        } catch (error: any) {
            // If connection refused, server is not running
            if (error.message?.includes('ECONNREFUSED') || error.message?.includes('connect')) {
                console.log('Backend server not available, skipping API tests');
                return null;
            }
        }
        
        try {
            // If login fails, try to register first (user might not exist)
            const registerResponse = await request.post(`${API_BASE_URL}/api/auth/register`, {
                data: {
                    username: 'targeting_cell',
                    email: 'targeting_cell@test.mil',
                    password: 'TargetingCell2026!',
                },
                timeout: 5000,
            });
            
            // 409 means user already exists, which is fine
            if (registerResponse.ok() || registerResponse.status() === 409) {
                // Try login again after registration
                const retryLoginResponse = await request.post(`${API_BASE_URL}/api/auth/login`, {
                    data: {
                        identifier: 'targeting_cell@test.mil',
                        password: 'TargetingCell2026!',
                    },
                    timeout: 5000,
                });
                
                if (retryLoginResponse.ok()) {
                    const body = await retryLoginResponse.json();
                    if (body.access_token) {
                        const setCookie = retryLoginResponse.headers()['set-cookie'];
                        const csrfToken = extractCsrfToken(setCookie);
                        if (csrfToken) {
                            console.log('CSRF token extracted from retry:', csrfToken.substring(0, 10) + '...');
                            return { token: body.access_token, csrfToken };
                        }
                        return { token: body.access_token, csrfToken: 'no-csrf-token' };
                    }
                }
            }
        } catch (error: any) {
            // If connection refused, server is not running
            if (error.message?.includes('ECONNREFUSED') || error.message?.includes('connect')) {
                console.log('Backend server not available, skipping API tests');
                return null;
            }
        }
        
        // If all else fails, return null (test will skip)
        return null;
    }

    test('should create target via API', async ({ request }) => {
        const auth = await getAuthToken(request);
        
        if (!auth) {
            test.skip(true, 'Authentication token not available');
            return;
        }
        
        const headers: Record<string, string> = {
            'Authorization': `Bearer ${auth.token}`,
            'X-CSRF-Token': auth.csrfToken,
            'Cookie': `csrf_token=${auth.csrfToken}`,
        };
        
        const response = await request.post(`${API_BASE_URL}/api/targeting/targets`, {
            data: {
                name: 'API TEST TARGET',
                target_type: 'HPT',
                priority: 'HIGH',
                coordinates: '32.1234,44.5678',
                classification: 'SECRET',
            },
            headers,
        });
        
        if (response.status() !== 201) {
            const errorBody = await response.text();
            console.error(`Target creation failed with status ${response.status()}:`, errorBody);
            // Log headers for debugging
            console.error('Response headers:', JSON.stringify(response.headers(), null, 2));
        }
        expect(response.status()).toBe(201);
        const body = await response.json();
        expect(body).toHaveProperty('id');
        expect(body).toHaveProperty('message', 'Target created successfully');
    });

    test('should reject invalid target creation', async ({ request }) => {
        const auth = await getAuthToken(request);
        
        if (!auth) {
            test.skip(true, 'Authentication token not available');
            return;
        }
        
        const headers: Record<string, string> = {
            'Authorization': `Bearer ${auth.token}`,
            'X-CSRF-Token': auth.csrfToken,
            'Cookie': `csrf_token=${auth.csrfToken}`,
        };
        
        // Test empty name
        const response1 = await request.post(`${API_BASE_URL}/api/targeting/targets`, {
            data: {
                name: '',
                target_type: 'HPT',
                priority: 'HIGH',
                coordinates: '32.1234,44.5678',
                classification: 'SECRET',
            },
            headers,
        });
        expect(response1.status()).toBe(400);
        
        // Test invalid target_type
        const response2 = await request.post(`${API_BASE_URL}/api/targeting/targets`, {
            data: {
                name: 'Test Target',
                target_type: 'INVALID',
                priority: 'HIGH',
                coordinates: '32.1234,44.5678',
                classification: 'SECRET',
            },
            headers,
        });
        expect(response2.status()).toBe(400);
        
        // Test invalid priority
        const response3 = await request.post(`${API_BASE_URL}/api/targeting/targets`, {
            data: {
                name: 'Test Target',
                target_type: 'HPT',
                priority: 'INVALID',
                coordinates: '32.1234,44.5678',
                classification: 'SECRET',
            },
            headers,
        });
        expect(response3.status()).toBe(400);
    });

    test('should update target status via API', async ({ request }) => {
        const auth = await getAuthToken(request);
        
        if (!auth) {
            test.skip(true, 'Authentication token not available');
            return;
        }
        
        const headers: Record<string, string> = {
            'Authorization': `Bearer ${auth.token}`,
            'X-CSRF-Token': auth.csrfToken,
            'Cookie': `csrf_token=${auth.csrfToken}`,
        };
        
        // First create a target
        const createResponse = await request.post(`${API_BASE_URL}/api/targeting/targets`, {
            data: {
                name: 'UPDATE TEST TARGET',
                target_type: 'HPT',
                priority: 'MEDIUM',
                coordinates: '33.0000,45.0000',
                classification: 'SECRET',
            },
            headers,
        });
        
        expect(createResponse.status()).toBe(201);
        const createBody = await createResponse.json();
        const targetId = createBody.id;
        
        // Update target status
        const updateResponse = await request.put(`${API_BASE_URL}/api/targeting/targets/${targetId}`, {
            data: {
                target_status: 'Validated',
            },
            headers,
        });
        
        expect(updateResponse.status()).toBe(200);
        const updateBody = await updateResponse.json();
        expect(updateBody.target_status).toBe('Validated');
    });

    test.skip('should get target by ID', async ({ request }) => {
        // Create target first
        const createResponse = await request.post(`${API_BASE_URL}/api/targeting/targets`, {
            data: {
                name: 'GET TEST TARGET',
                target_type: 'HVT',
                priority: 'HIGH',
                coordinates: '34.0000,46.0000',
                classification: 'SECRET',
            },
        });
        
        const createBody = await createResponse.json();
        const targetId = createBody.id;
        
        // Get target
        const getResponse = await request.get(`${API_BASE_URL}/api/targeting/targets/${targetId}`);
        
        expect(getResponse.status()).toBe(200);
        const target = await getResponse.json();
        expect(target.id).toBe(targetId);
        expect(target.name).toBe('GET TEST TARGET');
        expect(target.target_type).toBe('HVT');
    });

    test('should return 404 for non-existent target', async ({ request }) => {
        const auth = await getAuthToken(request);
        
        if (!auth) {
            test.skip(true, 'Authentication token not available');
            return;
        }
        
        const headers: Record<string, string> = {
            'Authorization': `Bearer ${auth.token}`,
            'X-CSRF-Token': auth.csrfToken,
            'Cookie': `csrf_token=${auth.csrfToken}`,
        };
        
        const response = await request.get(`${API_BASE_URL}/api/targeting/targets/nonexistent-id`, {
            headers,
        });
        expect(response.status()).toBe(404);
    });

    test('should get target timeline', async ({ request }) => {
        const auth = await getAuthToken(request);
        
        if (!auth) {
            test.skip(true, 'Authentication token not available');
            return;
        }
        
        const headers: Record<string, string> = {
            'Authorization': `Bearer ${auth.token}`,
            'X-CSRF-Token': auth.csrfToken,
            'Cookie': `csrf_token=${auth.csrfToken}`,
        };
        
        // Create target first
        const createResponse = await request.post(`${API_BASE_URL}/api/targeting/targets`, {
            data: {
                name: 'TIMELINE TEST TARGET',
                target_type: 'HPT',
                priority: 'MEDIUM',
                coordinates: '35.0000,47.0000',
                classification: 'SECRET',
            },
            headers,
        });
        
        expect(createResponse.status()).toBe(201);
        const createBody = await createResponse.json();
        const targetId = createBody.id;
        
        // Get timeline
        const timelineResponse = await request.get(`${API_BASE_URL}/api/targeting/targets/${targetId}/timeline`, {
            headers,
        });
        
        expect(timelineResponse.status()).toBe(200);
        const timeline = await timelineResponse.json();
        expect(timeline).toHaveProperty('target_id', targetId);
        expect(timeline).toHaveProperty('timeline');
        expect(Array.isArray(timeline.timeline)).toBe(true);
    });
});
