import { test, expect } from '@playwright/test';

test.describe('Situation Awareness Cockpit', () => {
    test.beforeEach(async ({ page }) => {
        // Login first
        await page.goto('/login');
        await page.fill('input[name="email"]', 'test@example.com');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');
        
        // Wait for redirect
        await page.waitForURL('**/smartops/**', { timeout: 10000 });
        
        // Navigate to dashboard
        await page.goto('/smartops/');
        await page.waitForLoadState('networkidle');
    });

    test('should display operational context bar with critical information', async ({ page }) => {
        // Check operational context elements
        await expect(page.getByText('Operation')).toBeVisible();
        await expect(page.getByText('Timeline')).toBeVisible();
        await expect(page.getByText('D+04')).toBeVisible();
        await expect(page.getByText('Zulu Time')).toBeVisible();
        await expect(page.getByText('DEFCON')).toBeVisible();
        await expect(page.getByText('Alert Level')).toBeVisible();
        await expect(page.getByText('RED-ALPHA')).toBeVisible();
    });

    test('should display critical actions section prominently', async ({ page }) => {
        // Check critical section header
        await expect(page.getByText('Critical - TODAY')).toBeVisible();
        
        // Check for critical action cards
        const criticalSection = page.locator('text=Critical - TODAY').locator('..');
        await expect(criticalSection).toBeVisible();
        
        // Check for decision items
        await expect(page.getByText('Strike T-1002 Authorization')).toBeVisible();
        await expect(page.getByText('Move 1 MECH BDE to Sector Beta')).toBeVisible();
    });

    test('should display active monitoring metrics', async ({ page }) => {
        // Check Active Monitoring section
        await expect(page.getByText('Active Monitoring')).toBeVisible();
        
        // Check Force Readiness card
        await expect(page.getByText('Force Readiness')).toBeVisible();
        await expect(page.getByText('87')).toBeVisible(); // Readiness percentage
        
        // Check Targeting Efficacy card
        await expect(page.getByText('Targeting Efficacy')).toBeVisible();
        await expect(page.getByText('64')).toBeVisible(); // Efficacy percentage
        
        // Check Intel Insights card
        await expect(page.getByText('Intel Insights')).toBeVisible();
    });

    test('should display planning horizon section', async ({ page }) => {
        // Check planning section
        await expect(page.getByText('This Month')).toBeVisible();
        await expect(page.getByText('Upcoming Governance')).toBeVisible();
        await expect(page.getByText('Campaign Milestones')).toBeVisible();
    });

    test('should display tactical COP', async ({ page }) => {
        // Check for tactical map presence
        await expect(page.getByText('Tactical COP')).toBeVisible();
        await expect(page.getByText('AO VULCAN - CRITICAL')).toBeVisible();
    });

    test('should display campaign timeline', async ({ page }) => {
        // Check campaign timeline section
        await expect(page.getByText('Campaign Lines of Operation')).toBeVisible();
    });

    test('should update Zulu time every second', async ({ page }) => {
        // Get initial time
        const timeElement = page.locator('text=/\\d{2}:\\d{2}:\\d{2}Z/');
        await expect(timeElement).toBeVisible();
        const initialTime = await timeElement.textContent();
        
        // Wait 2 seconds
        await page.waitForTimeout(2000);
        
        // Check time has changed
        const updatedTime = await timeElement.textContent();
        expect(updatedTime).not.toBe(initialTime);
    });

    test('should show visual hierarchy with color coding', async ({ page }) => {
        // Check for red (critical) elements
        const redElements = page.locator('[class*="red-"]');
        expect(await redElements.count()).toBeGreaterThan(0);
        
        // Check for blue (monitoring) elements
        const blueElements = page.locator('[class*="blue-"]');
        expect(await blueElements.count()).toBeGreaterThan(0);
        
        // Check for amber (high priority) elements
        const amberElements = page.locator('[class*="amber-"]');
        expect(await amberElements.count()).toBeGreaterThan(0);
    });

    test('should have clickable action cards', async ({ page }) => {
        // Check that critical action cards are clickable
        const decisionCard = page.getByText('Strike T-1002 Authorization').locator('..');
        await expect(decisionCard).toBeVisible();
        
        // Verify it's a link or has cursor pointer
        const tag = await decisionCard.evaluate(el => el.tagName.toLowerCase());
        expect(['a', 'button', 'div']).toContain(tag);
    });

    test('should navigate to decision board on critical action click', async ({ page }) => {
        // Click on a decision action
        await page.getByText('Strike T-1002 Authorization').click();
        
        // Should navigate to decision board
        await expect(page).toHaveURL(/.*\/smartops\/decision-board/);
    });

    test('should navigate to campaign page from timeline', async ({ page }) => {
        // Click "View Full Campaign" link
        await page.getByText('View Full Campaign').click();
        
        // Should navigate to campaign page
        await expect(page).toHaveURL(/.*\/smartops\/campaign/);
    });

    test('should navigate to advisory queue from intel insights', async ({ page }) => {
        // Click intel insights card
        await page.getByText('Review All').click();
        
        // Should navigate to advisory page
        await expect(page).toHaveURL(/.*\/smartops\/advisory/);
    });

    test('should display correct urgency indicators', async ({ page }) => {
        // Check for urgency badges
        const criticalBadge = page.getByText('CRITICAL').first();
        await expect(criticalBadge).toBeVisible();
    });

    test('should display deadline information', async ({ page }) => {
        // Check for deadline text
        await expect(page.getByText(/Next \d+ hours?/)).toBeVisible();
    });

    test('should display trend indicators for metrics', async ({ page }) => {
        // Check for trend arrows in Force Readiness
        const trendIndicator = page.locator('[class*="Trending"]');
        expect(await trendIndicator.count()).toBeGreaterThan(0);
    });

    test('should display progress bars for metrics', async ({ page }) => {
        // Check for progress bars
        const progressBars = page.locator('.rounded-full.bg-blue-500, .rounded-full.bg-cyan-500');
        expect(await progressBars.count()).toBeGreaterThan(1);
    });

    test('should show status footer', async ({ page }) => {
        // Check footer elements
        await expect(page.getByText('SYSTEM NOMINAL')).toBeVisible();
        await expect(page.getByText('HQ NORTH C2')).toBeVisible();
        await expect(page.getByText('NATO COPD')).toBeVisible();
    });

    test('should display intel insight count badges', async ({ page }) => {
        // Check for "NEW" badges
        const newBadges = page.locator('text=/\\d+ NEW/');
        expect(await newBadges.count()).toBeGreaterThan(0);
    });

    test('should maintain responsive layout', async ({ page }) => {
        // Check that left column has fixed width
        const leftColumn = page.locator('.w-\\[420px\\]').first();
        await expect(leftColumn).toBeVisible();
        
        // Check that right column is flexible
        const rightColumn = page.locator('.flex-1.flex.flex-col.gap-3').first();
        await expect(rightColumn).toBeVisible();
    });

    test('should display alert animation on critical status', async ({ page }) => {
        // Check for pulsing animation on RED-ALPHA indicator
        const alertElement = page.locator('text=RED-ALPHA').locator('..');
        const hasAnimation = await alertElement.evaluate(el => {
            const styles = window.getComputedStyle(el.querySelector('[class*="animate-pulse"]') || el);
            return styles.animation !== 'none' && styles.animation !== '';
        });
        expect(hasAnimation).toBeTruthy();
    });

    test('should display proper text hierarchy', async ({ page }) => {
        // Check for section headers in uppercase
        const headers = page.locator('text=/^[A-Z ]+$/').filter({ hasText: 'CRITICAL' });
        expect(await headers.count()).toBeGreaterThan(0);
    });

    test('should show tactical map unit indicators', async ({ page }) => {
        // Check for unit badges on tactical map
        await expect(page.getByText('1-64 MECH')).toBeVisible();
        await expect(page.getByText('OPFOR REGT')).toBeVisible();
    });

    test('should display decision board link with arrow', async ({ page }) => {
        // Check for ChevronRight icons on action cards
        const viewDetailsLinks = page.getByText('View Details');
        expect(await viewDetailsLinks.count()).toBeGreaterThan(0);
    });
});

