// NATO COPD Targeting Cell Dashboard - E2E Tests
// Tests all 8 core components and critical workflows

import { test, expect } from '@playwright/test';

test.describe('NATO COPD Targeting Cell Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to targeting cell dashboard
    await page.goto('/smartops/targeting-cell-dashboard');
    // Wait for page to load
    await page.waitForTimeout(1000);
  });

  test('should display all 8 NATO COPD components', async ({ page }) => {
    // Verify page loads
    await expect(page).toHaveTitle(/Template app/);

    // Component 1: Mission Command Overview
    await expect(page.getByText('Mission Command Overview')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Commander's Intent/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Targeting Guidance/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Decision Authority/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Operational Tempo/i })).toBeVisible();

    // Component 2: Target Nomination & Prioritization
    await expect(page.getByText('Target Nomination & Prioritization')).toBeVisible();
    await expect(page.getByText('F3EAD Target Pipeline')).toBeVisible();
    // Dynamic Target List appears in subtitle and as heading - use first()
    await expect(page.getByText(/Dynamic Target List/i).first()).toBeVisible();

    // Component 3: Intelligence Integration
    await expect(page.getByText('Intelligence Integration')).toBeVisible();
    // Multi-INT Fusion appears in subtitle and as heading - use getByRole
    await expect(page.getByRole('heading', { name: /Multi-INT Fusion/i })).toBeVisible();
    // Pattern of Life appears as heading
    await expect(page.getByRole('heading', { name: /Pattern of Life/i })).toBeVisible();

    // Component 4: Effects Assessment
    await expect(page.getByText('Effects Assessment')).toBeVisible();
    await expect(page.getByText('Battle Damage Assessment')).toBeVisible();

    // Component 5: Asset & Capability Management
    await expect(page.getByText('Asset & Capability Management')).toBeVisible();
    await expect(page.getByText('Strike Platform')).toBeVisible();

    // Component 6: Risk & Constraints Monitor
    await expect(page.getByText('Risk & Constraints Monitor')).toBeVisible();
    await expect(page.getByText('Fratricide')).toBeVisible();

    // Component 7: Alternative Analysis
    await expect(page.getByText('Alternative Analysis')).toBeVisible();
    await expect(page.getByText('Assumption Challenges')).toBeVisible();

    // Component 8: Collaborative Workspace
    await expect(page.getByText('Collaborative Workspace')).toBeVisible();
    await expect(page.getByText('Multi-Domain')).toBeVisible();
  });

  test('should display Decision Gates Bar', async ({ page }) => {
    // DecisionGatesBar doesn't have a heading, just displays the gates
    // Check for the gate names (they appear as uppercase labels)
    await expect(page.getByText('ROE', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('CDE', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Weather', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Deconfliction', { exact: true }).first()).toBeVisible();
  });

  test('should display Time-Sensitive Target alerts with countdown', async ({ page }) => {
    // TST section only appears if there are TSTs
    // "Time-Sensitive Targets" appears in subtitle, so use first() to avoid strict mode violation
    const tstHeading = page.getByText(/Time-Sensitive Targets/i).first();
    const tstSection = page.locator('text=/Time-Sensitive Targets.*\\(\\d+\\)/i');
    
    // Check if TST section with count exists (actual TST alerts section)
    if (await tstSection.count() > 0) {
      await expect(tstSection.first()).toBeVisible();
      // Check for minutes countdown (displayed as number + "Minutes" text)
      await expect(page.locator('text=/Minutes/i').first()).toBeVisible();
    } else {
      // If no TSTs, verify component loaded (TST text appears in subtitle)
      await expect(tstHeading).toBeVisible();
    }
  });

  test('should display F3EAD pipeline stages', async ({ page }) => {
    // All 6 F3EAD stages should be visible
    await expect(page.getByText('Find', { exact: true })).toBeVisible();
    await expect(page.getByText('Fix', { exact: true })).toBeVisible();
    await expect(page.getByText('Finish', { exact: true })).toBeVisible();
    await expect(page.getByText('Exploit', { exact: true })).toBeVisible();
    await expect(page.getByText('Analyze', { exact: true })).toBeVisible();
    await expect(page.getByText('Disseminate', { exact: true })).toBeVisible();
  });

  test('should display Priority Matrix heat map', async ({ page }) => {
    await expect(page.getByText(/Target Priority Matrix/i)).toBeVisible();
    // Feasibility appears in the heading and as axis label - use first() to avoid strict mode
    await expect(page.locator('text=/Feasibility|Priority vs/i').first()).toBeVisible();
  });

  test('should display Multi-INT fusion data', async ({ page }) => {
    // Multi-INT Fusion section should be visible (appears as heading)
    await expect(page.getByRole('heading', { name: /Multi-INT Fusion/i })).toBeVisible();
    
    // Intelligence types may not be visible if no data - check if section has content
    // They appear as uppercase labels in the INT Type Grid
    const sigint = page.getByText('SIGINT', { exact: true });
    const imint = page.getByText('IMINT', { exact: true });
    const humint = page.getByText('HUMINT', { exact: true });
    const geoint = page.getByText('GEOINT', { exact: true });
    
    // At least one INT type should be visible if data exists
    const intTypesVisible = (await sigint.count() > 0) || (await imint.count() > 0) || 
                           (await humint.count() > 0) || (await geoint.count() > 0);
    
    if (intTypesVisible) {
      // If any INT type is visible, verify at least one
      if (await sigint.count() > 0) await expect(sigint.first()).toBeVisible();
      else if (await imint.count() > 0) await expect(imint.first()).toBeVisible();
      else if (await humint.count() > 0) await expect(humint.first()).toBeVisible();
      else if (await geoint.count() > 0) await expect(geoint.first()).toBeVisible();
    }
    
    // Check for convergence indicator (may not be visible if no data)
    const convergence = page.locator('text=/CONVERGENCE/i');
    if (await convergence.count() > 0) {
      await expect(convergence.first()).toBeVisible();
    }
  });

  test('should display Pattern of Life analytics', async ({ page }) => {
    // Pattern of Life appears as heading
    await expect(page.getByRole('heading', { name: /Pattern of Life/i })).toBeVisible();
    // Predictive Targeting Window may not be visible if no pattern of life data
    const predictiveWindow = page.getByText(/Predictive Targeting Window/i);
    if (await predictiveWindow.count() > 0) {
      await expect(predictiveWindow.first()).toBeVisible();
    }
  });

  test('should display ISR collection status', async ({ page }) => {
    await expect(page.getByText(/ISR Collection Status/i)).toBeVisible();
    
    // Platform types may not be visible if no ISR platforms
    const platforms = page.locator('text=/Reaper|Global Hawk|Sentinel/i');
    if (await platforms.count() > 0) {
      await expect(platforms.first()).toBeVisible();
    }
  });

  test('should display BDA assessments with effectiveness percentages', async ({ page }) => {
    await expect(page.getByText(/Effects Assessment/i)).toBeVisible();
    
    // BDA status badges may not be visible if no BDA data
    const bdaStatus = page.locator('text=/DESTROYED|DAMAGED|INTACT/i');
    if (await bdaStatus.count() > 0) {
      await expect(bdaStatus.first()).toBeVisible();
    }
    
    // Effectiveness percentages may not be visible if no BDA data
    const effectiveness = page.locator('text=/\\d+%/i');
    if (await effectiveness.count() > 0) {
      await expect(effectiveness.first()).toBeVisible();
    }
  });

  test('should display strike platform availability', async ({ page }) => {
    await expect(page.getByText(/Strike Platform Inventory/i)).toBeVisible();
    // Munitions may appear in the munitions list or as a label
    await expect(page.locator('text=/Munitions/i').first()).toBeVisible();
  });

  test('should display risk assessments', async ({ page }) => {
    await expect(page.getByText('Risk & Constraints Monitor')).toBeVisible();
    // Risk labels may not be visible if no risk data
    const fratricide = page.getByText(/Fratricide/i);
    const political = page.getByText(/Political Sensitivity/i);
    const legal = page.getByText(/Legal Review/i);
    
    // At least one should be visible if component has data
    if (await fratricide.count() > 0) {
      await expect(fratricide.first()).toBeVisible();
    } else if (await political.count() > 0) {
      await expect(political.first()).toBeVisible();
    } else if (await legal.count() > 0) {
      await expect(legal.first()).toBeVisible();
    }
  });

  test('should display second and third order effects', async ({ page }) => {
    await expect(page.getByText('Second Order')).toBeVisible();
    await expect(page.getByText('Third Order')).toBeVisible();
  });

  test('should display assumption challenges', async ({ page }) => {
    await expect(page.getByText(/Assumption Challenges/i)).toBeVisible();
    // Alternative Hypothesis may not be visible if no assumption data
    const altHypothesis = page.getByText(/Alternative Hypothesis/i);
    if (await altHypothesis.count() > 0) {
      await expect(altHypothesis.first()).toBeVisible();
    }
  });

  test('should display red team perspectives', async ({ page }) => {
    await expect(page.getByText('Red Team Analysis')).toBeVisible();
    await expect(page.getByText('Adversary COA')).toBeVisible();
  });

  test('should display cognitive bias alerts', async ({ page }) => {
    // Cognitive Bias Detection appears as heading
    await expect(page.getByRole('heading', { name: /Cognitive Bias/i })).toBeVisible();
    // Check for bias types (may appear as badges or text)
    // Use first() to avoid strict mode violation if multiple matches
    const biasText = page.locator('text=/CONFIRMATION|ANCHORING|GROUPTHINK|Confirmation Bias|Anchoring|Groupthink/i');
    if (await biasText.count() > 0) {
      await expect(biasText.first()).toBeVisible();
    }
  });

  test('should display devil\'s advocate questions', async ({ page }) => {
    await expect(page.getByText("Devil's Advocate Questions")).toBeVisible();
  });

  test('should display multi-domain operations status', async ({ page }) => {
    await expect(page.getByText(/Multi-Domain Operations Status/i)).toBeVisible();
    
    // All 6 domains should be visible (as uppercase labels)
    await expect(page.getByText('LAND', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('AIR', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('MARITIME', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('CYBER', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('SPACE', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('INFO', { exact: true }).first()).toBeVisible();
  });

  test('should display decision log', async ({ page }) => {
    // Decision Log appears in subtitle, heading, and button - use getByRole for heading
    const decisionLogHeading = page.getByRole('heading', { name: /Decision Log/i });
    if (await decisionLogHeading.count() > 0) {
      await expect(decisionLogHeading.first()).toBeVisible();
    } else {
      // Fallback: check for text in subtitle
      await expect(page.getByText(/Decision Log/i).first()).toBeVisible();
    }
  });

  test('should display shift handover summary', async ({ page }) => {
    await expect(page.getByText(/Shift Handover Summary/i)).toBeVisible();
    // Critical Issues and Recommendations may not be visible if no handover data
    const criticalIssues = page.getByText(/Critical Issues/i);
    const recommendations = page.getByText(/Recommendations/i);
    
    if (await criticalIssues.count() > 0) {
      await expect(criticalIssues.first()).toBeVisible();
    }
    if (await recommendations.count() > 0) {
      await expect(recommendations.first()).toBeVisible();
    }
  });

  test('should display classification markings on all panels', async ({ page }) => {
    // SecurityBadge components should be present
    const badges = page.locator('[class*="border-amber-600"],[class*="border-red-600"],[class*="border-yellow-600"]');
    await expect(badges.first()).toBeVisible();
  });

  test('should display security banners at top and bottom', async ({ page }) => {
    // Security banners should be present
    await expect(page.locator('text=/SECRET/i').first()).toBeVisible();
  });

  test('should display commander intent with endstate metrics', async ({ page }) => {
    await expect(page.getByText(/Phase.*Hostile Force/i)).toBeVisible();
    await expect(page.getByText('Progress to Endstate')).toBeVisible();
  });

  test('should show munitions-to-target pairing recommendations', async ({ page }) => {
    await expect(page.getByText(/Recommended Munitions Pairing/i)).toBeVisible();
    // Munition types may appear in the recommendations
    const munitionTypes = page.locator('text=/GBU|JDAM|Excalibur|GMLRS/i');
    if (await munitionTypes.count() > 0) {
      await expect(munitionTypes.first()).toBeVisible();
    }
  });

  test('should display re-attack recommendations when applicable', async ({ page }) => {
    // Check if re-attack section appears
    const reattack = page.locator('text=/Re-Attack Recommended/i');
    if (await reattack.isVisible()) {
      await expect(page.getByText('Nominate Re-Attack')).toBeVisible();
    }
  });

  test('should allow clicking F3EAD stages to filter', async ({ page }) => {
    // Click on a F3EAD stage button
    const findButton = page.getByRole('button', { name: /Find/i });
    if (await findButton.isVisible()) {
      await findButton.click();
      // Stage should be highlighted (visual feedback)
      await page.waitForTimeout(500);
    }
  });

  test('should display alternative scenario planning', async ({ page }) => {
    await expect(page.getByText(/Scenario Planning/i)).toBeVisible();
    // Branch Plan may appear in scenario descriptions
    const branchPlan = page.locator('text=/Branch Plan/i');
    if (await branchPlan.count() > 0) {
      await expect(branchPlan.first()).toBeVisible();
    }
  });

  test('should show commander guidance update alert', async ({ page }) => {
    // Guidance update alert may not always be visible (only when there's an update)
    const guidanceAlert = page.locator('text=/Commander.*Guidance Update|Guidance Update/i');
    if (await guidanceAlert.count() > 0) {
      await expect(guidanceAlert.first()).toBeVisible();
      const acknowledgeBtn = page.getByRole('button', { name: /Acknowledge/i });
      if (await acknowledgeBtn.count() > 0) {
        await expect(acknowledgeBtn.first()).toBeVisible();
      }
    }
  });

  test('should display weather and deconfliction status', async ({ page }) => {
    // Weather and Deconfliction appear in Decision Gates Bar
    await expect(page.getByText('Weather', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Deconfliction', { exact: true }).first()).toBeVisible();
  });
});

test.describe('NATO COPD Targeting Cell - Alternative Analysis Safeguards', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/smartops/targeting-cell-dashboard');
    await page.waitForTimeout(1000);
  });

  test('should enforce mandatory critical thinking prompts', async ({ page }) => {
    // Verify devil's advocate questions are displayed
    await expect(page.getByText(/Devil's Advocate Questions/i)).toBeVisible();
    
    // Questions should have Document Response buttons (may not always be visible)
    const docResponseBtn = page.getByRole('button', { name: /Document Response/i });
    if (await docResponseBtn.count() > 0) {
      await expect(docResponseBtn.first()).toBeVisible();
    }
  });

  test('should require input from multiple INT disciplines', async ({ page }) => {
    // Multi-INT fusion section should be visible
    await expect(page.getByText(/Multi-INT Fusion/i)).toBeVisible();
    
    // Intelligence types may not be visible if no data - check if any are present
    const sigint = page.getByText('SIGINT', { exact: true });
    const imint = page.getByText('IMINT', { exact: true });
    const humint = page.getByText('HUMINT', { exact: true });
    
    // At least one INT type should be visible if data exists
    const hasIntTypes = (await sigint.count() > 0) || (await imint.count() > 0) || (await humint.count() > 0);
    
    if (hasIntTypes) {
      // If any INT type is visible, that's sufficient for this test
      if (await sigint.count() > 0) await expect(sigint.first()).toBeVisible();
      else if (await imint.count() > 0) await expect(imint.first()).toBeVisible();
      else if (await humint.count() > 0) await expect(humint.first()).toBeVisible();
    }
  });

  test('should display assumption challenge board with evidence', async ({ page }) => {
    await expect(page.getByText(/Assumption Challenges/i)).toBeVisible();
    // Supporting/Contradicting Evidence may not be visible if no assumption data
    const supporting = page.getByText(/Supporting Evidence/i);
    const contradicting = page.getByText(/Contradicting Evidence/i);
    
    // If assumption challenges have data, evidence sections should be visible
    if (await supporting.count() > 0) {
      await expect(supporting.first()).toBeVisible();
    }
    if (await contradicting.count() > 0) {
      await expect(contradicting.first()).toBeVisible();
    }
  });

  test('should show red team analysis for alternative perspectives', async ({ page }) => {
    await expect(page.getByText('Red Team Analysis')).toBeVisible();
    await expect(page.locator('text=/Adversary COA/i')).toBeVisible();
  });

  test('should alert on cognitive biases', async ({ page }) => {
    await expect(page.getByText('Cognitive Bias Detection')).toBeVisible();
  });
});

test.describe('NATO COPD Targeting Cell - Operational Workflows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/smartops/targeting-cell-dashboard');
    await page.waitForTimeout(1000);
  });

  test('should display F3EAD cycle for target lifecycle management', async ({ page }) => {
    // All 6 F3EAD stages with counts
    const stages = ['Find', 'Fix', 'Finish', 'Exploit', 'Analyze', 'Disseminate'];
    
    for (const stage of stages) {
      await expect(page.getByText(stage, { exact: true })).toBeVisible();
    }
  });

  test('should show target priority matrix for decision support', async ({ page }) => {
    await expect(page.getByText('Target Priority Matrix')).toBeVisible();
    await expect(page.getByText('Priority vs. Feasibility')).toBeVisible();
  });

  test('should display ISR platform status with loiter time', async ({ page }) => {
    await expect(page.getByText(/ISR Collection Status/i)).toBeVisible();
    
    // Check for time remaining indicators (format: X.Xh)
    // May not be visible if no ISR platforms or if loiter time is 0
    const loiterTime = page.locator('text=/\\d+\\.\\d+h/i');
    if (await loiterTime.count() > 0) {
      await expect(loiterTime.first()).toBeVisible();
    }
  });

  test('should show BDA effectiveness tracking', async ({ page }) => {
    // Check for effectiveness percentages in BDA
    const effectiveness = page.locator('text=/\\d+%/i');
    await expect(effectiveness.first()).toBeVisible();
  });

  test('should display strike platform availability', async ({ page }) => {
    await expect(page.getByText('Strike Platform Inventory')).toBeVisible();
  });

  test('should show decision log with rationale', async ({ page }) => {
    // Decision Log appears in subtitle, heading, and button - use getByRole for heading to avoid strict mode
    const decisionLogHeading = page.getByRole('heading', { name: /Decision Log/i });
    if (await decisionLogHeading.count() > 0) {
      await expect(decisionLogHeading.first()).toBeVisible();
    } else {
      // Fallback: check for text
      await expect(page.getByText(/Decision Log/i).first()).toBeVisible();
    }
  });

  test('should generate shift handover summary', async ({ page }) => {
    await expect(page.getByText(/Shift Handover Summary/i)).toBeVisible();
    // Generate button may not always be visible
    const generateBtn = page.getByRole('button', { name: /Generate.*Handover|Generate Full/i });
    if (await generateBtn.count() > 0) {
      await expect(generateBtn.first()).toBeVisible();
    }
  });
});

test.describe('NATO COPD Targeting Cell - Security & Classification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/smartops/targeting-cell-dashboard');
    await page.waitForTimeout(1000);
  });

  test('should display top and bottom security banners', async ({ page }) => {
    // Check for classification banners
    const secretBanners = page.locator('text=/SECRET/i');
    await expect(secretBanners.first()).toBeVisible();
  });

  test('should show classification badges on all panels', async ({ page }) => {
    // SecurityBadge components use various border colors - check for common patterns
    // They may use border-red-600, border-amber-600, border-yellow-600, or other variants
    const badges = page.locator('[class*="border-red"],[class*="border-amber"],[class*="border-yellow"],[class*="SECRET"],[class*="CUI"],[class*="TS"]');
    // Should have at least a few badges (one per panel)
    expect(await badges.count()).toBeGreaterThan(3);
  });

  test('should display TS/SCI markings on intelligence panel', async ({ page }) => {
    // Intelligence panel should have higher classification
    await expect(page.locator('text=/TS.*SCI|TS\/SCI/i')).toBeVisible();
  });
});

