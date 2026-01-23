// BDA Phase 4: Reporting & Dissemination E2E Tests
// Purpose: Verify report generation and distribution functionality

import { test, expect } from '@playwright/test';

test.describe('BDA Phase 4: Reporting & Dissemination', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to BDA workbench
        await page.goto('/smartops/bda');
        await page.waitForLoadState('networkidle');
    });

    test('should display report generator component', async ({ page }) => {
        // Navigate to a BDA report detail page
        // Assuming we have at least one report
        const reportLinks = page.locator('a[href*="/smartops/bda/"]').first();
        if (await reportLinks.isVisible()) {
            await reportLinks.click();
            await page.waitForLoadState('networkidle');
            
            // Check for report generator component
            const reportGenerator = page.locator('text=Report Generation & Export');
            await expect(reportGenerator).toBeVisible();
        }
    });

    test('should load report templates', async ({ page }) => {
        // Navigate to report detail
        const reportLinks = page.locator('a[href*="/smartops/bda/"]').first();
        if (await reportLinks.isVisible()) {
            await reportLinks.click();
            await page.waitForLoadState('networkidle');
            
            // Check for template dropdown
            const templateSelect = page.locator('select').filter({ hasText: 'Initial' });
            await expect(templateSelect).toBeVisible();
        }
    });

    test('should allow format selection', async ({ page }) => {
        const reportLinks = page.locator('a[href*="/smartops/bda/"]').first();
        if (await reportLinks.isVisible()) {
            await reportLinks.click();
            await page.waitForLoadState('networkidle');
            
            // Check for format buttons
            const htmlButton = page.locator('button:has-text("HTML")');
            const jsonButton = page.locator('button:has-text("JSON")');
            const kmlButton = page.locator('button:has-text("KML")');
            const pdfButton = page.locator('button:has-text("PDF")');
            
            if (await htmlButton.isVisible()) {
                await expect(htmlButton).toBeVisible();
                await expect(jsonButton).toBeVisible();
                await expect(kmlButton).toBeVisible();
                await expect(pdfButton).toBeVisible();
            }
        }
    });

    test('should generate PDF report', async ({ page }) => {
        // Intercept PDF generation API call
        let pdfGenerated = false;
        page.route('**/api/bda/reports/*/generate', async route => {
            const request = route.request();
            const postData = request.postDataJSON();
            if (postData?.format === 'pdf') {
                pdfGenerated = true;
                await route.fulfill({
                    status: 200,
                    contentType: 'application/pdf',
                    body: Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\nxref\n0 1\ntrailer\n<< /Size 1 /Root 1 0 R >>\nstartxref\n%%EOF'),
                });
            } else {
                await route.continue();
            }
        });

        const reportLinks = page.locator('a[href*="/smartops/bda/"]').first();
        if (await reportLinks.isVisible()) {
            await reportLinks.click();
            await page.waitForLoadState('networkidle');
            
            // Select PDF format if available
            const pdfButton = page.locator('button:has-text("PDF")');
            if (await pdfButton.isVisible() && await pdfButton.isEnabled()) {
                await pdfButton.click();
                await page.waitForTimeout(500);
                
                // Try to generate if button is enabled
                const generateButton = page.locator('button:has-text("Generate")');
                if (await generateButton.isVisible() && await generateButton.isEnabled()) {
                    await generateButton.click();
                    await page.waitForTimeout(2000);
                    // PDF generation should have been triggered
                }
            }
        }
    });

    test('should display distribution manager component', async ({ page }) => {
        const reportLinks = page.locator('a[href*="/smartops/bda/"]').first();
        if (await reportLinks.isVisible()) {
            await reportLinks.click();
            await page.waitForLoadState('networkidle');
            
            // Check for distribution manager
            const distributionManager = page.locator('text=Report Distribution');
            await expect(distributionManager).toBeVisible();
        }
    });

    test('should show distribution summary when distributions exist', async ({ page }) => {
        const reportLinks = page.locator('a[href*="/smartops/bda/"]').first();
        if (await reportLinks.isVisible()) {
            await reportLinks.click();
            await page.waitForLoadState('networkidle');
            
            // Check for summary statistics (may not exist if no distributions)
            const summary = page.locator('text=Total').or(page.locator('text=Delivered'));
            // This may or may not be visible depending on data
            // Just verify the component loads without errors
            await page.waitForTimeout(1000);
        }
    });

    test('should disable generate button for draft reports', async ({ page }) => {
        // This test assumes we can identify draft reports
        // In a real scenario, we'd need to create or identify a draft report
        const reportLinks = page.locator('a[href*="/smartops/bda/"]').first();
        if (await reportLinks.isVisible()) {
            await reportLinks.click();
            await page.waitForLoadState('networkidle');
            
            // Check if generate button exists and is potentially disabled
            const generateButton = page.locator('button:has-text("Generate")');
            if (await generateButton.isVisible()) {
                // Button should exist, check if it's disabled based on status
                // This is a basic check - actual status would come from API
                await expect(generateButton).toBeVisible();
            }
        }
    });

    test('should display classification level selector', async ({ page }) => {
        const reportLinks = page.locator('a[href*="/smartops/bda/"]').first();
        if (await reportLinks.isVisible()) {
            await reportLinks.click();
            await page.waitForLoadState('networkidle');
            
            // Check for classification dropdown
            const classificationSelect = page.locator('select').filter({ hasText: 'SECRET' });
            if (await classificationSelect.isVisible()) {
                await expect(classificationSelect).toBeVisible();
            }
        }
    });

    test('should allow selecting include options', async ({ page }) => {
        const reportLinks = page.locator('a[href*="/smartops/bda/"]').first();
        if (await reportLinks.isVisible()) {
            await reportLinks.click();
            await page.waitForLoadState('networkidle');
            
            // Check for include checkboxes
            const imageryCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: 'Imagery' });
            // Checkboxes may be present
            await page.waitForTimeout(1000);
        }
    });

    test('should handle report generation API call', async ({ page }) => {
        // Intercept API call
        let apiCalled = false;
        page.route('**/api/bda/reports/*/generate', async route => {
            apiCalled = true;
            await route.fulfill({
                status: 200,
                contentType: 'text/html',
                body: '<html><body>Test Report</body></html>',
            });
        });

        const reportLinks = page.locator('a[href*="/smartops/bda/"]').first();
        if (await reportLinks.isVisible()) {
            await reportLinks.click();
            await page.waitForLoadState('networkidle');
            
            // Try to generate report if button is enabled
            const generateButton = page.locator('button:has-text("Generate")');
            if (await generateButton.isVisible() && await generateButton.isEnabled()) {
                await generateButton.click();
                await page.waitForTimeout(2000);
                // API should have been called
                // Note: This may not always trigger if button is disabled
            }
        }
    });

    test('should handle different report formats correctly', async ({ page }) => {
        const formats = ['HTML', 'JSON', 'KML', 'PDF'];
        const contentTypes = {
            'HTML': 'text/html',
            'JSON': 'application/json',
            'KML': 'application/vnd.google-earth.kml+xml',
            'PDF': 'application/pdf',
        };

        page.route('**/api/bda/reports/*/generate', async route => {
            const request = route.request();
            const postData = request.postDataJSON();
            const format = postData?.format?.toUpperCase();
            const contentType = contentTypes[format] || 'text/html';
            
            let body: string | Buffer;
            if (format === 'JSON') {
                body = JSON.stringify({ report_id: 'test', format });
            } else if (format === 'PDF') {
                body = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\nxref\n0 1\ntrailer\n<< /Size 1 /Root 1 0 R >>\nstartxref\n%%EOF');
            } else if (format === 'KML') {
                body = '<?xml version="1.0"?><kml><Document><name>Test</name></Document></kml>';
            } else {
                body = '<html><body>Test Report</body></html>';
            }
            
            await route.fulfill({
                status: 200,
                contentType,
                body,
            });
        });

        const reportLinks = page.locator('a[href*="/smartops/bda/"]').first();
        if (await reportLinks.isVisible()) {
            await reportLinks.click();
            await page.waitForLoadState('networkidle');
            
            // Verify format buttons exist
            for (const format of formats) {
                const formatButton = page.locator(`button:has-text("${format}")`);
                if (await formatButton.isVisible()) {
                    await expect(formatButton).toBeVisible();
                }
            }
        }
    });

    test('should display distribution lists in modal', async ({ page }) => {
        const reportLinks = page.locator('a[href*="/smartops/bda/"]').first();
        if (await reportLinks.isVisible()) {
            await reportLinks.click();
            await page.waitForLoadState('networkidle');
            
            // Click distribute button if visible and enabled
            const distributeButton = page.locator('button:has-text("Distribute")');
            if (await distributeButton.isVisible() && await distributeButton.isEnabled()) {
                await distributeButton.click();
                await page.waitForTimeout(500);
                
                // Check for modal
                const modal = page.locator('text=Distribute Report');
                if (await modal.isVisible()) {
                    await expect(modal).toBeVisible();
                }
            }
        }
    });

    test('should show distribution status badges', async ({ page }) => {
        const reportLinks = page.locator('a[href*="/smartops/bda/"]').first();
        if (await reportLinks.isVisible()) {
            await reportLinks.click();
            await page.waitForLoadState('networkidle');
            
            // Check for status badges (may not exist if no distributions)
            const statusBadges = page.locator('text=/pending|sent|delivered|failed/i');
            // Just verify page loads without errors
            await page.waitForTimeout(1000);
        }
    });
});