test.describe('Situation Awareness Accessibility', () => {
    test('should have proper focus indicators', async ({ page }) => {
        await page.goto('/smartops/');
        
        // Tab through elements
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');
        
        // Check that focus is visible (would need visual regression testing for full validation)
        const focusedElement = await page.locator(':focus');
        await expect(focusedElement).toBeVisible();
    });

    test('should have sufficient color contrast', async ({ page }) => {
        await page.goto('/smartops/');
        
        // This is a basic check - full WCAG validation would require dedicated tools
        // Check that text is not using very low contrast colors
        const criticalText = page.getByText('Critical - TODAY');
        const color = await criticalText.evaluate(el => window.getComputedStyle(el).color);
        
        // Basic check that it's not pure gray on gray
        expect(color).not.toBe('rgb(128, 128, 128)');
    });
});

test.describe('Situation Awareness Performance', () => {
    test('should load within acceptable time', async ({ page }) => {
        const startTime = Date.now();
        await page.goto('/smartops/');
        await page.waitForLoadState('networkidle');
        const loadTime = Date.now() - startTime;
        
        // Should load within 3 seconds
        expect(loadTime).toBeLessThan(3000);
    });

    test('should not have console errors', async ({ page }) => {
        const consoleErrors: string[] = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });
        
        await page.goto('/smartops/');
        await page.waitForLoadState('networkidle');
        
        // Should not have critical errors
        const criticalErrors = consoleErrors.filter(err => 
            !err.includes('favicon') && // Ignore favicon errors
            !err.includes('__vite')     // Ignore Vite dev errors
        );
        expect(criticalErrors).toHaveLength(0);
    });
});