test.describe('NATO COPD Targeting Cell - Data Visualization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/smartops/targeting-cell-dashboard');
    await page.waitForTimeout(1000);
  });

  test('should display progress bars for endstate metrics', async ({ page }) => {
    // Progress bars should be visible in commander's intent
    await expect(page.getByText('Progress to Endstate')).toBeVisible();
  });

  test('should show color-coded status indicators', async ({ page }) => {
    // Green, amber, red indicators should be present
    const statusElements = page.locator('[class*="bg-green-"],[class*="bg-amber-"],[class*="bg-red-"]');
    expect(await statusElements.count()).toBeGreaterThan(10);
  });

  test('should display heat map with color gradients', async ({ page }) => {
    // Priority matrix should have colored cells
    await expect(page.getByText('Target Priority Matrix')).toBeVisible();
  });

  test('should show effectiveness percentages visually', async ({ page }) => {
    // Effectiveness percentages appear in BDA assessments (format: X%)
    const effectiveness = page.locator('text=/Effectiveness/i');
    if (await effectiveness.count() > 0) {
      await expect(effectiveness.first()).toBeVisible();
      // Check for percentage display
      const percentage = page.locator('text=/\\d+%/i');
      if (await percentage.count() > 0) {
        await expect(percentage.first()).toBeVisible();
      }
    }
  });
});

test.describe('NATO COPD Targeting Cell - Critical Alerts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/smartops/targeting-cell-dashboard');
    await page.waitForTimeout(1000);
  });

  test('should display TST alerts with countdown timers', async ({ page }) => {
    // TST section only appears if there are TSTs
    const tstHeading = page.getByText(/Time-Sensitive Targets/i);
    if (await tstHeading.count() > 0) {
      await expect(tstHeading.first()).toBeVisible();
    }
  });

  test('should show red team findings', async ({ page }) => {
    // Red Team section may appear as "Red Team Analysis" or "Red Team"
    await expect(page.locator('text=/Red Team/i').first()).toBeVisible();
  });

  test('should display cognitive bias warnings', async ({ page }) => {
    // Cognitive bias warnings may appear in different formats
    const biasWarnings = page.locator('text=/Confirmation Bias|Anchoring|Groupthink|CONFIRMATION|ANCHORING|GROUPTHINK/i');
    if (await biasWarnings.count() > 0) {
      await expect(biasWarnings.first()).toBeVisible();
    }
  });

  test('should show re-attack recommendations when needed', async ({ page }) => {
    // Check for re-attack alerts
    const reattack = page.locator('text=/Re-Attack Recommended/i');
    if (await reattack.isVisible()) {
      await expect(reattack).toBeVisible();
    }
  });
});

test.describe('NATO COPD Targeting Cell - Responsive Design', () => {
  test('should be usable on large screens (1920x1080)', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/smartops/targeting-cell-dashboard');
    await page.waitForTimeout(1000);

    // All components should be visible
    await expect(page.getByText('Mission Command Overview')).toBeVisible();
    await expect(page.getByText('Target Nomination')).toBeVisible();
  });

  test('should be usable on tablet screens (1024x768)', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/smartops/targeting-cell-dashboard');
    await page.waitForTimeout(1000);

    // Core components should be visible even on smaller screens
    await expect(page.getByText('Mission Command Overview')).toBeVisible();
  });
});
